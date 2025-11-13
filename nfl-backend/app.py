from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from db import get_connection, init_db

app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": [r"http://localhost:\d+", r"http://127\.0\.0\.1:\d+"]}},
    supports_credentials=True
)

# Init DB on startup
init_db()

# --- Helper functions ---
def get_user_id(username):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE username = ?", (username,))
    row = cur.fetchone()
    conn.close()
    return row[0] if row else None

# --- Routes ---
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    if not username:
        return jsonify({"error": "Username required"}), 400

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO users (username) VALUES (?)", (username,))
        conn.commit()
    except sqlite3.IntegrityError:
        pass  # username already exists
    conn.close()

    return jsonify({"message": "Login successful", "username": username})

@app.route("/pick/<username>", methods=["GET", "POST"])
def pick(username):
    user_id = get_user_id(username)
    if not user_id:
        return jsonify({"error": "User not found"}), 404

    week = int(request.args.get("week", 1))
    game_id = request.args.get("game_id")
    if game_id is not None:
        game_id = int(game_id)

    if request.method == "GET":
        conn = get_connection()
        cur = conn.cursor()
        if game_id:
            cur.execute(
                "SELECT selection FROM picks WHERE user_id=? AND week=? AND game_id=?",
                (user_id, week, game_id),
            )
            row = cur.fetchone()
            conn.close()
            return jsonify({"selection": row[0] if row else None}), 200
        else:
            cur.execute(
                "SELECT game_id, selection FROM picks WHERE user_id=? AND week=?",
                (user_id, week),
            )
            rows = cur.fetchall()
            conn.close()
            return jsonify({"picks": {row[0]: row[1] for row in rows}}), 200

    data = request.get_json(silent=True) or {}
    selection = data.get("selection") or data.get("team_id") or data.get("team")
    if not selection or not game_id:
        return jsonify({"error": "game_id and selection are required"}), 400

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            INSERT INTO picks (user_id, week, game_id, selection)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id, week, game_id)
            DO UPDATE SET selection=excluded.selection
            """,
            (user_id, week, game_id, selection),
        )
        conn.commit()
    finally:
        conn.close()

    return jsonify({"ok": True, "selection": selection}), 200


    # map username -> user_id (your current design)
    user_id = get_user_id(username)
    if not user_id:
        return jsonify({"error": "User not found"}), 404

    if request.method == "GET":
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT selection FROM picks WHERE user_id=? AND week=? AND game_id=?",
            (user_id, week, game_id),
        )
        row = cur.fetchone()
        conn.close()
        return jsonify({"selection": row[0] if row else None}), 200

    # POST: save/upsert
    data = request.get_json(silent=True) or {}
    selection = data.get("selection") or data.get("team_id") or data.get("team")
    if not selection:
        return jsonify({"error": "selection (team id) required in JSON body"}), 400

    conn = get_connection()
    cur = conn.cursor()
    # Prefer SQLite UPSERT if available
    try:
        cur.execute(
            """
            INSERT INTO picks (user_id, week, game_id, selection)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id, week, game_id)
            DO UPDATE SET selection=excluded.selection
            """,
            (user_id, week, game_id, selection),
        )
    except Exception:
        # Fallback for older SQLite: manual upsert
        cur.execute(
            "UPDATE picks SET selection=? WHERE user_id=? AND week=? AND game_id=?",
            (selection, user_id, week, game_id),
        )
        if cur.rowcount == 0:
            cur.execute(
                "INSERT INTO picks (user_id, week, game_id, selection) VALUES (?, ?, ?, ?)",
                (user_id, week, game_id, selection),
            )
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "selection": selection}), 200

    return jsonify({"selection": row[0] if row else None})

@app.route("/picks/all", methods=["GET"])
def list_all_users_with_picks():
    week = int(request.args.get("week", 1))
    game_id = int(request.args.get("game_id", 1))

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT u.username, p.selection
        FROM users u
        LEFT JOIN picks p
          ON p.user_id = u.id AND p.week = ? AND p.game_id = ?
        ORDER BY u.username COLLATE NOCASE
    """, (week, game_id))
    rows = cur.fetchall()
    conn.close()

    return jsonify([{"username": r[0], "selection": r[1]} for r in rows])

# NEW: get all picks for one user & week in a single call
@app.get("/picks")
def picks_for_week():
    user = request.args.get("user")
    if not user:
        return jsonify({"error": "user required"}), 400

    week = int(request.args.get("week", 1))

    user_id = get_user_id(user)
    if not user_id:
        # no user yet = no picks; return empty map (easier for frontend)
        return jsonify({"picks": {}}), 200

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT game_id, selection FROM picks WHERE user_id=? AND week=?",
        (user_id, week),
    )
    rows = cur.fetchall()
    conn.close()

    # rows are tuples in your codebase (you use row[0] elsewhere)
    out = {row[0]: row[1] for row in rows}
    return jsonify({"picks": out}), 200

if __name__ == "__main__":
    app.run(debug=True, port=5001)
