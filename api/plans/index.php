<?php
/**
 * FitTrack Gym - Plans & Pricing API
 *
 * GET /api/plans/index.php - List all available membership/coaching plans
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';

setApiHeaders();

try {
    $pdo = getDB();

    $stmt = $pdo->query("SELECT * FROM plans WHERE status = 'active' ORDER BY price ASC");
    $plans = $stmt->fetchAll();

    // If no plans in DB yet, seed standard FitTrack tiers
    if (empty($plans)) {
        $defaultPlans = [
            [
                'plan_name'     => 'Starter Fitness Tier',
                'description'   => 'Ideal for beginners seeking structured workout routines and basic macro nutrition guidelines.',
                'price'         => 29.00,
                'duration_days' => 30,
                'features'      => ['Access to Standard Workout Library', 'Basic Macro & Meal Plan', 'Community Support Group']
            ],
            [
                'plan_name'     => 'Pro Coaching Plan',
                'description'   => 'Our most popular plan. Dedicated coach, 1-on-1 bi-weekly video form checks, and tailored weekly diet revisions.',
                'price'         => 59.00,
                'duration_days' => 30,
                'features'      => ['Dedicated 1-on-1 Certified Coach', 'Bi-Weekly Live Video Coaching', 'Custom Macro & Calorie Tracking', 'Priority Messaging Support']
            ],
            [
                'plan_name'     => 'Elite Performance Tier',
                'description'   => 'Comprehensive body recomposition, sports psychology, weekly 1-on-1 video sessions, and custom daily meal plans.',
                'price'         => 99.00,
                'duration_days' => 30,
                'features'      => ['Weekly 60-min 1-on-1 Live Sessions', 'Daily Tailored Macro Adjustments', 'Injury Prevention & Mobility Screening', '24/7 Direct WhatsApp/Chat Access']
            ]
        ];

        $pdo->beginTransaction();
        foreach ($defaultPlans as $dp) {
            $pIns = $pdo->prepare("
                INSERT INTO plans (plan_name, description, price, duration_days, status, created_at, updated_at)
                VALUES (:name, :desc, :price, :duration, 'active', NOW(), NOW())
            ");
            $pIns->execute([
                ':name'     => $dp['plan_name'],
                ':desc'     => $dp['description'],
                ':price'    => $dp['price'],
                ':duration' => $dp['duration_days']
            ]);
            $planId = (int)$pdo->lastInsertId();

            foreach ($dp['features'] as $feat) {
                $fIns = $pdo->prepare("INSERT INTO plan_features (plan_id, feature_name) VALUES (:pid, :fname)");
                $fIns->execute([':pid' => $planId, ':fname' => $feat]);
            }
        }
        $pdo->commit();

        $stmt = $pdo->query("SELECT * FROM plans WHERE status = 'active' ORDER BY price ASC");
        $plans = $stmt->fetchAll();
    }

    // Attach features to each plan
    foreach ($plans as &$p) {
        $fStmt = $pdo->prepare("SELECT feature_name, feature_description FROM plan_features WHERE plan_id = :pid");
        $fStmt->execute([':pid' => $p['plan_id']]);
        $p['features'] = $fStmt->fetchAll();
    }

    sendSuccess($plans, 'Plans retrieved successfully.');
} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendError('Database error: ' . $e->getMessage(), 500);
}
