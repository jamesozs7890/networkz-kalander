# kalendernetz backend

Minimal FastAPI backend for your manual PostgreSQL database.

## What it does
- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /events/public` → homepage
- `GET /events` → admin list
- `GET /events/{id}`
- `POST /events` → registered user creates a pending event
- `PUT /events/{id}` → owner or admin updates event
- `PATCH /events/{id}/publish` → admin publishes/unpublishes event
- `DELETE /events/{id}` → admin deletes event
- `GET /meta/categories`
- `GET /meta/venues`
- `GET /meta/organizations`
- `POST /admin/scrape` → admin-only dispatch of the GitHub Actions scraper workflow

All API routes are also available under the `/api` prefix for the frontend.

## Important
Your current `events` table does not contain workflow/auth columns. On startup, this backend adds them if missing:
- `created_by`
- `updated_by`
- `status`
- `is_published`
- `created_at`
- `updated_at`

It also creates a new table:
- `app_users`

This keeps your existing manual event data and adds the minimum backend fields needed for registered users and admins.

## Run
1. Create a virtual environment
2. Install requirements
3. Copy `.env.example` to `.env` and set the password
4. Start the server

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend flow
- Homepage fetches: `GET http://localhost:8000/events/public`
- Registered user creates event: `POST http://localhost:8000/events`
- Admin updates event: `PUT http://localhost:8000/events/{id}`
- Admin publishes event: `PATCH http://localhost:8000/events/{id}/publish`

## First admin user
Register a normal user first, then promote it in PostgreSQL:

```sql
UPDATE app_users
SET is_admin = TRUE
WHERE email = 'your-admin-email@example.com';
```

## Admin scraper sync

The admin dashboard starts the existing GitHub Actions workflow; it does not
run scrapers inside the API server. Configure these backend environment
variables:

- `GITHUB_TOKEN`: a fine-grained token with access to this repository and
  **Actions: write** permission
- `GITHUB_REPOSITORY`: repository in `owner/name` format (defaults to
  `jamesozs7890/networkz-kalander`)
- `GITHUB_WORKFLOW`: workflow file name (defaults to `event-sync.yml`)
- `GITHUB_REF`: branch to run (defaults to `main`)

The workflow also requires the `DATABASE_URL` GitHub Actions secret. The API
returns an error in the admin dashboard if dispatch is not configured or GitHub
rejects the request.
