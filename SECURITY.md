# Security Policy — SiPeSa

## Reporting a Vulnerability

Kami sangat menghargai keamanan proyek ini. Jika Anda menemukan kerentanan keamanan, harap laporkan dengan cara berikut:

**JANGAN** membuat issue publik di GitHub untuk kerentanan keamanan.

Sebagai gantinya, kirim laporan ke alamat email: `security@sipesa.dev` atau buka **Security Advisory** di repository GitHub.

### Apa yang perlu disertakan:

- Deskripsi kerentanan
- Langkah reproduksi
- Versi yang terpengaruh
- Dampak potensial
- Saran perbaikan (jika ada)

### Proses:

1. **Laporan diterima** — Tim akan merespon dalam 48 jam
2. **Verifikasi** — Tim akan memverifikasi kerentanan
3. **Perbaikan** — Patch akan dikembangkan
4. **Rilis** — Versi baru akan dirilis dengan perbaikan
5. **Publikasi** — Setelah patch dirilis, kerentanan akan dipublikasikan

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅ Aktif   |
| < 1.0   | ❌ Tidak   |

## Best Practices

Sebagai pengguna SiPeSa, kami merekomendasikan:

1. Selalu gunakan versi terbaru
2. Jangan pernah membagikan `.env` atau credential
3. Gunakan HTTPS di production
4. Atur permission file dengan benar
5. Backup database secara rutin
6. Gunakan password yang kuat untuk semua akun

## Disclosure Policy

- Kerentanan akan diumumkan setelah patch tersedia
- Kredit akan diberikan kepada pelapor (jika diinginkan)
- Informasi sensitif akan diredaksi

---

Terima kasih telah membantu menjaga SiPeSa tetap aman! 🔒
