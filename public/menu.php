<?php
require_once __DIR__ . '/../src/helpers.php';
require_once __DIR__ . '/../src/db.php';

$pdo = Database::getConnection();
$q = trim((string)($_GET['q'] ?? ''));
$params = [];
$sql = "SELECT id, name, description, price, image_url, category FROM menu_items";
if ($q !== '') {
	$sql .= " WHERE name LIKE :q OR description LIKE :q";
	$params[':q'] = '%' . $q . '%';
}
$sql .= " ORDER BY category, name";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$items = $stmt->fetchAll();

include __DIR__ . '/../templates/header.php';
?>
<section class="menu-page">
	<div class="container">
		<h1>Меню</h1>
		<form class="search" method="get">
			<input type="text" name="q" placeholder="Поиск блюд" value="<?php echo e($q); ?>" />
			<button class="btn-outline">Найти</button>
		</form>
		<div class="menu-grid">
			<?php foreach ($items as $item): ?>
				<article class="card fade-in">
					<div class="card-image" style="background-image:url('<?php echo e($item['image_url'] ?: asset('img/placeholder.jpg')); ?>')"></div>
					<div class="card-body">
						<div class="category"><?php echo e($item['category']); ?></div>
						<h3><?php echo e($item['name']); ?></h3>
						<p><?php echo e($item['description']); ?></p>
						<div class="price">₽<?php echo number_format((float)$item['price'], 2, ',', ' '); ?></div>
					</div>
				</article>
			<?php endforeach; ?>
		</div>
	</div>
</section>
<?php include __DIR__ . '/../templates/footer.php'; ?>