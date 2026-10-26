import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import get_settings
from app.models.user import AppUser
from app.routers.deps import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/scrape", status_code=status.HTTP_202_ACCEPTED)
def start_scraper_sync(_: AppUser = Depends(require_admin)) -> dict[str, str]:
    settings = get_settings()
    if not settings.github_token:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Scraper dispatch is not configured. Set GITHUB_TOKEN on the backend.",
        )

    request = Request(
        (
            "https://api.github.com/repos/"
            f"{settings.github_repository}/actions/workflows/"
            f"{settings.github_workflow}/dispatches"
        ),
        data=json.dumps({"ref": settings.github_ref}).encode(),
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {settings.github_token}",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
            "User-Agent": "KalenderNetz",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=15):
            pass
    except HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "GitHub Actions rejected the scraper workflow dispatch "
                f"(HTTP {exc.code}). Check GITHUB_TOKEN permissions and workflow settings."
            ),
        ) from exc
    except URLError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not reach GitHub Actions to start the scraper workflow.",
        ) from exc

    return {"message": "Scraper workflow started on GitHub Actions."}
