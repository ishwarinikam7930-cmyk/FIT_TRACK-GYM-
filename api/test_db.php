<?php
/**
 * FitTrack Gym - Backend & Database Connection Test Endpoint
 *
 * GET /api/test_db.php
 * Verifies PDO connection, queries table names and row counts in fittrack_db.
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setApiHeaders();

try {
    $pdo = getDB();

    // Query all tables in fittrack_db
    $tableQuery = $pdo->prepare("
        SELECT table_name, table_rows 
        FROM information_schema.tables 
        WHERE table_schema = :db_name 
        ORDER BY table_name ASC
    ");
    $tableQuery->execute([':db_name' => DB_NAME]);
    $tables = $tableQuery->fetchAll();

    // Check users table count
    $userCountStmt = $pdo->query("SELECT COUNT(*) AS total FROM users");
    $userCount = (int) $userCountStmt->fetchColumn();

    sendSuccess([
        'connection'    => 'active',
        'database_name' => DB_NAME,
        'database_host' => DB_HOST . ':' . DB_PORT,
        'php_version'   => PHP_VERSION,
        'tables_count'  => count($tables),
        'total_users'   => $userCount,
        'tables'        => $tables
    ], 'FitTrack PHP backend is running and successfully connected to ' . DB_NAME);

} catch (PDOException $e) {
    sendError('Database connection error: ' . $e->getMessage(), 500);
} catch (Throwable $e) {
    sendError('Internal server error: ' . $e->getMessage(), 500);
}
