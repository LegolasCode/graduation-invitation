# Undangan Wisuda Online — Tema Musim Dingin ❄️🌲

Web undangan wisuda online, dibangun dengan **HTML + Tailwind CSS (CDN) + Vanilla JS**,
terintegrasi dengan **Google Spreadsheet** (lewat Google Apps Script) untuk menyimpan
daftar tamu, link personal, serta ucapan & doa dari buku tamu.

---

## 1. Struktur Project

```
undangan-wisuda/
├── index.html              # Halaman utama undangan (semua 7 section)
├── admin.html               # Halaman admin: tambah tamu & generate link
├── assets/
│   ├── css/
│   │   └── style.css        # Animasi amplop, salju, ilustrasi gunung & pinus
│   ├── js/
│   │   ├── config.js        # << SEMUA DATA YANG PERLU DIUBAH ADA DI SINI
│   │   ├── content.js       # Mengisi teks statis dari config.js ke HTML
│   │   ├── snow.js          # Efek salju jatuh
│   │   ├── envelope.js      # Logika buka amplop + auto scroll
│   │   ├── countdown.js     # Kalender & countdown hari-H
│   │   ├── gallery.js       # Galeri foto + lightbox
│   │   ├── sheets-api.js    # Komunikasi ke Google Spreadsheet
│   │   ├── guestbook.js     # Form & daftar ucapan/doa
│   │   ├── guest-link.js    # Sapaan nama tamu dari link personal (?to=)
│   │   ├── admin.js         # Logika halaman admin.html
│   │   └── main.js          # Entry point, menjalankan semua module
│   └── images/
│       ├── bg-hero.jpg      # Foto besar background hero (GANTI dengan fotomu)
│       └── gallery/         # Taruh foto semester 1-8 di sini
└── google-apps-script/
    └── Code.gs              # Backend — dideploy sebagai Google Apps Script Web App
```

**Kamu HANYA perlu mengedit `assets/js/config.js`** untuk mengganti nama, tanggal,
lokasi, foto, dsb. File-file JS lain berisi logika/fungsi dan tidak perlu diubah
kecuali kamu ingin mengubah perilaku/tampilannya.

---

## 2. Setup Google Apps Script (backend spreadsheet)

Karena Google Sheets API resmi butuh API key/OAuth yang tidak aman jika ditaruh
di kode JS publik, kita pakai **Google Apps Script Web App** sebagai jembatan.

### Langkah-langkah:

1. Buka [Google Sheets](https://sheets.google.com), buat spreadsheet baru
   (mis. "Data Undangan Wisuda"). Sheet "Tamu" dan "Ucapan" akan **dibuat
   otomatis** oleh script saat pertama kali dipakai — kamu tidak perlu bikin manual.
2. Di spreadsheet, klik **Extensions > Apps Script**.
3. Hapus kode default (`myFunction`), lalu **copy-paste seluruh isi**
   `google-apps-script/Code.gs` ke editor tersebut.
4. Di bagian atas file, ubah 2 konfigurasi ini:
   ```js
   const ADMIN_KEY = 'GANTI_DENGAN_KUNCI_RAHASIA_KAMU';   // bebas, contoh: 'wisuda2026rahasia'
   const BASE_URL  = 'GANTI_DENGAN_URL_HOSTING_UNDANGAN_KAMU'; // isi setelah kamu hosting (langkah 4)
   ```
5. Klik **Deploy > New deployment**.
   - Klik ikon gear ⚙️ di samping "Select type" → pilih **Web app**.
   - **Execute as**: `Me`
   - **Who has access**: `Anyone` (supaya bisa diakses dari browser tamu manapun)
   - Klik **Deploy**, lalu **Authorize access** (izinkan akses ke akun Google-mu).
6. Salin **Web App URL** yang muncul (formatnya seperti
   `https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXX/exec`).
7. Paste URL tersebut ke `assets/js/config.js`:
   ```js
   api: {
     appsScriptUrl: "https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXX/exec",
   },
   ```

> **Catatan:** Setiap kali kamu mengedit `Code.gs`, kamu harus membuat
> **New deployment** lagi (atau "Manage deployments" > edit versi) supaya
> perubahan ikut ter-deploy — sekadar Save saja tidak cukup.

---

## 3. Hosting halaman web

Karena project ini murni HTML/CSS/JS tanpa build step, kamu bisa hosting gratis di:

- **GitHub Pages** — push folder ini ke repo GitHub, aktifkan Pages di Settings.
- **Netlify / Vercel** — drag & drop folder project ke dashboard mereka.
- **Firebase Hosting**.

Setelah dapat URL hosting (mis. `https://namakamu.github.io/undangan-wisuda`),
**update `BASE_URL` di Code.gs** (langkah 2.4 di atas) lalu deploy ulang, supaya
link personal yang digenerate mengarah ke URL yang benar.

---

## 4. Cara pakai halaman Admin (generate link per tamu)

1. Buka `admin.html` (mis. `https://domainkamu.com/admin.html`).
2. Masukkan **Admin Key** yang sama dengan `ADMIN_KEY` di `Code.gs`.
3. Isi nama tamu di form "Tambah Tamu Baru" → klik **Generate Link**.
4. Link personal (`.../index.html?to=TOKEN`) langsung muncul, tinggal klik
   **Salin** lalu kirim ke tamu bersangkutan lewat WhatsApp/dsb.
5. Semua tamu yang pernah ditambahkan bisa dilihat di tabel **Daftar Tamu**,
   lengkap dengan status "Sudah Dibuka" / "Belum Dibuka" (otomatis tercatat
   saat tamu membuka link undangannya).

> Admin Key disimpan di `localStorage` browser kamu supaya tidak perlu
> login ulang setiap kali buka `admin.html`. Ini pengaman sederhana, **bukan**
> sistem login yang aman untuk skala besar — jangan sebar URL admin + key ke publik.

---

## 5. Kustomisasi konten

Semua bisa diubah di **`assets/js/config.js`**:

| Bagian | Yang bisa diubah |
|---|---|
| `wisudawan` | Nama, gelar, fakultas, universitas, foto profil & foto hero |
| `undangan` | Judul & isi ucapan undangan (section 2) |
| `acara` | Tanggal & jam acara (dipakai kalender + countdown) |
| `lokasi` | Nama tempat, alamat, link Google Maps embed & link biasa |
| `galeri` | Path foto & caption tiap semester (1-8) |
| `footer` | Ucapan terima kasih, quote, username & link Instagram |
| `api.appsScriptUrl` | URL Web App dari langkah setup di atas |

### Mengganti foto profil & foto hero
Taruh foto lingkaran di `assets/images/profile-photo.jpg` dan foto besar
background hero di `assets/images/bg-hero.jpg` (path ini bisa diubah lewat
`wisudawan.fotoProfil` / `wisudawan.fotoBackground` di `config.js`). Sebelum
foto diganti, halaman otomatis menampilkan gambar placeholder sementara.

### Mengganti foto galeri
Taruh 8 foto di `assets/images/gallery/` dengan nama `semester1.jpg` s/d
`semester8.jpg` (atau ubah nama filenya di `config.js`). Selama file belum
ada, thumbnail otomatis memakai gambar placeholder sementara.

### Mengganti link Google Maps
Buka Google Maps → cari lokasi → **Share > Embed a map** → copy value
`src="..."` ke `mapsEmbedUrl`. Untuk `mapsLinkUrl`, pakai link share biasa
(tombol "Buka di Google Maps").

---

## 6. Menjalankan secara lokal

Karena file di-load lewat `fetch`/module JS biasa, buka langsung lewat
`file://` bisa kena batasan CORS di beberapa browser. Disarankan jalankan
local server sederhana, misalnya:

```bash
# Python
python3 -m http.server 8000

# lalu buka http://localhost:8000/index.html
```

---

## 7. Catatan teknis tambahan

- **Tidak ada proses build** (tidak butuh `npm install`) — tinggal edit file
  HTML/CSS/JS lalu upload ke hosting.
- Background "gunung salju" (section ucapan → lokasi) dan "hutan pinus"
  (section buku tamu → footer) dibuat dari SVG polygon di `index.html`,
  bukan foto, supaya halaman tetap ringan dan warnanya mudah disesuaikan
  lewat CSS variable di `assets/css/style.css`.
- File `bg-hero.jpg` bawaan berukuran besar (~12MB) — sangat disarankan
  diganti dengan foto asli wisudawan yang sudah dikompres (idealnya di
  bawah 500KB) supaya halaman cepat dimuat.
- Semua input dari user (nama & pesan di buku tamu) di-escape sebelum
  ditampilkan ke halaman untuk mencegah XSS sederhana.
