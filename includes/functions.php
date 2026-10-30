<?php
/**
 * FitTrack Gym - Global Utilities & API Response Helper
 */

// Common headers for JSON REST API
function setApiHeaders(): void
{
    header('Content-Type: application/json; charset=UTF-8');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('X-XSS-Protection: 1; mode=block');

    // Handle CORS if needed (same-origin by default, supports local credentials)
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

    // Handle preflight OPTIONS request
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

/**
 * Send standard JSON response and terminate script
 *
 * @param bool $success
 * @param mixed $data
 * @param string $message
 * @param int $statusCode
 * @param array $extra
 */
function sendResponse(bool $success, $data = null, string $message = '', int $statusCode = 200, array $extra = []): void
{
    setApiHeaders();
    http_response_code($statusCode);

    $response = array_merge([
        'success'   => $success,
        'message'   => $message,
        'data'      => $data,
        'timestamp' => date('c')
    ], $extra);

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Send standard JSON success response
 */
function sendSuccess($data = null, string $message = 'Success', int $statusCode = 200, array $extra = []): void
{
    sendResponse(true, $data, $message, $statusCode, $extra);
}

/**
 * Send standard JSON error response
 */
function sendError(string $message = 'An error occurred', int $statusCode = 400, array $errors = []): void
{
    $extra = !empty($errors) ? ['errors' => $errors] : [];
    sendResponse(false, null, $message, $statusCode, $extra);
}

/**
 * Safely parse incoming JSON request body or form payload
 *
 * @return array
 */
function getJsonInput(): array
{
    $rawInput = file_get_contents('php://input');
    if (!empty($rawInput)) {
        $decoded = json_decode($rawInput, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }
    }

    // Fallback to $_POST if multipart or standard form
    return $_POST ?: [];
}

/**
 * Validate required fields in input data
 *
 * @param array $data Input array
 * @param array $requiredFields List of keys
 * @return array List of missing field names (empty if all present)
 */
function validateRequired(array $data, array $requiredFields): array
{
    $missing = [];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || trim((string)$data[$field]) === '') {
            $missing[] = $field;
        }
    }
    return $missing;
}

/**
 * Validate email format
 */
function isValidEmail(string $email): bool
{
    return (bool) filter_var(trim($email), FILTER_VALIDATE_EMAIL);
}

/**
 * Sanitize string input
 */
function sanitizeString(?string $str): string
{
    if ($str === null) {
        return '';
    }
    return htmlspecialchars(trim($str), ENT_QUOTES, 'UTF-8');
}
