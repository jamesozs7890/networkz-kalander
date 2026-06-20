import sys
import os
from datetime import datetime

SCRAPERS_DIR = os.path.abspath(os.path.dirname(__file__))
BACKEND_ROOT = os.path.abspath(os.path.join(SCRAPERS_DIR, ".."))
for path in (SCRAPERS_DIR, BACKEND_ROOT):
    if path not in sys.path:
        sys.path.insert(0, path)

from import_common import import_events


def parse_date(row):
    return datetime.strptime(
        str(row["Date"]),
        "%a., %d %B, %Y %H:%M"
    )


def build_description(row):
    return f"Category: {row['Category']} | Location: {row['Location']}"


def run_import():
    return import_events(
        csv_file=os.path.abspath(
            os.path.join(
                os.path.dirname(__file__),
                "marburg_events.csv"
            )
        ),
        scraper_source="marburg_express",
        category_id=4,
        date_parser=parse_date,
        description_builder=build_description,
    )


if __name__ == "__main__":
    run_import()
