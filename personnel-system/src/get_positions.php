<?php
/**
 * Get all positions
 */

require_once __DIR__ . '/database.php';

$positions = Database::read('positions.json');

echo json_encode([
    'success' => true,
    'data' => $positions
]);
