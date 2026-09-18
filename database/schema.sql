-- BatVision Database Schema (MySQL)
-- AI-Based Online Cricket Scouting & Performance Analysis System

CREATE DATABASE IF NOT EXISTS batvision;
USE batvision;

-- 1. Players Table
CREATE TABLE IF NOT EXISTS players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE,
    age INT DEFAULT 20,
    role ENUM('Batsman', 'Bowler', 'All-Rounder') DEFAULT 'All-Rounder',
    batting_style VARCHAR(50) DEFAULT 'Right Hand Bat',
    bowling_style VARCHAR(50) DEFAULT 'Right Arm Fast',
    location VARCHAR(100) DEFAULT 'Mumbai, India',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Videos Table
CREATE TABLE IF NOT EXISTS videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT,
    filename VARCHAR(255) NOT NULL,
    video_type ENUM('batting', 'bowling') NOT NULL,
    duration_seconds FLOAT DEFAULT 0.0,
    fps FLOAT DEFAULT 0.0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- 3. Performance Scores Table
CREATE TABLE IF NOT EXISTS performance_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    video_id INT,
    analysis_type ENUM('batting', 'bowling') NOT NULL,
    score INT NOT NULL,
    classification VARCHAR(50) NOT NULL,
    metrics_json JSON,
    strengths_json JSON,
    improvements_json JSON,
    recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE SET NULL
);

-- 4. Scout Shortlists Table
CREATE TABLE IF NOT EXISTS shortlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scout_identifier VARCHAR(100) NOT NULL,
    player_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_shortlist (scout_identifier, player_id),
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- 5. Scouts Table
CREATE TABLE IF NOT EXISTS scouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    organization VARCHAR(150) DEFAULT 'State Cricket Academy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- Seed Data: Pre-populate initial cricket talent prospects
-- -------------------------------------------------------------
INSERT INTO players (id, name, email, age, role, batting_style, bowling_style, location)
VALUES 
(1, 'Rahul Sharma', 'rahul@cricket.in', 21, 'Batsman', 'Right Hand Bat', 'Right Arm Off-Break', 'Bengaluru, Karnataka'),
(2, 'Jasprit Patel', 'jasprit@cricket.in', 19, 'Bowler', 'Right Hand Bat', 'Right Arm Fast', 'Ahmedabad, Gujarat'),
(3, 'Rohan Verma', 'rohan@cricket.in', 22, 'All-Rounder', 'Left Hand Bat', 'Left Arm Orthodox', 'Delhi, NCR'),
(4, 'Amaan Khan', 'amaan@batvision.com', 20, 'All-Rounder', 'Right Hand Bat', 'Right Arm Fast-Medium', 'Mumbai, Maharashtra')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Seed Scores for Rahul Sharma (Batsman: 86)
INSERT INTO performance_scores (player_id, analysis_type, score, classification, metrics_json, strengths_json, improvements_json, recommendation)
VALUES 
(1, 'batting', 86, 'Highly Promising', 
 '{"stance_stability": 94.0, "shot_movement": 82.5, "batting_consistency": 85.0}',
 '["Clean front-foot bat presentation", "Solid balance through contact zone"]',
 '["Work on back-foot defensive balance against rising deliveries"]',
 'Highly promising top-order batsman suitable for state U-23 trials.')
ON DUPLICATE KEY UPDATE score=VALUES(score);

-- Seed Scores for Jasprit Patel (Bowler: 92)
INSERT INTO performance_scores (player_id, analysis_type, score, classification, metrics_json, strengths_json, improvements_json, recommendation)
VALUES 
(2, 'bowling', 92, 'Exceptional',
 '{"runup_momentum": 93.5, "release_stability": 91.0, "bowling_consistency": 92.0}',
 '["Exceptional acceleration through delivery stride", "Repeatable high-arm release alignment"]',
 '["Maintain follow-through deceleration to manage back strain"]',
 'Exceptional fast-bowling prospect; recommended for state academy selection camp.')
ON DUPLICATE KEY UPDATE score=VALUES(score);

-- Seed Scores for Rohan Verma (All-Rounder: Batting 84, Bowling 78)
INSERT INTO performance_scores (player_id, analysis_type, score, classification, metrics_json, strengths_json, improvements_json, recommendation)
VALUES 
(3, 'batting', 84, 'Highly Promising',
 '{"stance_stability": 88.0, "shot_movement": 82.0, "batting_consistency": 83.0}',
 '["Strong lower-order batting power", "Good bat speed through the line"]',
 '["Improve footwork against spinning deliveries outside off-stump"]',
 'Reliable middle-order batsman with match-finishing capability.'),
(3, 'bowling', 78, 'Promising',
 '{"runup_momentum": 76.0, "release_stability": 82.0, "bowling_consistency": 77.0}',
 '["Consistent wicket-to-wicket spin trajectory", "Good arm speed"]',
 '["Improve spin flight variation in middle overs"]',
 'Promising left-arm orthodox spinner providing bowling depth.')
ON DUPLICATE KEY UPDATE score=VALUES(score);
