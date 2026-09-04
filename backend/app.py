from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "../uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


@app.route("/")
def home():
    return "BatVision Backend is Working!"


@app.route("/api/upload", methods=["POST"])
def upload_video():

    if "video" not in request.files:
        return jsonify({"error": "No video uploaded"}), 400

    video = request.files["video"]

    if video.filename == "":
        return jsonify({"error": "No video selected"}), 400

    file_path = os.path.join(
        app.config["UPLOAD_FOLDER"],
        video.filename
    )

    video.save(file_path)

    return jsonify({
        "message": "Video uploaded successfully!",
        "filename": video.filename
    })


if __name__ == "__main__":
    app.run(debug=True)