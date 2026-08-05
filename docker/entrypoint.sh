#!/bin/sh
set -e

echo "Caching Laravel config and routes..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Waiting for database connection..."
until php -r "try { new PDO('mysql:host=' . getenv('DB_HOST') . ';port=' . getenv('DB_PORT'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); exit(0); } catch (Exception \$e) { exit(1); }"
do
  echo "Database not ready yet, retrying in 2 seconds..."
  sleep 2
done
echo "Database is ready!"

echo "Running migrations..."
php artisan migrate --force

echo "Starting Supervisor (Nginx and PHP-FPM)..."
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf
