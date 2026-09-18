from video_analysis import analyze_video
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import check_password_hash
import os
import db

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.abspath(os.path.join(BASE_DIR, "..", "uploads"))
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Attempt safe database initialization on startup
try:
    db.init_db()
except Exception as e:
    print(f"[BatVision] Database init skipped: {e}")


@app.route("/")
def home():
    return "BatVision Backend is Working!"


@app.route("/api/players", methods=["GET"])
def get_players():
    """Returns all registered players and their latest scores from MySQL."""
    feed = db.get_players_feed()
    if feed is not None:
        return jsonify({"players": feed, "source": "database"})
    return jsonify({"players": None, "source": "fallback", "message": "Using fallback mode"})


@app.route("/api/players", methods=["POST"])
def save_player():
    """Creates or updates a player profile in MySQL."""
    data = request.json or {}
    player_id = db.save_player_profile(data)
    return jsonify({
        "message": "Player profile updated successfully!",
        "player_id": player_id
    })


@app.route("/api/scouts", methods=["POST"])
def save_scout():
    """Creates or updates a scout profile in MySQL."""
    data = request.json or {}
    scout_id = db.save_scout_profile(data)
    return jsonify({
        "message": "Scout profile updated successfully!",
        "scout_id": scout_id
    })


@app.route("/api/shortlists", methods=["GET"])
def get_shortlists():
    """Returns player IDs bookmarked by a specific scout."""
    scout_id = request.args.get("scout_identifier", "").strip()
    if not scout_id:
        return jsonify({"shortlists": []})
    shortlists = db.get_shortlists_by_scout(scout_id)
    return jsonify({"shortlists": shortlists})


@app.route("/api/shortlists/toggle", methods=["POST"])
def toggle_shortlist():
    """Toggles a player bookmark for a scout."""
    data = request.json or {}
    scout_id = data.get("scout_identifier", "").strip()
    player_id = data.get("player_id")
    if not scout_id or player_id is None:
        return jsonify({"error": "scout_identifier and player_id are required"}), 400

    is_shortlisted = db.toggle_shortlist(scout_id, player_id)
    shortlists = db.get_shortlists_by_scout(scout_id)
    return jsonify({
        "message": "Player added to shortlist" if is_shortlisted else "Player removed from shortlist",
        "player_id": player_id,
        "is_shortlisted": is_shortlisted,
        "shortlists": shortlists
    })


@app.route("/api/login", methods=["POST"])
def login():
    """Authenticates a player or scout by email and password, returning their profile and scores."""
    data = request.json or {}
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()
    role = data.get("role", "player")

    if not email:
        return jsonify({"error": "Email is required."}), 400
    if not password:
        return jsonify({"error": "Password is required."}), 400

    if role == "player":
        res = db.get_player_by_email(email)
        if not res or not res.get("player"):
            return jsonify({"error": "Account not found. Please register first."}), 401

        player_data = res["player"]
        stored_pw = player_data.get("password")

        is_valid = False
        if stored_pw:
            try:
                is_valid = check_password_hash(stored_pw, password) or (stored_pw == password)
            except Exception:
                is_valid = (stored_pw == password)

        if not is_valid:
            return jsonify({"error": "Incorrect password. Please try again."}), 401

        return jsonify({
            "message": f"Welcome back, {player_data['name']}!",
            "user": {
                "id": player_data["id"],
                "name": player_data["name"],
                "email": player_data["email"],
                "role": "player",
                "age": player_data.get("age", 20),
                "playerRole": player_data.get("role", "All-Rounder"),
                "location": player_data.get("location", "India"),
                "battingStyle": player_data.get("battingStyle", "Right Hand Bat"),
                "bowlingStyle": player_data.get("bowlingStyle", "Right Arm Fast")
            },
            "scores": res.get("scores", {"batting": None, "bowling": None})
        })
    else:
        # Scout login
        res = db.get_scout_by_email(email)
        if not res:
            return jsonify({"error": "Account not found. Please register first."}), 401

        stored_pw = res.get("password")

        is_valid = False
        if stored_pw:
            try:
                is_valid = check_password_hash(stored_pw, password) or (stored_pw == password)
            except Exception:
                is_valid = (stored_pw == password)

        if not is_valid:
            return jsonify({"error": "Incorrect password. Please try again."}), 401

        return jsonify({
            "message": f"Welcome back, {res['name']}!",
            "user": {
                "id": res["id"],
                "name": res["name"],
                "email": res["email"],
                "role": "scout",
                "organization": res.get("organization", "State Cricket Academy")
            }
        })


@app.route("/api/upload", methods=["POST"])
def upload_video():

    if "video" not in request.files:
        return jsonify({"error": "No video uploaded"}), 400

    video = request.files["video"]

    if video.filename == "":
        return jsonify({"error": "No video selected"}), 400

    # Read and validate user-selected analysis type (batting vs. bowling)
    analysis_type = request.form.get("analysis_type", "batting").lower().strip()
    if analysis_type not in ["batting", "bowling"]:
        return jsonify({"error": "Invalid analysis_type. Must be 'batting' or 'bowling'"}), 400

    # Associate video with specific player by ID or Email
    player_id = request.form.get("player_id")
    email = request.form.get("email", "").strip()

    resolved_player_id = None
    if player_id and str(player_id).isdigit():
        resolved_player_id = int(player_id)
    elif email:
        p_res = db.get_player_by_email(email)
        if p_res and p_res.get("player"):
            resolved_player_id = p_res["player"]["id"]

    if not resolved_player_id:
        try:
            resolved_player_id = int(player_id)
        except (ValueError, TypeError):
            resolved_player_id = 4

    file_path = os.path.join(
        app.config["UPLOAD_FOLDER"],
        video.filename
    )

    video.save(file_path)

    analysis = analyze_video(file_path, analysis_type=analysis_type)

    # Save to MySQL if available
    db_saved = False
    if "performance" in analysis:
        try:
            saved_id = db.save_video_and_score(
                player_id=resolved_player_id,
                filename=video.filename,
                analysis_type=analysis_type,
                duration=analysis.get("duration_seconds", 0.0),
                fps=analysis.get("fps", 0.0),
                performance=analysis["performance"]
            )
            if saved_id:
                db_saved = True
        except Exception as err:
            print(f"[BatVision] Notice: Could not write to DB: {err}")

    return jsonify({
        "message": f"Video uploaded and analyzed successfully as {analysis_type}!",
        "filename": video.filename,
        "analysis_type": analysis_type,
        "saved_to_db": db_saved,
        "analysis": analysis
    })


if __name__ == "__main__":
    app.run(debug=True)