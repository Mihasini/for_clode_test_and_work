#!/bin/sh
set -e

GRAV_ROOT=/var/www/html
USER_DIR="${GRAV_ROOT}/user"

# Bind-mount з Windows перекриває вміст образу. Якщо каталог порожній —
# засіваємо його еталонною копією, інакше Grav не стартує взагалі.
if [ -z "$(ls -A "$USER_DIR" 2>/dev/null)" ]; then
    echo "[grav] user/ порожній — засіваю еталонною копією з образу (кілька хвилин)"
    cp -a /usr/src/grav-user/. "$USER_DIR"/
    # лише один раз: обхід 4000 файлів на bind-mount коштує хвилини,
    # а Docker Desktop і так віддає їх із правами 777
    chown -R www-data:www-data "$USER_DIR" 2>/dev/null || true
    echo "[grav] засів завершено"
fi

# Робочі каталоги Grav — усі в іменованих томах, обхід швидкий
for dir in cache logs tmp backup images; do
    chown -R www-data:www-data "${GRAV_ROOT}/${dir}" 2>/dev/null || true
done

exec "$@"
