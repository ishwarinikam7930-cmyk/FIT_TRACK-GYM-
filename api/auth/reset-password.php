<?php
/**
 * FitTrack Gym – Reset Password (Direct Password Reset - No OTP)
 *
 * POST /api/auth/reset-password.php
 * Payload (JSON):
 *  - email            (required)
 *  - new_password     (required, min 8 chars, mixed case + digit)
 *  - confirm_password (required, must match new_password)
 *
 * Directly updates the password hash without requiring an OTP.
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

setApiHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed. Use POST.', 405);
}

$input = getJsonInput();

$missing = validateRequired($input, ['email', 'new_password', 'confirm_password']);
if (!empty($missing)) {
    sendError('Missing required fields: ' . implode(', ', $missing), 422);
}

$email           = strtolower(trim($input['email']));
$newPassword     = (string) $input['new_password'];
$confirmPassword = (string) $input['confirm_password'];

if (!isValidEmail($email)) {
    sendError('Invalid email address format.', 422);
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
        SELECT user_id, full_name, account_status
        FROM users
        WHERE email = :email
        LIMIT 1
    ");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if (!$user) {
        sendError('No account found with this email address.', 404);
    }

    $newHash = hashPassword($newPassword);

    $pdo->prepare("
        UPDATE users
        SET password_hash      = :hash,
            reset_token_hash   = NULL,
            reset_token_expiry = NULL,
            otp_attempts       = 0,
            account_status     = 'active',
            email_verified     = 1,
            updated_at         = NOW()
        WHERE user_id = :uid
    ")->execute([
        ':hash' => $newHash,
        ':uid'  => $user['user_id']
    ]);

    sendSuccess(null, 'Password reset successfully! You can now sign in with your new password.');

} catch (PDOException $e) {
    error_log('Reset password DB error: ' . $e->getMessage());
    sendError('Database error occurred while resetting password.', 500);
}
