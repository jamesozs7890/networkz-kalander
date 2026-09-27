from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.category import Category
from app.models.organization import Organization
from app.models.venue import Venue
from app.schemas.event import SimpleLookup

router = APIRouter(prefix="/meta", tags=["meta"])


@router.get("/categories", response_model=list[SimpleLookup])
def categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.name.asc()).all()


@router.get("/venues", response_model=list[SimpleLookup])
def venues(db: Session = Depends(get_db)):
    return db.query(Venue).order_by(Venue.name.asc()).all()


@router.get("/organizations", response_model=list[SimpleLookup])
def organizations(db: Session = Depends(get_db)):
    return db.query(Organization).order_by(Organization.name.asc()).all()
