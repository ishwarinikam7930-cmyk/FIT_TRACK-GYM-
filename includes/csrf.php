<?php
/**
 * FitTrack Gym – CSRF Token Utilities
 *
 * Generates and validates CSRF tokens to protect state-changing forms.
 * Uses PHP sessions to store the token.
 */

require_once __DIR__ . '/auth.php'; // Ensures startSecureSession() is available

/**
 * Generate (or return existing) CSRF token for the current session
 */
function generateCsrfToken(): string
{
    startSecureSession();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Validate an incoming CSRF token against the session token
 *
 * @param string|null $token  Token from the request
 * @return bool
 */
function validateCsrfToken(?string $token): bool
{
    startSecureSession();
    if (empty($token) || empty($_SESSION['csrf_token'])) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $token);
}
