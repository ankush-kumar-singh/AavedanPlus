import json
import os
from datetime import datetime


AUDIT_DIR = "audit_logs"


def create_audit_log(user_id: str) -> list:
    return [
        {
            "timestamp": datetime.now().isoformat(),
            "event": "SESSION_STARTED",
            "user_id": user_id
        }
    ]


def add_audit_event(
    audit_log: list,
    event: str,
    user_id: str,
    details: dict | None = None
) -> list:

    entry = {
        "timestamp": datetime.now().isoformat(),
        "event": event,
        "user_id": user_id,
        "details": details or {}
    }

    audit_log.append(entry)

    return audit_log


def save_audit_log(
    user_id: str,
    audit_log: list
):
    os.makedirs(
        AUDIT_DIR,
        exist_ok=True
    )

    file_path = os.path.join(
        AUDIT_DIR,
        f"{user_id}.json"
    )

    with open(
        file_path,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            audit_log,
            file,
            indent=4,
            ensure_ascii=False
        )


def print_audit_log(audit_log: list):
    print()
    print("=" * 55)
    print("                 AUDIT LOG")
    print("=" * 55)

    for entry in audit_log:
        event = entry.get("event", "")
        details = entry.get("details", {})

        print()
        print(
            f"{entry.get('timestamp', '')} | {event}"
        )

        if details:
            for key, value in details.items():
                print(
                    f"  {key}: {value}"
                )

    print()
    print("=" * 55)
    print()