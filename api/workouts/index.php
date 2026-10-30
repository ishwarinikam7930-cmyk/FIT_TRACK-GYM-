<?php
/**
 * FitTrack Gym - Workouts API
 *
 * GET  /api/workouts/index.php - Get assigned workouts for current user or all routines for trainer
 * POST /api/workouts/index.php - Complete a workout (user) or create/assign a workout (trainer)
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

setApiHeaders();
$authUser = requireAuth();
$userId   = $authUser['user_id'];
$userRole = $authUser['role'];
$pdo      = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        if ($userRole === 'trainer') {
            // Get all master workouts created by trainer
            $stmt = $pdo->prepare("
                SELECT w.*, 
                       (SELECT COUNT(*) FROM workout_exercises e WHERE e.workout_id = w.workout_id) as exercise_count
                FROM workouts w
                WHERE w.trainer_id = :tid AND w.is_active = 1
                ORDER BY w.created_at DESC
            ");
            $stmt->execute([':tid' => $userId]);
            $workouts = $stmt->fetchAll();

            foreach ($workouts as &$w) {
                $eStmt = $pdo->prepare("SELECT * FROM workout_exercises WHERE workout_id = :wid ORDER BY display_order ASC");
                $eStmt->execute([':wid' => $w['workout_id']]);
                $w['exercises'] = $eStmt->fetchAll();
            }

            sendSuccess($workouts, 'Trainer workouts retrieved.');
        } else {
            // Get assigned workouts for member
            $stmt = $pdo->prepare("
                SELECT aw.assigned_workout_id, aw.scheduled_date, aw.completion_status, aw.completed_at, aw.trainer_remarks,
                       w.workout_id, w.workout_name, w.description, w.fitness_goal, w.difficulty_level, w.estimated_duration_minutes,
                       u.full_name as trainer_name
                FROM assigned_workouts aw
                JOIN workouts w ON aw.workout_id = w.workout_id
                JOIN users u ON aw.assigned_by = u.user_id
                WHERE aw.user_id = :uid
                ORDER BY aw.scheduled_date DESC, aw.assigned_workout_id DESC
            ");
            $stmt->execute([':uid' => $userId]);
            $assigned = $stmt->fetchAll();

            foreach ($assigned as &$a) {
                $eStmt = $pdo->prepare("SELECT * FROM workout_exercises WHERE workout_id = :wid ORDER BY display_order ASC");
                $eStmt->execute([':wid' => $a['workout_id']]);
                $a['exercises'] = $eStmt->fetchAll();
            }

            sendSuccess($assigned, 'Assigned workouts retrieved.');
        }
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = getJsonInput();
    $action = $input['action'] ?? '';

    try {
        // User action: Complete workout
        if ($action === 'complete_workout') {
            $assignedId = (int) ($input['assigned_workout_id'] ?? 0);
            if ($assignedId <= 0) {
                sendError('assigned_workout_id is required', 422);
            }

            $stmt = $pdo->prepare("
                UPDATE assigned_workouts 
                SET completion_status = 'completed', completed_at = NOW()
                WHERE assigned_workout_id = :id AND user_id = :uid
            ");
            $stmt->execute([':id' => $assignedId, ':uid' => $userId]);

            sendSuccess(null, 'Workout marked as completed!');
        }

        // Trainer action: Assign workout to client
        if ($userRole === 'trainer' && $action === 'assign_workout') {
            $clientId = (int) ($input['client_id'] ?? 0);
            $workoutId = (int) ($input['workout_id'] ?? 0);
            $scheduledDate = $input['scheduled_date'] ?? date('Y-m-d');
            $remarks = sanitizeString($input['trainer_remarks'] ?? '');

            if ($clientId <= 0 || $workoutId <= 0) {
                sendError('client_id and workout_id are required', 422);
            }

            $stmt = $pdo->prepare("
                INSERT INTO assigned_workouts (user_id, workout_id, assigned_by, scheduled_date, completion_status, trainer_remarks, created_at)
                VALUES (:uid, :wid, :tid, :sdate, 'assigned', :remarks, NOW())
            ");
            $stmt->execute([
                ':uid' => $clientId,
                ':wid' => $workoutId,
                ':tid' => $userId,
                ':sdate' => $scheduledDate,
                ':remarks' => $remarks
            ]);

            sendSuccess(['assigned_workout_id' => $pdo->lastInsertId()], 'Workout assigned successfully.');
        }

        sendError('Invalid action specified.', 400);
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

sendError('Method not allowed.', 405);
