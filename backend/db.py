import os
import json
import mysql.connector
from mysql.connector import Error

# Database connection configuration (configurable via environment variables)
DB_HOST = os.environ.get("DB_HOST", "127.0.0.1")
DB_USER = os.environ.get("DB_USER", "root")
DB_PASS = os.environ.get("DB_PASS", "root")
DB_NAME = os.environ.get("DB_NAME", "batvision")

# -------------------------------------------------------------
# In-Memory Cache Store (Active fallback when MySQL is offline)
# -------------------------------------------------------------
IN_MEMORY_PLAYERS = [
    {
        "id": 1,
        "name": "Rohan Deshmukh",
        "email": "rohan.deshmukh@example.com",
        "age": 19,
        "role": "Batsman",
        "batting_style": "Right Hand Bat",
        "bowling_style": "Right Arm Off Break",
        "location": "Pune, Maharashtra"
    },
    {
        "id": 2,
        "name": "Karanveer Gill",
        "email": "karanveer.gill@example.com",
        "age": 21,
        "role": "Bowler",
        "batting_style": "Left Hand Bat",
        "bowling_style": "Left Arm Fast",
        "location": "Amritsar, Punjab"
    },
    {
        "id": 3,
        "name": "Yashwardhan Nair",
        "email": "yash.nair@example.com",
        "age": 18,
        "role": "All-Rounder",
        "batting_style": "Right Hand Bat",
        "bowling_style": "Right Arm Leg Spin",
        "location": "Kochi, Kerala"
    },
    {
        "id": 4,
        "name": "Amaan Khan",
        "email": "amaan.khan@example.com",
        "age": 20,
        "role": "All-Rounder",
        "batting_style": "Right Hand Bat",
        "bowling_style": "Right Arm Fast-Medium",
        "location": "Mumbai, Maharashtra"
    }
]

IN_MEMORY_SCORES = [
    {
        "player_id": 1,
        "analysis_type": "batting",
        "score": 88,
        "classification": "Highly Promising",
        "metrics": {"timing_efficiency_pct": 91, "bat_swing_speed_kmh": 128, "footwork_rating": 86},
        "strengths": ["Elite bat-swing velocity through the line", "Fluid transfer of weight on drive execution"],
        "areas_for_improvement": ["Occasional front-pad exposure against late in-swing"],
        "recommendation": "High potential top-order batsman. Ready for provincial academy selection."
    },
    {
        "player_id": 1,
        "analysis_type": "bowling",
        "score": 72,
        "classification": "Promising",
        "metrics": {"release_speed_kmh": 86, "release_height_m": 1.95, "seam_deviation_deg": 3.2},
        "strengths": ["Decent revolutions on the off-break release"],
        "areas_for_improvement": ["Tendency to drop arm angle on flatter trajectory"],
        "recommendation": "Useful part-time spin option."
    },
    {
        "player_id": 2,
        "analysis_type": "batting",
        "score": 68,
        "classification": "Developing",
        "metrics": {"timing_efficiency_pct": 72, "bat_swing_speed_kmh": 105, "footwork_rating": 66},
        "strengths": ["Capable lower-order boundary striker"],
        "areas_for_improvement": ["High back-lift leads to vulnerability on short balls"],
        "recommendation": "Lower order utility contributor."
    },
    {
        "player_id": 2,
        "analysis_type": "bowling",
        "score": 92,
        "classification": "Exceptional",
        "metrics": {"release_speed_kmh": 139, "release_height_m": 2.15, "seam_deviation_deg": 6.8},
        "strengths": ["Explosive run-up gather and rapid arm whip", "Consistent seam presentation generating late away-movement"],
        "areas_for_improvement": ["Follow-through landing occasionally drifts onto the pitch danger zone"],
        "recommendation": "Priority Tier-1 fast bowling asset. Recommend immediate trial invitation."
    },
    {
        "player_id": 3,
        "analysis_type": "batting",
        "score": 84,
        "classification": "Highly Promising",
        "metrics": {"timing_efficiency_pct": 87, "bat_swing_speed_kmh": 122, "footwork_rating": 83},
        "strengths": ["Compact defensive technique with crisp punch shots"],
        "areas_for_improvement": ["Strike rotation against spin in middle overs"],
        "recommendation": "Solid middle-order anchor."
    },
    {
        "player_id": 3,
        "analysis_type": "bowling",
        "score": 86,
        "classification": "Highly Promising",
        "metrics": {"release_speed_kmh": 91, "release_height_m": 1.92, "seam_deviation_deg": 5.4},
        "strengths": ["Sharp turn on leg break with deceptive googly variation"],
        "areas_for_improvement": ["Release consistency drops during high-pressure spells"],
        "recommendation": "Well-balanced all-round profile for franchise scout shortlists."
    }
]

IN_MEMORY_SCOUTS = [
    {
        "id": 1,
        "name": "Coach Vikram",
        "email": "vikram@cricket.in",
        "organization": "National Cricket Academy"
    }
]

IN_MEMORY_SHORTLISTS = [
    {"scout_identifier": "vikram@cricket.in", "player_id": 2}
]


def get_connection(use_database=True):
    """Establishes connection to MySQL. Returns connection or None if unavailable."""
    try:
        if use_database:
            conn = mysql.connector.connect(
                host=DB_HOST,
                user=DB_USER,
                password=DB_PASS,
                database=DB_NAME,
                connect_timeout=2
            )
        else:
            conn = mysql.connector.connect(
                host=DB_HOST,
                user=DB_USER,
                password=DB_PASS,
                connect_timeout=2
            )
        return conn
    except Error:
        return None


def init_db():
    """Initializes the database and executes schema.sql if MySQL is running."""
    conn = get_connection(use_database=False)
    if not conn:
        return False

    try:
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME};")
        cursor.close()
        conn.close()

        conn = get_connection(use_database=True)
        if not conn:
            return False

        schema_path = os.path.join(os.path.dirname(__file__), "..", "database", "schema.sql")
        if os.path.exists(schema_path):
            with open(schema_path, "r", encoding="utf-8") as f:
                schema_sql = f.read()

            cursor = conn.cursor()
            for statement in schema_sql.split(";"):
                stmt = statement.strip()
                if stmt:
                    try:
                        cursor.execute(stmt)
                    except Error as err:
                        pass
            conn.commit()
            cursor.close()
            print("[BatVision DB] Database initialized with schema.sql successfully!")
        conn.close()
        return True
    except Error as e:
        print(f"[BatVision DB] Initialization notice: {e}")
        return False


def get_classification(score):
    if score is None:
        return "Unranked"
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


def save_video_and_score(player_id, filename, analysis_type, duration, fps, performance):
    """Saves an analyzed video and performance score into MySQL (and in-memory store)."""
    score = performance.get("score", 70)
    classification = performance.get("classification", get_classification(score))
    metrics = performance.get("metrics", {})
    strengths = performance.get("strengths", [])
    improvements = performance.get("areas_for_improvement", [])
    recommendation = performance.get("recommendation", "")

    # 1. Update in-memory fallback store
    score_entry = {
        "player_id": int(player_id),
        "analysis_type": analysis_type,
        "score": score,
        "classification": classification,
        "metrics": metrics,
        "strengths": strengths,
        "areas_for_improvement": improvements,
        "recommendation": recommendation
    }
    # Replace existing score of same type for this player if exists, or append
    replaced = False
    for i, s in enumerate(IN_MEMORY_SCORES):
        if s["player_id"] == int(player_id) and s["analysis_type"] == analysis_type:
            IN_MEMORY_SCORES[i] = score_entry
            replaced = True
            break
    if not replaced:
        IN_MEMORY_SCORES.append(score_entry)

    # 2. Persist to MySQL if available
    conn = get_connection()
    if conn:
        try:
            cursor = conn.cursor()
            video_sql = """
                INSERT INTO videos (player_id, filename, video_type, duration_seconds, fps)
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(video_sql, (player_id, filename, analysis_type, duration, fps))
            video_id = cursor.lastrowid

            score_sql = """
                INSERT INTO performance_scores 
                (player_id, video_id, analysis_type, score, classification, metrics_json, strengths_json, improvements_json, recommendation)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(score_sql, (
                player_id, video_id, analysis_type, score, classification,
                json.dumps(metrics), json.dumps(strengths), json.dumps(improvements), recommendation
            ))
            conn.commit()
            cursor.close()
            conn.close()
            return video_id
        except Error as e:
            print(f"[BatVision DB] Notice: DB insert skipped ({e}). Saved in-memory.")

    return 1


def get_players_feed():
    """Retrieves all players with their latest Batting and Bowling scores."""
    conn = get_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM players ORDER BY id ASC")
            players = cursor.fetchall()

            feed = []
            for p in players:
                player_id = p["id"]

                cursor.execute("""
                    SELECT score, classification, metrics_json, strengths_json, improvements_json, recommendation
                    FROM performance_scores
                    WHERE player_id = %s AND analysis_type = 'batting'
                    ORDER BY created_at DESC LIMIT 1
                """, (player_id,))
                bat_row = cursor.fetchone()

                cursor.execute("""
                    SELECT score, classification, metrics_json, strengths_json, improvements_json, recommendation
                    FROM performance_scores
                    WHERE player_id = %s AND analysis_type = 'bowling'
                    ORDER BY created_at DESC LIMIT 1
                """, (player_id,))
                bowl_row = cursor.fetchone()

                batting_score = bat_row["score"] if bat_row else None
                bowling_score = bowl_row["score"] if bowl_row else None

                overall_score = None
                classification = "Unranked"
                if batting_score is not None and bowling_score is not None:
                    overall_score = round((batting_score * 0.50) + (bowling_score * 0.50))
                    classification = get_classification(overall_score)
                elif batting_score is not None:
                    classification = bat_row["classification"]
                elif bowling_score is not None:
                    classification = bowl_row["classification"]

                strengths = []
                improvements = []
                recommendation = ""
                if bat_row:
                    try:
                        strengths.extend(json.loads(bat_row["strengths_json"]))
                        improvements.extend(json.loads(bat_row["improvements_json"]))
                        recommendation = bat_row["recommendation"]
                    except Exception:
                        pass
                if bowl_row:
                    try:
                        strengths.extend(json.loads(bowl_row["strengths_json"]))
                        improvements.extend(json.loads(bowl_row["improvements_json"]))
                        if not recommendation:
                            recommendation = bowl_row["recommendation"]
                    except Exception:
                        pass

                feed.append({
                    "id": player_id,
                    "name": p["name"],
                    "email": p.get("email", ""),
                    "age": p["age"],
                    "role": p["role"],
                    "location": p["location"],
                    "battingStyle": p["batting_style"],
                    "bowlingStyle": p["bowling_style"],
                    "battingScore": batting_score,
                    "bowlingScore": bowling_score,
                    "overallScore": overall_score,
                    "classification": classification,
                    "highlights": f"Verified {p['role']} from {p['location']}.",
                    "reportDetails": {
                        "strengths": strengths or ["Consistent fundamentals"],
                        "improvements": improvements or ["Continue building match experience"],
                        "recommendation": recommendation or "Candidate active on BatVision platform."
                    } if (bat_row or bowl_row) else None
                })

            cursor.close()
            conn.close()
            return feed
        except Error as e:
            print(f"[BatVision DB] Error loading players feed from DB: {e}")

    # Fallback to in-memory store
    feed = []
    for p in IN_MEMORY_PLAYERS:
        pid = p["id"]
        # Find latest batting & bowling in memory
        bat_score = next((s for s in reversed(IN_MEMORY_SCORES) if s["player_id"] == pid and s["analysis_type"] == "batting"), None)
        bowl_score = next((s for s in reversed(IN_MEMORY_SCORES) if s["player_id"] == pid and s["analysis_type"] == "bowling"), None)

        b_val = bat_score["score"] if bat_score else None
        bw_val = bowl_score["score"] if bowl_score else None

        overall = None
        cls = "Unranked"
        if b_val is not None and bw_val is not None:
            overall = round((b_val * 0.5) + (bw_val * 0.5))
            cls = get_classification(overall)
        elif b_val is not None:
            cls = bat_score["classification"]
        elif bw_val is not None:
            cls = bowl_score["classification"]

        strengths = []
        improvements = []
        rec = ""
        if bat_score:
            strengths.extend(bat_score.get("strengths", []))
            improvements.extend(bat_score.get("areas_for_improvement", []))
            rec = bat_score.get("recommendation", "")
        if bowl_score:
            strengths.extend(bowl_score.get("strengths", []))
            improvements.extend(bowl_score.get("areas_for_improvement", []))
            if not rec:
                rec = bowl_score.get("recommendation", "")

        feed.append({
            "id": pid,
            "name": p["name"],
            "email": p.get("email", ""),
            "age": p["age"],
            "role": p["role"],
            "location": p["location"],
            "battingStyle": p["batting_style"],
            "bowlingStyle": p["bowling_style"],
            "battingScore": b_val,
            "bowlingScore": bw_val,
            "overallScore": overall,
            "classification": cls,
            "highlights": f"Verified {p['role']} from {p['location']}.",
            "reportDetails": {
                "strengths": strengths or ["Consistent fundamentals"],
                "improvements": improvements or ["Continue building match experience"],
                "recommendation": rec or "Candidate active on BatVision platform."
            } if (bat_score or bowl_score) else None
        })

    return feed


def save_player_profile(data):
    """Inserts or updates a player's profile in MySQL and in-memory store."""
    name = data.get("name", "New Player")
    email = data.get("email", None)
    age = int(data.get("age", 20))
    role = data.get("role", "All-Rounder")
    batting_style = data.get("battingStyle", "Right Hand Bat")
    bowling_style = data.get("bowlingStyle", "Right Arm Fast")
    location = data.get("location", "Mumbai, India")
    player_id = data.get("id")

    assigned_id = None

    # Try MySQL first
    conn = get_connection()
    if conn:
        try:
            cursor = conn.cursor()
            if player_id and str(player_id).isdigit():
                update_sql = """
                    UPDATE players 
                    SET name=%s, age=%s, role=%s, batting_style=%s, bowling_style=%s, location=%s
                    WHERE id=%s
                """
                cursor.execute(update_sql, (name, age, role, batting_style, bowling_style, location, int(player_id)))
                conn.commit()
                assigned_id = int(player_id)
            elif email:
                cursor.execute("SELECT id FROM players WHERE LOWER(email) = LOWER(%s) LIMIT 1", (email.strip(),))
                row = cursor.fetchone()
                if row:
                    assigned_id = row[0]
                    update_sql = """
                        UPDATE players 
                        SET name=%s, age=%s, role=%s, batting_style=%s, bowling_style=%s, location=%s
                        WHERE id=%s
                    """
                    cursor.execute(update_sql, (name, age, role, batting_style, bowling_style, location, assigned_id))
                    conn.commit()
                else:
                    sql = """
                        INSERT INTO players (name, email, age, role, batting_style, bowling_style, location)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """
                    cursor.execute(sql, (name, email, age, role, batting_style, bowling_style, location))
                    conn.commit()
                    assigned_id = cursor.lastrowid
            cursor.close()
            conn.close()
        except Error as e:
            print(f"[BatVision DB] DB save warning ({e}). Syncing in memory.")

    # Update in-memory store
    if not assigned_id:
        if player_id and str(player_id).isdigit():
            assigned_id = int(player_id)
        elif email:
            existing = next((p for p in IN_MEMORY_PLAYERS if p.get("email", "").lower() == email.lower().strip()), None)
            if existing:
                assigned_id = existing["id"]
        if not assigned_id:
            assigned_id = max([p["id"] for p in IN_MEMORY_PLAYERS], default=4) + 1

    # Check if exists in IN_MEMORY_PLAYERS
    found = False
    for p in IN_MEMORY_PLAYERS:
        if p["id"] == assigned_id or (email and p.get("email", "").lower() == email.lower().strip()):
            p["id"] = assigned_id
            p["name"] = name
            if email:
                p["email"] = email
            p["age"] = age
            p["role"] = role
            p["batting_style"] = batting_style
            p["bowling_style"] = bowling_style
            p["location"] = location
            found = True
            break

    if not found:
        IN_MEMORY_PLAYERS.append({
            "id": assigned_id,
            "name": name,
            "email": email or "",
            "age": age,
            "role": role,
            "batting_style": batting_style,
            "bowling_style": bowling_style,
            "location": location
        })

    return assigned_id


def get_player_by_email(email):
    """Finds a player by email address and retrieves their profile and scores."""
    cleaned_email = email.strip().lower()

    # Try MySQL first
    conn = get_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM players WHERE LOWER(email) = LOWER(%s) LIMIT 1", (cleaned_email,))
            player = cursor.fetchone()

            if player:
                player_id = player["id"]

                cursor.execute("""
                    SELECT score, classification, metrics_json, strengths_json, improvements_json, recommendation
                    FROM performance_scores
                    WHERE player_id = %s AND analysis_type = 'batting'
                    ORDER BY created_at DESC LIMIT 1
                """, (player_id,))
                bat_row = cursor.fetchone()

                cursor.execute("""
                    SELECT score, classification, metrics_json, strengths_json, improvements_json, recommendation
                    FROM performance_scores
                    WHERE player_id = %s AND analysis_type = 'bowling'
                    ORDER BY created_at DESC LIMIT 1
                """, (player_id,))
                bowl_row = cursor.fetchone()

                cursor.close()
                conn.close()

                def parse_score(row, type_name):
                    if not row:
                        return None
                    try:
                        metrics = json.loads(row["metrics_json"]) if row.get("metrics_json") else {}
                        strengths = json.loads(row["strengths_json"]) if row.get("strengths_json") else []
                        improvements = json.loads(row["improvements_json"]) if row.get("improvements_json") else []
                    except Exception:
                        metrics, strengths, improvements = {}, [], []
                    return {
                        "analysis_type": type_name,
                        "score": row["score"],
                        "classification": row["classification"],
                        "metrics": metrics,
                        "strengths": strengths,
                        "areas_for_improvement": improvements,
                        "recommendation": row.get("recommendation", "")
                    }

                return {
                    "player": {
                        "id": player_id,
                        "name": player["name"],
                        "email": player["email"],
                        "age": player["age"],
                        "role": player["role"],
                        "battingStyle": player["batting_style"],
                        "bowlingStyle": player["bowling_style"],
                        "location": player["location"]
                    },
                    "scores": {
                        "batting": parse_score(bat_row, "batting"),
                        "bowling": parse_score(bowl_row, "bowling")
                    }
                }
        except Error as e:
            print(f"[BatVision DB] DB lookup error: {e}")

    # Fallback to in-memory store
    matched_player = next((p for p in IN_MEMORY_PLAYERS if p.get("email", "").strip().lower() == cleaned_email), None)
    if matched_player:
        pid = matched_player["id"]
        bat_score = next((s for s in reversed(IN_MEMORY_SCORES) if s["player_id"] == pid and s["analysis_type"] == "batting"), None)
        bowl_score = next((s for s in reversed(IN_MEMORY_SCORES) if s["player_id"] == pid and s["analysis_type"] == "bowling"), None)

        return {
            "player": {
                "id": pid,
                "name": matched_player["name"],
                "email": matched_player.get("email", ""),
                "age": matched_player["age"],
                "role": matched_player["role"],
                "battingStyle": matched_player["batting_style"],
                "bowlingStyle": matched_player["bowling_style"],
                "location": matched_player["location"]
            },
            "scores": {
                "batting": bat_score,
                "bowling": bowl_score
            }
        }

    return None


def save_scout_profile(data):
    """Inserts or updates a scout profile in MySQL and in-memory fallback."""
    name = data.get("name", "Scout User").strip()
    email = data.get("email", "").strip().lower()
    organization = data.get("organization", "State Cricket Academy").strip()
    scout_id = data.get("id")

    assigned_id = None
    conn = get_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS scouts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(120) UNIQUE NOT NULL,
                    organization VARCHAR(150) DEFAULT 'State Cricket Academy',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            if scout_id and str(scout_id).isdigit():
                cursor.execute("""
                    UPDATE scouts SET name=%s, organization=%s WHERE id=%s
                """, (name, organization, int(scout_id)))
                conn.commit()
                assigned_id = int(scout_id)
            elif email:
                cursor.execute("SELECT id FROM scouts WHERE LOWER(email) = %s LIMIT 1", (email,))
                row = cursor.fetchone()
                if row:
                    assigned_id = row[0]
                    cursor.execute("""
                        UPDATE scouts SET name=%s, organization=%s WHERE id=%s
                    """, (name, organization, assigned_id))
                    conn.commit()
                else:
                    cursor.execute("""
                        INSERT INTO scouts (name, email, organization) VALUES (%s, %s, %s)
                    """, (name, email, organization))
                    conn.commit()
                    assigned_id = cursor.lastrowid
            cursor.close()
            conn.close()
        except Error as e:
            print(f"[BatVision DB] Scout save notice ({e}). Syncing in-memory.")

    if not assigned_id:
        if scout_id and str(scout_id).isdigit():
            assigned_id = int(scout_id)
        elif email:
            existing = next((s for s in IN_MEMORY_SCOUTS if s["email"].lower() == email), None)
            if existing:
                assigned_id = existing["id"]
        if not assigned_id:
            assigned_id = max([s["id"] for s in IN_MEMORY_SCOUTS], default=100) + 1

    # Sync to IN_MEMORY_SCOUTS
    found = False
    for s in IN_MEMORY_SCOUTS:
        if s["id"] == assigned_id or (email and s["email"].lower() == email):
            s["id"] = assigned_id
            s["name"] = name
            s["email"] = email
            s["organization"] = organization
            found = True
            break
    if not found:
        IN_MEMORY_SCOUTS.append({
            "id": assigned_id,
            "name": name,
            "email": email,
            "organization": organization
        })

    return assigned_id


def get_scout_by_email(email):
    """Retrieves a scout by email from MySQL or in-memory fallback."""
    cleaned = email.strip().lower()
    conn = get_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM scouts WHERE LOWER(email) = %s LIMIT 1", (cleaned,))
            scout = cursor.fetchone()
            cursor.close()
            conn.close()
            if scout:
                return {
                    "id": scout["id"],
                    "name": scout["name"],
                    "email": scout["email"],
                    "role": "scout",
                    "organization": scout["organization"]
                }
        except Error as e:
            print(f"[BatVision DB] Scout lookup error: {e}")

    # Fallback to in-memory
    match = next((s for s in IN_MEMORY_SCOUTS if s["email"].lower() == cleaned), None)
    if match:
        return {
            "id": match["id"],
            "name": match["name"],
            "email": match["email"],
            "role": "scout",
            "organization": match["organization"]
        }
    return None


def get_shortlists_by_scout(scout_identifier):
    """Returns a list of player_ids shortlisted by the scout."""
    scout_id = str(scout_identifier).strip().lower()
    conn = get_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT player_id FROM shortlists WHERE LOWER(scout_identifier) = %s", (scout_id,))
            rows = cursor.fetchall()
            cursor.close()
            conn.close()
            return [r[0] for r in rows]
        except Error as e:
            print(f"[BatVision DB] Shortlist lookup error: {e}")

    # Fallback to in-memory
    return [s["player_id"] for s in IN_MEMORY_SHORTLISTS if s["scout_identifier"].lower() == scout_id]


def toggle_shortlist(scout_identifier, player_id):
    """Adds or removes a player from a scout's shortlist in MySQL and in-memory."""
    scout_id = str(scout_identifier).strip().lower()
    pid = int(player_id)
    is_shortlisted = False

    conn = get_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM shortlists WHERE LOWER(scout_identifier) = %s AND player_id = %s", (scout_id, pid))
            row = cursor.fetchone()
            if row:
                cursor.execute("DELETE FROM shortlists WHERE id = %s", (row[0],))
                is_shortlisted = False
            else:
                cursor.execute("INSERT INTO shortlists (scout_identifier, player_id) VALUES (%s, %s)", (scout_id, pid))
                is_shortlisted = True
            conn.commit()
            cursor.close()
            conn.close()
        except Error as e:
            print(f"[BatVision DB] Toggle shortlist error: {e}")

    # Sync in-memory
    existing_idx = next((i for i, s in enumerate(IN_MEMORY_SHORTLISTS) if s["scout_identifier"].lower() == scout_id and s["player_id"] == pid), None)
    if existing_idx is not None:
        IN_MEMORY_SHORTLISTS.pop(existing_idx)
        is_shortlisted = False
    else:
        IN_MEMORY_SHORTLISTS.append({"scout_identifier": scout_id, "player_id": pid})
        is_shortlisted = True

    return is_shortlisted
