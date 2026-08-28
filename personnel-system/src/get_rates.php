<?php
/**
 * Get all rates
 */

require_once __DIR__ . '/database.php';

$rates = Database::read('rates.json');

echo json_encode([
    'success' => true,
    'data' => $rates
]);
