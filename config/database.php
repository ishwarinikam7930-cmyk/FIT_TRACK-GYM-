<?php
/**
 * FitTrack Gym - Database Configuration & Connection Handler
 *
 * Provides a secure, reusable PDO connection to MySQL (fittrack_db) on XAMPP.
 */

// Prevent direct access to configuration file if called via web
if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'] ?? '')) {
    header('HTTP/1.1 403 Forbidden');
    exit('Direct access not permitted.');
}

// Database Connection Parameters
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'fittrack_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_CHARSET', 'utf8mb4');

class Database
{
    private static ?PDO $instance = null;

    /**
     * Get the singleton PDO instance
     *
     * @return PDO
     * @throws PDOException
     */
    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                DB_HOST,
                DB_PORT,
                DB_NAME,
                DB_CHARSET
            );

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET . " COLLATE utf8mb4_unicode_ci"
            ];

            try {
                self::$instance = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (PDOException $e) {
                // Log internal error message safely
                error_log("FitTrack Database Connection Error: " . $e->getMessage());
                throw new PDOException("Database connection failed. Please ensure MySQL is running in XAMPP.");
            }
        }

        return self::$instance;
    }

    /**
     * Test the database connection
     *
     * @return array [bool $connected, string $message, array $tables]
     */
    public static function testConnection(): array
    {
        try {
            $pdo = self::getConnection();
            $stmt = $pdo->query("SELECT table_name FROM information_schema.tables WHERE table_schema = '" . DB_NAME . "' ORDER BY table_name ASC");
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

            return [
                'success' => true,
                'message' => 'Successfully connected to database ' . DB_NAME,
                'database' => DB_NAME,
                'table_count' => count($tables),
                'tables' => $tables
            ];
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'database' => DB_NAME,
                'table_count' => 0,
                'tables' => []
            ];
        }
    }
}

/**
 * Functional shorthand for Database::getConnection()
 *
 * @return PDO
 */
function getDB(): PDO
{
    return Database::getConnection();
}
