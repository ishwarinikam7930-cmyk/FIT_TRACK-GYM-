<?php
/**
 * FitTrack Gym – Forgot Password (Send Reset OTP)
 *
 * POST /api/auth/forgot-password.php
 * Payload (JSON):
 *  - email (required)
 *
 * Sends a 6-digit OTP for password reset.
 * Stores the hashed token, not plaintext.
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/smtp.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/otp.php';
require_once __DIR__ . '/../../includes/mailer.php';

setApiHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed. Use POST.', 405);
}

$input = getJsonInput();

if (empty($input['email'])) {
    sendError('Email is required.', 422);
}

$email = strtolower(trim($input['email']));

if (!isValidEmail($email)) {
    sendError('Invalid email address format.', 422);
}

try {
    $pdo = getDB();

    $stmt = $pdo->prepare("
        SELECT user_id, full_name, email_verified, account_status, otp_last_sent
        FROM users
        WHERE email = :email
        LIMIT 1
    ");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    // Always return success to avoid user enumeration
    $genericMsg = 'If an account with this email exists and is verified, a reset OTP has been sent.';

    if (!$user || $user['email_verified'] != 1 || $user['account_status'] !== 'active') {
        // Return success anyway (prevents account enumeration)
        sendSuccess(null, $genericMsg);
    }

    // Enforce resend cooldown
    if (!canResendOtp($user['otp_last_sent'])) {
        $remaining = resendCooldownRemaining($user['otp_last_sent']);
        sendError("Please wait {$remaining} seconds before requesting another OTP.", 429, ['cooldown_remaining' => $remaining]);
    }

    // Generate OTP
    $otp        = generateOtp();
    $tokenHash  = hashOtp($otp);
    $expiry     = date('Y-m-d H:i:s', time() + (RESET_TOKEN_EXPIRY_MINUTES * 60));
    $now        = date('Y-m-d H:i:s');

    $pdo->prepare("
        UPDATE users
        SET reset_token_hash   = :hash,
            reset_token_expiry = :expiry,
            otp_last_sent      = :now,
            otp_attempts       = 0,
            updated_at         = NOW()
        WHERE user_id = :uid
    ")->execute([
        ':hash'   => $tokenHash,
        ':expiry' => $expiry,
        ':now'    => $now,
        ':uid'    => $user['user_id']
    ]);

    $sent = sendPasswordResetOTP($email, $user['full_name'], $otp);

    if (!$sent) {
        error_log('Forgot password OTP email failed for: ' . $email);
        sendError('Failed to send OTP email. Please check SMTP configuration.', 500);
    }

    sendSuccess([
        'cooldown' => OTP_RESEND_COOLDOWN,
        'expiry_minutes' => RESET_TOKEN_EXPIRY_MINUTES
    ], $genericMsg);

} catch (PDOException $e) {
    error_log('Forgot password DB error: ' . $e->getMessage());
    sendError('Database error occurred.', 500);
}
