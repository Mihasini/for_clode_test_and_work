/**
 * Мобільне меню.
 *
 * Каркас devtools клав сюди `import Alpine from 'alpinejs'`, але Grav підключає
 * цей файл звичайним <script src>, без type="module" і без бандлера — тобто
 * браузер щоразу падав на SyntaxError, і скрипт не виконувався взагалі.
 * Поки на сайті немає жодного компонента, якому потрібен Alpine, обходимось
 * ванільним кодом: без залежностей, без збірки JS.
 */
(function () {
    'use strict';

    var toggle = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-nav-panel]');

    if (!toggle || !panel) {
        return;
    }

    function setOpen(open) {
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        panel.classList.toggle('hidden', !open);
        // Блокуємо прокрутку сторінки, поки меню розкрите на весь екран
        document.documentElement.classList.toggle('overflow-hidden', open);
    }

    toggle.addEventListener('click', function () {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            setOpen(false);
        }
    });

    // Клік по пункту меню — це перехід, меню має закритися
    panel.addEventListener('click', function (event) {
        if (event.target.closest('a')) {
            setOpen(false);
        }
    });
})();
