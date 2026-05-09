# Berkontribusi pada SiPeSa

Terima kasih atas ketertarikan Anda untuk berkontribusi pada **SiPeSa**! Kami sangat menghargai kontribusi dari komunitas.

## Cara Berkontribusi

### 1. Laporkan Bug

Jika Anda menemukan bug, buka **Issue** di repository GitHub dengan format:

```
**Judul:** [Bug] Deskripsi singkat

**Deskripsi:**
Penjelasan detail tentang bug.

**Langkah Reproduksi:**
1. Buka halaman ...
2. Klik tombol ...
3. Error muncul ...

**Screenshot:**
(Lampirkan jika ada)

**Environment:**
- OS: Windows/macOS/Linux
- PHP: 8.2.x
- Browser: Chrome/Firefox
```

### 2. Ajukan Fitur Baru

Untuk fitur baru, buka **Issue** dengan label `enhancement`:

```
**Judul:** [Feature] Nama Fitur

**Deskripsi:**
Jelaskan fitur yang diinginkan.

**Manfaat:**
Mengapa fitur ini penting?

**Alternatif:**
Apakah ada solusi lain?
```

### 3. Pull Request

#### Proses:

1. Fork repository
2. Buat branch baru:
   - `feature/nama-fitur` — untuk fitur baru
   - `fix/nama-bug` — untuk perbaikan bug
   - `docs/perbaikan` — untuk dokumentasi
3. Commit dengan pesan yang jelas:
   - `feat: menambahkan fitur X`
   - `fix: memperbaiki bug Y`
   - `docs: update README`
4. Push ke branch Anda
5. Buka Pull Request ke branch `main`

#### Standar Kode:

- Ikuti **PSR-12** untuk PHP
- Gunakan **Prettier** untuk JavaScript/JSX
- Gunakan **ESLint** untuk kode React
- Tulis komentar untuk fungsi yang kompleks
- Tambahkan test untuk fitur baru jika memungkinkan

#### Commit Convention:

| Prefix | Keterangan |
|--------|------------|
| `feat:` | Fitur baru |
| `fix:` | Perbaikan bug |
| `refactor:` | Refaktor kode |
| `style:` | Perubahan styling (CSS, UI) |
| `docs:` | Update dokumentasi |
| `test:` | Penambahan test |
| `chore:` | Tugas maintenance |

#### Sebelum Pull Request:

- [ ] Kode sudah di-test
- [ ] Tidak ada error linting
- [ ] Tidak ada file sensitif (`.env`, credentials)
- [ ] Dokumentasi sudah diupdate jika perlu

## Development Setup

```bash
# Clone repo
git clone https://github.com/username/sipesa.git
cd sipesa

# Install dependencies
composer install
npm install

# Copy environment
cp .env.example .env

# Generate key
php artisan key:generate

# Database
php artisan migrate --seed

# Build & run
npm run dev
php artisan serve
```

## Testing

```bash
# PHP Tests
php artisan test

# Laravel Pint (Code Style)
./vendor/bin/pint

# ESLint
npx eslint resources/js
```

## Struktur Branch

```
main (production-ready)
  └── develop (staging)
       ├── feature/*
       ├── fix/*
       └── docs/*
```

## Hubungi

Jika ada pertanyaan, buka Issue di repository atau hubungi maintainer.

---

Terima kasih telah berkontribusi! 🎉
