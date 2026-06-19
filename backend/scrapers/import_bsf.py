import sys
import os
from datetime import datetime

backend_path = os.path.abspath("../backend")
os.chdir(backend_path)

sys.path.append(backend_path)

from import_common import import_events


def parse_date(row):
    date_text = str(row["Date"]).replace("\u200b", "").strip()

    return datetime.strptime(
        date_text,
        "%d.%m.%Y"
    )


def build_description(row):
    return "Imported from BSF Richtsberg"


import_events(
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
