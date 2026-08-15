---
title: Журнал
menu: Журнал
# Ключ обов'язковий: плагін simplesearch підміняє шаблон сторінки своїм
# (simplesearch_results) рівно тоді, коли template у фронтматері не заданий.
template: blog
eyebrow: 'Нотатки зі стенду'
lead: 'Що ламали, що полагодили і чому саме так. Короткі записи про Grav, Flarum і власну тему.'
content:
    items: '@self.children'
    order:
        by: date
        dir: desc
    limit: 4
    pagination: true
simplesearch:
    # Результати показуємо на цій самій сторінці, окремої /search немає
    route: '@self'
    # Шукаємо лише серед записів журналу: фільтр @self бере ту саму
    # колекцію content (@self.children), але вже без пагінації
    filters:
        - '@self'
---
