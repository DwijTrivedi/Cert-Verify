-- =============================================================
-- CertVerify Database Setup Script
-- Run this ONCE in your MySQL client to set up all tables.
-- Database: Local_cert_verify_db
-- =============================================================

USE Local_cert_verify_db;

-- 1. Institutions: universities & colleges
CREATE TABLE IF NOT EXISTS Institutions (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- 2. Students: certificate holders
CREATE TABLE IF NOT EXISTS Students (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL
);

-- 3. Issued Certificates: links students to institutions
CREATE TABLE IF NOT EXISTS Issued_Certificates (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    student_id     INT NOT NULL,
    institution_id INT NOT NULL,
    degree         VARCHAR(255),
    issue_year     YEAR,
    FOREIGN KEY (student_id)     REFERENCES Students(id),
    FOREIGN KEY (institution_id) REFERENCES Institutions(id)
);

-- 4. Verification Log: every certificate scan result
CREATE TABLE IF NOT EXISTS Verification_Log (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    certificate_id VARCHAR(255),
    student_name   VARCHAR(255),
    status         VARCHAR(50),
    verified_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Users: institution and company accounts
CREATE TABLE IF NOT EXISTS Users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255),
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20)  NOT NULL DEFAULT 'institution',
    mfa_secret  VARCHAR(64)  NULL,
    mfa_enabled BOOLEAN      DEFAULT FALSE,
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
);

-- 6. Login Log: audit trail — who logged in and when
CREATE TABLE IF NOT EXISTS Login_Log (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    email        VARCHAR(255) NOT NULL,
    role         VARCHAR(20),
    logged_in_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- Optional: Sample data for testing
-- (Register via the web app instead to get bcrypt-hashed passwords)
-- =============================================================
-- INSERT INTO Institutions (name) VALUES ('Gujarat University');
-- INSERT INTO Students (first_name, last_name) VALUES ('Dwij', 'Shah');
-- INSERT INTO Issued_Certificates (student_id, institution_id, degree, issue_year)
--     VALUES (1, 1, 'B.Tech Computer Science', 2024);
