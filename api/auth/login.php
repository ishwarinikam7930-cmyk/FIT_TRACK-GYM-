<?php
/**
 * FitTrack Gym – Authentication / Sign In API
 *
 * POST /api/auth/login.php
 * Payload (JSON):
 *  - email    (required)
 *  - password (required)
 *  - role     (optional, for UI validation only)
 *
 * Requirements:
 *  - User must exist in the database
 *  - Email must be verified (email_verified = 1)
 *  - Account must be active
 *  - Password must match stored BCrypt hash
 *  - Session is regenerated on success (prevents session fixation)
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

setApiHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed. Use POST.', 405);
}

$input = getJsonInput();

$missing = validateRequired($input, ['email', 'password']);
if (!empty($missing)) {
    sendError('Email and password are required.', 422);
}

$email    = strtolower(trim($input['email']));
$password = (string) $input['password'];

if (!isValidEmail($email)) {
    sendError('Invalid email address format.', 422);
}

if (empty($password)) {
    sendError('Password is required.', 422);
}

try {
    $pdo = getDB();

    // 1. Fetch user by email
    $stmt = $pdo->prepare("
        SELECT user_id, full_name, email, password_hash, role, phone, profile_image,
               account_status, email_verified
        FROM users
        WHERE email = :email
        LIMIT 1
    ");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    // 2. User not found — use generic error to prevent user enumeration
    if (!$user) {
        sendError('Invalid email or password.', 401);
    }

    // 3. Check email verification FIRST (before password check)
    if ($user['email_verified'] != 1) {
        sendError(
            'Your email address has not been verified. Please check your inbox for the verification OTP.',
            403,
            ['action' => 'resend_otp', 'email' => $email]
        );
    }

    // 4. Check account status
    if ($user['account_status'] !== 'active') {
        sendError('Your account is ' . $user['account_status'] . '. Please contact support.', 403);
    }

    // 5. Verify password
    if (!verifyPassword($password, $user['password_hash'])) {
        sendError('Invalid email or password.', 401);
    }

    // 6. Update last login timestamp
    $pdo->prepare("UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE user_id = :id")
        ->execute([':id' => $user['user_id']]);

    // 7. Fetch role-specific profile
    $profileData = [];
    if ($user['role'] === 'trainer') {
        $pStmt = $pdo->prepare("SELECT * FROM trainer_profiles WHERE trainer_id = :id LIMIT 1");
        $pStmt->execute([':id' => $user['user_id']]);
        $profileData = $pStmt->fetch() ?: [];
    } else {
        $pStmt = $pdo->prepare("SELECT * FROM user_profiles WHERE user_id = :id LIMIT 1");
        $pStmt->execute([':id' => $user['user_id']]);
        $profileData = $pStmt->fetch() ?: [];
    }

    // 8. Start secure PHP session (session ID regenerated inside loginUserSession)
    $authPayload = [
        'user_id'        => (int) $user['user_id'],
        'full_name'      => $user['full_name'],
        'email'          => $user['email'],
        'role'           => $user['role'],
        'phone'          => $user['phone'],
        'profile_image'  => $user['profile_image'],
        'account_status' => $user['account_status'],
    ];
    loginUserSession($authPayload);

    $redirect = ($user['role'] === 'trainer') ? 'trainer-dashboard.html' : 'user-dashboard.html';

    sendSuccess([
        'user'     => $authPayload,
        'profile'  => $profileData,
        'redirect' => $redirect
    ], 'Authentication successful.');

} catch (PDOException $e) {
    error_log('Login error: ' . $e->getMessage());
    sendError('Database error during authentication.', 500);
}
