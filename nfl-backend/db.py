import os, sqlite3
BASE_DIR = os.path.dirname(__file__)               # folder where db.py lives
DB_NAME = os.path.join(BASE_DIR, "nflpicker.db")   # always use backend DB

def get_connection():
    return sqlite3.connect(DB_NAME, check_same_thread=False)


def init_db():
    conn = get_connection()
    cur = conn.cursor()

    # Users table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL
        )
    """)

    # Picks table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS picks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            week INTEGER NOT NULL,
            game_id INTEGER NOT NULL,
            selection TEXT NOT NULL,
            UNIQUE(user_id, week, game_id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    conn.commit()
    conn.close()
