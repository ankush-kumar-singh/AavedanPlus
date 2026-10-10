import json
import sqlite3
import threading
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4


DATABASE_PATH = Path(__file__).resolve().parent.parent / "application_state.sqlite3"
DATABASE_LOCK = threading.RLock()


def _connect():
    connection = sqlite3.connect(DATABASE_PATH, timeout=30)
    connection.execute("PRAGMA journal_mode=WAL")
    connection.execute("PRAGMA foreign_keys=ON")
    return connection


@contextmanager
def _connection():
    connection = _connect()
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def initialize_session_store():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with DATABASE_LOCK, _connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS application_sessions (
                user_id TEXT PRIMARY KEY,
                state_json TEXT NOT NULL,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS audit_events (
                event_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                actor TEXT NOT NULL,
                event TEXT NOT NULL,
                details_json TEXT NOT NULL
            )
            """
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS audit_events_user_time "
            "ON audit_events(user_id, timestamp)"
        )


def load_all_sessions() -> dict:
    initialize_session_store()
    with DATABASE_LOCK, _connection() as connection:
        rows = connection.execute(
            "SELECT user_id, state_json FROM application_sessions"
        ).fetchall()

    sessions = {}
    for user_id, state_json in rows:
        try:
            state = json.loads(state_json)
        except (TypeError, json.JSONDecodeError):
            continue
        if isinstance(state, dict):
            sessions[user_id] = state
    return sessions


def load_session(user_id: str) -> dict | None:
    initialize_session_store()
    with DATABASE_LOCK, _connection() as connection:
        row = connection.execute(
            "SELECT state_json FROM application_sessions WHERE user_id = ?",
            (user_id,),
        ).fetchone()

    if not row:
        return None
    try:
        state = json.loads(row[0])
    except (TypeError, json.JSONDecodeError):
        return None
    return state if isinstance(state, dict) else None


def save_session(user_id: str, state: dict):
    initialize_session_store()
    state_json = json.dumps(state, ensure_ascii=False)
    with DATABASE_LOCK, _connection() as connection:
        connection.execute(
            """
            INSERT INTO application_sessions (user_id, state_json, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET
                state_json = excluded.state_json,
                updated_at = CURRENT_TIMESTAMP
            """,
            (user_id, state_json),
        )


def delete_session(user_id: str):
    initialize_session_store()
    with DATABASE_LOCK, _connection() as connection:
        connection.execute(
            "DELETE FROM application_sessions WHERE user_id = ?",
            (user_id,),
        )


def add_audit_event(
    user_id: str,
    actor: str,
    event: str,
    details: dict | None = None,
):
    initialize_session_store()
    event_record = {
        "event_id": uuid4().hex,
        "user_id": user_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "actor": actor,
        "event": event,
        "details": details or {},
    }
    with DATABASE_LOCK, _connection() as connection:
        connection.execute(
            """
            INSERT INTO audit_events
                (event_id, user_id, timestamp, actor, event, details_json)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                event_record["event_id"],
                user_id,
                event_record["timestamp"],
                actor,
                event,
                json.dumps(event_record["details"], ensure_ascii=False),
            ),
        )
    return event_record


def get_audit_events(user_id: str, limit: int = 500) -> list[dict]:
    initialize_session_store()
    safe_limit = max(1, min(int(limit), 1000))
    with DATABASE_LOCK, _connection() as connection:
        rows = connection.execute(
            """
            SELECT event_id, timestamp, actor, event, details_json
            FROM audit_events
            WHERE user_id = ?
            ORDER BY timestamp DESC, rowid DESC
            LIMIT ?
            """,
            (user_id, safe_limit),
        ).fetchall()

    events = []
    for event_id, timestamp, actor, event, details_json in reversed(rows):
        try:
            details = json.loads(details_json)
        except (TypeError, json.JSONDecodeError):
            details = {}
        events.append(
            {
                "event_id": event_id,
                "timestamp": timestamp,
                "actor": actor,
                "event": event,
                "details": details if isinstance(details, dict) else {},
            }
        )
    return events
