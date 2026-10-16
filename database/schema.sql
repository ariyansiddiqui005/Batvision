-- BatVision Database Schema (MySQL)
-- AI-Based Online Cricket Scouting & Performance Analysis System

CREATE DATABASE IF NOT EXISTS batvision;
USE batvision;

-- 1. Players Table
CREATE TABLE IF NOT EXISTS players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE,
    password VARCHAR(255) NULL,
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
    visibility ENUM('scouts', 'private') DEFAULT 'scouts',
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
    password VARCHAR(255) NULL,
    organization VARCHAR(150) DEFAULT 'State Cricket Academy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- End of Schema
