<?php
/**
 * Get all employees
 */

require_once __DIR__ . '/database.php';

$employees = Database::read('employees.json');
$positions = Database::read('positions.json');

// Add position names to employees
foreach ($employees as &$employee) {
    $positionId = $employee['position_id'] ?? null;
    foreach ($positions as $position) {
        if ($position['id'] === $positionId) {
            $employee['position_name'] = $position['name'];
            break;
        }
    }
}

echo json_encode([
    'success' => true,
    'data' => $employees
]);
