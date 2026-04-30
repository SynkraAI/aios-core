import os
from typing import Optional

import psycopg2
import psycopg2.extras

DATABASE_URL = os.getenv("DATABASE_URL")


def _connect():
    return psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)


def get_analysis(analysis_id: str) -> Optional[dict]:
    """Fetch analysis + user profile joined from DB."""
    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """SELECT a.id, a.user_id, a.status,
                          a.photo_front_url, a.photo_back_url,
                          u.goal, u.sex, u.age, u.height_cm, u.weight_kg
                   FROM analyses a
                   JOIN users u ON u.id = a.user_id
                   WHERE a.id = %s""",
                (analysis_id,),
            )
            row = cur.fetchone()
            return dict(row) if row else None


def mark_photos_deleted(analysis_id: str) -> None:
    """Nullify photo URLs and record deletion timestamp — LGPD."""
    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """UPDATE analyses
                   SET photo_front_url = NULL,
                       photo_back_url  = NULL,
                       photos_deleted_at = NOW()
                   WHERE id = %s""",
                (analysis_id,),
            )
        conn.commit()


def mark_failed(analysis_id: str) -> None:
    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE analyses SET status = 'failed' WHERE id = %s",
                (analysis_id,),
            )
        conn.commit()
