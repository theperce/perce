<?php

return [
	'db' => [
		'driver' => 'sqlite',
		'sqlite_path' => __DIR__ . '/../data/database.sqlite',
		'mysql_host' => '127.0.0.1',
		'mysql_db' => 'restaurant',
		'mysql_user' => 'root',
		'mysql_pass' => '',
		'mysql_charset' => 'utf8mb4',
	],
	'app' => [
		'name' => 'Le Gourmet',
		'base_url' => '',
		'session_name' => 'restaurant_app',
	],
];