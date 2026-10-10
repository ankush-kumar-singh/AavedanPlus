import json
import os
import tempfile
import threading
from pathlib import Path


APPLICATION_DATA_DIRECTORY = Path(__file__).resolve().parents[2]
APPLICATION_DB = APPLICATION_DATA_DIRECTORY / "local_application_records.json"
LEGACY_APPLICATION_DB = APPLICATION_DATA_DIRECTORY / "application_records.json"
RECORDS_LOCK = threading.RLock()


def load_application_records() -> list:
    with RECORDS_LOCK:
        source_path = APPLICATION_DB if APPLICATION_DB.exists() else LEGACY_APPLICATION_DB
        if not source_path.exists():
            return []
        try:
            with source_path.open("r", encoding="utf-8") as file:
                records = json.load(file)
        except (OSError, json.JSONDecodeError):
            return []
        return records if isinstance(records, list) else []


def save_application_records(records: list):
    APPLICATION_DB.parent.mkdir(parents=True, exist_ok=True)
    with RECORDS_LOCK:
        temporary_path = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="w",
                encoding="utf-8",
                dir=APPLICATION_DB.parent,
                prefix=f"{APPLICATION_DB.name}.",
                suffix=".tmp",
                delete=False,
            ) as file:
                temporary_path = Path(file.name)
                json.dump(records, file, indent=4, ensure_ascii=False)
                file.flush()
                os.fsync(file.fileno())
            os.replace(temporary_path, APPLICATION_DB)
        finally:
            if temporary_path and temporary_path.exists():
                temporary_path.unlink(missing_ok=True)
