import sqlite3
import json
import logging
from pathlib import Path
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

# Put the DB in a 'data' directory in the root of the project (if running locally)
# or in /app/data inside Docker.
DB_DIR = Path(__file__).parent.parent.parent / "data"
DB_PATH = DB_DIR / "deepdive.db"

def init_db():
    """Initialize the SQLite database and create tables if they don't exist."""
    DB_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            topic TEXT NOT NULL,
            depth TEXT NOT NULL,
            status TEXT NOT NULL,
            report_markdown TEXT,
            research_raw_data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    # Handle migration if user_id doesn't exist
    try:
        cursor.execute("ALTER TABLE reports ADD COLUMN user_id TEXT")
    except sqlite3.OperationalError:
        pass # Column already exists
    conn.commit()
    conn.close()
    logger.info("Database initialized at %s", DB_PATH)

def save_report(topic: str, depth: str, status: str, report_markdown: str, research_results: list[dict], user_id: str = None) -> str:
    """Save a completed report to the database."""
    report_id = str(uuid.uuid4())
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO reports (id, user_id, topic, depth, status, report_markdown, research_raw_data)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        report_id,
        user_id,
        topic,
        depth,
        status,
        report_markdown,
        json.dumps(research_results)
    ))
    conn.commit()
    conn.close()
    logger.info("Saved report %s to database", report_id)
    return report_id

def get_history(user_id: str = None) -> list[dict]:
    """Retrieve all reports for a specific user ordered by creation date (newest first)."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    if user_id:
        cursor.execute("""
            SELECT id, topic, depth, status, created_at 
            FROM reports 
            WHERE user_id = ?
            ORDER BY created_at DESC
        """, (user_id,))
    else:
        cursor.execute("""
            SELECT id, topic, depth, status, created_at 
            FROM reports 
            WHERE user_id IS NULL OR user_id = ''
            ORDER BY created_at DESC
        """)
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def get_report(report_id: str, user_id: str = None) -> dict | None:
    """Retrieve a specific report with all its raw data."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    if user_id:
        cursor.execute("SELECT * FROM reports WHERE id = ? AND user_id = ?", (report_id, user_id))
    else:
        cursor.execute("SELECT * FROM reports WHERE id = ? AND (user_id IS NULL OR user_id = '')", (report_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        result = dict(row)
        # Parse the raw JSON back into a list of dicts
        result['research_raw_data'] = json.loads(result['research_raw_data']) if result['research_raw_data'] else []
        return result
    return None

# Auto-initialize on import
init_db()
