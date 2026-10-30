<?php
/**
 * FitTrack Gym - Active Session User API
 *
 * GET /api/auth/me.php
 * Returns current authenticated user and profile from active PHP session.
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

setApiHeaders();

if (!isAuthenticated()) {
    sendSuccess([
        'authenticated' => false,
        'user'          => null
    ], 'No active session.');
}

$authUser = getAuthUser();

try {
    $pdo = getDB();

    $stmt = $pdo->prepare("
        SELECT user_id, full_name, email, role, phone, profile_image, account_status, last_login_at
        FROM users 
        WHERE user_id = :id
        LIMIT 1
    ");
    $stmt->execute([':id' => $authUser['user_id']]);
    $user = $stmt->fetch();

    if (!$user) {
        logoutUserSession();
        sendSuccess(['authenticated' => false, 'user' => null], 'User account not found.');
    }

    $profile = [];
    if ($user['role'] === 'trainer') {
        $pStmt = $pdo->prepare("SELECT * FROM trainer_profiles WHERE trainer_id = :id LIMIT 1");
        $pStmt->execute([':id' => $user['user_id']]);
        $profile = $pStmt->fetch() ?: [];
    } else {
        $pStmt = $pdo->prepare("SELECT * FROM user_profiles WHERE user_id = :id LIMIT 1");
        $pStmt->execute([':id' => $user['user_id']]);
        $profile = $pStmt->fetch() ?: [];
    }

    sendSuccess([
        'authenticated' => true,
        'user'          => $user,
        'profile'       => $profile
    ], 'Active session verified.');

} catch (PDOException $e) {
    sendError('Database error retrieving profile: ' . $e->getMessage(), 500);
}
