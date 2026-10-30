<?php
/**
 * FitTrack Gym – Send / Resend Verification OTP
 *
 * POST /api/auth/send-otp.php
 * Payload (JSON):
 *  - email (required)
 *  - type  'verify' | 'resend'  (default 'verify')
 *
 * Generates a 6-digit OTP, stores its hash in the DB, and emails it.
 * Subject to resend cooldown and only for unverified accounts.
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

    // Fetch user
    $stmt = $pdo->prepare("
        SELECT user_id, full_name, email_verified, otp_last_sent
        FROM users
        WHERE email = :email
        LIMIT 1
    ");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if (!$user) {
        // Generic message – don't reveal if account exists
        sendError('If an account with this email exists, an OTP will be sent.', 404);
    }

    if ($user['email_verified'] == 1) {
        sendError('This email is already verified. You can sign in directly.', 409);
    }

    // Enforce resend cooldown
    if (!canResendOtp($user['otp_last_sent'])) {
        $remaining = resendCooldownRemaining($user['otp_last_sent']);
        sendError("Please wait {$remaining} seconds before requesting another OTP.", 429, ['cooldown_remaining' => $remaining]);
    }

    // Generate OTP
    $otp     = generateOtp();
    $otpHash = hashOtp($otp);
    $expiry  = date('Y-m-d H:i:s', time() + (OTP_EXPIRY_MINUTES * 60));
    $now     = date('Y-m-d H:i:s');

    // Store in DB
    $update = $pdo->prepare("
        UPDATE users
        SET verification_otp_hash = :hash,
            otp_expiry             = :expiry,
            otp_attempts           = 0,
            otp_last_sent          = :now,
            updated_at             = NOW()
        WHERE user_id = :uid
    ");
    $update->execute([
        ':hash'   => $otpHash,
        ':expiry' => $expiry,
        ':now'    => $now,
        ':uid'    => $user['user_id']
    ]);

    // Send email
    $sent = sendVerificationOTP($email, $user['full_name'], $otp);

    if (!$sent) {
        sendError('Failed to send OTP email. Please check SMTP configuration.', 500);
    }

    sendSuccess([
        'cooldown' => OTP_RESEND_COOLDOWN
    ], 'OTP sent to your email address. It expires in ' . OTP_EXPIRY_MINUTES . ' minutes.');

} catch (PDOException $e) {
    error_log('Send OTP DB error: ' . $e->getMessage());
    sendError('Database error occurred.', 500);
}
