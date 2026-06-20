from datetime import datetime
import pandas as pd
import re

from app.db.session import SessionLocal
from app.models.event import Event


def import_events(
    csv_file,
    scraper_source,
    category_id,
    date_parser,
    description_builder,
    venue_id=1,
    organization_id=1,
):
    db = SessionLocal()

    df = pd.read_csv(csv_file)
    df = df.fillna("")

    def normalize_title(s: str) -> str:
        t = re.sub(r"[^\w\s]", "", (s or "").strip())
        t = re.sub(r"\s+", " ", t)
        return t.lower()

    total_rows = len(df)
    unique_rows = []
    seen = set()

    for _, row in df.iterrows():
        raw_title = str(row.get("Title", "")).strip()
        normalized_title = normalize_title(raw_title)

        try:
            start_time = date_parser(row)
        except Exception as e:
            print("ERROR parsing date:", raw_title)
            print(e)
            continue

        row_key = (normalized_title, start_time)
        if row_key in seen:
            continue
        seen.add(row_key)
        unique_rows.append((row, raw_title, normalized_title, start_time))

    duplicate_rows = total_rows - len(unique_rows)
    print(f"Duplicate rows removed before import: {duplicate_rows}")

    def find_existing_event(db, normalized_title, start_time):
        candidates = db.query(Event).filter(Event.start_time == start_time).all()
        for candidate in candidates:
            if normalize_title(candidate.title) == normalized_title:
                return candidate
        return None

    count = 0
    existing_skipped = 0

    for row, raw_title, normalized_title, start_time in unique_rows:

        try:
            existing_event = find_existing_event(db, normalized_title, start_time)

            if existing_event:
                existing_skipped += 1
                continue

            event = Event(
                title=raw_title,
                description=description_builder(row),
                start_time=start_time,
                end_time=start_time,
                source_url=str(row.get("URL", "")),
                scraper_source=scraper_source,
                collected_at=datetime.now(),
                category_id=category_id,
                venue_id=venue_id,
                organization_id=organization_id,
                status="approved",
                is_published=True,
            )

            db.add(event)
            count += 1

        except Exception as e:
            print("ERROR:", row.get("Title", "Unknown"))
            print(e)

    db.commit()
    db.close()

    print(f"Imported {count} events")
    if existing_skipped:
        print(f"Skipped {existing_skipped} already-existing events in the database")

    return {
        "imported": count,
        "skipped_existing": existing_skipped,
        "duplicate_rows": duplicate_rows,
    }
