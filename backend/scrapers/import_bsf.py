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
    date_text = str(row["Date"]).replace("\u200b", "").strip()

    return datetime.strptime(
        date_text,
        "%d.%m.%Y"
    )


def build_description(row):
    return "Imported from BSF Richtsberg"


def run_import():
    return import_events(
        csv_file=os.path.abspath(
            os.path.join(
                os.path.dirname(__file__),
                "bsf_events.csv"
            )
        ),
        scraper_source="bsf",
        category_id=4,
        date_parser=parse_date,
        description_builder=build_description,
    )


if __name__ == "__main__":
    run_import()
