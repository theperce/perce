<?php
require_once __DIR__ . '/../../src/helpers.php';
require_once __DIR__ . '/../../src/auth.php';
require_admin();
include __DIR__ . '/../../templates/header.php';
?>
<section class="admin">
	<div class="container">
		<h1>Админ панель</h1>
		<nav class="admin-nav">
			<a class="btn-outline" href="<?php echo url('admin/menu_items.php'); ?>">Блюда</a>
			<a class="btn-outline" href="<?php echo url('admin/reservations.php'); ?>">Бронирования</a>
			<a class="btn-outline" href="<?php echo url('admin/logout.php'); ?>">Выход</a>
		</nav>
	</div>
</section>
<?php include __DIR__ . '/../../templates/footer.php'; ?>