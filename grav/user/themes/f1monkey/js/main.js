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

/**
 * Смужка про cookies.
 *
 * Вибір зберігаємо в localStorage, а не в cookie: сервер про згоду нічого не
 * знає, тож cookie їздила б у кожному запиті намарно — та й cookie заради
 * банера про cookie виглядає дивно.
 *
 * Смужка лежить у розмітці прихованою і показується вже тут. Тому в тих, хто
 * погодився, вона не встигає блимнути — навіть якщо HTML прийшов із кешу.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'f1monkey.cookie-notice';

    var notice = document.querySelector('[data-cookie-notice]');
    var accept = notice ? notice.querySelector('[data-cookie-accept]') : null;

    if (!notice || !accept) {
        return;
    }

    // У приватному режимі деяких браузерів localStorage кидає виняток —
    // через це не має падати решта скрипта, тому обидва звертання в try/catch
    function isAccepted() {
        try {
            return window.localStorage.getItem(STORAGE_KEY) === 'yes';
        } catch (error) {
            return false;
        }
    }

    function remember() {
        try {
            window.localStorage.setItem(STORAGE_KEY, 'yes');
        } catch (error) {
            // Не змогли запам'ятати — банер просто з'явиться наступного разу
        }
    }

    if (isAccepted()) {
        return;
    }

    notice.classList.remove('hidden');

    accept.addEventListener('click', function () {
        notice.classList.add('hidden');
        remember();
    });
})();
