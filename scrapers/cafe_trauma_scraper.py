import csv
import re
from pathlib import Path

import requests
from bs4 import BeautifulSoup


LISTING_URL = "https://www.cafetrauma.de/index.php?pid=2"
OUTPUT_PATH = Path(__file__).with_name("cafe_trauma_events.csv")


def extract_value(block, field):
    match = re.search(
        rf'\["{field}"\].*?\["Value"\].*?string\(\d+\) "([^"]*)"',
        block,
        flags=re.DOTALL,
    )
    return match.group(1).strip() if match else ""


def extract_string(block, field):
    match = re.search(
        rf'\["{field}"\].*?string\(\d+\) "([^"]*)"',
        block,
        flags=re.DOTALL,
    )
    return match.group(1).strip() if match else ""


def main():
    response = requests.get(LISTING_URL, timeout=30)
    response.raise_for_status()
    html = response.content.decode("utf-8", errors="replace")
    blocks = [pre.get_text() for pre in BeautifulSoup(html, "html.parser").find_all("pre")]

    rows = []
    for block in blocks:
        event_id = extract_string(block, "Id")
        title = extract_string(block, "Title")
        date = extract_value(block, "StartDate")
        start_time = extract_value(block, "StartTime")
        category = extract_string(block, "Category")

        if not event_id or not title or not date or not start_time:
            continue

        rows.append(
            {
                "Title": title,
                "Date": f"{date} {start_time}",
                "Category": category,
                "Location": "trauma im g-werk, Afföllerwiesen 3a, Marburg",
                "URL": f"https://www.cafetrauma.de/index.php?pid=2&eid={event_id}",
            }
        )

    if not rows:
        raise RuntimeError("Cafe Trauma returned no parseable events")

    with OUTPUT_PATH.open("w", newline="", encoding="utf-8") as output:
        writer = csv.DictWriter(output, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    print(f"Saved {len(rows)} Cafe Trauma events to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
