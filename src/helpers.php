<?php

function e(string $value): string {
	return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function redirect(string $path): void {
	$base = (include __DIR__ . '/config.php')['app']['base_url'] ?? '';
	header('Location: ' . rtrim($base, '/') . '/' . ltrim($path, '/'));
	exit;
}

function is_post(): bool {
	return ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST';
}

function url(string $path = ''): string {
	$base = (include __DIR__ . '/config.php')['app']['base_url'] ?? '';
	return rtrim($base, '/') . '/' . ltrim($path, '/');
}

function asset(string $path): string {
	return url('assets/' . ltrim($path, '/'));
}