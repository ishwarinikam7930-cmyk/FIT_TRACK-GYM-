<?php
/**
 * FitTrack Gym - Reviews & Ratings API
 *
 * GET  /api/reviews/index.php - List trainer reviews
 * POST /api/reviews/index.php - Submit feedback & rating (1 to 5)
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

setApiHeaders();
$pdo = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $trainerId = !empty($_GET['trainer_id']) ? (int) $_GET['trainer_id'] : 0;

    try {
        if ($trainerId > 0) {
            $stmt = $pdo->prepare("
                SELECT r.*, u.full_name as client_name, u.profile_image as client_avatar
                FROM reviews r
                JOIN users u ON r.user_id = u.user_id
                WHERE r.trainer_id = :tid AND r.review_status = 'published'
                ORDER BY r.created_at DESC
            ");
            $stmt->execute([':tid' => $trainerId]);
        } else {
            $stmt = $pdo->query("
                SELECT r.*, u.full_name as client_name, t.full_name as trainer_name
                FROM reviews r
                JOIN users u ON r.user_id = u.user_id
                JOIN users t ON r.trainer_id = t.user_id
                WHERE r.review_status = 'published'
                ORDER BY r.created_at DESC
                LIMIT 50
            ");
        }
        $reviews = $stmt->fetchAll();

        sendSuccess($reviews, 'Reviews retrieved.');
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $authUser = requireAuth(['user']);
    $userId   = $authUser['user_id'];
    $input    = getJsonInput();

    $trainerId = (int) ($input['trainer_id'] ?? 0);
    $rating    = (int) ($input['rating'] ?? 5);
    $text      = sanitizeString($input['review_text'] ?? '');

    if ($trainerId <= 0 || $rating < 1 || $rating > 5) {
        sendError('Valid trainer_id and rating (1-5) are required.', 422);
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO reviews (user_id, trainer_id, rating, review_text, review_status, created_at, updated_at)
            VALUES (:uid, :tid, :rating, :text, 'published', NOW(), NOW())
        ");
        $stmt->execute([
            ':uid'    => $userId,
            ':tid'    => $trainerId,
            ':rating' => $rating,
            ':text'   => $text
        ]);

        sendSuccess(['review_id' => $pdo->lastInsertId()], 'Review submitted successfully.', 201);
    } catch (PDOException $e) {
        sendError('Failed to submit review: ' . $e->getMessage(), 500);
    }
}

sendError('Method not allowed.', 405);
