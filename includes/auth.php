<?php
/**
 * FitTrack Gym - Authentication & Session Authorization Utilities
 */

require_once __DIR__ . '/functions.php';

/**
 * Initialize a secure PHP session if not already active
 */
function startSecureSession(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        // Enforce secure cookie settings
        $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['SERVER_PORT'] ?? '') == 443);

        session_set_cookie_params([
            'lifetime' => 86400 * 7, // 7 days
            'path'     => '/',
            'domain'   => '',
            'secure'   => $isHttps,
            'httponly' => true,
            'samesite' => 'Lax'
        ]);

        session_name('FITTRACK_SESSION');
        session_start();
    }
}

/**
 * Log in a user by saving their identity to the active PHP session
 *
 * @param array $user User record from database
 */
function loginUserSession(array $user): void
{
    startSecureSession();

    // Regenerate session ID to prevent session fixation
    session_regenerate_id(true);

    $_SESSION['logged_in']      = true;
    $_SESSION['user_id']        = (int) $user['user_id'];
    $_SESSION['full_name']      = $user['full_name'];
    $_SESSION['email']          = $user['email'];
    $_SESSION['role']           = $user['role']; // 'user' or 'trainer'
    $_SESSION['account_status'] = $user['account_status'] ?? 'active';
    $_SESSION['profile_image']  = $user['profile_image'] ?? null;
    $_SESSION['last_activity']  = time();
}

/**
 * Destroy the current authenticated session
 */
function logoutUserSession(): void
{
    startSecureSession();

    $_SESSION = [];

    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params["path"],
            $params["domain"],
            $params["secure"],
            $params["httponly"]
        );
    }

    session_destroy();
}

/**
 * Check if a session user is logged in
 */
function isAuthenticated(): bool
{
    startSecureSession();
    return !empty($_SESSION['logged_in']) && !empty($_SESSION['user_id']);
}

/**
 * Get current authenticated user details from session
 *
 * @return array|null
 */
function getAuthUser(): ?array
{
    if (!isAuthenticated()) {
        return null;
    }

    return [
        'user_id'        => (int) $_SESSION['user_id'],
        'full_name'      => $_SESSION['full_name'] ?? '',
        'email'          => $_SESSION['email'] ?? '',
        'role'           => $_SESSION['role'] ?? 'user',
        'account_status' => $_SESSION['account_status'] ?? 'active',
        'profile_image'  => $_SESSION['profile_image'] ?? null
    ];
}

/**
 * Require authentication and optional role authorization.
 * Terminates with 401/403 JSON error if check fails.
 *
 * @param array $allowedRoles Empty array permits any authenticated user. E.g. ['user'], ['trainer'], or ['user', 'trainer']
 * @return array The authenticated user info
 */
function requireAuth(array $allowedRoles = []): array
{
    startSecureSession();

    if (!isAuthenticated()) {
        sendError('Authentication required. Please sign in.', 401);
    }

    $currentUser = getAuthUser();

    if (!empty($allowedRoles)) {
        $userRole = strtolower($currentUser['role'] ?? '');
        $allowed = array_map('strtolower', $allowedRoles);

        if (!in_array($userRole, $allowed, true)) {
            sendError('Access denied: You do not have permission to access this resource.', 403);
        }
    }

    return $currentUser;
}

/**
 * Securely hash a password using standard Bcrypt
 */
function hashPassword(string $password): string
{
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
}

/**
 * Verify a plain text password against a stored Bcrypt hash
 */
function verifyPassword(string $password, string $hash): bool
{
    return password_verify($password, $hash);
}
