import sys
import os
import re
from datetime import datetime

sys.path.append(os.path.abspath("../backend"))

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

    date_str = re.sub(r"\.\s*,", ",", date_str)
    for date_format in ("%a, %d %b, %Y %H:%M", "%a, %d %B, %Y %H:%M"):
        try:
            return datetime.strptime(date_str, date_format)
        except ValueError:
            continue
    raise ValueError(f"Unsupported Marburg-Liebe date: {date_str}")


def build_description(row):
    return f"Category: {row['Category']} | Location: {row['Location']}"


import_events(
    csv_file="marburgliebe_events.csv",
    scraper_source="marburgliebe",
    category_id=2,
    date_parser=parse_date,
    description_builder=build_description,
)
