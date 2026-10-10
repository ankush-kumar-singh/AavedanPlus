from datetime import datetime, timezone

from app.tools.record_store import (
    RECORDS_LOCK,
    load_application_records,
    save_application_records,
)


VALID_STATUSES = {
    "SUBMITTED",
    "UNDER_REVIEW",
    "APPROVED",
    "REJECTED",
}

STATUS_TRANSITIONS = {
    "SUBMITTED": {"UNDER_REVIEW", "APPROVED", "REJECTED"},
    "UNDER_REVIEW": {"APPROVED", "REJECTED"},
    "APPROVED": set(),
    "REJECTED": set(),
}


def get_application_status(application_id: str) -> dict | None:
    target_id = str(application_id).upper()
    with RECORDS_LOCK:
        records = load_application_records()
        for record in records:
            record_id = record.get("application_id")
            if isinstance(record_id, str) and record_id.upper() == target_id:
                return record
    return None


def update_application_status(
    application_id: str,
    new_status: str,
) -> dict | None:
    new_status = str(new_status).upper()
    if new_status not in VALID_STATUSES:
        return None

    target_id = str(application_id).upper()
    with RECORDS_LOCK:
        records = load_application_records()
        for record in records:
            record_id = record.get("application_id")
            if not isinstance(record_id, str) or record_id.upper() != target_id:
                continue

            current_status = str(record.get("status", "SUBMITTED")).upper()
            if new_status == current_status:
                return record
            if new_status not in STATUS_TRANSITIONS.get(current_status, set()):
                return None

            record["status"] = new_status
            history = record.get("status_history")
            if not isinstance(history, list):
                history = []
                record["status_history"] = history
            history.append(
                {
                    "status": new_status,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
            )
            save_application_records(records)
            return record

    return None
