<?php
/**
 * FitTrack Gym – Verify Email OTP
 *
 * POST /api/auth/verify-otp.php
 * Payload (JSON):
 *  - email (required)
 *  - otp   (required, 6-digit code)
 *
 * Validates OTP hash, expiry, and attempt count.
 * On success: marks account as verified, logs user into session.
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

$missing = validateRequired($input, ['email', 'otp']);
if (!empty($missing)) {
    sendError('Email and OTP are required.', 422);
}

$email = strtolower(trim($input['email']));
$otp   = trim((string) $input['otp']);

if (!isValidEmail($email)) {
    sendError('Invalid email format.', 422);
}

if (!preg_match('/^\d{' . OTP_LENGTH . '}$/', $otp)) {
    sendError('OTP must be a ' . OTP_LENGTH . '-digit number.', 422);
}

try {
    $pdo = getDB();

    $stmt = $pdo->prepare("
        SELECT user_id, full_name, email, role, phone, profile_image,
               account_status, email_verified,
               verification_otp_hash, otp_expiry, otp_attempts
        FROM users
        WHERE email = :email
        LIMIT 1
    ");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if (!$user) {
        sendError('Account not found.', 404);
    }

    if ($user['email_verified'] == 1) {
        sendError('Email already verified. Please sign in.', 409);
    }

    // Check max attempts
    if ((int)$user['otp_attempts'] >= OTP_MAX_ATTEMPTS) {
        sendError('Too many incorrect OTP attempts. Please request a new OTP.', 429);
    }

    // Check expiry
    if (!isOtpValid($user['otp_expiry'])) {
        sendError('OTP has expired. Please request a new one.', 410);
    }

    // Verify OTP
    if (empty($user['verification_otp_hash']) || !verifyOtp($otp, $user['verification_otp_hash'])) {
        // Increment attempts
        $pdo->prepare("UPDATE users SET otp_attempts = otp_attempts + 1, updated_at = NOW() WHERE user_id = :uid")
            ->execute([':uid' => $user['user_id']]);

        $attemptsLeft = OTP_MAX_ATTEMPTS - ((int)$user['otp_attempts'] + 1);
        sendError(
            'Incorrect OTP. ' . ($attemptsLeft > 0 ? "{$attemptsLeft} attempt(s) remaining." : 'Please request a new OTP.'),
            400,
            ['attempts_left' => max(0, $attemptsLeft)]
        );
    }

    // ── OTP is valid: mark email verified, clear OTP fields, log in ──
    $pdo->beginTransaction();

    $pdo->prepare("
        UPDATE users
        SET email_verified           = 1,
            email_verified_at        = NOW(),
            verification_otp_hash    = NULL,
            otp_expiry               = NULL,
            otp_attempts             = 0,
            account_status           = 'active',
            updated_at               = NOW()
        WHERE user_id = :uid
    ")->execute([':uid' => $user['user_id']]);

    // Create user_profiles row if not exists
    if ($user['role'] === 'user') {
        $pdo->prepare("
            INSERT IGNORE INTO user_profiles (user_id, fitness_goal, activity_level, created_at, updated_at)
            VALUES (:uid, 'general_fitness', 'moderate', NOW(), NOW())
        ")->execute([':uid' => $user['user_id']]);
    } elseif ($user['role'] === 'trainer') {
        $pdo->prepare("
            INSERT IGNORE INTO trainer_profiles (trainer_id, specialization, profile_status, created_at, updated_at)
            VALUES (:uid, 'Strength & Conditioning', 'active', NOW(), NOW())
        ")->execute([':uid' => $user['user_id']]);
    }

    $pdo->commit();

    // Start session
    $authPayload = [
        'user_id'        => (int) $user['user_id'],
        'full_name'      => $user['full_name'],
        'email'          => $user['email'],
        'role'           => $user['role'],
        'phone'          => $user['phone'],
        'profile_image'  => $user['profile_image'],
        'account_status' => 'active',
    ];
    loginUserSession($authPayload);

    $redirect = $user['role'] === 'trainer' ? 'trainer-dashboard.html' : 'user-dashboard.html';

    sendSuccess([
        'user'     => $authPayload,
        'redirect' => $redirect
    ], 'Email verified successfully! Welcome to FitTrack.', 200);

} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Verify OTP DB error: ' . $e->getMessage());
    sendError('Database error occurred.', 500);
}
