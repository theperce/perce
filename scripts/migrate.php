<?php
require_once __DIR__ . '/../src/db.php';

$pdo = Database::getConnection();

$pdo->exec('CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT UNIQUE NOT NULL,
	password_hash TEXT NOT NULL,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)');

$pdo->exec('CREATE TABLE IF NOT EXISTS menu_items (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	description TEXT,
	price REAL NOT NULL,
	category TEXT,
	image_url TEXT,
	is_featured INTEGER DEFAULT 0,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)');

$pdo->exec('CREATE TABLE IF NOT EXISTS reservations (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	phone TEXT NOT NULL,
	date TEXT NOT NULL,
	time TEXT NOT NULL,
	guests INTEGER NOT NULL,
	note TEXT,
	status TEXT DEFAULT "new",
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)');

// seed admin if not exists
$exists = $pdo->query("SELECT COUNT(*) AS c FROM users")->fetch();
if ((int)$exists['c'] === 0) {
	$stmt = $pdo->prepare('INSERT INTO users (username, password_hash) VALUES (:u, :p)');
	$stmt->execute([
		':u' => 'admin',
		':p' => password_hash('admin123', PASSWORD_DEFAULT),
	]);
}

// seed sample menu
$menuCount = $pdo->query('SELECT COUNT(*) AS c FROM menu_items')->fetch();
if ((int)$menuCount['c'] === 0) {
	$items = [
		['Стейк Рибай', 'Сочный мраморный стейк средней прожарки', 1890, 'Горячее', 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?q=80&w=1600&auto=format&fit=crop', 1],
		['Тартар из лосося', 'Свежий лосось, каперсы, лайм', 790, 'Закуски', 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1600&auto=format&fit=crop', 1],
		['Паста Карбонара', 'Классическая итальянская паста с панчеттой', 640, 'Паста', 'https://images.unsplash.com/photo-1526312426976-593c6c249f74?q=80&w=1600&auto=format&fit=crop', 0],
		['Крем-брюле', 'Нежный ванильный десерт с хрустящей корочкой', 390, 'Десерты', 'https://images.unsplash.com/photo-1557872943-16a5ac26437b?q=80&w=1600&auto=format&fit=crop', 0],
		['Салат Цезарь', 'Курица, романо, пармезан, фирменный соус', 520, 'Салаты', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1600&auto=format&fit=crop', 0],
		['Тирамису', 'Классический итальянский десерт', 420, 'Десерты', 'https://images.unsplash.com/photo-1607920591413-4ec007e700c5?q=80&w=1600&auto=format&fit=crop', 1],
	];
	$stmt = $pdo->prepare('INSERT INTO menu_items (name, description, price, category, image_url, is_featured) VALUES (?,?,?,?,?,?)');
	foreach ($items as $it) { $stmt->execute($it); }
}

echo "Migration completed. Admin: admin / admin123\n";