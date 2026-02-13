# API мониторинга ментального здоровья

Backend API для мобильного приложения мониторинга ментального здоровья. Построен на NestJS, Nestia, Prisma и Fastify.

## Содержание

- [О проекте](#о-проекте)
- [Быстрый старт](#быстрый-старт)
- [Структура API](#структура-api)
- [Аутентификация](#аутентификация)
- [Работа с проектом](#работа-с-проектом)
- [Технологии](#технологии)

---

## О проекте

Приложение предоставляет REST API для мобильного клиента:

| Модуль              | Описание                                                            |
| ------------------- | ------------------------------------------------------------------- |
| **Онбординг**       | Конфигурация шагов, сохранение ответов, рекомендация путей, paywall |
| **Пути (Journeys)** | Курсы по ментальному здоровью с прогрессом и премиум-разблокировкой |
| **Уроки (Lessons)** | Контент, квизы, рефлексии, завершение с рейтингом                   |
| **Пользователи**    | Профиль, удаление данных (GDPR)                                     |

**Базовый путь:** все эндпоинты доступны по префиксу `/api/v1`

---

## Быстрый старт

### Требования

- Node.js >= 22
- pnpm >= 8
- PostgreSQL (локально или через Docker)

### Установка

```bash
# 1. Клонирование и установка
git clone <repository-url>
cd Nest-nestia-microservice-boilerplate
pnpm install

# 2. Настройка окружения
cp .env.example .env
# Отредактируйте .env: DATABASE_URL, JWT_SECRET

# 3. Запуск инфраструктуры
docker compose up -d db

# 4. Миграции базы данных
pnpm prisma:dev

# 5. Запуск приложения
pnpm start:dev
```

Приложение: **http://localhost:7000**  
Swagger UI: **http://localhost:7000/api/docs**

### Docker Compose — инфраструктура

| Сервис | Порт | Описание |
|--------|------|----------|
| **db** | 5444→5432 | PostgreSQL 16 (user: myuser, password: mypassword, db: mydatabase) |
| **prometheus** | 9090 | Метрики |
| **grafana** | 3000 | Дашборды (Loki + Prometheus) — http://localhost:3000 |
| **loki** | 3100 | Логи |

**Команды:**

```bash
# Только база данных (для локальной разработки)
docker compose up -d db

# Вся инфраструктура (db + мониторинг)
docker compose up -d prometheus grafana loki

# Логи
docker compose logs -f db

# Остановка
docker compose down

# Остановка с удалением volumes
docker compose down -v
```

**DATABASE_URL:** `postgresql://myuser:mypassword@127.0.0.1:5444/mydatabase?schema=public`

---

## Структура API

### Auth

| Метод | Путь                  | Описание                                       |
| ----- | --------------------- | ---------------------------------------------- |
| POST  | `/api/v1/auth/device` | Регистрация/логин по deviceId и platform → JWT |

### Health

| Метод | Путь             | Описание                                     |
| ----- | ---------------- | -------------------------------------------- |
| GET   | `/api/v1/health` | Полная проверка (ping, prisma, memory, disk) |

### Users (требует авторизации)

| Метод | Путь                     | Описание                                 |
| ----- | ------------------------ | ---------------------------------------- |
| GET   | `/api/v1/users/me`       | Профиль текущего пользователя            |
| POST  | `/api/v1/users/me/erase` | Удаление всех данных пользователя (GDPR) |

### Journeys (требует авторизации)

| Метод | Путь                                              | Описание                     |
| ----- | ------------------------------------------------- | ---------------------------- |
| GET   | `/api/v1/journeys`                                | Список всех путей            |
| GET   | `/api/v1/journeys/my`                             | Мои пути с прогрессом        |
| GET   | `/api/v1/journeys/:id/my/progress`                | Прогресс по конкретному пути |
| POST  | `/api/v1/journeys/:id/my/progress/premium-unlock` | Разблокировка премиум-уроков |

### Lessons (требует авторизации)

| Метод | Путь                                     | Описание                     |
| ----- | ---------------------------------------- | ---------------------------- |
| GET   | `/api/v1/lessons/:journeyId/:day`        | Контент урока по пути и дню  |
| POST  | `/api/v1/lessons/:id/quiz/submit`        | Отправка ответов на квиз     |
| POST  | `/api/v1/lessons/:id/reflections/submit` | Отправка рефлексии           |
| POST  | `/api/v1/lessons/:id/finish`             | Завершение урока с рейтингом |

### Onboarding (требует авторизации)

| Метод | Путь                              | Описание                      |
| ----- | --------------------------------- | ----------------------------- |
| GET   | `/api/v1/onboarding/config`       | Конфигурация шагов онбординга |
| POST  | `/api/v1/onboarding/answers`      | Сохранение ответов онбординга |
| GET   | `/api/v1/onboarding/paywall-type` | Данные paywall                |
| GET   | `/api/v1/onboarding/journeys`     | Рекомендованные пути          |

---

## Аутентификация

Авторизация по JWT. Заголовок `X-Device-Id` **не требуется** — достаточно Bearer токена.

### Получение токена

```bash
curl -X POST http://localhost:7000/api/v1/auth/device \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "unique-device-id-123", "platform": "ios"}'
```

Ответ:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "deviceId": "unique-device-id-123",
    "platform": "ios"
  }
}
```

> `deviceId` и `platform` используются только при регистрации для идентификации пользователя. При последующих запросах они не нужны.

### Запросы с авторизацией

Для защищённых эндпоинтов передавайте только заголовок:

- **Authorization:** `Bearer <accessToken>`

```bash
curl -X GET http://localhost:7000/api/v1/users/me \
  -H "Authorization: Bearer <token>"
```

---

## Работа с проектом

### Разработка

```bash
# Режим разработки с hot-reload
pnpm start:dev

# Режим отладки
pnpm start:debug
```

### База данных

```bash
# Применить миграции
pnpm prisma:dev

# Создать миграцию (без применения)
pnpm prisma:create --name migration_name

# Генерация Prisma Client после изменения schema.prisma
pnpm prisma:generate
```

### Сборка и production

```bash
# Сборка
pnpm build

# Запуск (single process)
pnpm start:prod

# Запуск (cluster mode)
pnpm start:prod:cluster
```

### OpenAPI и SDK

```bash
# Генерация Swagger JSON
pnpm build:swagger

# Сборка SDK (если настроен sdk-package)
pnpm sdk:build
```

### Качество кода

```bash
# Форматирование
pnpm format

# Линтинг
pnpm lint
```

### Docker

```bash
# Запуск всех сервисов (app, db, prometheus, grafana, loki)
docker compose up -d --build

# Только инфраструктура
docker compose up -d db prometheus grafana loki
```

**Важно:** в Docker `DATABASE_URL` должен указывать на сервис `db`, а не на `localhost`.

---

## Технологии

- **NestJS 11** — фреймворк
- **Fastify** — HTTP-сервер
- **Prisma 7** — ORM
- **Nestia** — типизация API, OpenAPI, SDK
- **Typia** — валидация
- **JWT + Passport** — аутентификация
- **PostgreSQL** — база данных

---

## Структура проекта

```
src/
├── auth/           # JWT, DeviceAuthGuard, стратегии
├── users/          # Профиль, удаление данных
├── journeys/       # Пути, прогресс, premium-unlock
├── lessons/        # Уроки, квизы, рефлексии
├── onboarding/     # Онбординг, рекомендации
├── health/         # Health check
├── prisma/         # PrismaService
├── configs/        # TypedConfigService
└── common/         # DTO, фильтры, интерцепторы
```

---

## Переменные окружения

| Переменная     | Обязательная | Описание                              |
| -------------- | ------------ | ------------------------------------- |
| DATABASE_URL   | Да           | URL PostgreSQL                        |
| JWT_SECRET     | Да           | Секрет JWT                            |
| JWT_EXPIRES_IN | Нет          | Срок жизни токена (по умолчанию: 30d) |
| PORT           | Нет          | Порт (по умолчанию: 7000)             |
| NODE_ENV       | Нет          | development / production              |
