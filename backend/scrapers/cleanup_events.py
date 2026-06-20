import argparse
import csv
from datetime import datetime
from pathlib import Path
import re

DEFAULT_FILES = [
    "bsf_events.csv",
    "marburg_events.csv",
    "marburgliebe_events.csv",
]

GERMAN_MONTHS = {
    "januar": "January",
    "februar": "February",
    "märz": "March",
    "maerz": "March",
    "april": "April",
    "mai": "May",
    "juni": "June",
    "juli": "July",
    "august": "August",
    "september": "September",
    "oktober": "October",
    "okt": "October",
    "november": "November",
    "dezember": "December",
}


def normalize_string(value: str) -> str:
    if value is None:
        return ""
    text = str(value).replace("\u200b", "").replace("\ufeff", "").strip()
    return re.sub(r"\s+", " ", text)


def normalize_date(value: str) -> str:
    value = normalize_string(value)
    if not value:
        return ""

    # Common numeric formats
    numeric_match = re.match(r"^(\d{1,2})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{4})", value)
    if numeric_match:
        day, month, year = numeric_match.groups()
        return f"{int(year):04d}-{int(month):02d}-{int(day):02d}"

    # Clean up weekday prefixes and commas
    cleaned = re.sub(r"^[A-Za-zÄÖÜäöüß]+\.?\s*,?\s*", "", value)
    cleaned = cleaned.replace(",", " ")
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    cleaned = re.sub(
        r"\b([A-Za-zÄÖÜäöüß]+)\b",
        lambda m: GERMAN_MONTHS.get(m.group(1).lower(), m.group(1)),
        cleaned,
    )

    for fmt in [
        "%a %d %B %Y %H:%M",
        "%A %d %B %Y %H:%M",
        "%d %B %Y %H:%M",
        "%d %b %Y %H:%M",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d",
    ]:
        try:
            parsed = datetime.strptime(cleaned, fmt)
            return parsed.strftime("%Y-%m-%d")
        except ValueError:
            continue

    iso_match = re.search(r"(\d{4})-(\d{2})-(\d{2})", cleaned)
    if iso_match:
        year, month, day = iso_match.groups()
        return f"{year}-{month}-{day}"

    return value


def normalize_time(value: str) -> str:
    value = normalize_string(value)
    if not value:
        return ""
    time_match = re.search(r"(\d{1,2})[:hH]?(\d{2})", value)
    if time_match:
        hours, minutes = time_match.groups()
        return f"{int(hours):02d}:{int(minutes):02d}"
    return value


def make_dedupe_key(row: dict, columns: list[str]) -> str:
    values = [normalize_string(row.get(col, "")).lower() for col in columns]
    return "|".join(values)


def clean_csv(path: Path, output_path: Path) -> tuple[int, int, dict[str, int]]:
    with path.open(newline="", encoding="utf-8") as src:
        reader = csv.DictReader(src)
        rows = list(reader)
        if not rows:
            return 0, 0, {}

        header = reader.fieldnames or []

    cleaned_rows = []
    seen = set()
    null_counts: dict[str, int] = {field: 0 for field in header}

    for row in rows:
        row = {field: normalize_string(row.get(field, "")) for field in header}
        row["Date"] = normalize_date(row.get("Date", "")) if "Date" in header else row.get("Date", "")
        if "Time" in header:
            row["Time"] = normalize_time(row.get("Time", ""))

        for field, value in row.items():
            if value == "":
                null_counts[field] += 1

        key = make_dedupe_key(row, ["Title", "Date", "Time"] if "Time" in header else ["Title", "Date"])
        if key in seen:
            continue
        seen.add(key)
        cleaned_rows.append(row)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", newline="", encoding="utf-8") as dst:
        writer = csv.DictWriter(dst, fieldnames=header)
        writer.writeheader()
        writer.writerows(cleaned_rows)

    return len(rows), len(rows) - len(cleaned_rows), null_counts


def main() -> None:
    parser = argparse.ArgumentParser(description="Clean and dedupe event CSV files.")
    parser.add_argument(
        "--files",
        nargs="*",
        default=DEFAULT_FILES,
        help="CSV files to clean from backend/scrapers",
    )
    parser.add_argument(
        "--output-dir",
        default="cleaned_csv",
        help="Output directory for cleaned CSV files",
    )
    parser.add_argument(
        "--inplace",
        action="store_true",
        help="Overwrite the original CSV files instead of writing cleaned copies",
    )
    args = parser.parse_args()

    base_dir = Path(__file__).resolve().parent
    output_dir = base_dir / args.output_dir

    for filename in args.files:
        source_path = base_dir / filename
        if not source_path.exists():
            print(f"Skipping missing file: {source_path}")
            continue

        destination = source_path if args.inplace else output_dir / filename
        total, dup_count, null_counts = clean_csv(source_path, destination)

        print(f"Cleaned: {filename}")
        print(f"  Total rows: {total}")
        print(f"  Duplicates removed: {dup_count}")
        print("  Empty/null counts:")
        for field, count in null_counts.items():
            print(f"    {field}: {count}")
        print(f"  Output written to: {destination}\n")

    if not args.inplace:
        print(f"Cleaned CSV files are available in: {output_dir}")


if __name__ == "__main__":
    main()
