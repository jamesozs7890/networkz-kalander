from datetime import datetime
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
import pandas as pd

from app.db.session import SessionLocal
from app.models.event import Event


def normalize_source_url(value):
    url = str(value or "").strip()
    if not url or url.lower() in {"nan", "no url provided"}:
        return ""

    parts = urlsplit(url)
    query = urlencode(
        [(key, value) for key, value in parse_qsl(parts.query) if key != "_a"]
    )
    fragment_path, separator, fragment_query = parts.fragment.partition("?")
    fragment_query = urlencode(
        [(key, value) for key, value in parse_qsl(fragment_query) if key != "_a"]
    )
    fragment = fragment_path + (separator + fragment_query if fragment_query else "")
    return urlunsplit((parts.scheme, parts.netloc, parts.path, query, fragment))


def import_events(
    csv_file,
    scraper_source,
    category_id,
    date_parser,
    description_builder,
    venue_id=1,
    organization_id=1,
    minimum_count_ratio=0.5,
    dedupe_across_sources=False,
):
    db = SessionLocal()

    df = pd.read_csv(csv_file)

    previous_visible_count = (
        db.query(Event)
        .filter(
            Event.scraper_source == scraper_source,
            Event.created_by.is_(None),
            Event.is_published.is_(True),
        )
        .count()
    )
    minimum_count = int(previous_visible_count * minimum_count_ratio)
    if df.empty or (previous_visible_count and len(df) < minimum_count):
        db.close()
        raise ValueError(
            f"Refusing to sync {scraper_source}: scraper returned {len(df)} rows; "
            f"at least {minimum_count} expected"
        )

    seen_keys = set()
    seen_urls = set()
    added = 0
    updated = 0
    hidden = 0
    parse_errors = 0
    source_events = (
        db.query(Event)
        .filter(
            Event.scraper_source == scraper_source,
            Event.created_by.is_(None),
        )
        .all()
    )
    events_by_url = {}
    events_by_key = {}
    for event in source_events:
        normalized_url = normalize_source_url(event.source_url)
        if normalized_url:
            current = events_by_url.get(normalized_url)
            if current is None or (event.is_published and not current.is_published):
                events_by_url[normalized_url] = event
        events_by_key.setdefault((event.title, event.start_time, scraper_source), event)

    for _, row in df.iterrows():

        try:
            title = str(row.get("Title", "")).strip()
            start_time = date_parser(row)
            source_url = str(row.get("URL", "")).strip()
            normalized_url = normalize_source_url(source_url)
            event_key = (title, start_time, scraper_source)

            if not title or event_key in seen_keys:
                continue
            seen_keys.add(event_key)
            if normalized_url:
                seen_urls.add(normalized_url)

            existing_event = events_by_url.get(normalized_url) if normalized_url else None
            if existing_event is None:
                existing_event = events_by_key.get(event_key)
            cross_source_match = False
            if existing_event is None and dedupe_across_sources:
                existing_event = (
                    db.query(Event)
                    .filter(
                        Event.title == title,
                        Event.start_time == start_time,
                        Event.is_published.is_(True),
                    )
                    .first()
                )
                cross_source_match = existing_event is not None

            if cross_source_match:
                continue

            if existing_event:
                existing_event.title = title
                existing_event.start_time = start_time
                existing_event.description = description_builder(row)
                existing_event.end_time = start_time
                existing_event.source_url = source_url
                existing_event.collected_at = datetime.now()
                existing_event.category_id = category_id
                existing_event.venue_id = venue_id
                existing_event.organization_id = organization_id
                existing_event.status = "approved"
                existing_event.is_published = True
                updated += 1
                continue

            event = Event(
                title=title,
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
            added += 1
            if normalized_url:
                events_by_url[normalized_url] = event
            events_by_key[event_key] = event

        except Exception as e:
            print("ERROR:", row.get("Title", "Unknown"))
            print(e)
            parse_errors += 1

    if parse_errors:
        db.rollback()
        db.close()
        raise ValueError(
            f"Refusing to sync {scraper_source}: {parse_errors} rows could not be parsed"
        )

    for event in source_events:
        event_key = (event.title, event.start_time, scraper_source)
        normalized_url = normalize_source_url(event.source_url)
        is_present = normalized_url in seen_urls if normalized_url else event_key in seen_keys
        if not is_present and event.is_published:
            event.is_published = False
            event.status = "removed"
            hidden += 1

    db.commit()
    db.close()

    print(f"Synced {scraper_source}: added={added}, updated={updated}, hidden={hidden}")
