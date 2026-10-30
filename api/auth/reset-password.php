<?php
/**
 * FitTrack Gym – Reset Password
 *
 * POST /api/auth/reset-password.php
 * Payload (JSON):
 *  - email        (required)
 *  - otp          (required, 6-digit reset OTP)
 *  - new_password (required, min 8 chars)
 *  - confirm_password (required, must match new_password)
 *
 * Validates reset OTP, updates password hash, invalidates token.
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/smtp.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/otp.php';

setApiHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed. Use POST.', 405);
}

$input = getJsonInput();

$missing = validateRequired($input, ['email', 'otp', 'new_password', 'confirm_password']);
if (!empty($missing)) {
    sendError('Missing required fields: ' . implode(', ', $missing), 422);
}

$email           = strtolower(trim($input['email']));
$otp             = trim((string) $input['otp']);
$newPassword     = (string) $input['new_password'];
$confirmPassword = (string) $input['confirm_password'];

if (!isValidEmail($email)) {
    sendError('Invalid email address.', 422);
}

if (!preg_match('/^\d{' . OTP_LENGTH . '}$/', $otp)) {
    sendError('OTP must be a ' . OTP_LENGTH . '-digit number.', 422);
}

if (strlen($newPassword) < 8) {
    sendError('New password must be at least 8 characters.', 422);
}

if ($newPassword !== $confirmPassword) {
    sendError('Passwords do not match.', 422);
}

// Password strength: at least one uppercase, one lowercase, one digit
if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/', $newPassword)) {
    sendError('Password must contain at least one uppercase letter, one lowercase letter, and one number.', 422);
}

try {
    $pdo = getDB();

    $stmt = $pdo->prepare("
        SELECT user_id, full_name, email_verified, account_status,
               reset_token_hash, reset_token_expiry, otp_attempts
        FROM users
        WHERE email = :email
        LIMIT 1
    ");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if (!$user || $user['email_verified'] != 1 || $user['account_status'] !== 'active') {
        sendError('Invalid or expired reset request.', 400);
    }

    if (empty($user['reset_token_hash'])) {
        sendError('No active password reset request found. Please request a new OTP.', 400);
    }

    // Check max attempts (reuse otp_attempts for reset too)
    if ((int)$user['otp_attempts'] >= OTP_MAX_ATTEMPTS) {
        sendError('Too many incorrect attempts. Please request a new OTP.', 429);
    }

    // Check expiry
    if (!isOtpValid($user['reset_token_expiry'])) {
        sendError('Reset OTP has expired. Please request a new one.', 410);
    }

    // Verify OTP
    if (!verifyOtp($otp, $user['reset_token_hash'])) {
        // Increment attempts
        $pdo->prepare("UPDATE users SET otp_attempts = otp_attempts + 1, updated_at = NOW() WHERE user_id = :uid")
            ->execute([':uid' => $user['user_id']]);

        $attemptsLeft = OTP_MAX_ATTEMPTS - ((int)$user['otp_attempts'] + 1);
        sendError(
            'Incorrect OTP. ' . ($attemptsLeft > 0 ? "{$attemptsLeft} attempt(s) remaining." : 'Please request a new OTP.'),
            400
        );
    }

    // ── OTP valid: update password, clear reset token ──
    $newHash = hashPassword($newPassword);

    $pdo->prepare("
        UPDATE users
        SET password_hash      = :hash,
            reset_token_hash   = NULL,
            reset_token_expiry = NULL,
            otp_attempts       = 0,
            updated_at         = NOW()
        WHERE user_id = :uid
    ")->execute([
        ':hash' => $newHash,
        ':uid'  => $user['user_id']
    ]);

    sendSuccess(null, 'Password reset successfully. You can now sign in with your new password.');

} catch (PDOException $e) {
    error_log('Reset password DB error: ' . $e->getMessage());
    sendError('Database error occurred.', 500);
}
