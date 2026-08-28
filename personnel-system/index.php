<?php
/**
 * Personnel Management System
 * Main entry point
 */

session_start();

// Simple routing
$request = $_SERVER['REQUEST_URI'];
$basePath = '/personnel-system';

// Remove query string
$request = strtok($request, '?');

// Route handling
if ($request === $basePath || $request === $basePath . '/') {
    include __DIR__ . '/templates/index.php';
} elseif ($request === $basePath . '/api/employees') {
    header('Content-Type: application/json');
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        include __DIR__ . '/src/get_employees.php';
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        include __DIR__ . '/src/add_employee.php';
    }
} elseif ($request === $basePath . '/api/schedules') {
    header('Content-Type: application/json');
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        include __DIR__ . '/src/get_schedules.php';
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        include __DIR__ . '/src/add_schedule.php';
    }
} elseif ($request === $basePath . '/api/rates') {
    header('Content-Type: application/json');
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        include __DIR__ . '/src/get_rates.php';
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        include __DIR__ . '/src/update_rates.php';
    }
} elseif ($request === $basePath . '/api/positions') {
    header('Content-Type: application/json');
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        include __DIR__ . '/src/get_positions.php';
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        include __DIR__ . '/src/add_position.php';
    }
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Not Found']);
}
