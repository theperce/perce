# CS 1.6 Matchmaking Platform

Профессиональная платформа матчмейкинга для CS 1.6 в стиле FACEIT с интерфейсом в духе CS2 и визуальной стилистикой GoldSrc/CS 1.6.

## 🎮 Функционал

### Основные возможности
- **Авторизация через Steam OpenID 2.0** - безопасный вход с автоматическим извлечением профиля
- **ELO Рейтинговая система** - 10 уровней рангов от Private до Command Sergeant Major
- **5v5 Captain Mode** - капитаны выбирают команды
- **5v5 Auto Mode** - авто-баланс по ELO
- **1v1 Aim Mode** - дуэльный режим
- **Veto-фаза** - поочередный бан карт
- **Real-time статистика** - обновление счета во время матча через WebSocket
- **HLTV Demo записи** - сохранение и просмотр демо матчей

### Интеграция с серверами CS 1.6
- REST API для AMX Mod X плагинов
- Проверка токенов игроков
- Передача статистики в реальном времени
- Автоматический расчет ELO после матча

## 🛠 Технологический стек

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Zustand
- **Backend:** Next.js Server Actions, Node.js + Socket.io
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth с Steam Provider
- **Real-time:** WebSocket для очереди, лобби, вето и live-счета

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка базы данных

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Отредактируйте `.env` и укажите ваши данные:
- `DATABASE_URL` - строка подключения к PostgreSQL
- `STEAM_API_KEY` - ваш Steam Web API ключ
- `NEXTAUTH_SECRET` - секретный ключ для NextAuth

Запустите миграции Prisma:

```bash
npx prisma migrate dev --name init
```

### 3. Запуск development сервера

```bash
npm run dev
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000)

## 📁 Структура проекта

```
/workspace
├── app/                      # Next.js App Router
│   ├── api/                  # API endpoints
│   │   └── server/           # CS 1.6 server integration API
│   ├── lib/                  # Библиотеки и утилиты
│   │   ├── auth.ts          # NextAuth конфигурация
│   │   ├── constants.ts     # Константы приложения
│   │   ├── elo.ts           # ELO расчетная система
│   │   └── steam.ts         # Steam интеграция
│   ├── components/           # React компоненты
│   │   ├── lobby/           # Компоненты лобби
│   │   └── profile/         # Компоненты профиля
│   ├── page.tsx             # Главная страница (лобби)
│   └── layout.tsx           # Root layout
├── websocket/                # WebSocket сервер
│   └── matchmaking.ts       # Матчмейкинг логика
├── prisma/                   # Prisma ORM
│   └── schema.prisma        # Схема базы данных
├── styles/                   # Глобальные стили
│   └── globals.css          # Tailwind + кастомные стили CS 1.6
├── public/                   # Статические файлы
│   └── sounds/              # Звуковые эффекты CS 1.6
└── tailwind.config.ts       # Tailwind конфигурация
```

## 🎨 Дизайн-система

### Цветовая палитра CS 1.6
- **Dark Background:** `#191e19` (темно-зеленый болотный)
- **Card Background:** `#252d25`
- **Accent Color:** `#c2c62c` (классический желто-зеленый CS 1.6)
- **Secondary:** `#5c7c5c`
- **Borders:** `#3a473a`

### Статус цвета
- **Green #48b848** - Ready/Live
- **Red #d9534f** - Banned/Offline
- **Yellow #e0a96d** - In Queue/Picking
- **Blue #4a90d9** - CT side
- **Orange #d98a4a** - T side

## 🗄 Схема базы данных

Основные модели:
- `User` - игроки с ELO, рангами, статистикой
- `Lobby` - лобби игроков перед матчем
- `Match` - информация о матче
- `MatchPlayer` - статистика игрока в матче
- `ServerPool` - пул игровых серверов
- `PenaltyHistory` - история наказаний

## 🔌 API для серверов CS 1.6

### POST /api/server

Тело запроса:
```json
{
  "action": "players-check|live-score|match-end",
  "apiKey": "server-api-key",
  "data": { ... }
}
```

#### players-check
Проверка прав доступа игроков:
```json
{
  "matchToken": "uuid",
  "players": [
    { "steamId64": "...", "name": "Player" }
  ]
}
```

#### live-score
Обновление счета в реальном времени:
```json
{
  "matchToken": "uuid",
  "teamAScore": 12,
  "teamBScore": 10,
  "currentRound": 23
}
```

#### match-end
Завершение матча со статистикой:
```json
{
  "matchToken": "uuid",
  "teamAScore": 16,
  "teamBScore": 14,
  "playerStats": [...],
  "hltvDemoUrl": "https://..."
}
```

## 🎯 Жизненный цикл матча

1. **Queueing** - поиск соперников со схожим ELO (±150)
2. **Match Found** - 30 секунд на подтверждение готовности
3. **Check-in** - проверка всех игроков, штрафы за dodge
4. **Veto** - капитаны банят карты, выбирают последнюю
5. **Server Start** - выдача connect команды с паролем
6. **Live Match** - трансляция счета на сайт
7. **Match Finish** - расчет ELO, сохранение статистики

## ⚙️ Конфигурация сервера

Для добавления игрового сервера в пул:

```sql
INSERT INTO "ServerPool" ("id", "ip", "port", "rconPassword", "apiKey", "isBusy", "location", "status")
VALUES ('uuid', '192.168.1.100', 27015, 'rcon_pass', 'api_key', false, 'EU_WEST', 'ONLINE');
```

## 📝 Лицензия

MIT
