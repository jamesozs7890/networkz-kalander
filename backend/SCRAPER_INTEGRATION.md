# Scraper Integration Guide for Frontend Developers

## Purpose
This document explains how the frontend can trigger backend scraper/import operations and how to handle the response.

## Endpoint
- URL: `POST /admin/scrape`
- Method: `POST`
- Auth: admin-only Bearer token required

## Available modes
### 1. Run scrapers immediately
- Request: `POST /admin/scrape`
- Behavior: imports events from the scraper CSV files via the backend scraper scripts.

### 2. Dry run
- Request: `POST /admin/scrape?dry_run=true`
- Behavior: does not import anything.
- Purpose: validate that the CSV files exist and inspect row counts.

## Headers
Required headers:
- `Authorization: Bearer <ADMIN_TOKEN>`
- `Content-Type: application/json`

## Example requests
### Run scrapers
```js
fetch("http://localhost:8000/admin/scrape", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  },
})
```

### Dry run
```js
fetch("http://localhost:8000/admin/scrape?dry_run=true", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  },
})
```

## Expected response
The endpoint returns a JSON array of objects, one per scraper module.
Each object contains:
- `script` — the scraper script name
- `returncode` — `0` on success, non-zero on failure
- `stdout` — success output or result details
- `stderr` — error output if any

Example response:
```json
[
  {
    "script": "import_bsf.py",
    "returncode": 0,
    "stdout": "{'imported': 10, 'skipped_existing': 2, 'duplicate_rows': 0}",
    "stderr": ""
  },
  {
    "script": "import_marburg.py",
    "returncode": 0,
    "stdout": "{'imported': 15, 'skipped_existing': 1, 'duplicate_rows': 0}",
    "stderr": ""
  },
  {
    "script": "import_marburgliebe.py",
    "returncode": 0,
    "stdout": "{'imported': 3, 'skipped_existing': 0, 'duplicate_rows': 0}",
    "stderr": ""
  }
]
```

## Recommended frontend flow
1. Add a button such as `Run Scrapers` or `Trigger Scrape`
2. On click, call the API endpoint
3. Show a loading state while the request is in progress
4. Display the returned results for each script
5. If any `returncode` is not `0`, show the error from `stderr`

## Important notes
- The endpoint is protected and should only be usable by admin users.
- The backend uses a lock file so overlapping scraper runs are blocked.
- The integration is currently built on top of the existing scraper/import scripts; no scraper rewrite is required.

## File support
The backend currently executes these scripts:
- `backend/scrapers/import_bsf.py`
- `backend/scrapers/import_marburg.py`
- `backend/scrapers/import_marburgliebe.py`

Each script now exposes a `run_import()` function for direct import into the FastAPI route.

## Debugging
If the request fails or returns non-zero `returncode`:
- Check `stderr` in the response
- Ensure the admin bearer token is valid
- Ensure the backend is running and accessible

---

If you want, I can also add a small React example component for the button and fetch call.