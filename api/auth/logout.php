<?php
/**
 * FitTrack Gym - Logout API
 *
 * POST /api/auth/logout.php
 * Destroys the active PHP session.
 */

require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

setApiHeaders();

logoutUserSession();

sendSuccess(null, 'Successfully signed out.');
