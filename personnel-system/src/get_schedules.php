<?php
/**
 * Get all schedules
 */

require_once __DIR__ . '/database.php';

$schedules = Database::read('schedules.json');
$employees = Database::read('employees.json');

// Add employee names to schedules
foreach ($schedules as &$schedule) {
    $employeeId = $schedule['employee_id'] ?? null;
    foreach ($employees as $employee) {
        if ($employee['id'] === $employeeId) {
            $schedule['employee_name'] = $employee['name'];
            break;
        }
    }
}

echo json_encode([
    'success' => true,
    'data' => $schedules
]);
