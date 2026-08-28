<?php
/**
 * Add new position
 */

require_once __DIR__ . '/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['name'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Position name is required']);
    exit;
}

$positions = Database::read('positions.json');
$newPosition = [
    'id' => Database::getNextId('positions.json'),
    'name' => htmlspecialchars($input['name']),
    'description' => htmlspecialchars($input['description'] ?? ''),
    'created_at' => date('Y-m-d H:i:s')
];

$positions[] = $newPosition;
Database::write('positions.json', $positions);

echo json_encode([
    'success' => true,
    'data' => $newPosition
]);
