<?php
define('BASE_PATH', dirname(__DIR__));
$pageTitle = 'Gourmet — Ресторан';
require BASE_PATH . '/templates/header.php';
?>
<section class="container hero">
  <div class="reveal">
    <h1>Высокая кухня, созданная с любовью</h1>
    <p>Откройте для себя сезонное меню от шеф-повара и атмосферу, в которую хочется возвращаться.</p>
    <div class="cta-row">
      <a class="nav-link btn btn-primary" href="/reserve.php">Забронировать стол</a>
      <a class="nav-link btn btn-outline" href="/menu.php">Смотреть меню</a>
    </div>
  </div>
  <div class="reveal">
    <div class="card floaty">
      <img src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop" alt="Dish" style="width:100%;border-radius:14px;max-height:360px;object-fit:cover"/>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px">
        <div class="card">
          <div style="font-weight:700">Живая музыка</div>
          <div style="opacity:.7">Каждые выходные с 19:00</div>
        </div>
        <div class="card">
          <div style="font-weight:700">Винная карта</div>
          <div style="opacity:.7">Более 50 позиций</div>
        </div>
      </div>
    </div>
  </div>
  
</section>

<section class="container">
  <h2 class="section-title">Почему выбирают нас</h2>
  <div class="feature-grid">
    <div class="card feature reveal">
      <h3>Фермерские продукты</h3>
      <p>Мы работаем с локальными поставщиками, чтобы блюда были свежими и полезными.</p>
    </div>
    <div class="card feature reveal">
      <h3>Авторская подача</h3>
      <p>Каждое блюдо — это маленькое произведение искусства.</p>
    </div>
    <div class="card feature reveal">
      <h3>Забота о гостях</h3>
      <p>Команда зала создаст для вас идеальный вечер.</p>
    </div>
  </div>
</section>

<?php require BASE_PATH . '/templates/footer.php'; ?>
