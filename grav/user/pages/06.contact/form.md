---
title: 'Контакти'
eyebrow: 'Зворотний зв''язок'
# Ім'я файлу (form.md) задає шаблон: themes/f1monkey/templates/form.html.twig

form:
    name: contact
    # Помилки під полем, а не купою вгорі; у плагіні типово вимкнено
    inline_errors: true

    fields:
        - { name: name,    label: "Ім'я",       type: text,     autocomplete: name,  validate: { required: true } }
        - { name: email,   label: Пошта,        type: email,    autocomplete: email, validate: { required: true } }
        - { name: message, label: Повідомлення, type: textarea, rows: 6,             validate: { required: true } }

        # Згода. Не відмічений checkbox взагалі не приходить у POST,
        # тому validate.required зупиняє відправку навіть із вимкненим JS.
        - name: consent
          type: checkbox
          # markdown у label — щоб у згоді були живі посилання на обидві сторінки
          markdown: true
          label: 'Погоджуюсь з [Угодою користувача](/terms-of-use) та [Політикою конфіденційності](/privacy-policy)'
          # Підпис іде поруч із галочкою, тому верхній лейбл вимикаємо —
          # інакше розкладка лишає над полем порожній блок
          display_label: false
          # Коротка назва для листа — інакше в лист поїде весь текст згоди з посиланнями
          data_label: 'Згода з умовами'
          validate:
              required: true
              # Без цього в помилку піде весь текст згоди разом із markdown-посиланнями:
              # ядро складає її як `Невірне введення в "<label>"`
              message: 'Щоб надіслати форму, потрібно погодитися з умовами'

        # Пастка для ботів: приховане поле, яке заповнює тільки скрипт.
        # Ховається інлайновим стилем самого плагіна (inline_css: true).
        - { name: website, type: honeypot }

    buttons:
        - { type: submit, value: Надіслати }

    process:
        # Адреси не дублюємо: from/to беруться з user/config/plugins/email.yaml
        - email:
              # |raw обов'язковий саме для адреси: параметри листа рендеряться
              # з автоекрануванням, і форма `Ім'я <a@b.c>` перетворилася б на &lt;
              reply_to: '{{ form.value.email|raw }}'
              subject: '[{{ config.site.title }}] Звернення від {{ form.value.name|e }}'
        - message: 'Дякуємо! Ми відповімо на вказану пошту.'
        - reset: true
---

Напишіть нам — відповімо на пошту, яку ви вкажете.
