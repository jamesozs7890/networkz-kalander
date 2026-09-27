from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    venue_id: Mapped[int | None] = mapped_column(ForeignKey("venues.id"), nullable=True)
    organization_id: Mapped[int | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"), nullable=True)
    source_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    scraper_source: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    collected_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    created_by: Mapped[int | None] = mapped_column(ForeignKey("app_users.id"), nullable=True)
    updated_by: Mapped[int | None] = mapped_column(ForeignKey("app_users.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")
    is_published: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    venue = relationship("Venue", back_populates="events")
    organization = relationship("Organization", back_populates="events")
    category = relationship("Category", back_populates="events")
    creator = relationship("AppUser", foreign_keys=[created_by], back_populates="created_events")
    updater = relationship("AppUser", foreign_keys=[updated_by], back_populates="updated_events")
