<?php
require_once __DIR__ . '/../../src/helpers.php';
require_once __DIR__ . '/../../src/auth.php';

$errors = [];
if (is_post()) {
	if (!verify_csrf($_POST['csrf'] ?? null)) {
		$errors[] = 'Неверный токен безопасности.';
	} else {
		$username = trim((string)($_POST['username'] ?? ''));
		$password = (string)($_POST['password'] ?? '');
		if (!admin_login($username, $password)) {
			$errors[] = 'Неверные данные для входа.';
		} else {
			redirect('admin/index.php');
		}
	}
}
include __DIR__ . '/../../templates/header.php';
?>
<section class="admin-login">
	<div class="container small">
		<h1>Вход администратора</h1>
		<?php if ($errors): ?>
			<div class="alert error">
				<?php foreach ($errors as $err): ?><div><?php echo e($err); ?></div><?php endforeach; ?>
			</div>
		<?php endif; ?>
		<form method="post" class="card form">
			<input type="hidden" name="csrf" value="<?php echo e(csrf_token()); ?>" />
			<label>Логин<input type="text" name="username" required /></label>
			<label>Пароль<input type="password" name="password" required /></label>
			<div class="actions"><button class="btn-primary">Войти</button></div>
		</form>
	</div>
</section>
<?php include __DIR__ . '/../../templates/footer.php'; ?>