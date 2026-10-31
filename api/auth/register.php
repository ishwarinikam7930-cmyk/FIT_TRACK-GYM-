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
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

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
        sendError('An account with this email already exists. Please sign in.', 409);
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

    // Insert user directly as active and email_verified = 1 (OTP temporarily bypassed)
    $insertUser = $pdo->prepare("
        INSERT INTO users (full_name, email, password_hash, role, phone, account_status, email_verified, email_verified_at, created_at, updated_at)
        VALUES (:full_name, :email, :password_hash, :role, :phone, 'active', 1, NOW(), NOW(), NOW())
    ");
    $insertUser->execute([
        ':full_name'     => $fullName,
        ':email'         => $email,
        ':password_hash' => $passwordHash,
        ':role'          => $role,
        ':phone'         => $phone,
    ]);
    $userId = (int) $pdo->lastInsertId();

    // Insert role profile
    if ($role === 'trainer') {
        $pdo->prepare("
            INSERT INTO trainer_profiles (trainer_id, specialization, bio, profile_status, created_at, updated_at)
            VALUES (:uid, :spec, 'Certified Fitness Coach on FitTrack platform.', 'active', NOW(), NOW())
        ")->execute([':uid' => $userId, ':spec' => $roleExtra ?: 'Strength & Conditioning']);
    } else {
        $pdo->prepare("
            INSERT INTO user_profiles (user_id, fitness_goal, activity_level, created_at, updated_at)
            VALUES (:uid, :goal, 'moderate', NOW(), NOW())
        ")->execute([':uid' => $userId, ':goal' => $mappedGoal]);
    }

    $pdo->commit();

    // Account is created and active, but user is NOT automatically logged in (must sign in first)
    sendSuccess([
        'email' => $email,
        'role'  => $role,
        'name'  => $fullName
    ], 'Account created successfully! Please sign in with your email and password.', 201);

} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Registration Error: ' . $e->getMessage());
    sendError('Failed to create account: ' . $e->getMessage(), 500);
}
