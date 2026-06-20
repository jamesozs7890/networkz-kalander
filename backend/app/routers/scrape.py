from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import importlib.util
import os
import sys
import time
from typing import Any

from app.routers.deps import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])

SCRAPERS = [
    "import_bsf.py",
    "import_marburg.py",
    "import_marburgliebe.py",
]

SCRAPERS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "scrapers"))
BACKEND_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
for path in (SCRAPERS_DIR, BACKEND_ROOT):
    if path not in sys.path:
        sys.path.insert(0, path)
LOCK_PATH = "/tmp/kalender_scrape.lock"


class ScrapeResponse(BaseModel):
    script: str
    returncode: int
    stdout: str
    stderr: str


def _acquire_lock(timeout: int = 3600) -> None:
    if os.path.exists(LOCK_PATH):
        # check staleness
        mtime = os.path.getmtime(LOCK_PATH)
        if time.time() - mtime < timeout:
            raise HTTPException(status_code=409, detail="Scrape already running")
        # stale lock, remove
        try:
            os.remove(LOCK_PATH)
        except Exception:
            raise HTTPException(status_code=500, detail="Could not remove stale lock")
    # create lock file
    with open(LOCK_PATH, "w") as fh:
        fh.write(str(time.time()))


def _release_lock() -> None:
    try:
        if os.path.exists(LOCK_PATH):
            os.remove(LOCK_PATH)
    except Exception:
        pass


def _load_scraper_module(script_path: str):
    spec = importlib.util.spec_from_file_location(
        os.path.splitext(os.path.basename(script_path))[0], script_path
    )
    if spec is None or spec.loader is None:
        raise ImportError(f"Could not load scraper module from {script_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@router.post("/scrape", response_model=list[ScrapeResponse])
def run_scrapers(dry_run: bool = False, _=Depends(require_admin)) -> Any:
    """Run scraper/import scripts. Requires admin. If dry_run, only report CSV counts."""
    # simple lock to avoid overlapping runs
    _acquire_lock()
    results = []
    try:
        if dry_run:
            # count rows in CSVs
            import csv
            for script in SCRAPERS:
                csv_name = script.replace("import_", "").replace('.py', '') + "_events.csv"
                csv_path = os.path.join(SCRAPERS_DIR, csv_name)
                info = {"script": script, "returncode": 0, "stdout": "", "stderr": ""}
                if os.path.exists(csv_path):
                    try:
                        with open(csv_path, newline="", encoding="utf-8") as fh:
                            r = csv.reader(fh)
                            total = sum(1 for _ in r) - 1
                        info["stdout"] = f"rows={total}"
                    except Exception as e:
                        info["returncode"] = 2
                        info["stderr"] = str(e)
                else:
                    info["returncode"] = 1
                    info["stderr"] = f"missing file: {csv_path}"
                results.append(info)
            return results

        for script in SCRAPERS:
            path = os.path.join(SCRAPERS_DIR, script)
            if not os.path.exists(path):
                results.append({"script": script, "returncode": 1, "stdout": "", "stderr": "script not found"})
                continue
            try:
                module = _load_scraper_module(path)
                if not hasattr(module, "run_import"):
                    raise AttributeError("run_import() not found")
                result = module.run_import()
                results.append({
                    "script": script,
                    "returncode": 0,
                    "stdout": str(result),
                    "stderr": "",
                })
            except Exception as exc:
                results.append({
                    "script": script,
                    "returncode": 1,
                    "stdout": "",
                    "stderr": str(exc),
                })

        return results
    finally:
        _release_lock()
