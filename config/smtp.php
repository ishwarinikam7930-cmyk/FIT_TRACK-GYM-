<?php
/**
 * FitTrack Gym – SMTP / Email Configuration
 *
 * IMPORTANT: Never commit real credentials to version control.
 * Set actual credentials via environment variables (preferred) or edit this file
 * directly on the server (keep outside web root if possible).
 *
 * Configuration Instructions:
 *   1. Set SMTP_HOST to your mail server (e.g. smtp.gmail.com)
 *   2. Set SMTP_USER to your sending email address
 *   3. Set SMTP_PASS to your App Password (Google) or SMTP password
 *   4. Set SMTP_FROM_NAME to your display sender name
 *   5. For Gmail: enable 2FA and generate an App Password at
 *      https://myaccount.google.com/apppasswords
 *   6. For other providers, adjust SMTP_HOST, SMTP_PORT, SMTP_SECURE
 */

// Prevent direct access
if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'] ?? '')) {
    header('HTTP/1.1 403 Forbidden');
    exit('Direct access not permitted.');
}

// ── SMTP Credentials ────────────────────────────────────────────────────────
// Read from environment variables first, then fall back to constants below.
// To configure: edit the fallback values OR set environment variables.

define('SMTP_HOST',     getenv('SMTP_HOST')     ?: 'smtp.gmail.com');
define('SMTP_PORT',     (int)(getenv('SMTP_PORT')    ?: 587));
define('SMTP_SECURE',   getenv('SMTP_SECURE')   ?: 'tls');   // 'tls' or 'ssl'
define('SMTP_AUTH',     true);
define('SMTP_USER',     getenv('SMTP_USER')     ?: 'your-email@gmail.com');
define('SMTP_PASS',     getenv('SMTP_PASS')     ?: 'your-app-password-here');
define('SMTP_FROM',     getenv('SMTP_FROM')     ?: 'your-email@gmail.com');
define('SMTP_FROM_NAME', getenv('SMTP_FROM_NAME') ?: 'FitTrack');
define('SMTP_DEBUG',    (int)(getenv('SMTP_DEBUG')   ?: 0));  // 0 = off, 2 = verbose

// ── OTP Settings ─────────────────────────────────────────────────────────────
define('OTP_EXPIRY_MINUTES',   5);     // OTP valid for 5 minutes
define('OTP_MAX_ATTEMPTS',     5);     // Max wrong OTP tries before lockout
define('OTP_RESEND_COOLDOWN',  60);    // Seconds before resend is allowed
define('OTP_LENGTH',           6);     // Digits in OTP

// ── Reset Token Settings ─────────────────────────────────────────────────────
define('RESET_TOKEN_EXPIRY_MINUTES', 15); // Password reset token valid for 15 minutes
