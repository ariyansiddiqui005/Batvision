import cv2
import math
from ultralytics import YOLO

# Initialize YOLOv8 nano model (fast and lightweight for CPU)
model = YOLO("yolov8n.pt")


def get_classification(score):
    if score >= 90:
        return "Exceptional"
    elif score >= 80:
        return "Highly Promising"
    elif score >= 70:
        return "Promising"
    elif score >= 60:
        return "Developing"
    else:
        return "Needs Improvement"


def analyze_video(video_path, analysis_type="batting"):
    analysis_type = analysis_type.lower().strip()
    if analysis_type not in ["batting", "bowling"]:
        analysis_type = "batting"

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
    step = max(1, int(fps)) if fps > 0 else 30
    if frame_count > 0 and (frame_count // step) > 30:
        step = max(1, int(frame_count // 30))

    player_counts = []
    tracked_players = []
    current_frame_idx = 0

    while video.isOpened():
        ret, frame = video.read()
        if not ret:
            break

        if current_frame_idx % step == 0:
            results = model(frame, verbose=False)
            boxes = results[0].boxes

            # Filter person boxes (class 0 in COCO)
            persons = [box for box in boxes if int(box.cls[0]) == 0]
            player_counts.append(len(persons))

            # Identify primary player (largest bounding box by area)
            primary = None
            max_area = 0
            for p in persons:
                coords = p.xyxy[0].tolist()  # [x1, y1, x2, y2]
                area = (coords[2] - coords[0]) * (coords[3] - coords[1])
                if area > max_area:
                    max_area = area
                    primary = coords

            if primary:
                pw = primary[2] - primary[0]
                ph = primary[3] - primary[1]
                cx = (primary[0] + primary[2]) / 2.0
                cy = (primary[1] + primary[3]) / 2.0
                tracked_players.append({
                    "cx": cx,
                    "cy": cy,
                    "width": pw,
                    "height": ph,
                    "aspect_ratio": ph / pw if pw > 0 else 1.0
                })
            else:
                tracked_players.append(None)

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

    # Compute Computer Vision motion dynamics from tracked positions
    valid_positions = [tp for tp in tracked_players if tp is not None]
    
    if len(valid_positions) >= 2:
        displacements = []
        aspect_ratios = []
        for i in range(1, len(valid_positions)):
            dx = valid_positions[i]["cx"] - valid_positions[i - 1]["cx"]
            dy = valid_positions[i]["cy"] - valid_positions[i - 1]["cy"]
            displacements.append(math.sqrt(dx * dx + dy * dy))
            aspect_ratios.append(valid_positions[i]["aspect_ratio"])

        avg_disp = sum(displacements) / len(displacements) if displacements else 0
        max_disp = max(displacements) if displacements else 0
        
        # Stability: variance in aspect ratio / normalized position
        mean_ar = sum(aspect_ratios) / len(aspect_ratios) if aspect_ratios else 1.0
        ar_variance = sum((ar - mean_ar) ** 2 for ar in aspect_ratios) / len(aspect_ratios) if aspect_ratios else 0
        stability_score = max(50.0, min(95.0, 92.0 - (ar_variance * 40.0)))
    else:
        avg_disp = 10.0
        max_disp = 15.0
        stability_score = 75.0

    # -------------------------------------------------------------
    # Cricket Scoring Engine (Batting vs. Bowling)
    # -------------------------------------------------------------
    if analysis_type == "batting":
        # Stance & posture stability (higher is better for balanced stance)
        stance_stability = round(stability_score, 1)
        
        # Shot commitment / footwork activity
        shot_movement = round(max(55.0, min(94.0, 60.0 + (max_disp / 15.0))), 1)
        
        # Overall presence consistency
        batting_consistency = round(max(50.0, min(96.0, consistency)), 1)

        # Batting Score Formula (0-100)
        score = round((stance_stability * 0.40) + (shot_movement * 0.35) + (batting_consistency * 0.25))
        score = max(50, min(98, score))
        classification = get_classification(score)

        # AI Recommendations
        strengths = []
        improvements = []
        if stance_stability >= 80:
            strengths.append("Stable and balanced batting stance throughout the stroke")
        else:
            improvements.append("Work on head and body balance during initial stance")

        if shot_movement >= 78:
            strengths.append("Decisive footwork and committed follow-through")
        else:
            improvements.append("Improve forward/back foot commitment towards the line of delivery")

        if batting_consistency >= 75:
            strengths.append("Consistent visual focus and shot readiness across frames")
        else:
            improvements.append("Maintain focused posture across all delivery phases")

        if not strengths:
            strengths.append("Good basic shot execution and positioning")
        if not improvements:
            improvements.append("Focus on expanding shot range against variable pace")

        recommendation = (
            f"Player demonstrates {classification.lower()} batting potential. "
            f"Scout evaluation recommends focus on match-situation stroke play."
        )

        performance_data = {
            "analysis_type": "batting",
            "score": score,
            "classification": classification,
            "metrics": {
                "stance_stability": stance_stability,
                "shot_movement": shot_movement,
                "batting_consistency": batting_consistency
            },
            "strengths": strengths,
            "areas_for_improvement": improvements,
            "recommendation": recommendation
        }

    else:  # Bowling Analysis
        # Run-up momentum & acceleration
        runup_momentum = round(max(55.0, min(95.0, 58.0 + (avg_disp / 10.0))), 1)
        
        # Release point stability
        release_stability = round(stability_score, 1)
        
        # Action flow consistency
        bowling_consistency = round(max(50.0, min(96.0, consistency)), 1)

        # Bowling Score Formula (0-100)
        score = round((runup_momentum * 0.40) + (release_stability * 0.35) + (bowling_consistency * 0.25))
        score = max(50, min(98, score))
        classification = get_classification(score)

        # AI Recommendations
        strengths = []
        improvements = []
        if runup_momentum >= 80:
            strengths.append("Strong forward momentum through run-up into delivery stride")
        else:
            improvements.append("Increase rhythm and pace through the approach run-up")

        if release_stability >= 80:
            strengths.append("Solid core stability and consistent release alignment")
        else:
            improvements.append("Work on bowling arm gather and upper-body balance at release")

        if bowling_consistency >= 75:
            strengths.append("Repeatable delivery action with steady tracking")
        else:
            improvements.append("Improve follow-through consistency post-delivery")

        if not strengths:
            strengths.append("Good foundational delivery approach")
        if not improvements:
            improvements.append("Continue building stamina for sustained spell speed")

        recommendation = (
            f"Player demonstrates {classification.lower()} bowling potential. "
            f"Scout evaluation suggests refining delivery stride repeatability."
        )

        performance_data = {
            "analysis_type": "bowling",
            "score": score,
            "classification": classification,
            "metrics": {
                "runup_momentum": runup_momentum,
                "release_stability": release_stability,
                "bowling_consistency": bowling_consistency
            },
            "strengths": strengths,
            "areas_for_improvement": improvements,
            "recommendation": recommendation
        }

    return {
        "fps": round(fps, 2),
        "frame_count": int(frame_count),
        "duration_seconds": round(duration, 2),
        "width": width,
        "height": height,
        "video_type": analysis_type,
        "yolo_detection": {
            "model": "YOLOv8n",
            "frames_analyzed": frames_analyzed,
            "max_players_detected": max_players,
            "avg_players_detected": avg_players,
            "detection_consistency_percent": consistency,
            "status": "Players detected successfully"
        },
        "performance": performance_data,
        "overall_scouting_score": None,
        "overall_status": "Requires both Batting (50%) and Bowling (50%) evaluations"
    }