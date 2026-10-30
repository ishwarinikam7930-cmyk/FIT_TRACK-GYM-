<?php
/**
 * FitTrack Gym - User Profile API
 *
 * GET  /api/user/profile.php - Get authenticated user profile details
 * POST /api/user/profile.php - Update user biometrics and profile details
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
            SELECT u.user_id, u.full_name, u.email, u.phone, u.role, u.profile_image,
                   p.date_of_birth, p.gender, p.height_cm, p.current_weight_kg,
                   p.fitness_goal, p.activity_level, p.dietary_preference, p.medical_notes,
                   p.updated_at
            FROM users u
            LEFT JOIN user_profiles p ON u.user_id = p.user_id
            WHERE u.user_id = :id
            LIMIT 1
        ");
        $stmt->execute([':id' => $userId]);
        $profile = $stmt->fetch();

        sendSuccess($profile, 'User profile retrieved.');
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = getJsonInput();

    try {
        $pdo->beginTransaction();

        // Update users table
        if (isset($input['full_name']) || isset($input['phone'])) {
            $uStmt = $pdo->prepare("
                UPDATE users 
                SET full_name = COALESCE(:full_name, full_name),
                    phone = COALESCE(:phone, phone),
                    updated_at = NOW()
                WHERE user_id = :id
            ");
            $uStmt->execute([
                ':full_name' => isset($input['full_name']) ? sanitizeString($input['full_name']) : null,
                ':phone'     => isset($input['phone']) ? sanitizeString($input['phone']) : null,
                ':id'        => $userId
            ]);
        }

        // Update user_profiles table
        $pStmt = $pdo->prepare("
            INSERT INTO user_profiles (user_id, height_cm, current_weight_kg, fitness_goal, activity_level, dietary_preference, medical_notes, updated_at)
            VALUES (:uid, :height, :weight, :goal, :activity, :diet, :medical, NOW())
            ON DUPLICATE KEY UPDATE
                height_cm = COALESCE(VALUES(height_cm), height_cm),
                current_weight_kg = COALESCE(VALUES(current_weight_kg), current_weight_kg),
                fitness_goal = COALESCE(VALUES(fitness_goal), fitness_goal),
                activity_level = COALESCE(VALUES(activity_level), activity_level),
                dietary_preference = COALESCE(VALUES(dietary_preference), dietary_preference),
                medical_notes = COALESCE(VALUES(medical_notes), medical_notes),
                updated_at = NOW()
        ");
        $pStmt->execute([
            ':uid'      => $userId,
            ':height'   => !empty($input['height_cm']) ? (float)$input['height_cm'] : null,
            ':weight'   => !empty($input['current_weight_kg']) ? (float)$input['current_weight_kg'] : null,
            ':goal'     => !empty($input['fitness_goal']) ? sanitizeString($input['fitness_goal']) : null,
            ':activity' => !empty($input['activity_level']) ? sanitizeString($input['activity_level']) : null,
            ':diet'     => !empty($input['dietary_preference']) ? sanitizeString($input['dietary_preference']) : null,
            ':medical'  => !empty($input['medical_notes']) ? sanitizeString($input['medical_notes']) : null
        ]);

        $pdo->commit();

        sendSuccess(null, 'Profile updated successfully.');
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        sendError('Failed to update profile: ' . $e->getMessage(), 500);
    }
}

sendError('Method not allowed.', 405);
