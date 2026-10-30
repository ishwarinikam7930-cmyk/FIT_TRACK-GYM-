<?php
/**
 * FitTrack Gym - Coaching Sessions & Bookings API
 *
 * GET  /api/bookings/sessions.php - List all live coaching sessions / bookings
 * POST /api/bookings/sessions.php - Book a session, start session, or mark completed
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

setApiHeaders();

// Allow authenticated session, or fallback to current role context
$user = getAuthUser();
$userId = $user['user_id'] ?? 1; // default to primary user if direct
$pdo = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->prepare("
            SELECT b.booking_id, b.user_id, b.trainer_id, b.slot_id, b.booking_status, b.user_message, b.trainer_response, b.booked_at,
                   s.slot_date, s.start_time, s.end_time, s.training_type,
                   u.full_name as client_name,
                   t.full_name as trainer_name
            FROM bookings b
            JOIN availability_slots s ON b.slot_id = s.slot_id
            JOIN users u ON b.user_id = u.user_id
            JOIN users t ON b.trainer_id = t.user_id
            ORDER BY s.slot_date DESC, s.start_time DESC
        ");
        $stmt->execute();
        $dbBookings = $stmt->fetchAll();

        // If no bookings in DB, check if sessions.json exists to import
        if (empty($dbBookings)) {
            $jsonFile = __DIR__ . '/../../sessions.json';
            if (file_exists($jsonFile)) {
                $raw = file_get_contents($jsonFile);
                $imported = json_decode($raw, true);
                if (is_array($imported)) {
                    sendSuccess($imported, 'Sessions loaded.');
                }
            }
        }

        // Format for frontend
        $formatted = array_map(function ($row) {
            $status = ucfirst($row['booking_status']);
            $dateFormatted = date('l, M j, Y', strtotime($row['slot_date']));
            $timeFormatted = date('h:i A', strtotime($row['start_time'])) . ' – ' . date('h:i A', strtotime($row['end_time']));
            $initials = '';
            $parts = explode(' ', $row['client_name']);
            foreach ($parts as $p) {
                $initials .= strtoupper(substr($p, 0, 1));
            }

            return [
                'id'             => 'bk_' . $row['booking_id'],
                'booking_id'     => $row['booking_id'],
                'clientName'     => $row['client_name'],
                'clientInitials' => substr($initials, 0, 2),
                'trainerName'    => $row['trainer_name'],
                'date'           => $dateFormatted,
                'time'           => $timeFormatted,
                'type'           => ucfirst($row['training_type']) . ' Coaching',
                'duration'       => '60 min',
                'topic'          => $row['user_message'] ?: 'Personalized Coaching & Form Check',
                'category'       => strtolower($row['booking_status']),
                'status'         => $status,
                'meetingLink'    => 'https://meet.fittrack.com/session-rm-' . $row['booking_id']
            ];
        }, $dbBookings);

        sendSuccess($formatted, 'Sessions retrieved.');
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = getJsonInput();
    $action = $input['action'] ?? '';

    // Handle marking session completed
    if ($action === 'complete' || isset($input['sessionId'])) {
        $sessionId = $input['sessionId'] ?? ($input['booking_id'] ?? '');
        $idNum = (int) str_replace('bk_', '', (string) $sessionId);

        try {
            if ($idNum > 0) {
                $stmt = $pdo->prepare("UPDATE bookings SET booking_status = 'completed', updated_at = NOW() WHERE booking_id = :id");
                $stmt->execute([':id' => $idNum]);
            }

            // Also keep sessions.json updated if present
            $jsonFile = __DIR__ . '/../../sessions.json';
            if (file_exists($jsonFile)) {
                $raw = file_get_contents($jsonFile);
                $sessions = json_decode($raw, true) ?: [];
                foreach ($sessions as &$s) {
                    if (($s['id'] ?? '') === $sessionId) {
                        $s['status'] = 'Completed';
                        $s['category'] = 'completed';
                    }
                }
                file_put_contents($jsonFile, json_encode($sessions, JSON_PRETTY_PRINT));
            }

            sendSuccess(null, 'Session marked as completed.');
        } catch (PDOException $e) {
            sendError('Failed to complete session: ' . $e->getMessage(), 500);
        }
    }

    sendError('Action not supported.', 400);
}

sendError('Method not allowed.', 405);
