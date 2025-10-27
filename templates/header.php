<?php
require_once __DIR__ . '/../src/helpers.php';
$config = include __DIR__ . '/../src/config.php';
?>
<!DOCTYPE html>
<html lang="ru">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title><?php echo e($config['app']['name']); ?></title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">
	<link rel="stylesheet" href="<?php echo asset('css/style.css'); ?>" />
	<script defer src="<?php echo asset('js/app.js'); ?>"></script>
</head>
<body>
	<header class="site-header">
		<div class="container nav-wrapper">
			<a href="<?php echo url('index.php'); ?>" class="logo"><?php echo e($config['app']['name']); ?></a>
			<nav class="nav">
				<a href="<?php echo url('index.php'); ?>">Главная</a>
				<a href="<?php echo url('menu.php'); ?>">Меню</a>
				<a href="<?php echo url('reserve.php'); ?>" class="btn-primary">Бронь</a>
				<a href="<?php echo url('admin/login.php'); ?>">Админ</a>
			</nav>
			<button class="nav-toggle" aria-label="Меню">☰</button>
		</div>
	</header>
	<main>
