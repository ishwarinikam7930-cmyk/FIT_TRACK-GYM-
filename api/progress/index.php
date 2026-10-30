<?php
/**
 * FitTrack Gym - Progress Tracking API
 *
 * GET  /api/progress/index.php - Get progress history and metric logs
 * POST /api/progress/index.php - Log a new progress checkpoint
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
        $targetUserId = ($authUser['role'] === 'trainer' && !empty($_GET['client_id']))
            ? (int) $_GET['client_id']
            : $userId;

        $stmt = $pdo->prepare("
            SELECT p.*, u.full_name as reviewer_name
            FROM progress_entries p
            LEFT JOIN users u ON p.reviewed_by = u.user_id
            WHERE p.user_id = :uid
            ORDER BY p.recorded_at DESC
        ");
        $stmt->execute([':uid' => $targetUserId]);
        $entries = $stmt->fetchAll();

        sendSuccess($entries, 'Progress entries retrieved.');
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = getJsonInput();

    $weight    = !empty($input['weight_kg']) ? (float) $input['weight_kg'] : null;
    $bodyFat   = !empty($input['body_fat_percent']) ? (float) $input['body_fat_percent'] : null;
    $chest     = !empty($input['chest_cm']) ? (float) $input['chest_cm'] : null;
    $waist     = !empty($input['waist_cm']) ? (float) $input['waist_cm'] : null;
    $hips      = !empty($input['hips_cm']) ? (float) $input['hips_cm'] : null;
    $notes     = sanitizeString($input['notes'] ?? null);

    if ($weight === null && $bodyFat === null) {
        sendError('Please provide at least a weight or body fat % entry.', 422);
    }

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("
            INSERT INTO progress_entries (user_id, recorded_at, weight_kg, body_fat_percent, chest_cm, waist_cm, hips_cm, notes, created_at)
            VALUES (:uid, NOW(), :weight, :bf, :chest, :waist, :hips, :notes, NOW())
        ");
        $stmt->execute([
            ':uid'    => $userId,
            ':weight' => $weight,
            ':bf'     => $bodyFat,
            ':chest'  => $chest,
            ':waist'  => $waist,
            ':hips'   => $hips,
            ':notes'  => $notes
        ]);

        $entryId = (int) $pdo->lastInsertId();

        // Also update latest weight in user_profiles
        if ($weight !== null) {
            $upStmt = $pdo->prepare("UPDATE user_profiles SET current_weight_kg = :w, updated_at = NOW() WHERE user_id = :uid");
            $upStmt->execute([':w' => $weight, ':uid' => $userId]);
        }

        $pdo->commit();

        sendSuccess(['progress_entry_id' => $entryId], 'Progress log recorded successfully.', 201);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

sendError('Method not allowed.', 405);
