<?php

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

function ensure_session_started(): void {
	if (session_status() !== PHP_SESSION_ACTIVE) {
		$config = include __DIR__ . '/config.php';
		if (!headers_sent()) {
			session_name($config['app']['session_name'] ?? 'app_session');
		}
		session_start();
	}
}

function csrf_token(): string {
	ensure_session_started();
	if (empty($_SESSION['csrf_token'])) {
		$_SESSION['csrf_token'] = bin2hex(random_bytes(32));
	}
	return $_SESSION['csrf_token'];
}

function verify_csrf(?string $token): bool {
	ensure_session_started();
	return is_string($token) && hash_equals($_SESSION['csrf_token'] ?? '', $token);
}

function admin_login(string $username, string $password): bool {
	ensure_session_started();
	$pdo = Database::getConnection();
	$stmt = $pdo->prepare('SELECT id, username, password_hash FROM users WHERE username = :u LIMIT 1');
	$stmt->execute([':u' => $username]);
	$user = $stmt->fetch();
	if ($user && password_verify($password, $user['password_hash'])) {
		$_SESSION['admin_id'] = (int)$user['id'];
		$_SESSION['admin_name'] = $user['username'];
		return true;
	}
	return false;
}

function admin_logout(): void {
	ensure_session_started();
	unset($_SESSION['admin_id'], $_SESSION['admin_name']);
}

function current_admin_id(): ?int {
	ensure_session_started();
	return isset($_SESSION['admin_id']) ? (int)$_SESSION['admin_id'] : null;
}

function require_admin(): void {
	if (!current_admin_id()) {
		redirect('admin/login.php');
	}
}