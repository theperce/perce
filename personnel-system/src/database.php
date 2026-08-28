<?php
/**
 * Database helper functions using JSON files
 */

class Database {
    private static $dataDir = __DIR__ . '/../data';
    
    public static function read($filename) {
        $filepath = self::$dataDir . '/' . $filename;
        if (!file_exists($filepath)) {
            return [];
        }
        $content = file_get_contents($filepath);
        return json_decode($content, true) ?: [];
    }
    
    public static function write($filename, $data) {
        $filepath = self::$dataDir . '/' . $filename;
        file_put_contents($filepath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
    
    public static function getNextId($filename) {
        $data = self::read($filename);
        if (empty($data)) {
            return 1;
        }
        $maxId = max(array_column($data, 'id'));
        return $maxId + 1;
    }
}

// Initialize data files if they don't exist
$files = ['employees.json', 'positions.json', 'schedules.json', 'rates.json'];
foreach ($files as $file) {
    $filepath = Database::$dataDir . '/' . $file;
    if (!file_exists($filepath)) {
        Database::write($file, []);
    }
}
