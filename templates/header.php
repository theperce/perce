<?php
if (!defined('BASE_PATH')) {
    define('BASE_PATH', dirname(__DIR__));
}
$pageTitle = isset($pageTitle) ? $pageTitle : 'Restaurant';
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><?php echo htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8'); ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/styles.css" />
</head>
<body>
    <header class="site-header">
        <div class="container header-inner">
            <div class="logo" onclick="window.location='/'">Gourmet</div>
            <nav class="nav">
                <a href="/" class="nav-link">Главная</a>
                <a href="/menu.php" class="nav-link">Меню</a>
                <a href="/reserve.php" class="nav-link btn btn-primary">Бронь</a>
                <a href="/admin/login.php" class="nav-link admin-link">Админ</a>
            </nav>
        </div>
    </header>
    <main class="main-content">
