from datetime import datetime
import pandas as pd

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

    count = 0

    for _, row in df.iterrows():

        try:
            start_time = date_parser(row)

            existing_event = (
                db.query(Event)
                .filter(
                    Event.title == str(row.get("Title", "")),
                    Event.start_time == start_time,
                    Event.scraper_source == scraper_source,
                )
                .first()
            )

            if existing_event:
                continue

            event = Event(
                title=str(row.get("Title", "")),
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
