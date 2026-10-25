import csv
import re
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


LISTING_URL = "https://www.marburg.de/portal/seiten/veranstaltungskalender-900001092-23001.html"
OUTPUT_PATH = Path(__file__).with_name("marburg_city_events.csv")
DATE_PATTERN = re.compile(r"(\d{2}\.\d{2}\.\d{4}),\s*(\d{2}:\d{2})")


def main():
    response = requests.get(LISTING_URL, headers={"User-Agent": "Mozilla/5.0"}, timeout=30)
    response.raise_for_status()
    soup = BeautifulSoup(response.content, "html.parser")
    rows = []

    for box in soup.select("div.managerbox"):
        title_node = box.select_one(".bezeichnung")
        date_node = box.select_one(".datum")
        date_match = DATE_PATTERN.search(date_node.get_text(" ", strip=True)) if date_node else None
        detail_link = next(
            (link.get("href") for link in box.find_all("a")
             if "/regional/veranstaltungen/" in (link.get("href") or "")),
            "",
        )
        if not title_node or not date_match or not detail_link:
            continue

        location_node = box.select_one(".veranstaltungsort .feldinhalt")
        category_node = box.select_one(".rubriken")
        rows.append(
            {
                "Title": title_node.get_text(" ", strip=True),
                "Date": f"{date_match.group(1)} {date_match.group(2)}",
                "Category": category_node.get_text(" ", strip=True) if category_node else "",
                "Location": location_node.get_text(" ", strip=True) if location_node else "",
                "URL": urljoin(LISTING_URL, detail_link),
            }
        )

    if not rows:
        raise RuntimeError("Marburg.de returned no parseable events")

    with OUTPUT_PATH.open("w", newline="", encoding="utf-8") as output:
        writer = csv.DictWriter(output, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    print(f"Saved {len(rows)} Marburg.de events to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
