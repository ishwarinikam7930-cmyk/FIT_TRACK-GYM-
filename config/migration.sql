-- FitTrack Gym – Authentication Schema Migration
-- Run this script once against your fittrack_db database.
-- Safe to run multiple times (uses IF NOT EXISTS / column checks).

USE fittrack_db;

-- ── Step 1: Add phone column if not exists ─────────────────────────────────
SET @s = (SELECT IF(
    EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'fittrack_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone'),
    'SELECT "phone column already exists"',
    'ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL AFTER email'
));
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── Step 2: Add email_verified ─────────────────────────────────────────────
SET @s = (SELECT IF(
    EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'fittrack_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'email_verified'),
    'SELECT "email_verified column already exists"',
    'ALTER TABLE users ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0 AFTER phone'
));
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── Step 3: Add verification_otp_hash ─────────────────────────────────────
SET @s = (SELECT IF(
    EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'fittrack_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'verification_otp_hash'),
    'SELECT "verification_otp_hash column already exists"',
    'ALTER TABLE users ADD COLUMN verification_otp_hash VARCHAR(64) NULL AFTER email_verified'
));
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── Step 4: Add otp_expiry ────────────────────────────────────────────────
SET @s = (SELECT IF(
    EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'fittrack_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'otp_expiry'),
    'SELECT "otp_expiry column already exists"',
    'ALTER TABLE users ADD COLUMN otp_expiry DATETIME NULL AFTER verification_otp_hash'
));
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── Step 5: Add otp_attempts ─────────────────────────────────────────────
SET @s = (SELECT IF(
    EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'fittrack_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'otp_attempts'),
    'SELECT "otp_attempts column already exists"',
    'ALTER TABLE users ADD COLUMN otp_attempts TINYINT NOT NULL DEFAULT 0 AFTER otp_expiry'
));
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── Step 6: Add otp_last_sent ────────────────────────────────────────────
SET @s = (SELECT IF(
    EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'fittrack_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'otp_last_sent'),
    'SELECT "otp_last_sent column already exists"',
    'ALTER TABLE users ADD COLUMN otp_last_sent DATETIME NULL AFTER otp_attempts'
));
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── Step 7: Add reset_token_hash ─────────────────────────────────────────
SET @s = (SELECT IF(
    EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'fittrack_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'reset_token_hash'),
    'SELECT "reset_token_hash column already exists"',
    'ALTER TABLE users ADD COLUMN reset_token_hash VARCHAR(64) NULL AFTER otp_last_sent'
));
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── Step 8: Add reset_token_expiry ───────────────────────────────────────
SET @s = (SELECT IF(
    EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'fittrack_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'reset_token_expiry'),
    'SELECT "reset_token_expiry column already exists"',
    'ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME NULL AFTER reset_token_hash'
));
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── Step 9: Add last_login_at ────────────────────────────────────────────
SET @s = (SELECT IF(
    EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'fittrack_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'last_login_at'),
    'SELECT "last_login_at column already exists"',
    'ALTER TABLE users ADD COLUMN last_login_at DATETIME NULL AFTER reset_token_expiry'
));
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── Step 10: Mark existing demo users as verified ────────────────────────
-- This ensures legacy seeded accounts can still log in after adding email_verified
UPDATE users
SET email_verified = 1
WHERE email IN ('ishwari.nikam@email.com', 'arjun.mehta@fittrack.com')
  AND email_verified = 0;

-- ── Done ─────────────────────────────────────────────────────────────────
SELECT 'FitTrack auth migration complete!' AS status;
DESCRIBE users;
