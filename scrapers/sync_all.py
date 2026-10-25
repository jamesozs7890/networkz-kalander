
import os
import subprocess
import sys
from pathlib import Path

from dotenv import load_dotenv


SCRAPERS_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRAPERS_DIR.parent / "backend"
load_dotenv(BACKEND_DIR / ".env")


STEPS = [
    ("bsf", [sys.executable, "bsf_scraper.py"]),
    ("bsf import", [sys.executable, "import_bsf.py"]),
    ("marburg express", [sys.executable, "marburg_express_data.py"]),
    ("marburg express import", [sys.executable, "import_marburg.py"]),
    ("marburg liebe", [sys.executable, "marburgliebe_scraper.py"]),
    ("marburg liebe import", [sys.executable, "import_marburgliebe.py"]),
    ("cafe trauma", [sys.executable, "cafe_trauma_scraper.py"]),
    ("cafe trauma import", [sys.executable, "import_cafe_trauma.py"]),
    ("marburg city", [sys.executable, "marburg_city_scraper.py"]),
    ("marburg city import", [sys.executable, "import_marburg_city.py"]),
]


def main() -> None:
    failures = []

    for name, command in STEPS:
        print(f"\n=== Running {name} ===", flush=True)

        try:
            subprocess.run(
                command,
                cwd=SCRAPERS_DIR,
                check=True,
                env=os.environ.copy(),
            )
        except subprocess.CalledProcessError as error:
            print(
                f"FAILED: {name} (exit code {error.returncode})",
                flush=True,
            )
            failures.append(name)

    if failures:
        print(
            "\nSynchronization finished with failures: "
            + ", ".join(failures),
            flush=True,
        )
        sys.exit(1)

    print("\nEvent synchronization completed.", flush=True)


if __name__ == "__main__":
    main()
