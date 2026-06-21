from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.session import get_db
from app.models.category import Category
from app.models.event import Event
from app.models.organization import Organization
from app.models.user import AppUser
from app.models.venue import Venue
from app.routers.deps import get_current_user, require_admin
from app.schemas.event import EventCreate, EventJoinedResponse, EventResponse, EventUpdate, PublishRequest

router = APIRouter(prefix="/events", tags=["events"])


def _validate_fk(db: Session, venue_id: int | None, organization_id: int | None, category_id: int | None) -> None:
    if venue_id is not None and db.get(Venue, venue_id) is None:
        raise HTTPException(status_code=400, detail="Invalid venue_id")
    if organization_id is not None and db.get(Organization, organization_id) is None:
        raise HTTPException(status_code=400, detail="Invalid organization_id")
    if category_id is not None and db.get(Category, category_id) is None:
        raise HTTPException(status_code=400, detail="Invalid category_id")


def _to_joined(event: Event) -> EventJoinedResponse:
    return EventJoinedResponse(
        id=event.id,
        title=event.title,
        description=event.description,
        start_time=event.start_time,
        end_time=event.end_time,
        source_url=event.source_url,
        venue_id=event.venue_id,
        venue=event.venue.name if event.venue else None,
        venue_address=event.venue.address if event.venue else None,
        organization_id=event.organization_id,
        organization=event.organization.name if event.organization else None,
        category_id=event.category_id,
        category=event.category.name if event.category else None,
        status=event.status,
        is_published=event.is_published,
    )


@router.get("/public", response_model=list[EventJoinedResponse])
def public_events(
    db: Session = Depends(get_db),
    limit: int = Query(default=1000, ge=1, le=1000),
    upcoming_only: bool = True,
    q: str | None = Query(default=None, alias="q")
):
    query = db.query(Event).filter(Event.is_published.is_(True))
    if upcoming_only:
        from datetime import datetime
        query = query.filter(Event.start_time >= datetime.now())
    if q:
        query = query.filter(
            or_(
                Event.title.ilike(f"%{q}%"),
                Event.description.ilike(f"%{q}%")
            )
        )
    events = query.order_by(Event.start_time.asc()).limit(limit).all()
    return [_to_joined(event) for event in events]



@router.get("", response_model=list[EventJoinedResponse])
def all_events(
    db: Session = Depends(get_db),
    _: AppUser = Depends(require_admin),
    limit: int = Query(default=200, ge=1, le=1000),
    q: str | None = Query(default=None, alias="q")
):
    query = db.query(Event).order_by(Event.start_time.asc())
    if q:
        query = query.filter(
            or_(
                Event.title.ilike(f"%{q}%"),
                Event.description.ilike(f"%{q}%")
            )
        )
    events = query.order_by(Event.start_time.asc()).limit(limit).all()
    return [_to_joined(event) for event in events]


@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if not current_user.is_admin and not event.is_published and event.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to view this event")
    return event


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(payload: EventCreate, db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    _validate_fk(db, payload.venue_id, payload.organization_id, payload.category_id)
    event = Event(**payload.model_dump(mode="json"), created_by=current_user.id, updated_by=current_user.id, status="pending", is_published=False)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.put("/{event_id}", response_model=EventResponse)
def update_event(event_id: int, payload: EventUpdate, db: Session = Depends(get_db), current_user: AppUser = Depends(get_current_user)):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if not current_user.is_admin and event.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Only the owner or an admin can edit this event")

    data = payload.model_dump(exclude_unset=True, mode="json")
    if not current_user.is_admin:
        data.pop("status", None)
        data.pop("is_published", None)
        data["status"] = "pending"
        data["is_published"] = False

    _validate_fk(db, data.get("venue_id", event.venue_id), data.get("organization_id", event.organization_id), data.get("category_id", event.category_id))

    for field, value in data.items():
        setattr(event, field, value)
    event.updated_by = current_user.id
    db.commit()
    db.refresh(event)
    return event


@router.patch("/{event_id}/publish", response_model=EventResponse)
def publish_event(event_id: int, payload: PublishRequest, db: Session = Depends(get_db), admin_user: AppUser = Depends(require_admin)):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    event.is_published = payload.is_published
    event.status = payload.status
    event.updated_by = admin_user.id
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: int, db: Session = Depends(get_db), _: AppUser = Depends(require_admin)):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return None

