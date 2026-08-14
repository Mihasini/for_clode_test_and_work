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
Те, що ми редагуємо руками (`grav/user/`, `flarum/extend.php`, `flarum/less/`),
прокинуте на диск.
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

`grav/user/themes/f1monkey/` — власна тема на Tailwind 3 (+ forms, typography).
Активована в `grav/user/config/system.yaml` (`pages.theme`). Стара `pisochnica`
поки лежить поруч як точка відкату — перемикається одним рядком конфіга.

Дизайн — брутально-редакційний: монохром на теплому сірому (`#e5e5e5`, ніколи
не чисто білий), велика типографіка капсом, **нуль тіней** (`boxShadow` у
`tailwind.config.js` навмисно зведений до `none`). Глибина йде тільки контрастом
поверхонь: полотно → біла картка → чорний інверсний блок. Акценти — м'ятний
`#d1ffca` і жовтий `#fff100`.

Стилі збираються **на хості**, бо Node.js у контейнері немає:

```powershell
cd grav\user\themes\f1monkey
npm install          # один раз
npm run fonts        # один раз: розкладає woff2 і генерує css/_fonts.css
npm run watch        # під час роботи над темою
npm run prod         # мініфікована збірка
```

Джерело — `css/site.css` і класи в `templates/**/*.twig`; результат — `dist/css/site.css`
(лежить у git, тому сайт працює одразу після клону). `npm run prod` дає `site.min.css`;
щоб тема його підхопила, треба ввімкнути `production: true` у `f1monkey.yaml`.

Клас, який не трапляється в жодному шаблоні, у збірку не потрапляє — тож
компонент, описаний у `css/site.css` «про запас», у браузері не існує,
доки ним хтось не скористався.

### Модульна головна

`grav/user/pages/01.home/` — модульна сторінка: `modular.md` збирає дочірні
теки з `_` на початку (`_hero`, `_cards`, `_stats`, `_notes`, `_cta`), кожна
рендериться однойменним шаблоном із `themes/f1monkey/templates/modular/`.
Порядок заданий списком `content.order.custom` у `modular.md` — нумерувати
теки не можна: префікс `01.` злипся б із назвою, що починається з `_`.

Поля модулів описані в `themes/f1monkey/blueprints/modular/*.yaml`, тому
секції редагуються в адмінці, а не тільки у фронтматері. Щоб додати нову
секцію: тека `_назва/` + файл `шаблон.md` усередині + рядок у `custom`.

### Журнал

`grav/user/pages/02.blog/` — список записів (`blog.md`, шаблон `blog.html.twig`),
кожен запис — тека з `item.md` (шаблон `item.html.twig`). Порядок і посторінковий
розбір задані прямо в `blog.md`: `order.by: date`, `dir: desc`, `limit`, `pagination: true`.
Обкладинка запису — просто перше зображення в його теці, окремого поля немає.

Пагінацію дає плагін `pagination`, але вигляд — наш: `partials/pagination.html.twig`
у темі перекриває шаблон плагіна. Короткий опис у картці відрізає роздільник `===`
в тілі запису.

Фільтр за тегом (`/blog/tag:grav`) робить саме ядро — `pages.url_taxonomy_filters`
уже ввімкнений у `system/config/system.yaml`. А от перелік таксономій у ядрі
не заданий, тому він оголошений явно в `user/config/site.yaml`:

```yaml
taxonomies:
    - category
    - tag
```

Без цього Grav не збирає теги в індекс і будь-яке `tag:…` віддає порожній список.
Кириличні теги працюють: посилання будується через `|url_encode`.

### Шрифти

Oswald (заголовки), Inter (текст), JetBrains Mono (код) — усі **локальні**,
жодного запиту на `fonts.googleapis.com`. Джерело — пакети `@fontsource-variable/*`
у `devDependencies`; `npm run fonts` (`scripts/copy-fonts.mjs`) копіює підмножини
`latin`, `latin-ext`, `cyrillic`, `cyrillic-ext` у `fonts/` і генерує
`css/_fonts.css` з `@font-face`. Обидві теки в git — сайт має працювати одразу
після клону, без `npm`. `_fonts.css` руками не правимо: перезапис затре зміни.

Замінники, які радить зразок дизайну (Anton, Bebas Neue, Barlow Condensed),
**не мають кирилиці** — тому дисплейний шрифт саме Oswald.

## Оформлення форуму

Форум має читатися як частина сайту, тому Flarum одягнений у ту саму систему:
тепле сіре полотно, чорна шапка й герой, мʼятні акценти, нуль тіней, ті самі
шрифти. Джерела вигляду двоє, і плутати їх не варто.

**Кольори теми — у БД** (таблиця `settings`): `theme_dark_mode=0`,
`theme_colored_header=1`, `theme_primary_color` і `theme_secondary_color` —
`#000000`. Flarum підставляє їх у LESS як `@config-*` **до** компіляції
і сам рахує похідні (контраст, освітлення), тому з боку CSS їх не перебити.

**Решта — у `flarum/less/f1monkey.less`**, підключеному з `extend.php` через
`Extend\Frontend('forum')->css()`. Файл додається останнім, а ядро виводить усю
палітру в CSS-змінні на `:root` (`--body-bg`, `--control-bg`, `--hero-bg`,
`--tag-bg`, `--button-primary-bg`, `--shadow-color`, …) — тож достатньо
перевизначити змінні, без `!important` і без полювання за селекторами. Одне
`--shadow-color: transparent` гасить усі тіні ядра разом.

Не через «Custom LESS» в адмінці: те, що лежить у БД, зникає після
`docker compose down -v` і не видно в діффі.

Шрифти спільні з сайтом: `npm run fonts` у темі генерує не лише
`css/_fonts.css`, а й `flarum/less/_fonts.less` — ті самі підмножини, інший
шлях в `url()`. Тека `fonts/` теми змонтована в `public/fonts` форуму;
`.htaccess` Flarum віддає реальний файл раніше, ніж переписує запит на
`index.php`.

Смужка «На сайт» над шапкою — це налаштування `custom_header`: Flarum виводить
його сирим HTML першим у `<body>`, перед `#app`
(`views/frontend/forum.blade.php`). Єдине місце для власної розмітки без збірки
JS-розширення. Зворотний пункт «Форум» у меню сайту — ключ `menu`
в `grav/user/config/site.yaml`.

Усі ці налаштування пише `flarum/docker-entrypoint.sh` одразу після інсталяції,
тому після `docker compose down -v` форум піднімається вже оформленим.
Після правок у `less/` треба скинути кеш — стилі перезбираються при першому
запиті:

```powershell
docker compose exec -u www-data flarum php flarum cache:clear
```

## Мова

Обидва сайти українською.

**Grav** — блок `languages` у `grav/user/config/system.yaml`: `supported: [uk]`.
Один запис вмикає переклади ядра, плагінів і теми, але `include_default_lang: false`
лишає адреси без префікса `/uk/`, а `include_default_lang_file_extension: false` —
файли сторінок без суфікса (`default.md`, а не `default.uk.md`).
Щоб зробити сайт двомовним, дописуємо мову в `supported` і заводимо `default.en.md`.

Рядки теми — `themes/f1monkey/languages/{uk,en}.yaml`, ключі `THEME_F1MONKEY.*`.
Мова адмінки береться з профілю користувача (`adminLanguage` в `user/accounts/*.yaml`)
і перемикається в самій адмінці.

**Flarum** — пакет `flarum-lang/ukrainian`. Він ставиться в образі (`flarum/Dockerfile`),
а вмикається в БД, тому entrypoint після інсталяції робить `extension:enable`
і пише `default_locale` зі змінної `FLARUM_LOCALE` (типово `uk`). Тобто після
`docker compose down -v` українська повертається сама.

Вручну те саме:

```powershell
docker compose exec -u www-data flarum php flarum extension:enable flarum-lang-ukrainian
docker compose exec -u www-data flarum php flarum cache:clear
```

## Що не в git і як відновити

`grav/user/plugins/` і `grav/user/themes/quark2/` — це ~3900 файлів з образу
та GPM. Комплект образу відновлюється сам при першому старті (entrypoint засіває
порожній `user/`). Поверх нього доставлено вручну:

```powershell
docker compose exec grav php bin/gpm install devtools -y     # каркас для нових тем
docker compose exec grav php bin/gpm install pagination -y   # посторінковий розбір журналу
```

Без `pagination` сторінка `/blog` не впаде, але покаже лише перші `limit` записів
і жодного переходу далі.

## Корисне

```powershell
docker compose logs -f grav flarum      # логи
docker compose exec grav sh             # shell у Grav
docker compose exec grav php bin/grav clearcache
docker compose down                     # зупинити, дані лишаються в томах
docker compose down -v                  # ЗНЕСТИ разом з томами і БД
```

Перший старт Grav довгий (~5 хв): entrypoint копіює 3863 файли `user/`
у bind-mount на Windows. Наступні — секунди.
