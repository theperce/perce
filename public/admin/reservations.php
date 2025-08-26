<?php
require_once __DIR__ . '/../../src/helpers.php';
require_once __DIR__ . '/../../src/auth.php';
require_once __DIR__ . '/../../src/db.php';
require_admin();

$pdo = Database::getConnection();
$action = $_GET['action'] ?? 'list';

if ($action === 'status' && isset($_GET['id'], $_GET['to'])) {
	if (verify_csrf($_GET['csrf'] ?? null)) {
		$stmt = $pdo->prepare('UPDATE reservations SET status = :s WHERE id = :id');
		$stmt->execute([':s' => $_GET['to'], ':id' => (int)$_GET['id']]);
	}
	redirect('admin/reservations.php');
}

if ($action === 'delete' && isset($_GET['id'])) {
	if (verify_csrf($_GET['csrf'] ?? null)) {
		$stmt = $pdo->prepare('DELETE FROM reservations WHERE id = :id');
		$stmt->execute([':id' => (int)$_GET['id']]);
	}
	redirect('admin/reservations.php');
}

include __DIR__ . '/../../templates/header.php';
$rows = $pdo->query('SELECT id, name, phone, date, time, guests, note, status, created_at FROM reservations ORDER BY created_at DESC')->fetchAll();
?>
<section class="admin">
	<div class="container">
		<h1>Бронирования</h1>
		<table class="table">
			<thead><tr><th>ID</th><th>Гость</th><th>Дата</th><th>Время</th><th>Гостей</th><th>Телефон</th><th>Статус</th><th></th></tr></thead>
			<tbody>
			<?php foreach ($rows as $r): ?>
				<tr>
					<td><?php echo (int)$r['id']; ?></td>
					<td>
						<div><?php echo e($r['name']); ?></div>
						<div class="muted"><?php echo e($r['note']); ?></div>
					</td>
					<td><?php echo e($r['date']); ?></td>
					<td><?php echo e($r['time']); ?></td>
					<td><?php echo (int)$r['guests']; ?></td>
					<td><?php echo e($r['phone']); ?></td>
					<td><?php echo e($r['status']); ?></td>
					<td class="actions">
						<a class="btn-outline" href="?action=status&id=<?php echo (int)$r['id']; ?>&to=confirmed&csrf=<?php echo e(csrf_token()); ?>">Подтвердить</a>
						<a class="btn-outline" href="?action=status&id=<?php echo (int)$r['id']; ?>&to=cancelled&csrf=<?php echo e(csrf_token()); ?>">Отменить</a>
						<a class="btn-outline danger" href="?action=delete&id=<?php echo (int)$r['id']; ?>&csrf=<?php echo e(csrf_token()); ?>" onclick="return confirm('Удалить бронь?')">Удалить</a>
					</td>
				</tr>
			<?php endforeach; ?>
			</tbody>
		</table>
	</div>
</section>
<?php include __DIR__ . '/../../templates/footer.php'; ?>