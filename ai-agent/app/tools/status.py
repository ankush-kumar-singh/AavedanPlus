import json
import os
from datetime import datetime


APPLICATION_DB = "application_records.json"


VALID_STATUSES = {
    "SUBMITTED",
    "UNDER_REVIEW",
    "APPROVED",
    "REJECTED"
}


def load_application_records() -> list:

    if not os.path.exists(
        APPLICATION_DB
    ):
        return []

    try:

        with open(
            APPLICATION_DB,
            "r",
            encoding="utf-8"
        ) as file:

            records = json.load(
                file
            )

            if isinstance(
                records,
                list
            ):

                return records

    except Exception:
        pass

    return []


def save_application_records(
    records: list
):

    with open(
        APPLICATION_DB,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            records,
            file,
            indent=4,
            ensure_ascii=False
        )


def get_application_status(
    application_id: str
) -> dict | None:

    records = load_application_records()

    for record in records:

        if (
            record.get(
                "application_id"
            ).upper()
            == application_id.upper()
        ):

            return record

    return None


def update_application_status(
    application_id: str,
    new_status: str
) -> dict | None:

    new_status = new_status.upper()

    if new_status not in VALID_STATUSES:

        return None

    records = load_application_records()

    for record in records:

        if (
            record.get(
                "application_id"
            ).upper()
            == application_id.upper()
        ):

            record[
                "status"
            ] = new_status

            record.setdefault(
                "status_history",
                []
            )

            record[
                "status_history"
            ].append(
                {
                    "status":
                        new_status,
                    "timestamp":
                        datetime.now().isoformat()
                }
            )

            save_application_records(
                records
            )

            return record

    return None