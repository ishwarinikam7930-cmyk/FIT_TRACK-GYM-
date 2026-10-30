<?php
/**
 * FitTrack Gym - Messages & Chat API
 *
 * GET  /api/messages/index.php - Get conversation messages
 * POST /api/messages/index.php - Send a new message
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

setApiHeaders();
$authUser = requireAuth();
$userId   = $authUser['user_id'];
$pdo      = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $otherUserId = !empty($_GET['with_user_id']) ? (int) $_GET['with_user_id'] : 0;

    try {
        if ($otherUserId > 0) {
            // Get conversation with specific user
            $stmt = $pdo->prepare("
                SELECT m.*, u.full_name as sender_name, u.role as sender_role
                FROM messages m
                JOIN users u ON m.sender_id = u.user_id
                WHERE (m.sender_id = :uid AND m.receiver_id = :other)
                   OR (m.sender_id = :other AND m.receiver_id = :uid)
                ORDER BY m.sent_at ASC
            ");
            $stmt->execute([':uid' => $userId, ':other' => $otherUserId]);
            $msgs = $stmt->fetchAll();

            // Mark incoming unread messages as read
            $readStmt = $pdo->prepare("UPDATE messages SET read_at = NOW() WHERE receiver_id = :uid AND sender_id = :other AND read_at IS NULL");
            $readStmt->execute([':uid' => $userId, ':other' => $otherUserId]);

            sendSuccess($msgs, 'Conversation retrieved.');
        } else {
            // Get recent conversations list
            $stmt = $pdo->prepare("
                SELECT m.*, 
                       CASE WHEN m.sender_id = :uid THEN r.full_name ELSE s.full_name END as contact_name,
                       CASE WHEN m.sender_id = :uid THEN r.user_id ELSE s.user_id END as contact_id
                FROM messages m
                JOIN users s ON m.sender_id = s.user_id
                JOIN users r ON m.receiver_id = r.user_id
                WHERE m.sender_id = :uid OR m.receiver_id = :uid
                ORDER BY m.sent_at DESC
                LIMIT 50
            ");
            $stmt->execute([':uid' => $userId]);
            $msgs = $stmt->fetchAll();

            sendSuccess($msgs, 'Recent messages retrieved.');
        }
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = getJsonInput();
    $receiverId = (int) ($input['receiver_id'] ?? 0);
    $text = sanitizeString($input['message_text'] ?? '');

    if ($receiverId <= 0 || empty($text)) {
        sendError('receiver_id and message_text are required.', 422);
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO messages (sender_id, receiver_id, message_text, sent_at)
            VALUES (:sid, :rid, :text, NOW())
        ");
        $stmt->execute([
            ':sid'  => $userId,
            ':rid'  => $receiverId,
            ':text' => $text
        ]);

        $msgId = (int) $pdo->lastInsertId();

        sendSuccess(['message_id' => $msgId], 'Message sent successfully.', 201);
    } catch (PDOException $e) {
        sendError('Failed to send message: ' . $e->getMessage(), 500);
    }
}

sendError('Method not allowed.', 405);
