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

# Клон із git приходить із уже заповненим user/, тому блок вище мовчить — але
# plugins/ і themes/quark2 у .gitignore, тож їх у форку немає взагалі, і сайт
# лишається без адмінки, форми та пошуку. Досіваємо поштучно.
for item in plugins themes/quark2; do
    [ -e "${USER_DIR}/${item}" ] && continue
    [ -e "/usr/src/grav-user/${item}" ] || continue
    echo "[grav] user/${item} немає — досіваю з образу"
    parent="$(dirname "${USER_DIR}/${item}")"
    mkdir -p "$parent"
    cp -a "/usr/src/grav-user/${item}" "${parent}/"
    chown -R www-data:www-data "${USER_DIR}/${item}" 2>/dev/null || true
done

# accounts/ і data/ у git не тримаємо: там паролі й зібрані форми. Якщо їх
# першим створить CLI (а він працює від root), Apache під www-data писати туди
# не зможе — плагін problems помітить це й віддасть 500 замість сайту.
for dir in accounts data; do
    mkdir -p "${USER_DIR}/${dir}"
    chown www-data:www-data "${USER_DIR}/${dir}" 2>/dev/null || true
done

# Робочі каталоги Grav — усі в іменованих томах, обхід швидкий
for dir in cache logs tmp backup images; do
    chown -R www-data:www-data "${GRAV_ROOT}/${dir}" 2>/dev/null || true
done

exec "$@"
