<?php
require_once __DIR__ . '/../src/helpers.php';
require_once __DIR__ . '/../src/db.php';
require_once __DIR__ . '/../src/auth.php';

$errors = [];
$success = false;

if (is_post()) {
	if (!verify_csrf($_POST['csrf'] ?? null)) {
		$errors[] = 'Неверный токен безопасности.';
	} else {
		$name = trim((string)($_POST['name'] ?? ''));
		$phone = trim((string)($_POST['phone'] ?? ''));
		$date = trim((string)($_POST['date'] ?? ''));
		$time = trim((string)($_POST['time'] ?? ''));
		$guests = (int)($_POST['guests'] ?? 1);
		$note = trim((string)($_POST['note'] ?? ''));

		if ($name === '' || $phone === '' || $date === '' || $time === '') {
			$errors[] = 'Пожалуйста, заполните обязательные поля.';
		}
		if ($guests < 1 || $guests > 20) {
			$errors[] = 'Количество гостей должно быть от 1 до 20.';
		}

		if (!$errors) {
			$pdo = Database::getConnection();
			$stmt = $pdo->prepare('INSERT INTO reservations (name, phone, date, time, guests, note, status, created_at) VALUES (:name,:phone,:date,:time,:guests,:note,\'new\', CURRENT_TIMESTAMP)');
			$stmt->execute([
				':name' => $name,
				':phone' => $phone,
				':date' => $date,
				':time' => $time,
				':guests' => $guests,
				':note' => $note,
			]);
			$success = true;
		}
	}
}

include __DIR__ . '/../templates/header.php';
?>
<section class="reserve-page">
	<div class="container">
		<h1>Бронирование</h1>
		<?php if ($success): ?>
			<div class="alert success">Спасибо! Мы свяжемся с вами для подтверждения.</div>
		<?php endif; ?>
		<?php if ($errors): ?>
			<div class="alert error">
				<?php foreach ($errors as $err): ?>
					<div><?php echo e($err); ?></div>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>
		<form method="post" class="form card">
			<input type="hidden" name="csrf" value="<?php echo e(csrf_token()); ?>" />
			<div class="grid-2">
				<label>Имя<input type="text" name="name" required /></label>
				<label>Телефон<input type="tel" name="phone" required /></label>
			</div>
			<div class="grid-3">
				<label>Дата<input type="date" name="date" required /></label>
				<label>Время<input type="time" name="time" required /></label>
				<label>Гостей<input type="number" name="guests" min="1" max="20" value="2" required /></label>
			</div>
			<label>Пожелания<textarea name="note" rows="3" placeholder="Предпочтения по столу или блюдам"></textarea></label>
			<div class="actions"><button class="btn-primary">Забронировать</button></div>
		</form>
	</div>
</section>
<?php include __DIR__ . '/../templates/footer.php'; ?>