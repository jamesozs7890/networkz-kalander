from app.db.session import SessionLocal
from app.models.user import AppUser

db = SessionLocal()

users = db.query(AppUser).all()

for user in users:
    print(
        user.id,
        user.email,
        user.username,
        user.is_admin
    )

db.close()
