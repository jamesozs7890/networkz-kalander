from fastapi import Query

from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.category import Category
from app.models.organization import Organization
from app.models.venue import Venue
from app.models.event import Event
from app.schemas.event import SimpleLookup

router = APIRouter(prefix="/meta", tags=["meta"])


@router.get("/categories", response_model=list[SimpleLookup])
def categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.name.asc()).all()


@router.get("/venues", response_model=list[SimpleLookup])
def venues(
    db: Session = Depends(get_db),
    q: str | None = Query(default=None, alias="q")
):
    query = db.query(Venue).order_by(Venue.name.asc())
    if q:
        query = query.filter(Venue.name.ilike(f"%{q}%"))
    return query.all()

# get events for a given venue
@router.get("/venues/{venue_id}/events", response_model=list[SimpleLookup])
def events_by_venue(venue_id: int, db: Session = Depends(get_db)):
    venue = db.get(Venue, venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    return [SimpleLookup(id=event.id, name=event.title, source_url=event.source_url) for event in venue.events]



@router.get("/organizations", response_model=list[SimpleLookup])
def organizations(db: Session = Depends(get_db), q: str | None = Query(default=None, alias="q")):
    query = db.query(Organization).order_by(Organization.name.asc())
    if q:
        query = query.filter(Organization.name.ilike(f"%{q}%"))
    return query.all()

# get events for a given organization
@router.get("/organizations/{org_id}/events", response_model=list[SimpleLookup])
def events_by_organization(org_id: int, db: Session = Depends(get_db)):
    org = db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return [SimpleLookup(id=event.id, name=event.title, source_url=event.source_url) for event in org.events]

# common search API for venues, organizations, and categories
@router.get("/search", response_model=list[SimpleLookup])
def search(
    db: Session = Depends(get_db),
    q: str = Query(..., min_length=1, alias="q")
):
    venues = db.query(Venue).filter(Venue.name.ilike(f"%{q}%")).all()
    organizations = db.query(Organization).filter(Organization.name.ilike(f"%{q}%")).all()
    categories = db.query(Category).filter(Category.name.ilike(f"%{q}%")).all()
    events = db.query(Event).filter(Event.title.ilike(f"%{q}%")).all()
    results = []
    for venue in venues:
        results.append(SimpleLookup(id=venue.id, name=f"Venue: {venue.name}"))
    for org in organizations:
        results.append(SimpleLookup(id=org.id, name=f"Organization: {org.name}"))
    for cat in categories:
        results.append(SimpleLookup(id=cat.id, name=f"Category: {cat.name}"))
    for event in events:
        results.append(SimpleLookup(id=event.id, name=f"Event: {event.title}", source_url=event.source_url))
    return results
