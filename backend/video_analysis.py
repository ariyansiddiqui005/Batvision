import cv2
from ultralytics import YOLO

# Initialize YOLOv8 nano model (fast and lightweight for CPU)
model = YOLO("yolov8n.pt")


def analyze_video(video_path):

    video = cv2.VideoCapture(video_path)

    if not video.isOpened():
        return {
            "error": "Could not open video"
        }

    fps = video.get(cv2.CAP_PROP_FPS)
    frame_count = video.get(cv2.CAP_PROP_FRAME_COUNT)

    duration = frame_count / fps if fps > 0 else 0

    width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # Frame sampling strategy:
    # Sample ~1 frame per second, with a minimum of 1 frame and max 30 frames
    # to ensure responsive processing on CPU while maintaining accurate metrics.
    step = max(1, int(fps)) if fps > 0 else 30
    if frame_count > 0 and (frame_count // step) > 30:
        step = max(1, int(frame_count // 30))

    player_counts = []
    current_frame_idx = 0

    while video.isOpened():
        ret, frame = video.read()
        if not ret:
            break

        if current_frame_idx % step == 0:
            # Run YOLO detection on sampled frame
            results = model(frame, verbose=False)
            
            # Class 0 in COCO dataset is 'person' (players / umpires / fielders)
            boxes = results[0].boxes
            persons = sum(1 for box in boxes if int(box.cls[0]) == 0)
            player_counts.append(persons)

        current_frame_idx += 1

    video.release()

    frames_analyzed = len(player_counts)
    max_players = max(player_counts) if player_counts else 0
    avg_players = round(sum(player_counts) / frames_analyzed, 1) if frames_analyzed > 0 else 0
    consistency = (
        round((sum(1 for c in player_counts if c > 0) / frames_analyzed) * 100, 1)
        if frames_analyzed > 0
        else 0
    )

    return {
        "fps": round(fps, 2),
        "frame_count": int(frame_count),
        "duration_seconds": round(duration, 2),
        "width": width,
        "height": height,
        "yolo_detection": {
            "model": "YOLOv8n",
            "frames_analyzed": frames_analyzed,
            "max_players_detected": max_players,
            "avg_players_detected": avg_players,
            "detection_consistency_percent": consistency,
            "status": "Players detected successfully"
        }
    }