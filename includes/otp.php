<?php
/**
 * FitTrack Gym – OTP Utilities
 *
 * Helpers for generating, hashing, and validating OTPs used in email
 * verification and password reset flows.
 */

require_once __DIR__ . '/../config/smtp.php';

/**
 * Generate a secure random numeric OTP of the configured length.
 *
 * @return string  Zero-padded OTP string, e.g. "047382"
 */
function generateOtp(): string
{
    $max = (int) str_repeat('9', OTP_LENGTH);
    return str_pad((string) random_int(0, $max), OTP_LENGTH, '0', STR_PAD_LEFT);
}

/**
 * Hash an OTP for secure storage (SHA-256)
 *
 * @param string $otp  Plain-text OTP
 * @return string
 */
function hashOtp(string $otp): string
{
    return hash('sha256', $otp);
}

/**
 * Verify a plain-text OTP against its stored hash using constant-time comparison
 *
 * @param string $otp      Plain OTP submitted by user
 * @param string $stored   SHA-256 hash stored in DB
 * @return bool
 */
function verifyOtp(string $otp, string $stored): bool
{
    return hash_equals($stored, hashOtp($otp));
}

/**
 * Check if an OTP expiry timestamp has passed
 *
 * @param string|null $expiryDatetime  DB DATETIME value or null
 * @return bool  true = still valid, false = expired or null
 */
function isOtpValid(?string $expiryDatetime): bool
{
    if ($expiryDatetime === null) {
        return false;
    }
    return strtotime($expiryDatetime) > time();
}

/**
 * Check whether the resend cooldown period has passed
 *
 * @param string|null $lastSentDatetime  DB DATETIME of last send, or null
 * @return bool  true = can resend, false = cooldown still active
 */
function canResendOtp(?string $lastSentDatetime): bool
{
    if ($lastSentDatetime === null) {
        return true;
    }
    return (time() - strtotime($lastSentDatetime)) >= OTP_RESEND_COOLDOWN;
}

/**
 * Compute remaining cooldown seconds before resend is allowed
 *
 * @param string|null $lastSentDatetime
 * @return int  Seconds remaining (0 if none)
 */
function resendCooldownRemaining(?string $lastSentDatetime): int
{
    if ($lastSentDatetime === null) return 0;
    $elapsed = time() - strtotime($lastSentDatetime);
    $remaining = OTP_RESEND_COOLDOWN - $elapsed;
    return max(0, $remaining);
}
