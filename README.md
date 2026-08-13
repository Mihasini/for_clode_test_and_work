# Локальний стенд: Grav 2.0 + Flarum

Два незалежні сайти в Docker Compose: **Grav 2.0.18** (основний сайт, flat-file)
і **Flarum 1.8** (форум на MariaDB). Grav віддає REST API, до якого підключений
MCP-сервер — контентом можна керувати програмно.

## Швидкий старт

```powershell
docker compose up -d
```

| Адреса | Що це |
|---|---|
| http://grav.localhost | сайт Grav |
| http://grav.localhost/admin | адмінка Grav |
| http://forum.localhost | форум Flarum |
| http://127.0.0.1:8080 | Grav напряму, в обхід Caddy — для API, curl і MCP |

`*.localhost` резолвлять браузери, але не всі CLI-утиліти — тому API ходить
на `127.0.0.1:8080`.

Облікові дані й ключі — у `.env` (у git не потрапляє).

## Сервіси

| Сервіс | Образ | Призначення |
|---|---|---|
| caddy | caddy:2-alpine | реверс-проксі на порту 80, без TLS |
| grav | власний, `php:8.3-apache` | Grav 2.0.18 + Admin2 + API |
| flarum | власний, `php:8.3-apache` | Flarum 1.8, ставиться сам при першому старті |
| mariadb | mariadb:11 | БД лише для форуму; порт назовні не публікується |

Ядро Grav і Flarum лишається всередині образів — версії зафіксовані в `.env`.
Те, що ми редагуємо руками (`grav/user/`, `flarum/extend.php`), прокинуте на диск.
Те, що генерується (`cache`, `tmp`, `logs`, `images`, `vendor`, `storage`, дані БД),
живе в іменованих томах — так Windows-ФС не гальмує.

## Grav API

Автентифікація — заголовком `X-API-Key` (не `X-API-Token`):

```powershell
curl.exe http://127.0.0.1:8080/api/v1/ping
curl.exe -H "X-API-Key: $key" http://127.0.0.1:8080/api/v1/pages
```

Новий ключ:

```powershell
docker compose exec grav php bin/plugin api keys:generate -u admin -N "name" -n
```

Ключ показується один раз — одразу в `.env` і `.mcp.json`.

## MCP

`.mcp.json` (не в git, шаблон — `.mcp.json.example`) підключає `grav-mcp`:
70 інструментів над сторінками, медіа, конфігами й користувачами.
Потрібен Node.js 18+ на хості. `GRAV_API_URL` вказує на **`/api`** без `/v1` —
версію сервер додає сам.

## Власна тема

`grav/user/themes/pisochnica/` — каркас від `devtools` на Tailwind 3 (+ forms,
typography, Alpine.js). Активована в `grav/user/config/system.yaml`.

Стилі збираються **на хості**, бо Node.js у контейнері немає:

```powershell
cd grav\user\themes\pisochnica
npm install          # один раз
npm run watch        # під час роботи над темою
npm run prod         # мініфікована збірка
```

Джерело — `css/site.css` і класи в `templates/**/*.twig`; результат — `dist/css/site.css`
(лежить у git, тому сайт працює одразу після клону). `npm run prod` дає `site.min.css`;
щоб тема його підхопила, треба ввімкнути `production: true` у `pisochnica.yaml`.

## Що не в git і як відновити

`grav/user/plugins/` і `grav/user/themes/quark2/` — це ~3900 файлів з образу
та GPM. Комплект образу відновлюється сам при першому старті (entrypoint засіває
порожній `user/`). Поверх нього доставлено вручну:

```powershell
docker compose exec grav php bin/gpm install devtools -y
```

## Корисне

```powershell
docker compose logs -f grav flarum      # логи
docker compose exec grav sh             # shell у Grav
docker compose exec grav php bin/grav clear-cache
docker compose down                     # зупинити, дані лишаються в томах
docker compose down -v                  # ЗНЕСТИ разом з томами і БД
```

Перший старт Grav довгий (~5 хв): entrypoint копіює 3863 файли `user/`
у bind-mount на Windows. Наступні — секунди.
