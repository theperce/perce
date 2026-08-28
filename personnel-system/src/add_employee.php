<?php
/**
 * Add new employee
 */

require_once __DIR__ . '/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['name']) || empty($input['position_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Name and position are required']);
    exit;
}

$employees = Database::read('employees.json');
$newEmployee = [
    'id' => Database::getNextId('employees.json'),
    'name' => htmlspecialchars($input['name']),
    'position_id' => (int)$input['position_id'],
    'hourly_rate' => floatval($input['hourly_rate'] ?? 0),
    'daily_rate' => floatval($input['daily_rate'] ?? 0),
    'weekly_rate' => floatval($input['weekly_rate'] ?? 0),
    'monthly_rate' => floatval($input['monthly_rate'] ?? 0),
    'created_at' => date('Y-m-d H:i:s')
];

$employees[] = $newEmployee;
Database::write('employees.json', $employees);

echo json_encode([
    'success' => true,
    'data' => $newEmployee
]);
