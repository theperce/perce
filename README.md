# Le Gourmet — Ресторан (PHP + SQLite)

## Быстрый старт
1. Установить PHP (уже установлен здесь) и расширение sqlite3
2. Выполнить миграции и сиды:
```bash
php scripts/migrate.php
```
3. Запустить локально:
```bash
php -S 0.0.0.0:8787 -t public
```
4. Открыть сайт: http://127.0.0.1:8787

## Доступ администратора
- Логин: `admin`
- Пароль: `admin123`

## Структура
- `public/` — публичные страницы (`index.php`, `menu.php`, `reserve.php`) и админка `admin/`
- `src/` — конфиг, БД, авторизация, хелперы
- `templates/` — общий `header.php` и `footer.php`
- `public/assets/` — стили и JS
- `scripts/migrate.php` — создание SQLite БД и тестовые данные
- `data/database.sqlite` — база данных

## Переключение на MySQL (опционально)
Отредактируйте `src/config.php`:
```php
'db' => [
    'driver' => 'mysql',
    'mysql_host' => '127.0.0.1',
    'mysql_db' => 'restaurant',
    'mysql_user' => 'root',
    'mysql_pass' => '',
    'mysql_charset' => 'utf8mb4',
]
```
И адаптируйте SQL схемы при необходимости.

## Безопасность
- Сессии и CSRF токены в формах админки и резервирования
- Подготовленные запросы PDO

## UI/Анимации
- Современный минималистичный дизайн, плавные `fade-in`, `reveal`, параллакс-фон
- Адаптивная навигация и сетки 