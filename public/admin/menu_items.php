<?php
require_once __DIR__ . '/../../src/helpers.php';
require_once __DIR__ . '/../../src/auth.php';
require_once __DIR__ . '/../../src/db.php';
require_admin();

$pdo = Database::getConnection();
$action = $_GET['action'] ?? 'list';
$errors = [];

if ($action === 'delete' && isset($_GET['id'])) {
	if (!verify_csrf($_GET['csrf'] ?? null)) {
		$errors[] = 'CSRF токен неверен';
	} else {
		$stmt = $pdo->prepare('DELETE FROM menu_items WHERE id = :id');
		$stmt->execute([':id' => (int)$_GET['id']]);
		redirect('admin/menu_items.php');
	}
}

if ($action === 'save' && is_post()) {
	if (!verify_csrf($_POST['csrf'] ?? null)) {
		$errors[] = 'CSRF токен неверен';
	} else {
		$id = (int)($_POST['id'] ?? 0);
		$name = trim((string)($_POST['name'] ?? ''));
		$description = trim((string)($_POST['description'] ?? ''));
		$price = (float)($_POST['price'] ?? 0);
		$category = trim((string)($_POST['category'] ?? ''));
		$image_url = trim((string)($_POST['image_url'] ?? ''));
		$is_featured = isset($_POST['is_featured']) ? 1 : 0;

		if ($name === '' || $price <= 0) {
			$errors[] = 'Имя и цена обязательны';
		}

		if (!$errors) {
			if ($id > 0) {
				$stmt = $pdo->prepare('UPDATE menu_items SET name=:name, description=:description, price=:price, category=:category, image_url=:image_url, is_featured=:is_featured WHERE id=:id');
				$stmt->execute(compact('name','description','price','category','image_url','is_featured','id'));
			} else {
				$stmt = $pdo->prepare('INSERT INTO menu_items (name, description, price, category, image_url, is_featured, created_at) VALUES (:name,:description,:price,:category,:image_url,:is_featured, CURRENT_TIMESTAMP)');
				$stmt->execute(compact('name','description','price','category','image_url','is_featured'));
			}
			redirect('admin/menu_items.php');
		}
	}
}

include __DIR__ . '/../../templates/header.php';
?>
<section class="admin">
	<div class="container">
		<h1>Блюда</h1>
		<?php if ($action === 'edit' || $action === 'create'):
			$id = (int)($_GET['id'] ?? 0);
			$item = ['id'=>0,'name'=>'','description'=>'','price'=>'','category'=>'','image_url'=>'','is_featured'=>0];
			if ($action === 'edit' && $id) {
				$stmt = $pdo->prepare('SELECT * FROM menu_items WHERE id=:id');
				$stmt->execute([':id'=>$id]);
				$item = $stmt->fetch() ?: $item;
			}
		?>
		<form method="post" class="card form">
			<input type="hidden" name="csrf" value="<?php echo e(csrf_token()); ?>" />
			<input type="hidden" name="id" value="<?php echo (int)$item['id']; ?>" />
			<label>Название<input type="text" name="name" value="<?php echo e($item['name']); ?>" required /></label>
			<label>Описание<textarea name="description" rows="3"><?php echo e($item['description']); ?></textarea></label>
			<div class="grid-3">
				<label>Цена<input type="number" step="0.01" name="price" value="<?php echo e((string)$item['price']); ?>" required /></label>
				<label>Категория<input type="text" name="category" value="<?php echo e($item['category']); ?>" /></label>
				<label>Изображение (URL)<input type="url" name="image_url" value="<?php echo e($item['image_url']); ?>" /></label>
			</div>
			<label class="checkbox"><input type="checkbox" name="is_featured" <?php echo $item['is_featured'] ? 'checked' : ''; ?> /> Показать на главной</label>
			<div class="actions">
				<button formaction="?action=save" class="btn-primary">Сохранить</button>
				<a href="<?php echo url('admin/menu_items.php'); ?>" class="btn-outline">Отмена</a>
			</div>
		</form>
		<?php else:
			$rows = $pdo->query('SELECT id, name, price, category, is_featured FROM menu_items ORDER BY created_at DESC')->fetchAll();
		?>
		<div class="actions"><a href="?action=create" class="btn-primary">Добавить блюдо</a></div>
		<table class="table">
			<thead><tr><th>ID</th><th>Название</th><th>Категория</th><th>Цена</th><th>На главной</th><th></th></tr></thead>
			<tbody>
				<?php foreach ($rows as $row): ?>
					<tr>
						<td><?php echo (int)$row['id']; ?></td>
						<td><?php echo e($row['name']); ?></td>
						<td><?php echo e($row['category']); ?></td>
						<td>₽<?php echo number_format((float)$row['price'], 2, ',', ' '); ?></td>
						<td><?php echo $row['is_featured'] ? 'Да' : 'Нет'; ?></td>
						<td class="actions">
							<a class="btn-outline" href="?action=edit&id=<?php echo (int)$row['id']; ?>">Редактировать</a>
							<a class="btn-outline danger" href="?action=delete&id=<?php echo (int)$row['id']; ?>&csrf=<?php echo e(csrf_token()); ?>" onclick="return confirm('Удалить блюдо?')">Удалить</a>
						</td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
		<?php endif; ?>
	</div>
</section>
<?php include __DIR__ . '/../../templates/footer.php'; ?>