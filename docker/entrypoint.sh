#!/bin/sh
set -e

echo "Caching Laravel config and routes..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Running migrations..."
php artisan migrate --force

echo "Starting Supervisor (Nginx and PHP-FPM)..."
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf
