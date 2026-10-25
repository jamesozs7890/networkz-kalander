import os
import sys
from datetime import datetime

sys.path.append(os.path.abspath("../backend"))

from import_common import import_events


def parse_date(row):
    return datetime.strptime(str(row["Date"]), "%d.%m.%Y %H:%M")


def build_description(row):
    return f"Category: {row['Category']} | Location: {row['Location']}"


import_events(
    csv_file="marburg_city_events.csv",
    scraper_source="marburg_city",
    category_id=4,
    date_parser=parse_date,
    description_builder=build_description,
    dedupe_across_sources=True,
)
