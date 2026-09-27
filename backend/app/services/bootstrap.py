from sqlalchemy import text
from sqlalchemy.engine import Engine

from app.models.base import Base
from app.models import category, event, organization, user, venue  # noqa: F401


def initialize_database(engine: Engine) -> None:
    Base.metadata.create_all(bind=engine)

    statements = [
        "ALTER TABLE events ADD COLUMN IF NOT EXISTS created_by INTEGER NULL REFERENCES app_users(id) ON DELETE SET NULL",
        "ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_by INTEGER NULL REFERENCES app_users(id) ON DELETE SET NULL",
        "ALTER TABLE events ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'pending'",
        "ALTER TABLE events ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT FALSE",
        "ALTER TABLE events ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP",
        "ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP",
    ]

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))
