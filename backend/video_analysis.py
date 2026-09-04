import cv2


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

    video.release()

    return {
        "fps": round(fps, 2),
        "frame_count": int(frame_count),
        "duration_seconds": round(duration, 2),
        "width": width,
        "height": height
    }