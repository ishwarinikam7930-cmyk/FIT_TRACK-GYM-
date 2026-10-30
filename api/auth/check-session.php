<?php
/**
 * FitTrack Gym – Check Session (Auth Guard for Dashboard)
 *
 * GET /api/auth/check-session.php
 * Returns 200 + user info if authenticated, 401 if not.
 * Called by the dashboard JS to enforce server-side auth.
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

setApiHeaders();

startSecureSession();

if (!isAuthenticated()) {
    sendError('Not authenticated. Please sign in.', 401);
}

$user = getAuthUser();

// Optional: check session timeout (30 minutes of inactivity)
$lastActivity = $_SESSION['last_activity'] ?? time();
if ((time() - $lastActivity) > 1800) {
    logoutUserSession();
    sendError('Session expired due to inactivity. Please sign in again.', 401);
}

// Refresh last activity
$_SESSION['last_activity'] = time();

sendSuccess([
    'user_id'        => $user['user_id'],
    'full_name'      => $user['full_name'],
    'email'          => $user['email'],
    'role'           => $user['role'],
    'account_status' => $user['account_status'],
    'profile_image'  => $user['profile_image'],
], 'Session active.');
