<?php
/**
 * FitTrack Gym - Sessions API Endpoint (Direct route)
 *
 * Supports:
 *  - GET  /api/sessions.php (returns { success: true, sessions: [...] })
 *  - POST /api/sessions.php?action=start
 *  - POST /api/sessions.php?action=complete
 *  - POST /api/sessions.php?action=book
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setApiHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);

if (strpos($path, '/start') !== false) {
    $action = 'start';
} elseif (strpos($path, '/complete') !== false) {
    $action = 'complete';
} elseif (strpos($path, '/book') !== false) {
    $action = 'book';
}

$sessionsFile = __DIR__ . '/../sessions.json';

// Helper to read sessions from JSON fallback / initial store
function getJsonSessions($file): array {
    if (file_exists($file)) {
        $raw = file_get_contents($file);
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) return $decoded;
    }
    return [];
}

// ── GET Sessions ──
if ($method === 'GET') {
    try {
        $pdo = getDB();
        $stmt = $pdo->query("
            SELECT b.booking_id, b.user_id, b.trainer_id, b.slot_id, b.booking_status, b.user_message,
                   s.slot_date, s.start_time, s.end_time, s.training_type,
                   u.full_name as client_name,
                   t.full_name as trainer_name
            FROM bookings b
            JOIN availability_slots s ON b.slot_id = s.slot_id
            JOIN users u ON b.user_id = u.user_id
            JOIN users t ON b.trainer_id = t.user_id
            ORDER BY s.slot_date DESC
        ");
        $dbRows = $stmt->fetchAll();

        if (!empty($dbRows)) {
            $formatted = array_map(function ($row) {
                $status = ucfirst($row['booking_status']);
                $dateFormatted = date('l, M j, Y', strtotime($row['slot_date']));
                $timeFormatted = date('h:i A', strtotime($row['start_time'])) . ' – ' . date('h:i A', strtotime($row['end_time']));
                $initials = '';
                foreach (explode(' ', $row['client_name']) as $p) {
                    $initials .= strtoupper(substr($p, 0, 1));
                }

                return [
                    'id'             => 'ts_' . $row['booking_id'],
                    'clientName'     => $row['client_name'],
                    'clientInitials' => substr($initials, 0, 2),
                    'date'           => $dateFormatted,
                    'time'           => $timeFormatted,
                    'type'           => ucfirst($row['training_type']) . ' Coaching',
                    'duration'       => '60 min',
                    'topic'          => $row['user_message'] ?: 'Personalized Coaching',
                    'category'       => strtolower($row['booking_status']),
                    'status'         => $status,
                    'meetingLink'    => 'https://meet.fittrack.com/session-rm-' . $row['booking_id']
                ];
            }, $dbRows);

            echo json_encode([
                'success'  => true,
                'sessions' => $formatted
            ]);
            exit;
        }
    } catch (Exception $e) {
        // Fallback to sessions.json
    }

    $sessions = getJsonSessions($sessionsFile);
    echo json_encode([
        'success'  => true,
        'sessions' => $sessions
    ]);
    exit;
}

// ── POST Requests ──
if ($method === 'POST') {
    $input = getJsonInput();

    if ($action === 'start') {
        $sessionId = $input['sessionId'] ?? '';
        $sessions = getJsonSessions($sessionsFile);
        foreach ($sessions as $s) {
            if ($s['id'] === $sessionId && ($s['status'] ?? '') === 'Completed') {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => "Session $sessionId has already ended."]);
                exit;
            }
        }
        echo json_encode(['success' => true, 'message' => 'Session can be started']);
        exit;
    }

    if ($action === 'complete') {
        $sessionId = $input['sessionId'] ?? '';
        if (!$sessionId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'sessionId is required']);
            exit;
        }

        $sessions = getJsonSessions($sessionsFile);
        $found = false;
        $updatedSession = null;
        foreach ($sessions as &$s) {
            if ($s['id'] === $sessionId) {
                $s['status'] = 'Completed';
                $s['category'] = 'completed';
                $found = true;
                $updatedSession = $s;
                break;
            }
        }

        if ($found) {
            file_put_contents($sessionsFile, json_encode($sessions, JSON_PRETTY_PRINT));
            echo json_encode(['success' => true, 'message' => 'Session marked completed', 'session' => $updatedSession]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Session not found']);
        }
        exit;
    }

    if ($action === 'book') {
        $sessions = getJsonSessions($sessionsFile);
        array_unshift($sessions, $input);
        file_put_contents($sessionsFile, json_encode($sessions, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true, 'session' => $input]);
        exit;
    }
}

http_response_code(404);
echo json_encode(['success' => false, 'error' => 'Route not found']);
