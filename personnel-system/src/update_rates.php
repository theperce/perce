<?php
/**
 * Update rates for an employee
 */

require_once __DIR__ . '/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['employee_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Employee ID is required']);
    exit;
}

$employees = Database::read('employees.json');
$employeeId = (int)$input['employee_id'];
$found = false;

foreach ($employees as &$employee) {
    if ($employee['id'] === $employeeId) {
        $employee['hourly_rate'] = floatval($input['hourly_rate'] ?? $employee['hourly_rate']);
        $employee['daily_rate'] = floatval($input['daily_rate'] ?? $employee['daily_rate']);
        $employee['weekly_rate'] = floatval($input['weekly_rate'] ?? $employee['weekly_rate']);
        $employee['monthly_rate'] = floatval($input['monthly_rate'] ?? $employee['monthly_rate']);
        $employee['updated_at'] = date('Y-m-d H:i:s');
        $found = true;
        break;
    }
}

if (!$found) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Employee not found']);
    exit;
}

Database::write('employees.json', $employees);

echo json_encode([
    'success' => true,
    'message' => 'Rates updated successfully'
]);
