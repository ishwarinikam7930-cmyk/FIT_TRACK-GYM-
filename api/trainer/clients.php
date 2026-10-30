<?php
/**
 * FitTrack Gym - Trainer Clients API
 *
 * GET /api/trainer/clients.php - List all clients assigned to or associated with trainer
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

setApiHeaders();
$authTrainer = requireAuth(['trainer']);
$trainerId   = $authTrainer['user_id'];
$pdo         = getDB();

try {
    // Fetch users with their user_profile details
    $stmt = $pdo->prepare("
        SELECT u.user_id, u.full_name, u.email, u.phone, u.profile_image, u.created_at,
               p.height_cm, p.current_weight_kg, p.fitness_goal, p.activity_level, p.dietary_preference
        FROM users u
        LEFT JOIN user_profiles p ON u.user_id = p.user_id
        WHERE u.role = 'user'
        ORDER BY u.created_at DESC
    ");
    $stmt->execute();
    $clients = $stmt->fetchAll();

    sendSuccess($clients, 'Trainer client roster retrieved.');
} catch (PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
