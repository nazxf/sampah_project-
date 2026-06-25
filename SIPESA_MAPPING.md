# SIPESA — Pemetaan & Arsitektur Adaptasi

> **Status**: LANGKAH 1 & 2 selesai (Foundation + Migrasi DB + Model & Seeder).
> Project ini dibangun di atas codebase Laravel 12 + React/Inertia + Tailwind v3 yang sudah ada,
> diadaptasikan ke spesifikasi **SIPESA — Sistem Informasi Pengelolaan Sampah Berbasis Web & IoT** untuk Kampus B Muhammadiyah Cileungsi.

---

## 1. Pemetaan Terminologi Spec ↔ Skema Existing

| Spec (Indonesia) | Implementasi Aktual (English) | Catatan |
|---|---|---|
| `users` | `users` | Sudah punya `role_id`, `unit_id`, `no_telepon`, `alamat`, `avatar` |
| `lokasi_tong` (gedung/lantai) | `units` (SD/SMP/SMA/TK/BTM/Sumart/UMCI) | "Lokasi" disimpan di field `lokasi` di `trash_bins` (mis. "SD Kampus B - Area A") |
| `tong_sampah` | `trash_bins` | Sudah ada `latitude`, `longitude`. Akan ditambah `tinggi_tong_cm`, `persentase_kepenuhan`, `last_sensor_at` di Fase 1.2 |
| `perangkat_iot` | `iot_devices` *(akan dibuat — Fase 1.2)* | Token unik per perangkat, status online/offline |
| `sensor_logs` | `sensor_logs` *(akan dibuat — Fase 1.2)* | Histori jarak ultrasonik per device |
| `gps_logs` | `gps_logs` *(akan dibuat — Fase 1.2)* | Histori koordinat GPS dari Neo-6M |
| `jadwal` | `pickup_schedules` *(akan dibuat — Fase 1.2)* | Penjadwalan rutin & darurat |
| `pencatatan` | `trash_histories` | Sudah ada — akan ditambah `latitude_konfirmasi`, `longitude_konfirmasi`, link ke `pickup_schedule_id` di Fase 3 |
| `laporan_warga` (anonim) | `public_reports` *(akan dibuat — Fase 2)* | **Tabel terpisah** dari `complaints` (yang internal & wajib login). Mendukung anonim + IP tracking + nomor tiket `LP-YYYYMMDD-XXXX` |
| `complaints` | `complaints` | Aduan internal siswa login (existing, dipertahankan) |
| `notifikasi` | `notifications` *(akan dibuat — Fase 4)* | Push notif real-time via Pusher |

---

## 2. Sistem Role (6 Role + Anonim)

| Role | Akses | Scope | Mutasi Data | Akun Contoh |
|---|---|---|---|---|
| `super_admin` | Full akses | Semua unit | ✅ CRUD | superadmin@sipesa.test |
| `admin_unit` | Operasional | Unit-nya saja | ✅ CRUD (terbatas unit) | adminsd@sipesa.test |
| `kepala_unit` | **Read-only** | Unit-nya saja | ❌ View only | kepala.sd@sipesa.test, kepala.smp@sipesa.test |
| `kepala_pusat` | **Read-only** | Semua unit | ❌ View only | kepala.pusat@sipesa.test |
| `petugas` | Eksekusi lapangan | Tugas yang ditetapkan | ✅ Konfirmasi pickup | petugas@sipesa.test, petugas2@sipesa.test |
| `siswa` | Aduan internal | Personal | ✅ Buat aduan login | siswa@sipesa.test |
| _(anonim)_ | Hanya `/laporan` & `/laporan/status` publik | — | ✅ Submit laporan + cek status | _tidak login_ |

> **Password default semua akun seeder**: `password`

### Enforcement Read-Only (2 Lapis)
1. **Layer HTTP** — middleware `kepala_unit`, `kepala_pusat`, `viewer` blok HTTP method non-GET.
2. **Layer Authorization (Gate)** — `Gate::before()` di `AppServiceProvider`:
   - Ability `view*`/`see*`/`list*`/`show*`/`export*` → ALLOWED untuk kepala.
   - Ability `create*`/`update*`/`delete*`/`manage*` → DENIED untuk kepala.
   - `super_admin` → always allow (bypass).

### Daftar Middleware Alias (`bootstrap/app.php`)
| Alias | Class | Fungsi |
|---|---|---|
| `role` | `EnsureUserHasRole` | Cek role spesifik (parameterized) |
| `super_admin` | `EnsureUserIsSuperAdmin` | Hanya super admin |
| `admin` | `EnsureUserIsAdminOrSuperAdmin` | super_admin + admin_unit |
| `petugas` | `EnsureUserIsPetugas` | Hanya petugas |
| **`kepala_unit`** | `EnsureUserIsKepalaUnit` | 🆕 Kepala unit (read-only, scope unit, wajib unit_id) |
| **`kepala_pusat`** | `EnsureUserIsKepalaPusat` | 🆕 Kepala pusat (read-only, lintas-unit) |
| **`viewer`** | `EnsureUserCanView` | 🆕 Gerbang umum: admin + kepala (untuk route GET bersama) |

### Helper Methods di `User.php`
```php
$user->isSuperAdmin();        // bool
$user->isAdminUnit();         // bool
$user->isKepalaUnit();        // bool 🆕
$user->isKepalaPusat();       // bool 🆕
$user->isPetugas();           // bool
$user->isSiswa();             // bool

$user->isKepala();            // 🆕 kepala_unit OR kepala_pusat
$user->canEdit();             // 🆕 super_admin/admin_unit/petugas
$user->canView();             // 🆕 super_admin/admin_unit/kepala_*
$user->isScopedToUnit();      // 🆕 admin_unit OR kepala_unit
$user->canViewAllUnits();     // 🆕 super_admin OR kepala_pusat

$user->hasRole('super_admin'); // generic
$user->hasAnyRole(['admin_unit', 'kepala_unit']); // generic
```

---

## 3. Tech Stack Final (Adaptasi)

| Komponen | Spec | Implementasi |
|---|---|---|
| Backend | Laravel 11 | **Laravel 12** (kompatibel, lebih baru) |
| Frontend | Blade + Tailwind v3 | **React + Inertia.js + Tailwind v3** |
| Database | MySQL | MySQL `sipesa` |
| Auth | Breeze multi-role | Breeze (Inertia React) — sudah terpasang |
| Realtime | Laravel Echo + Pusher | (Fase 4) |
| Peta | Leaflet.js + OSM | (Fase 3) — pakai Leaflet via NPM |
| PDF | dompdf | `barryvdh/laravel-dompdf` ✅ |
| Excel | Maatwebsite | `maatwebsite/excel` ✅ |
| API | REST | Laravel Sanctum (token IoT) ✅ |
| Captcha | reCAPTCHA v3 | (Fase 2.9) |
| Halaman Publik `/laporan` | Blade clean mobile-first | **Blade murni** (tanpa Inertia) — sesuai spec |

> **Catatan Penting**: Halaman publik `/laporan` & `/laporan/status` akan dibuat sebagai **Blade view murni** (bukan Inertia/React) sesuai spesifikasi. Dashboard admin/petugas tetap React/Inertia.

---

## 4. Roadmap Migrasi Tabel (Yang Akan Dibuat di Fase Berikut)

| Tabel | Fase | Tujuan |
|---|---|---|
| `users` ALTER (no `phone` field) | 1.2 | Sudah ada `no_telepon` ✅ |
| `trash_bins` ALTER | 1.2 | Tambah `tinggi_tong_cm`, `persentase_kepenuhan`, `last_sensor_at` |
| `iot_devices` | 1.2 | Tabel baru |
| `sensor_logs` | 1.2 | Tabel baru |
| `gps_logs` | 1.2 | Tabel baru |
| `pickup_schedules` | 1.2 | Tabel baru (jadwal rutin & darurat) |
| `trash_histories` ALTER | 1.2 | Tambah `latitude_konfirmasi`, `longitude_konfirmasi`, FK `pickup_schedule_id` |
| `public_reports` | 2 | Tabel baru — laporan warga anonim |
| `notifications` | 4 | Tabel baru |

---

## 5. Tema Warna & Branding

Sesuai spec & DESIGN.md:
- **Primary**: `#16a34a` (green-600)
- **Primary Dark**: `#15803d` (green-700)
- **Status Tong**:
  - Kosong (0–40%): `#22c55e` (green-500)
  - Sedang (41–75%): `#eab308` (yellow-500)
  - Penuh (76–100%): `#ef4444` (red-500) + animasi pulse
- **Laporan Warga Aktif (ikon !)**: `#f97316` (orange-500)

Semua palette sudah didefinisikan di `tailwind.config.js` sebagai `primary` & `sipesa.*`.

---

## 6. Akun Seeder (Untuk Testing)

| Role | Email | Password | Unit |
|---|---|---|---|
| Super Admin | `superadmin@sipesa.test` | `password` | — |
| Admin Unit (SD) | `adminsd@sipesa.test` | `password` | SD |
| Kepala Unit (SD) | `kepala.sd@sipesa.test` | `password` | SD |
| Kepala Unit (SMP) | `kepala.smp@sipesa.test` | `password` | SMP |
| Kepala Pusat | `kepala.pusat@sipesa.test` | `password` | (semua) |
| Petugas 1 | `petugas@sipesa.test` | `password` | — |
| Petugas 2 | `petugas2@sipesa.test` | `password` | — |
| Siswa | `siswa@sipesa.test` | `password` | — |

---

## 7. Variabel `.env` Khusus SIPESA

```env
# Timezone
APP_TIMEZONE=Asia/Jakarta

# Google reCAPTCHA v3 (Fase 2)
RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=

# Pusher (Fase 4)
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=mt1

# IoT (Fase 5)
IOT_DEVICE_TOKEN_LENGTH=64
IOT_OFFLINE_THRESHOLD_MINUTES=15

# Gudang kebersihan (Fase 3 — algoritma rute)
WAREHOUSE_LATITUDE=-6.374672
WAREHOUSE_LONGITUDE=106.924831

# Verifikasi lokasi petugas (Fase 3)
PETUGAS_CONFIRM_RADIUS_METERS=50

# Threshold persentase status tong (Fase 3)
TONG_STATUS_EMPTY_MAX=40
TONG_STATUS_MEDIUM_MAX=75
```

---

## 8. Roadmap Eksekusi Fase Berikut

- [x] **Langkah 1**: Setup Laravel + Tailwind + Breeze + role multi-akun (selesai)
- [x] **Langkah 2**: Migrasi database lengkap + Model & relasi Eloquent (selesai — 8 migrasi + 6 model baru + 4 seeder + smoke test ✅)
- [x] **Langkah 3**: Model & relasi Eloquent (digabung ke Langkah 2 — selesai)
- [ ] **Langkah 4**: REST API IoT (`POST /api/sensor/update`) + validasi token Sanctum **(NEXT)**
- [ ] **Langkah 5–9**: Modul publik laporan warga (Blade)
- [ ] **Langkah 10–14**: Leaflet + Geolocation + rute Nearest Neighbor
- [ ] **Langkah 15–20**: CRUD admin (tong, perangkat, jadwal, laporan), notif Pusher, ekspor PDF/Excel
- [ ] **Langkah 21–24**: Hardware Arduino + ESP8266

---

## 9. 🔖 PROGRESS TRACKER — Resume Point Sesi Chat Baru

> **Update terakhir**: Langkah 2 selesai 100% (migrasi + model + seeder + smoke test).
> Untuk lanjut sesi baru: baca section ini dulu, lalu kerjakan **NEXT TASK** di bawah.

### ✅ Yang Sudah Selesai

#### Langkah 1 (100% DONE)
- Foundation: Tailwind v3 cleanup, palette `primary` & `sipesa.*` di `tailwind.config.js`
- `.env` & `.env.example` dengan placeholder reCAPTCHA / Pusher / IoT / gudang
- 6 role lengkap di `DatabaseSeeder.php` + 8 user contoh
- 3 middleware baru: `EnsureUserIsKepalaUnit`, `EnsureUserIsKepalaPusat`, `EnsureUserCanView`
- Alias middleware terdaftar di `bootstrap/app.php`: `kepala_unit`, `kepala_pusat`, `viewer`
- `Gate::before()` di `AppServiceProvider` enforce read-only untuk role kepala
- `User.php` ditambah helper: `isKepalaUnit()`, `isKepalaPusat()`, `isKepala()`, `canEdit()`, `canView()`, `isScopedToUnit()`, `canViewAllUnits()`, `hasAnyRole()`, plus trait `HasApiTokens`
- MySQL Laragon 8.0.30 + database `sipesa` + migrate fresh + seed sukses
- Build Vite OK, smoke test role helper & Gate::before() lulus

#### Langkah 2 — Migrasi (100% DONE — sudah di-migrate fresh + seed sukses)
File migrasi yang sudah dibuat di `database/migrations/`:
1. ✅ `2026_06_15_100001_add_sensor_fields_to_trash_bins_table.php` — alter trash_bins (+`tinggi_tong_cm`, `persentase_kepenuhan`, `last_sensor_at`)
2. ✅ `2026_06_15_100002_create_iot_devices_table.php` — perangkat IoT (token, status online/offline, last_ping_at)
3. ✅ `2026_06_15_100003_create_sensor_logs_table.php` — histori data ultrasonik
4. ✅ `2026_06_15_100004_create_gps_logs_table.php` — histori GPS Neo-6M
5. ✅ `2026_06_15_100005_create_pickup_schedules_table.php` — jadwal rutin & darurat
6. ✅ `2026_06_15_100006_add_geolocation_to_trash_histories_table.php` — alter trash_histories (+`latitude_konfirmasi`, `longitude_konfirmasi`, FK `pickup_schedule_id`)
7. ✅ `2026_06_15_100007_create_public_reports_table.php` — laporan warga anonim + tambah FK `pickup_schedules.public_report_id`
8. ✅ `2026_06_15_100008_create_sipesa_notifications_table.php` — notifikasi sistem (nama tabel `sipesa_notifications` agar tidak konflik default Laravel)

#### Langkah 2 — Model & Seeder (100% DONE)
Model existing diperbarui:
- ✅ `app/Models/TrashBin.php` — +fillable sensor, +`iotDevice()`, `sensorLogs()`, `gpsLogs()`, `pickupSchedules()`, `publicReports()`, accessor `status_by_persentase`, scope `withActiveReports()`
- ✅ `app/Models/TrashHistory.php` — +fillable `pickup_schedule_id`, `latitude_konfirmasi`, `longitude_konfirmasi`, +relasi `pickupSchedule()`
- ✅ `app/Models/Unit.php` — +`pickupSchedules()` & `publicReports()` HasManyThrough
- ✅ `app/Models/User.php` — +`pickupSchedules()` & `sipesaNotifications()`

Model baru:
- ✅ `app/Models/IotDevice.php` — relasi 1:1 trashBin + `isOnline()` + `regenerateToken()` + `makeToken()` (static)
- ✅ `app/Models/SensorLog.php` — relasi iotDevice/trashBin + scope `recent($hours)`
- ✅ `app/Models/GpsLog.php` — relasi trashBin/iotDevice
- ✅ `app/Models/PickupSchedule.php` — relasi trashBin/petugas/publicReport/dibuatOleh/pencatatan, scope `today()`/`terlambat()`/`forPetugas()`, accessor `is_overdue`, helper `getStatusColors()`/`getTipeLabels()`
- ✅ `app/Models/PublicReport.php` — relasi lengkap + **static `generateNomorTiket()`** (atomic, locked) + **static `findDuplicate()`** (60 menit window) + scope `aktif()`/`byTipe()` + helper labels
- ✅ `app/Models/SipesaNotification.php` — relasi + scope `unread()`/`forUser()` + `markAsRead()`

Seeder:
- ✅ `DatabaseSeeder` — update TrashBin seed (tinggi_tong_cm 60-120, persentase_kepenuhan match status, last_sensor_at)
- ✅ `IotDeviceSeeder` — ~50% tong (17 dari 33), token 64 char, 70% online
- ✅ `SensorLogSeeder` — 10 log per device (170 total) + GPS log 1:1
- ✅ `PickupScheduleSeeder` — 5 rutin hari ini + 2 darurat + 3 selesai kemarin (10 total)
- ✅ `PublicReportSeeder` — 8 laporan variatif + 1 duplikat (9 total)

Verifikasi:
- ✅ `php artisan migrate:fresh --seed --force` sukses (20 migrasi, 4 seeder)
- ✅ Smoke test relasi & helper lulus (status_by_persentase, generateNomorTiket increment, findDuplicate match, HasManyThrough Unit, isOnline)
- ✅ `php artisan test` — 28/28 passed (87 assertions)

**Counts setelah seed**: TrashBin=33 · IotDevice=17 · SensorLog=170 · GpsLog=170 · PickupSchedule=10 · PublicReport=9

### 🚧 NEXT TASK — Lanjut Dari Sini

#### Langkah 4 — REST API IoT (`POST /api/sensor/update`)
Urutan eksekusi:

**A. Setup routing API (belum ada `routes/api.php`)**
- [ ] Buat `routes/api.php`
- [ ] Daftarkan di `bootstrap/app.php` via `withRouting(api: __DIR__.'/../routes/api.php', apiPrefix: 'api')`
- [ ] Pastikan Sanctum middleware `auth:sanctum` tersedia (sudah ada `HasApiTokens` di User.php)

**B. Buat `app/Http/Controllers/Api/SensorController.php`**
Endpoint: `POST /api/sensor/update`

Payload yang diterima dari Arduino/ESP8266:
```json
{
  "device_token": "abc123...",
  "jarak_cm": 25.5,
  "latitude": -6.374672,
  "longitude": 106.924831,
  "akurasi_meter": 5.2
}
```

Logika:
1. Validasi `device_token` cocok dengan `iot_devices.device_token` (404 jika tidak)
2. Ambil `trash_bin` terkait, hitung `persentase = ((tinggi_tong_cm - jarak_cm) / tinggi_tong_cm) * 100`
3. Clamp 0-100, update `trash_bins.persentase_kepenuhan` + `last_sensor_at = now()`
4. Update `trash_bins.status` berdasarkan threshold env `TONG_STATUS_EMPTY_MAX` (40) & `TONG_STATUS_MEDIUM_MAX` (75)
5. Insert `sensor_logs` (jarak_cm, persentase)
6. Insert `gps_logs` jika `latitude`/`longitude` ada
7. Update `iot_devices.last_ping_at = now()` + `status_device = 'online'`
8. **Auto-confirm `public_reports`** tipe `penuh` yang masih `menunggu`/`diproses` JIKA tong baru saja terdeteksi penuh → set status `selesai` + catatan auto
9. **Trigger `SipesaNotification`** tipe `penuh` untuk semua admin (user_id NULL = broadcast) jika status berubah ke penuh
10. Return JSON `{ ok: true, persentase, status, log_id }`

**C. FormRequest validasi**
- [ ] `app/Http/Requests/Api/UpdateSensorRequest.php` — validate device_token required, jarak_cm 0-500, lat/lng nullable

**D. Test**
- [ ] `tests/Feature/Api/SensorUpdateTest.php` — happy path + token invalid + auto-confirm laporan + threshold transitions

### 📂 Konteks File Penting (untuk sesi baru)

**Skema existing yang tidak boleh diubah breakingly**:
- `users` (sudah ada `role_id`, `unit_id`, `no_telepon`, `alamat`, `avatar`)
- `roles` (6 role, jangan ubah `name` column)
- `units` (7 unit kampus)
- `trash_bins` (English fields: `kode`, `nama`, `unit_id`, `lokasi`, `jenis_sampah`, `status`, `latitude`, `longitude`, `terakhir_diangkut`, `terakhir_diangkut_oleh`)
- `trash_histories` (English fields: `trash_bin_id`, `user_id`, `status_sebelum`, `status_sesudah`, `tanggal`, `catatan`, `foto`)
- `complaints` (existing — internal aduan siswa login, JANGAN dihapus, beda dari `public_reports`)

**Konvensi penting**:
- Pakai field `pickup_schedule_id` (English) di `trash_histories`, bukan `jadwal_id` (sesuai konsistensi codebase)
- Tabel notif pakai `sipesa_notifications` (bukan `notifications` agar tidak konflik default Laravel)
- Tipe enum `pickup_schedules.status`: `terjadwal`, `selesai`, `terlambat`, `dibatalkan` (4 status, lebih lengkap dari spec asli yang 3)
- Format nomor tiket public_reports: `LP-YYYYMMDD-XXXX` (counter direset per hari)
- Duplicate detection window: 1 jam (env-driven via `RECAPTCHA_*` belum ada, hardcode 60 menit di model `findDuplicate()`)

**Akun MySQL**:
- Host: `127.0.0.1:3306`
- User: `root` (no password)
- Database: `sipesa`
- Source: Laragon MySQL 8.0.30 di `C:\laragon\bin\mysql\mysql-8.0.30-winx64\`

**Akun Login Aplikasi** (semua password = `password`):
- `superadmin@sipesa.test` — super_admin (full akses)
- `adminsd@sipesa.test` — admin_unit (SD)
- `kepala.sd@sipesa.test` — kepala_unit (SD, read-only)
- `kepala.smp@sipesa.test` — kepala_unit (SMP, read-only)
- `kepala.pusat@sipesa.test` — kepala_pusat (semua unit, read-only)
- `petugas@sipesa.test` — petugas
- `petugas2@sipesa.test` — petugas
- `siswa@sipesa.test` — siswa

### 🎯 Setelah Langkah 4 Selesai
Lanjut ke **Langkah 5–9 — Modul Publik Laporan Warga (Blade)**:
- Buat halaman publik `/laporan` (Blade murni, mobile-first, tanpa Inertia)
- Buat `/laporan/status` untuk cek status by nomor tiket
- Integrasi reCAPTCHA v3
- Pakai `PublicReport::findDuplicate()` sebelum insert
- Pakai `PublicReport::generateNomorTiket()` untuk nomor tiket

### 🎯 Stack Lengkap untuk REST API IoT
- Sanctum sudah terpasang (`HasApiTokens` trait di User), tapi untuk endpoint sensor publik kita tidak pakai user token — pakai `device_token` custom dari tabel `iot_devices`
- Helper sudah siap: `IotDevice::makeToken($length)`, `$device->isOnline()`
- TrashBin sudah punya accessor `status_by_persentase` (tinggal pakai sebagai source of truth)

### ⚙️ Command Cepat untuk Sesi Baru

```powershell
# Start MySQL Laragon (jika belum running)
Start-Process -FilePath "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysqld.exe" -ArgumentList "--standalone","--port=3306","--datadir=C:\laragon\data\mysql-8" -WindowStyle Hidden

# Cek koneksi DB Laravel
php artisan db:show --database=mysql

# Migrate fresh + seed (setelah model & seeder selesai)
php artisan migrate:fresh --seed --force

# Smoke test tinker
php artisan tinker --execute="echo App\Models\TrashBin::count();"

# Build assets
npm run build
```
