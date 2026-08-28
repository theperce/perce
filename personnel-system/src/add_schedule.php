<?php
/**
 * Add new schedule entry
 */

require_once __DIR__ . '/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['employee_id']) || empty($input['date']) || empty($input['shift_type'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Employee ID, date, and shift type are required']);
    exit;
}

$schedules = Database::read('schedules.json');
$newSchedule = [
    'id' => Database::getNextId('schedules.json'),
    'employee_id' => (int)$input['employee_id'],
    'date' => $input['date'],
    'shift_type' => htmlspecialchars($input['shift_type']), // e.g., 'morning', 'evening', 'night', 'day_off'
    'hours_worked' => floatval($input['hours_worked'] ?? 8),
    'notes' => htmlspecialchars($input['notes'] ?? ''),
    'created_at' => date('Y-m-d H:i:s')
];

$schedules[] = $newSchedule;
Database::write('schedules.json', $schedules);

echo json_encode([
    'success' => true,
    'data' => $newSchedule
]);
