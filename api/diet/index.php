<?php
/**
 * FitTrack Gym - Diet & Nutrition API
 *
 * GET  /api/diet/index.php - Get assigned diet plans and meals for user, or trainer plans
 * POST /api/diet/index.php - Assign diet plan to client (trainer)
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
            $stmt = $pdo->prepare("
                SELECT dp.*, 
                       (SELECT COUNT(*) FROM diet_items di WHERE di.diet_plan_id = dp.diet_plan_id) as item_count
                FROM diet_plans dp
                WHERE dp.trainer_id = :tid AND dp.is_active = 1
                ORDER BY dp.created_at DESC
            ");
            $stmt->execute([':tid' => $userId]);
            $dietPlans = $stmt->fetchAll();

            foreach ($dietPlans as &$dp) {
                $iStmt = $pdo->prepare("SELECT * FROM diet_items WHERE diet_plan_id = :dpid ORDER BY display_order ASC");
                $iStmt->execute([':dpid' => $dp['diet_plan_id']]);
                $dp['items'] = $iStmt->fetchAll();
            }

            sendSuccess($dietPlans, 'Trainer diet plans retrieved.');
        } else {
            // Get active assigned diet plan for member
            $stmt = $pdo->prepare("
                SELECT ad.assigned_diet_id, ad.start_date, ad.end_date, ad.status, ad.trainer_remarks,
                       dp.diet_plan_id, dp.diet_plan_name, dp.description, dp.fitness_goal, dp.dietary_type, dp.daily_calorie_target,
                       u.full_name as trainer_name
                FROM assigned_diets ad
                JOIN diet_plans dp ON ad.diet_plan_id = dp.diet_plan_id
                JOIN users u ON ad.assigned_by = u.user_id
                WHERE ad.user_id = :uid AND ad.status = 'active'
                ORDER BY ad.assigned_diet_id DESC
                LIMIT 1
            ");
            $stmt->execute([':uid' => $userId]);
            $activeDiet = $stmt->fetch();

            if ($activeDiet) {
                $iStmt = $pdo->prepare("SELECT * FROM diet_items WHERE diet_plan_id = :dpid ORDER BY display_order ASC");
                $iStmt->execute([':dpid' => $activeDiet['diet_plan_id']]);
                $activeDiet['meals'] = $iStmt->fetchAll();
            }

            sendSuccess($activeDiet ?: null, 'Assigned diet retrieved.');
        }
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = getJsonInput();
    $action = $input['action'] ?? '';

    if ($userRole === 'trainer' && $action === 'assign_diet') {
        $clientId = (int) ($input['client_id'] ?? 0);
        $dietPlanId = (int) ($input['diet_plan_id'] ?? 0);
        $remarks = sanitizeString($input['trainer_remarks'] ?? '');

        if ($clientId <= 0 || $dietPlanId <= 0) {
            sendError('client_id and diet_plan_id are required', 422);
        }

        try {
            $stmt = $pdo->prepare("
                INSERT INTO assigned_diets (user_id, diet_plan_id, assigned_by, start_date, status, trainer_remarks, created_at)
                VALUES (:uid, :dpid, :tid, CURDATE(), 'active', :remarks, NOW())
            ");
            $stmt->execute([
                ':uid' => $clientId,
                ':dpid' => $dietPlanId,
                ':tid' => $userId,
                ':remarks' => $remarks
            ]);

            sendSuccess(['assigned_diet_id' => $pdo->lastInsertId()], 'Diet plan assigned successfully.');
        } catch (PDOException $e) {
            sendError('Database error: ' . $e->getMessage(), 500);
        }
    }

    sendError('Invalid action or unauthorized.', 403);
}

sendError('Method not allowed.', 405);
