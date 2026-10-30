<?php
/**
 * FitTrack Gym – User Registration API
 *
 * POST /api/auth/register.php
 * Payload (JSON):
 *  - full_name        (required)
 *  - email            (required, unique)
 *  - phone            (required, validated)
 *  - password         (required, min 8 chars, mixed case + digit)
 *  - confirm_password (required, must match password)
 *  - role             (optional: 'user' | 'trainer', default 'user')
 *  - role_extra       (optional: fitness_goal or specialization)
 *
 * On success: inserts unverified user, sends OTP, returns 201.
 * Does NOT log user in or redirect — must verify email first.
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

// ── Validate required fields ────────────────────────────────────────────────
$missing = validateRequired($input, ['full_name', 'email', 'phone', 'password', 'confirm_password']);
if (!empty($missing)) {
    sendError('Missing required fields: ' . implode(', ', $missing), 422, ['missing' => $missing]);
}

$fullName        = sanitizeString($input['full_name']);
$email           = strtolower(trim($input['email']));
$phone           = sanitizeString($input['phone']);
$password        = (string) $input['password'];
$confirmPassword = (string) $input['confirm_password'];
$role            = strtolower(trim($input['role'] ?? 'user'));
$roleExtra       = sanitizeString($input['role_extra'] ?? ($input['fitness_goal'] ?? ($input['specialization'] ?? '')));

// ── Validate full name ───────────────────────────────────────────────────────
if (strlen($fullName) < 2 || strlen($fullName) > 120) {
    sendError('Full name must be between 2 and 120 characters.', 422);
}
if (!preg_match('/^[\p{L}\s\'-]+$/u', $fullName)) {
    sendError('Full name may only contain letters, spaces, hyphens, and apostrophes.', 422);
}

// ── Validate email ───────────────────────────────────────────────────────────
if (!isValidEmail($email)) {
    sendError('Invalid email address format.', 422);
}

// ── Validate phone ───────────────────────────────────────────────────────────
$phoneClean = preg_replace('/[\s\-\(\)\+]/', '', $phone);
if (!preg_match('/^\d{7,15}$/', $phoneClean)) {
    sendError('Mobile number must be 7–15 digits (spaces, hyphens, +, () are allowed).', 422);
}

// ── Validate password ────────────────────────────────────────────────────────
if (strlen($password) < 8) {
    sendError('Password must be at least 8 characters long.', 422);
}
if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/', $password)) {
    sendError('Password must contain at least one uppercase letter, one lowercase letter, and one number.', 422);
}
if ($password !== $confirmPassword) {
    sendError('Passwords do not match.', 422);
}

// ── Validate role ────────────────────────────────────────────────────────────
if (!in_array($role, ['user', 'trainer'], true)) {
    $role = 'user';
}

try {
    $pdo = getDB();

    // Check for duplicate email
    $checkStmt = $pdo->prepare("SELECT user_id, email_verified FROM users WHERE email = :email LIMIT 1");
    $checkStmt->execute([':email' => $email]);
    $existing = $checkStmt->fetch();

    if ($existing) {
        if ($existing['email_verified'] == 1) {
            sendError('An account with this email already exists. Please sign in.', 409);
        } else {
            // Unverified duplicate – allow OTP resend
            sendError('An unverified account with this email exists. Please check your email for the verification OTP.', 409, [
                'action' => 'resend_otp',
                'email'  => $email
            ]);
        }
    }

    $passwordHash = hashPassword($password);

    // Map role_extra to fitness_goal enum
    $validGoals = ['weight_loss', 'muscle_gain', 'general_fitness', 'strength', 'endurance', 'flexibility', 'other'];
    $mappedGoal = 'general_fitness';
    $lowerExtra = strtolower($roleExtra);
    if (strpos($lowerExtra, 'fat') !== false || strpos($lowerExtra, 'loss') !== false)        $mappedGoal = 'weight_loss';
    elseif (strpos($lowerExtra, 'hypertrophy') !== false || strpos($lowerExtra, 'muscle') !== false) $mappedGoal = 'muscle_gain';
    elseif (strpos($lowerExtra, 'strength') !== false)                                          $mappedGoal = 'strength';
    elseif (strpos($lowerExtra, 'endurance') !== false || strpos($lowerExtra, 'conditioning') !== false) $mappedGoal = 'endurance';
    elseif (strpos($lowerExtra, 'posture') !== false || strpos($lowerExtra, 'mobility') !== false) $mappedGoal = 'flexibility';

    $pdo->beginTransaction();

    // Insert user (email_verified = 0, account_status = pending)
    $insertUser = $pdo->prepare("
        INSERT INTO users (full_name, email, password_hash, role, phone, account_status, email_verified, created_at, updated_at)
        VALUES (:full_name, :email, :password_hash, :role, :phone, 'pending', 0, NOW(), NOW())
    ");
    $insertUser->execute([
        ':full_name'     => $fullName,
        ':email'         => $email,
        ':password_hash' => $passwordHash,
        ':role'          => $role,
        ':phone'         => $phone,
    ]);
    $userId = (int) $pdo->lastInsertId();

    // Insert role profile (empty, populated after verification)
    if ($role === 'trainer') {
        $pdo->prepare("
            INSERT INTO trainer_profiles (trainer_id, specialization, bio, profile_status, created_at, updated_at)
            VALUES (:uid, :spec, 'Certified Fitness Coach on FitTrack platform.', 'pending', NOW(), NOW())
        ")->execute([':uid' => $userId, ':spec' => $roleExtra ?: 'Strength & Conditioning']);
    } else {
        $pdo->prepare("
            INSERT INTO user_profiles (user_id, fitness_goal, activity_level, created_at, updated_at)
            VALUES (:uid, :goal, 'moderate', NOW(), NOW())
        ")->execute([':uid' => $userId, ':goal' => $mappedGoal]);
    }

    // Generate & store OTP
    $otp     = generateOtp();
    $otpHash = hashOtp($otp);
    $expiry  = date('Y-m-d H:i:s', time() + (OTP_EXPIRY_MINUTES * 60));
    $now     = date('Y-m-d H:i:s');

    $pdo->prepare("
        UPDATE users
        SET verification_otp_hash = :hash,
            otp_expiry             = :expiry,
            otp_attempts           = 0,
            otp_last_sent          = :now,
            updated_at             = NOW()
        WHERE user_id = :uid
    ")->execute([
        ':hash'   => $otpHash,
        ':expiry' => $expiry,
        ':now'    => $now,
        ':uid'    => $userId
    ]);

    $pdo->commit();

    // Send OTP email
    $sent = sendVerificationOTP($email, $fullName, $otp);

    if (!$sent) {
        // Don't fail registration; user can resend OTP
        error_log("OTP email failed for new user: $email");
    }

    sendSuccess([
        'email'            => $email,
        'otp_sent'         => $sent,
        'cooldown'         => OTP_RESEND_COOLDOWN,
        'expiry_minutes'   => OTP_EXPIRY_MINUTES,
    ], 'Account created! A verification OTP has been sent to your email.', 201);

} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Registration Error: ' . $e->getMessage());
    sendError('Failed to create account: ' . $e->getMessage(), 500);
}
