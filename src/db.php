<?php

class Database {
	private static ?PDO $connection = null;

	public static function getConnection(): PDO {
		if (self::$connection instanceof PDO) {
			return self::$connection;
		}

		$config = include __DIR__ . '/config.php';
		$db = $config['db'];

		if ($db['driver'] === 'sqlite') {
			$dsn = 'sqlite:' . $db['sqlite_path'];
			self::$connection = new PDO($dsn);
		} else {
			$dsn = 'mysql:host=' . $db['mysql_host'] . ';dbname=' . $db['mysql_db'] . ';charset=' . $db['mysql_charset'];
			self::$connection = new PDO($dsn, $db['mysql_user'], $db['mysql_pass']);
		}

		self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		self::$connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

		return self::$connection;
	}
}