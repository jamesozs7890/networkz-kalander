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
    date_str = str(row["Date"])

    german_months = {
        "Januar": "January",
        "Februar": "February",
        "März": "March",
        "April": "April",
        "Mai": "May",
        "Juni": "June",
        "Juli": "July",
        "August": "August",
        "September": "September",
        "Oktober": "October",
        "November": "November",
        "Dezember": "December",
    }

    for de, en in german_months.items():
        date_str = date_str.replace(de, en)

    date_str = (
        date_str.replace("Mo.", "Mon")
        .replace("Di.", "Tue")
        .replace("Mi.", "Wed")
        .replace("Do.", "Thu")
        .replace("Fr.", "Fri")
        .replace("Sa.", "Sat")
        .replace("So.", "Sun")
    )

    return datetime.strptime(
        date_str,
        "%a, %d %B, %Y %H:%M"
    )


def build_description(row):
    return f"Category: {row['Category']} | Location: {row['Location']}"


def run_import():
    return import_events(
        csv_file=os.path.abspath(
            os.path.join(
                os.path.dirname(__file__),
                "marburgliebe_events.csv"
            )
        ),
        scraper_source="marburgliebe",
        category_id=2,
        date_parser=parse_date,
        description_builder=build_description,
    )


if __name__ == "__main__":
    run_import()
