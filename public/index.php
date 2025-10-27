<?php
require_once __DIR__ . '/../src/helpers.php';
require_once __DIR__ . '/../src/db.php';

$pdo = Database::getConnection();
$featured = $pdo->query("SELECT id, name, description, price, image_url FROM menu_items WHERE is_featured = 1 ORDER BY id DESC LIMIT 6")->fetchAll();

include __DIR__ . '/../templates/header.php';
?>
<section class="hero">
	<div class="container">
		<h1 class="reveal">Добро пожаловать в мир вкуса</h1>
		<p class="reveal-delay">Авторская кухня, сезонные продукты и уютная атмосфера.</p>
		<a href="<?php echo url('reserve.php'); ?>" class="btn-primary reveal-more">Забронировать стол</a>
	</div>
</section>
<section class="featured">
	<div class="container">
		<h2>Хиты меню</h2>
		<div class="grid">
			<?php foreach ($featured as $item): ?>
				<article class="card fade-in">
					<div class="card-image" style="background-image:url('<?php echo e($item['image_url'] ?: asset('img/placeholder.jpg')); ?>')"></div>
					<div class="card-body">
						<h3><?php echo e($item['name']); ?></h3>
						<p><?php echo e($item['description']); ?></p>
						<div class="price">₽<?php echo number_format((float)$item['price'], 2, ',', ' '); ?></div>
					</div>
				</article>
			<?php endforeach; ?>
		</div>
		<div class="center"><a href="<?php echo url('menu.php'); ?>" class="btn-outline">Смотреть меню</a></div>
	</div>
</section>
<section class="about">
	<div class="container split">
		<div>
			<h2>О ресторане</h2>
			<p>Мы создаём блюда, вдохновлённые сезонами и локальными продуктами. Каждый вечер — новый гастрономический опыт.</p>
		</div>
		<div class="media parallax"></div>
	</div>
</section>
<?php include __DIR__ . '/../templates/footer.php'; ?>
