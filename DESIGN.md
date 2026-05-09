---
name: SiPeSa
description: Sistem informasi pengelolaan sampah — menghubungkan warga, petugas, dan admin dalam satu sistem yang transparan dan mudah digunakan.
colors:
  nature-green: "#16a34a"
  deep-forest: "#15803d"
  fresh-shoot: "#22c55e"
  warm-chalk: "#f9fafb"
  river-stone: "#f3f4f6"
  cloud-ash: "#d1d5db"
  muted-earth: "#6b7280"
  grounded-charcoal: "#374151"
  earth-heading: "#111827"
  field-indigo: "#6366f1"
  earth-red: "#dc2626"
typography:
  display:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 700
    lineHeight: 1.25
  headline:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 700
    lineHeight: 1.375
  title:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 600
    lineHeight: 1.375
  body:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 500
    lineHeight: 1.25
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  3xl: "48px"
  4xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.nature-green}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.deep-forest}"
  button-primary-active:
    backgroundColor: "#14532d"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.grounded-charcoal}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  button-ghost-hover:
    backgroundColor: "{colors.river-stone}"
  button-danger:
    backgroundColor: "{colors.earth-red}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  input:
    backgroundColor: "#ffffff"
    textColor: "{colors.earth-heading}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  card:
    backgroundColor: "#ffffff"
    rounded: "{rounded.xl}"
    padding: "24px"
---

# Design System: SiPeSa

## 1. Overview

**Creative North Star: "Posko Warga"**

SiPeSa adalah posko gotong royong di sudut taman perumahan — tempat warga melapor, petugas memeriksa jadwal, admin memantau operasional. Bukan kantor dinas yang kaku, bukan aplikasi startup yang mengkilap. Hangat, fungsional, dan terasa milik bersama.

Sistem visual bertumpu pada kehangatan warna tanah dan dedaunan alami. Tidak ada latar putih steril — setiap permukaan membawa sedikit warna bumi. Tidak ada bayangan berlapis — kedalaman dibangun dari perbedaan warna latar, bukan dari drop shadow. Tombol bulat penuh dan lapang, siap disentuh oleh petugas bersarung tangan maupun warga lansia. Semua elemen terasa seperti bagian dari lingkungan fisik yang sama: satu posko, satu komunitas.

Sistem ini menolak tiga hal: kekakuan birokrasi (tabel abu-abu tak berujung, form bertumpuk, nada surat dinas), kilau startup (glassmorphism, gradien neon, dark mode cyberpunk), dan klise eco-brand (ikon daun di mana-mana, palet hijau-putih generik, retorika kosong).

**Key Characteristics:**
- Palet hangat bersumber dari warna tanah dan dedaunan alami; tidak ada putih murni (#fff)
- Elevasi tonal — perbedaan warna menggantikan bayangan sebagai pembeda lapisan
- Komponen bulat penuh dan lapang — minimal 44px target sentuh
- Tipografi tunggal (Figtree) dengan kontras berat sebagai pembentuk hierarki
- Hijau muncul di titik keputusan, bukan sebagai dekorasi latar

## 2. Colors

Palet bersumber dari alam tropis yang hangat: hijau daun basah sebagai aksen utama, abu-abu hangat bernuansa kapur dan batu sungai sebagai netral, indigo lapangan sebagai sinyal interaktif, dan merah tanah sebagai peringatan.

### Primary
- **Daun Basah** (`#16a34a`, `nature-green`): Warna aksi utama — tombol primer, tautan aktif, ikon nav aktif. Muncul di titik keputusan, bukan sebagai dekorasi.
- **Lumut Tua** (`#15803d`, `deep-forest`): Hover dan active state dari tombol primer. Latar gradien CTA section.
- **Pucuk Muda** (`#22c55e`, `fresh-shoot`): Lingkaran logo, langkah-langkah, aksen minor. Digunakan pada elemen identitas, bukan tombol.

### Neutral
- **Kapur Hangat** (`#f9fafb`, `warm-chalk`): Latar halaman dan section. Bukan putih murni — membawa 0.01 chroma hijau yang nyaris tak terlihat.
- **Batu Sungai** (`#f3f4f6`, `river-stone`): Latar kartu dan section alternatif. Pembedaan tonal dari kapur hangat tanpa memerlukan border.
- **Abu Awan** (`#d1d5db`, `cloud-ash`): Border ringan pada input, kartu, dan divider.
- **Tanah Lembab** (`#6b7280`, `muted-earth`): Teks sekunder, placeholder, ikon tidak aktif.
- **Arang Hangat** (`#374151`, `grounded-charcoal`): Teks body dan label. Kontras cukup terhadap latar tanpa kekerasan hitam murni.
- **Batu Bata** (`#111827`, `earth-heading`): Heading dan teks kuat. Paling gelap dalam palet, bukan #000.

### Interactive
- **Indigo Lapangan** (`#6366f1`, `field-indigo`): Focus ring, border aktif pada input, indikator nav aktif. Hanya muncul sebagai respons terhadap interaksi.

### Danger
- **Merah Tanah** (`#dc2626`, `earth-red`): Tombol hapus, teks error, status ditolak. Satu-satunya warna di luar palet hijau-tanah.

### Named Rules

**The Grounded Green Rule.** Hijau primer muncul pada 10–15% maksimal dari setiap layar. Ia menandai aksi dan kehadiran brand, bukan dekorasi. Tidak disebar sebagai latar, tidak dipakai sebagai warna teks body. Kehadirannya yang terbatas adalah kekuatannya.

**The No Pure White Rule.** Tidak ada #fff dan tidak ada #000 di seluruh sistem. Setiap netral sedikit condong ke hijau tanah (chroma 0.005–0.01). Bahkan latar kartu membawa bisikan bumi.

**The Tonal Depth Rule.** Lapisan dibedakan oleh perbedaan warna latar (warm-chalk → river-stone → white-ish), bukan oleh shadow. Shadow hanya muncul sebagai respons terhadap state: hover, active, atau modal overlay.

## 3. Typography

**Font:** Figtree (weights 400, 500, 600, 700 dari Bunny Fonts)
**Fallback:** ui-sans-serif, system-ui, sans-serif

**Character:** Figtree adalah grotesque hangat yang menjembatani profesionalisme dan keramahan. Lengkungan terbuka dan x-height besar membuatnya terbaca jelas di layar kecil petugas lapangan maupun desktop admin. Satu typeface untuk seluruh sistem — hierarki dibangun dari perbedaan berat dan ukuran, bukan dari pergantian font.

### Hierarchy
- **Display** (700, clamp(2.25rem, 5vw, 3rem), 1.25): Hero heading di landing page. Muncul sekali per halaman, selalu dikawinkan dengan aksen hijau pada kata kunci.
- **Headline** (700, 1.875rem / clamp(1.5rem, 3vw, 1.875rem), 1.375): Judul section (Fitur Unggulan, Cara Kerja). Kontras kuat terhadap body.
- **Title** (600, 1.25rem, 1.375): Judul halaman dashboard, profil, judul kartu fitur. Semibold untuk membedakan dari headline tanpa kehilangan otoritas.
- **Body** (400, 0.875rem–1rem, 1.5): Teks paragraf, deskripsi, isi kartu. Maksimal 65 karakter per baris. Ukuran 0.875rem (text-sm) adalah default body karena mayoritas pengguna membaca di layar mobile.
- **Label** (500, 0.875rem, 1.25): Label form, nav link, tombol, badge. Medium weight untuk visibilitas tanpa bersaing dengan heading.

### Named Rules

**The Weight Gap Rule.** Dua tingkat hierarki yang bersebelahan harus berbeda minimal satu step berat (400→500, 500→600, 600→700). Jangan pernah menyusun dua label medium (500) berdampingan sebagai heading dan subheading.

**The One Font Rule.** Figtree adalah satu-satunya typeface. Tidak ada font kedua untuk kode, tidak ada serif untuk kutipan, tidak ada mono untuk data. Kontras dibangun dari skala dan berat, bukan dari tipe.

## 4. Elevation

Sistem ini flat secara tonal — kedalaman dibangun dari perbedaan warna latar, bukan dari drop shadow. Ini pilihan yang disengaja: petugas lapangan membaca layar di bawah sinar matahari, dan shadow tidak terbaca di outdoor. Warga lansia tidak perlu membedakan lapisan dari bayangan yang bisa membingungkan.

**Mode istirahat:** Semua permukaan rata. Kartu, input, dan tombol dibedakan dari latar hanya oleh warna (river-stone vs warm-chalk, atau white vs river-stone).

**Mode respons:** Shadow muncul hanya sebagai sinyal interaksi — hover mengangkat kartu (shadow-md), tombol primer membawa pancaran hijau lembut (shadow-lg dengan warna hijau), modal overlay menggunakan shadow-xl untuk memisahkan dari halaman di bawahnya.

### Shadow Vocabulary
- **ambient-sm** (`0 1px 2px 0 rgba(0,0,0,0.05)`): Navbar sticky, hover ringan pada kartu. Hampir tak terlihat.
- **ambient-md** (`0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)`): Kartu saat hover, kartu tamu di halaman login.
- **elevated-lg** (`0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)`): Tombol CTA, dropdown, lingkaran langkah.
- **overlay-xl** (`0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)`): Modal dialog saja.

### Named Rules

**The Flat-By-Default Rule.** Permukaan rata saat diam. Shadow muncul hanya sebagai respons terhadap state (hover, focus, modal). Tidak ada kartu yang membawa shadow saat istirahat — gunakan perbedaan warna latar untuk membedakan lapisan.

**The Green Glow Rule.** Shadow pada tombol primer menggunakan warna hijau (shadow-green-200), bukan hitam. Pancaran lembut ini memperkuat hierarki aksi tanpa menambah bobot visual.

## 5. Components

### Buttons

**Character:** Bulat penuh, lapang, taktis. Setiap tombol memiliki target sentuh minimal 44px — petugas bersarung tangan bisa menekan tanpa salah. Teks menggunakan sentence case (bukan all-caps), medium weight, tanpa tracking lebar. Bukan tombol enterprise yang berteriak.

- **Shape:** rounded-full (9999px)
- **Primary:** `nature-green` bg, white text, padding 12px 24px. Bayangan hijau lembut saat hover. Transisi 150ms ease-out.
- **Hover / Focus:** `deep-forest` bg. Focus ring 2px `field-indigo` dengan offset 2px.
- **Active:** `#14532d` bg (lebih dalam dari deep-forest).
- **Ghost:** Transparan, `grounded-charcoal` text. Hover: `river-stone` bg. Untuk aksi sekunder di samping primary.
- **Danger:** `earth-red` bg, white text. Hanya untuk aksi destruktif (hapus akun, tolak laporan). Harus selalu dikawinkan dengan konfirmasi eksplisit.

### Cards / Containers

**Character:** Lembut, tidak menonjol. Latar putih di atas river-stone tanpa border tebal. Sudut melengkung 12px — cukup untuk terasa ramah, tidak terlalu bulat hingga kehilangan struktur.

- **Corner Style:** rounded-xl (12px)
- **Background:** white di atas river-stone section bg
- **Border:** 1px `cloud-ash` hanya saat diperlukan untuk membedakan dari latar putih
- **Internal Padding:** 24px (p-6)
- **Elevation:** Flat saat istirahat. shadow-md saat hover sebagai satu-satunya sinyal interaksi.

### Inputs / Fields

**Character:** Ringan, responsif. Border `cloud-ash` saat diam, bergeser ke `field-indigo` saat fokus. Tidak ada bayangan saat istirahat.

- **Shape:** rounded-md (6px)
- **Background:** white
- **Border:** 1px `cloud-ash`
- **Focus:** Border dan ring 2px `field-indigo`
- **Error:** Teks error `earth-red`, 0.875rem, muncul di bawah input dengan margin-top 8px
- **Label:** `grounded-charcoal`, 0.875rem, medium weight, margin-bottom 4px

### Navigation

**Character:** Minimal, tenang. Navbar sticky putih dengan border bawah 1px river-stone — bukan shadow. Tidak mencuri perhatian dari konten.

- **Desktop Nav:** Link horizontal, `grounded-charcoal` text (inactive) → `nature-green` (active). Transisi warna 150ms ease-out. Active state ditandai oleh warna, bukan border-bawah.
- **Mobile Nav:** Muncul dari samping dengan border-l-4 `field-indigo` pada link aktif. Latar `field-indigo`/50 pada item aktif, `river-stone` pada hover.
- **User Menu:** Tombol avatar dengan chevron. Dropdown muncul sebagai panel putih dengan shadow-lg, rounded-md, ring 1px hitam 5% opacity.

### Stats & Metrics

**Character:** Komunitas, bukan dashboard enterprise. Angka besar (text-2xl, bold) dengan label kecil di bawahnya. Setiap stat dikawinkan dengan ikon dalam lingkaran latar hijau muda — bukan sekadar angka mentah.

- **Stat Card:** Lingkaran ikon (48px, rounded-full, `green-50` bg), angka (text-2xl, bold, `earth-heading`), label (text-sm, medium, `grounded-charcoal`), sublabel (text-xs, `muted-earth`).

### Status Badges

**Character:** Bulat penuh, ringkas, informatif. Latar hijau muda dengan teks hijau tua. Bukan pill Bootstrap, bukan chip Material.

- **Shape:** rounded-full
- **Style:** `green-200` bg, `green-800` text, 0.875rem, medium weight, padding 4px 16px

## 6. Do's and Don'ts

### Do:
- **Do** gunakan `rounded-full` sebagai radius default untuk semua tombol aksi — ini tanda "bisa ditekan" yang paling jelas untuk semua usia dan kondisi
- **Do** pastikan setiap target sentuh minimal 44x44px — petugas bersarung tangan dan warga lansia harus bisa menekan tanpa presisi
- **Do** bedakan lapisan dengan warna latar (warm-chalk → river-stone → white), bukan dengan shadow — shadow tidak terbaca di outdoor
- **Do** gunakan hijau (`nature-green`) hanya pada titik keputusan: tombol utama, tautan aktif, ikon nav. Bukan sebagai dekorasi latar
- **Do** pakai sentence case untuk semua teks tombol dan label — "Laporkan sampah", bukan "LAPORKAN SAMPAH"
- **Do** gunakan Figtree di semua tingkat hierarki — kontras dari berat dan ukuran, bukan dari pergantian font
- **Do** beri bayangan hijau (`shadow-green-200`) pada tombol primer saat hover — pancaran lembut yang memperkuat aksi tanpa bobot visual
- **Do** gunakan bahasa Indonesia yang natural dan ramah di semua copy — "Halo, Sudirman" bukan "Selamat Datang, Pengguna"

### Don't:
- **Don't** gunakan warna putih murni (#fff) atau hitam murni (#000) — selalu tint ke arah hijau tanah (warm-chalk untuk "putih", earth-heading untuk "hitam")
- **Don't** gunakan border-left atau border-right lebih dari 1px sebagai aksen berwarna pada kartu, list item, atau alert
- **Don't** gunakan glassmorphism, backdrop-blur, atau efek kaca — ini bukan aplikasi startup
- **Don't** gunakan gradien sebagai teks (background-clip: text) — gunakan warna solid tunggal
- **Don't** gunakan tabel abu-abu tak berujung — ringkas data ke dalam kartu atau list yang bisa di-scan cepat
- **Don't** gunakan form bertumpuk dengan puluhan field — pecah ke dalam langkah-langkah atau wizard singkat
- **Don't** gunakan ikon daun di mana-mana sebagai dekorasi — ini klise eco-brand. Satu ikon sistem sudah cukup
- **Don't** gunakan palet hijau-putih generik yang berteriak "aplikasi lingkungan" — hangatkan dengan warna tanah dan batu
- **Don't** gunakan dark mode neon, gradien ungu-biru, atau estetika cyberpunk
- **Don't** gunakan modal sebagai solusi pertama — gunakan inline expansion, sheet, atau navigasi langsung
- **Don't** gunakan kartu identik dalam grid 5-kolom tanpa variasi — bedakan ukuran, warna, atau konten untuk menciptakan ritme
