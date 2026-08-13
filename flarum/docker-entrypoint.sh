#!/bin/sh
set -e

cd /flarum

# Іменований том /flarum Docker заповнює вмістом образу автоматично,
# але після перезбірки образу права варто підрівняти
for dir in storage public/assets extensions; do
    chown -R www-data:www-data "/flarum/${dir}" 2>/dev/null || true
done

# config.php з'являється лише після успішної інсталяції і живе в томі —
# тому повторний запуск контейнера інсталяцію не повторює
if [ ! -f /flarum/config.php ]; then
    echo "[flarum] config.php відсутній — виконую первинну інсталяцію"

    # compose тримає нас до healthcheck БД, але з'єднання перевіряємо ще раз
    tries=0
    until php -r 'new PDO("mysql:host=".getenv("DB_HOST").";dbname=".getenv("DB_NAME"), getenv("DB_USER"), getenv("DB_PASSWORD"));' 2>/dev/null; do
        tries=$((tries + 1))
        if [ "$tries" -gt 30 ]; then
            echo "[flarum] БД так і не відповіла — припиняю"
            exit 1
        fi
        echo "[flarum] чекаю на MariaDB (спроба ${tries})"
        sleep 2
    done

    cat > /tmp/flarum-install.yml <<EOF
debug: false
baseUrl: ${FORUM_URL}
databaseConfiguration:
  driver: mysql
  host: ${DB_HOST}
  port: 3306
  database: ${DB_NAME}
  username: ${DB_USER}
  password: ${DB_PASSWORD}
  prefix: ''
adminUser:
  username: ${FLARUM_ADMIN_USER}
  password: ${FLARUM_ADMIN_PASSWORD}
  password_confirmation: ${FLARUM_ADMIN_PASSWORD}
  email: ${FLARUM_ADMIN_EMAIL}
settings:
  forum_title: ${FLARUM_TITLE}
EOF

    # інсталяція від імені www-data, щоб config.php і кеш належали веб-серверу
    su -s /bin/sh www-data -c "php /flarum/flarum install --file=/tmp/flarum-install.yml"
    rm -f /tmp/flarum-install.yml

    # Мовний пакет лежить в образі (див. Dockerfile), але вмикається він
    # записом у БД — тому робимо це одразу після інсталяції, поки БД свіжа.
    LOCALE="${FLARUM_LOCALE:-uk}"
    if [ "${LOCALE}" = "uk" ]; then
        su -s /bin/sh www-data -c "php /flarum/flarum extension:enable flarum-lang-ukrainian"
    fi

    # default_locale інсталятор не вміє задавати — пишемо напряму в settings
    FLARUM_LOCALE="${LOCALE}" php -r '
        $pdo = new PDO("mysql:host=".getenv("DB_HOST").";dbname=".getenv("DB_NAME"), getenv("DB_USER"), getenv("DB_PASSWORD"));
        $st = $pdo->prepare("INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)");
        $st->execute(["default_locale", getenv("FLARUM_LOCALE")]);
    '

    su -s /bin/sh www-data -c "php /flarum/flarum cache:clear"
    echo "[flarum] інсталяція завершена, мова інтерфейсу: ${LOCALE}"
fi

exec "$@"
