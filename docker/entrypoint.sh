#!/bin/sh
set -e

echo "Fixing storage permissions..."
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/framework/cache/data
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/bootstrap/cache
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

echo "Clearing old caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo "Creating storage symlink..."
php artisan storage:link --force 2>/dev/null || true

echo "Waiting for database connection..."
until php -r "try { new PDO('mysql:host=' . getenv('DB_HOST') . ';port=' . getenv('DB_PORT'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); exit(0); } catch (Exception \$e) { exit(1); }"
do
  echo "Database not ready yet, retrying in 2 seconds..."
  sleep 2
done
echo "Database is ready!"

echo "Running migrations..."
php artisan migrate --force

echo "Caching Laravel config and routes..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Starting Supervisor (Nginx and PHP-FPM)..."
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf
