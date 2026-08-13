ARG PHP_VERSION=8.3
FROM php:${PHP_VERSION}-apache

ARG GRAV_VERSION=2.0.18

# Системні бібліотеки, потрібні для складання PHP-розширень
RUN apt-get update && apt-get install -y --no-install-recommends \
        libzip-dev libpng-dev libjpeg62-turbo-dev libfreetype6-dev libwebp-dev \
        libicu-dev libyaml-dev libonig-dev \
        unzip git curl \
    && rm -rf /var/lib/apt/lists/*

# Розширення, яких Grav вимагає або які помітно його прискорюють
RUN docker-php-ext-configure gd --with-jpeg --with-freetype --with-webp \
    && docker-php-ext-install -j"$(nproc)" gd zip intl opcache exif \
    && printf "\n\n\n" | pecl install yaml apcu \
    && docker-php-ext-enable yaml apcu

# Базовий образ ставить AllowOverride None — без цього .htaccess від Grav
# не працює і всі сторінки, крім головної, віддають 404
RUN a2enmod rewrite headers expires \
    && printf '<Directory /var/www/html>\n\tOptions -Indexes +FollowSymLinks\n\tAllowOverride All\n\tRequire all granted\n</Directory>\n' \
        > /etc/apache2/conf-available/grav.conf \
    && a2enconf grav

RUN { \
        echo 'memory_limit = 256M'; \
        echo 'upload_max_filesize = 64M'; \
        echo 'post_max_size = 64M'; \
        echo 'max_execution_time = 120'; \
        echo 'opcache.enable = 1'; \
        echo 'opcache.memory_consumption = 128'; \
        echo 'opcache.max_accelerated_files = 20000'; \
        echo 'opcache.validate_timestamps = 1'; \
        echo 'opcache.revalidate_freq = 0'; \
    } > /usr/local/etc/php/conf.d/zz-grav.ini

# Офіційний реліз Grav із адмінкою; версія зафіксована аргументом збірки
RUN curl -fsSL -o /tmp/grav.zip \
        "https://github.com/getgrav/grav/releases/download/${GRAV_VERSION}/grav-admin-v${GRAV_VERSION}.zip" \
    && unzip -q /tmp/grav.zip -d /tmp/grav \
    && rm -rf /var/www/html \
    && mv /tmp/grav/grav-admin /var/www/html \
    && rm -rf /tmp/grav /tmp/grav.zip \
    && chmod +x /var/www/html/bin/* \
    # еталонна копія user/ — нею entrypoint засіває порожній bind-mount
    && cp -a /var/www/html/user /usr/src/grav-user \
    && chown -R www-data:www-data /var/www/html

COPY docker-entrypoint.sh /usr/local/bin/grav-entrypoint
# страховка від CRLF, якщо файл потрапив із Windows
RUN sed -i 's/\r$//' /usr/local/bin/grav-entrypoint && chmod +x /usr/local/bin/grav-entrypoint

WORKDIR /var/www/html

ENTRYPOINT ["grav-entrypoint"]
CMD ["apache2-foreground"]
