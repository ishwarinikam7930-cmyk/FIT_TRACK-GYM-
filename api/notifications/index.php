<?php
/**
 * FitTrack Gym - Notifications API
 *
 * GET  /api/notifications/index.php - Get user notifications & unread count
 * POST /api/notifications/index.php - Mark notification(s) as read
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

setApiHeaders();
$authUser = requireAuth();
$userId   = $authUser['user_id'];
$pdo      = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->prepare("
            SELECT * FROM notifications 
            WHERE user_id = :uid 
            ORDER BY created_at DESC 
            LIMIT 30
        ");
        $stmt->execute([':uid' => $userId]);
        $notifs = $stmt->fetchAll();

        $unreadCountStmt = $pdo->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = :uid AND is_read = 0");
        $unreadCountStmt->execute([':uid' => $userId]);
        $unreadCount = (int) $unreadCountStmt->fetchColumn();

        sendSuccess([
            'notifications' => $notifs,
            'unread_count'  => $unreadCount
        ], 'Notifications retrieved.');
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = getJsonInput();
    $notifId = !empty($input['notification_id']) ? (int) $input['notification_id'] : 0;

    try {
        if ($notifId > 0) {
            $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1, read_at = NOW() WHERE notification_id = :nid AND user_id = :uid");
            $stmt->execute([':nid' => $notifId, ':uid' => $userId]);
        } else {
            // Mark all as read
            $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = :uid AND is_read = 0");
            $stmt->execute([':uid' => $userId]);
        }

        sendSuccess(null, 'Notifications marked as read.');
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

sendError('Method not allowed.', 405);
