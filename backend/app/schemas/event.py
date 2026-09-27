from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class EventBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    start_time: datetime
    end_time: datetime | None = None
    venue_id: int | None = None
    organization_id: int | None = None
    category_id: int | None = None
    source_url: HttpUrl | None = None


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    venue_id: int | None = None
    organization_id: int | None = None
    category_id: int | None = None
    source_url: HttpUrl | None = None
    status: str | None = None
    is_published: bool | None = None


class PublishRequest(BaseModel):
    is_published: bool = True
    status: str = "published"


class EventResponse(BaseModel):
    id: int
    title: str
    description: str | None
    start_time: datetime
    end_time: datetime | None
    venue_id: int | None
    organization_id: int | None
    category_id: int | None
    source_url: str | None
    status: str
    is_published: bool
    created_by: int | None
    updated_by: int | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EventJoinedResponse(BaseModel):
    id: int
    title: str
    description: str | None
    start_time: datetime
    end_time: datetime | None
    source_url: str | None
    venue_id: int | None
    venue: str | None = None
    venue_address: str | None = None
    organization_id: int | None
    organization: str | None = None
    category_id: int | None
    category: str | None = None
    status: str
    is_published: bool


class SimpleLookup(BaseModel):
    id: int
    name: str
