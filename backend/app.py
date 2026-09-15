from video_analysis import analyze_video
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import db

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "../uploads"
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


@app.route("/api/login", methods=["POST"])
def login():
    """Authenticates a player or scout by email and returns their profile and scores."""
    data = request.json or {}
    email = data.get("email", "").strip()
    role = data.get("role", "player")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    if role == "player":
        res = db.get_player_by_email(email)
        if res:
            return jsonify({
                "message": f"Welcome back, {res['player']['name']}!",
                "user": {
                    "id": res["player"]["id"],
                    "name": res["player"]["name"],
                    "email": res["player"]["email"],
                    "role": "player",
                    "age": res["player"]["age"],
                    "playerRole": res["player"]["role"],
                    "location": res["player"]["location"],
                    "battingStyle": res["player"]["battingStyle"],
                    "bowlingStyle": res["player"]["bowlingStyle"]
                },
                "scores": res["scores"]
            })
        else:
            # If not in DB, use user's email prefix or create profile
            display_name = email.split("@")[0].replace(".", " ").title()
            return jsonify({
                "message": f"Logged in as {display_name}",
                "user": {
                    "id": f"p-{abs(hash(email)) % 10000}",
                    "name": display_name,
                    "email": email,
                    "role": "player",
                    "age": 20,
                    "playerRole": "All-Rounder",
                    "location": "India",
                    "battingStyle": "Right Hand Bat",
                    "bowlingStyle": "Right Arm Fast"
                },
                "scores": {"batting": None, "bowling": None}
            })
    else:
        # Scout login
        scout_name = email.split("@")[0].replace(".", " ").title()
        return jsonify({
            "message": f"Welcome, {scout_name}!",
            "user": {
                "id": f"s-{abs(hash(email)) % 10000}",
                "name": scout_name,
                "email": email,
                "role": "scout",
                "organization": "State Cricket Academy"
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