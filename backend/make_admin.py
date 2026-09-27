from app.db.session import SessionLocal
from app.models.user import AppUser

db = SessionLocal()

user = db.query(AppUser).filter(
    AppUser.email == "Rounak1490@gmail.com"
).first()

if user:
    user.is_admin = True
    db.commit()
    print("Admin access granted.")
else:
    print("User not found.")

db.close()
