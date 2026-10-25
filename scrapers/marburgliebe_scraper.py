import csv
import datetime
from pathlib import Path

import requests


API_URL = "https://webapi.deskline.net/marburg/de/events"
OUTPUT_PATH = Path(__file__).with_name("marburgliebe_events.csv")
PAGE_SIZE = 100
FIELDS = (
    "id,name,dbCode,date,location{place,town},mainCriteria{id,name,value},"
    "urlFriendlyName"
)


def fetch_events():
    events = []
    session_id = f"H{int(datetime.datetime.now().timestamp() * 1000)}"
    headers = {
        "Accept": "application/json, text/plain, */*",
        "DW-SessionId": session_id,
        "DW-Source": "desklineweb",
        "Origin": "https://www.marburg-liebe.de",
        "Referer": "https://www.marburg-liebe.de/",
        "User-Agent": "Mozilla/5.0",
    }

    for page_no in range(100):
        response = requests.get(
            API_URL,
            params={
                "filterId": "",
                "fields": FIELDS,
                "sortingFields": "date,-topEvent,time",
                "pageNo": page_no,
                "pageSize": PAGE_SIZE,
                "hashF": 0,
            },
            headers=headers,
            timeout=30,
        )
        response.raise_for_status()
        page = response.json().get("data", [])
        events.extend(page)
        if len(page) < PAGE_SIZE:
            break

    return events


def main():
    source_events = fetch_events()
    if not source_events:
        raise RuntimeError("Marburg-Liebe API returned no events")

    rows = []
    for event in source_events:
        start_time = event.get("date")
        if not start_time:
            raise ValueError(f"Marburg-Liebe event has no date: {event.get('id')}")

        start = datetime.datetime.fromisoformat(start_time)
        criteria = event.get("mainCriteria") or {}
        category = criteria.get("name", "") if isinstance(criteria, dict) else ""
        location = event.get("location") or {}
        friendly_name = event.get("urlFriendlyName") or "event"
        event_url = (
            "https://www.marburg-liebe.de/veranstaltungskalender.html#/"
            f"veranstaltungen/{event.get('dbCode', 'RPT')}/{event['id']}/{friendly_name}"
        )
        rows.append(
            {
                "Title": event.get("name", "").strip(),
                "Date": start.strftime("%a., %-d %b., %Y %H:%M"),
                "Category": category,
                "Location": f"{location.get('place', '')}, {location.get('town', '')}".strip(", "),
                "URL": event_url,
            }
        )

    with OUTPUT_PATH.open("w", newline="", encoding="utf-8") as output:
        writer = csv.DictWriter(output, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    print(f"Saved {len(rows)} Marburg-Liebe events to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
