ARG PHP_VERSION=8.3
FROM php:${PHP_VERSION}-apache

# Обмеження версії скелета Flarum (скелет 1.8.x підтягує ядро flarum/core 1.8.18)
ARG FLARUM_VERSION=^1.8

ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_NO_INTERACTION=1

RUN apt-get update && apt-get install -y --no-install-recommends \
        libzip-dev libpng-dev libjpeg62-turbo-dev libfreetype6-dev libwebp-dev \
        libicu-dev unzip git curl \
    && rm -rf /var/lib/apt/lists/*

# Набір розширень із вимог Flarum (решта — curl, dom, json, mbstring,
# openssl, tokenizer — уже вбудовані в базовий образ)
RUN docker-php-ext-configure gd --with-jpeg --with-freetype --with-webp \
    && docker-php-ext-install -j"$(nproc)" gd zip intl opcache exif pdo_mysql

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN { \
        echo 'memory_limit = 256M'; \
        echo 'upload_max_filesize = 32M'; \
        echo 'post_max_size = 32M'; \
        echo 'opcache.enable = 1'; \
        echo 'opcache.memory_consumption = 128'; \
        echo 'opcache.max_accelerated_files = 20000'; \
    } > /usr/local/etc/php/conf.d/zz-flarum.ini

# DocumentRoot Flarum — public/, а не корінь проєкту
RUN sed -ri 's!/var/www/html!/flarum/public!g' /etc/apache2/sites-available/000-default.conf \
    && printf '<Directory /flarum/public>\n\tOptions -Indexes +FollowSymLinks\n\tAllowOverride All\n\tRequire all granted\n</Directory>\n' \
        > /etc/apache2/conf-available/flarum.conf \
    && a2enconf flarum \
    && a2enmod rewrite headers

RUN composer create-project flarum/flarum:"${FLARUM_VERSION}" /flarum --no-dev --prefer-dist \
    && chown -R www-data:www-data /flarum

COPY docker-entrypoint.sh /usr/local/bin/flarum-entrypoint
RUN sed -i 's/\r$//' /usr/local/bin/flarum-entrypoint && chmod +x /usr/local/bin/flarum-entrypoint

WORKDIR /flarum

ENTRYPOINT ["flarum-entrypoint"]
CMD ["apache2-foreground"]
