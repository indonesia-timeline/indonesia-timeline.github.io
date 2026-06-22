# 🏛️ Arsip Sejarah Indonesia — Interaktif

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deployed-success?logo=github)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

**Arsip Sejarah Indonesia** adalah website arsip digital interaktif yang memungkinkan pengguna menjelajahi peristiwa-peristiwa penting dalam sejarah Indonesia melalui **peta interaktif**, **timeline visual**, dan **arsip digital yang dapat dicari**. Dibangun sepenuhnya dengan vanilla JavaScript tanpa framework atau backend.

### ✨ Fitur Unggulan

| Fitur | Deskripsi |
|-------|-----------|
| 🗺️ **Peta Interaktif** | Jelajahi peristiwa sejarah berdasarkan lokasi geografis di seluruh Indonesia menggunakan Leaflet.js |
| 📈 **Timeline Visual** | Lihat peristiwa dalam linimasa vertikal interaktif yang dibuat dengan D3.js, lengkap dengan filter era & kategori |
| 🔍 **Pencarian & Filter** | Cari peristiwa, filter berdasarkan era, kategori, provinsi, dan tahun secara real-time |
| 📋 **Citation Cards** | Setiap peristiwa dilengkapi sumber, tahun, provinsi, dan link referensi |
| 📱 **Responsif** | Tampilan optimal di desktop, tablet, dan mobile |
| 🌙 **Dark Theme** | Tampilan dark mode elegan dengan aksen emas & merah |

---

## 📋 Daftar Isi

- [Struktur Proyek](#struktur-proyek)
- [Tech Stack](#tech-stack)
- [Cara Menjalankan Lokal](#cara-menjalankan-lokal)
- [Deploy ke GitHub Pages](#deploy-ke-github-pages)
  - [Opsi 1: User Site (username.github.io)](#opsi-1-user-site-usernamegithubio)
  - [Opsi 2: Project Site (username.github.io/repo-name)](#opsi-2-project-site-usernamegithubiorepo-name)
  - [Opsi 3: Custom Domain](#opsi-3-custom-domain)
- [Konfigurasi BASE_URL](#konfigurasi-base_url)
- [GitHub Actions — Auto Deploy](#github-actions--auto-deploy)
- [Panduan Kontribusi Data](#panduan-kontribusi-data)
  - [Format Data JSON](#format-data-json)
  - [Kategori & Era yang Tersedia](#kategori--era-yang-tersedia)
  - [Panduan Koordinat](#panduan-koordinat)
  - [Checklist Kontribusi](#checklist-kontribusi)
- [Troubleshooting](#troubleshooting)
- [Lisensi](#lisensi)

---

## 📁 Struktur Proyek

```
arsip-sejarah-indonesia/
│
├── index.html                 # Halaman utama (di root)
├── .nojekyll                  # Nonaktifkan Jekyll (wajib untuk GitHub Pages)
├── .github/workflows/
│   └── deploy.yml             # GitHub Actions — auto deploy
│
├── assets/
│   ├── css/
│   │   └── style.css          # Semua styling (dark theme, responsif)
│   └── js/
│       ├── data.js            # Load & filter data JSON
│       ├── map.js             # Peta interaktif Leaflet.js
│       ├── timeline.js        # Timeline D3.js
│       └── app.js             # Integrasi utama
│
├── data/
│   └── events.json            # Data peristiwa sejarah (50+ event)
│
└── libs/
    └── README.md              # Panduan backup library CDN (opsional)
```

> **Catatan:** Semua path menggunakan **relative path**. Tidak ada absolute path seperti `/css/style.css` — melainkan `assets/css/style.css`. Hal ini penting agar website tetap berfungsi di subpath GitHub Pages.

---

## 🛠 Tech Stack

Proyek ini **zero build tools** — tidak ada npm, webpack, atau bundle step. Semua library di-load via CDN.

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| [Leaflet.js](https://leafletjs.com/) | 1.9.4 | Peta interaktif (CDN: `unpkg.com`) |
| [D3.js](https://d3js.org/) | v7 | Visualisasi timeline (CDN: `d3js.org`) |
| [Font Awesome](https://fontawesome.com/) | 6.5.1 | Ikon (CDN: `cdnjs.cloudflare.com`) |
| [Google Fonts](https://fonts.google.com/) | — | Inter + Playfair Display |
| Fetch API | Native | Load data JSON eksternal |

Semua library di-load langsung dari CDN di `<head>` `index.html`:

```html
<!-- Leaflet.js -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<!-- D3.js -->
<script src="https://d3js.org/d3.v7.min.js"></script>

<!-- Font Awesome -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
```

---

## 🚀 Cara Menjalankan Lokal

Karena ini static site murni, kamu bisa langsung buka `index.html` di browser.

### Via File Browser

```bash
cd arsip-sejarah-indonesia
# Buka index.html langsung di browser (double-click)
```

### Via Local Server (Direkomendasikan)

Beberapa browser mungkin memblokir fetch request `file://`. Gunakan server lokal:

```bash
# Pakai Python (built-in)
python3 -m http.server 8080 --directory .
# Buka: http://localhost:8080

# Atau pakai Node.js (npx)
npx serve .
# Buka: http://localhost:3000
```

### Uji Coba di Lokal dengan Base URL

Untuk mensimulasikan subpath GitHub Pages secara lokal:

```bash
# Simulasi subpath /arsip-sejarah-indonesia/
mkdir -p /tmp/test-site
cp -r arsip-sejarah-indonesia /tmp/test-site/
cd /tmp/test-site
python3 -m http.server 8080
# Buka: http://localhost:8080/arsip-sejarah-indonesia/
```

---

## 🌐 Deploy ke GitHub Pages

### Opsi 1: User Site (`username.github.io`)

Ini skenario paling sederhana — website akan muncul di root domain.

**Langkah-langkah:**

1. **Buat repo** dengan nama `username.github.io` (ganti `username` dengan username GitHub-mu)
2. **Clone & push**:
   ```bash
   git clone https://github.com/username/username.github.io.git
   cd username.github.io
   # Copy semua file dari arsip-sejarah-indonesia/ ke sini
   cp -r ../arsip-sejarah-indonesia/* .
   git add .
   git commit -m "Initial commit: Arsip Sejarah Indonesia"
   git push origin main
   ```
3. **Aktifkan GitHub Actions**:
   - Buka repo di GitHub → **Settings** → **Pages**
   - Source: **GitHub Actions**
4. **Selesai!** Website akan live di `https://username.github.io`

**BASE_URL:** Biarkan `window.BASE_URL = ''` (default).

### Opsi 2: Project Site (`username.github.io/repo-name`)

Website akan muncul di subpath `/repo-name/`.

**Langkah-langkah:**

1. **Buat repo** dengan nama apapun (misal: `arsip-sejarah-indonesia`)
2. **Push ke GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/username/arsip-sejarah-indonesia.git
   git push -u origin main
   ```
3. **Aktifkan GitHub Pages**:
   - Buka repo → **Settings** → **Pages**
   - Source: **GitHub Actions**
4. **Konfigurasi BASE_URL**:
   - Edit `index.html` → set `window.BASE_URL = '/arsip-sejarah-indonesia';`
   - Commit & push perubahan
5. **Selesai!** Website akan live di `https://username.github.io/arsip-sejarah-indonesia/`

### Opsi 3: Custom Domain

Kamu ingin pakai domain sendiri seperti `sejarah.my.id`.

**Langkah-langkah:**

1. **Deploy dulu** ke GitHub Pages (ikuti Opsi 1 atau 2 di atas)
2. **Set custom domain**:
   - Buka repo → **Settings** → **Pages** → **Custom domain**
   - Masukkan domain kamu (misal: `sejarah.my.id`)
   - GitHub akan otomatis membuat file `CNAME`
3. **Konfigurasi DNS** (di penyedia domain kamu):
   - **Apex domain** (`sejarah.my.id`):
     ```
     A record → 185.199.108.153
     A record → 185.199.109.153
     A record → 185.199.110.153
     A record → 185.199.111.153
     AAAA record → 2606:50c0:8000::153
     AAAA record → 2606:50c0:8001::153
     AAAA record → 2606:50c0:8002::153
     AAAA record → 2606:50c0:8003::153
     ```
   - **Subdomain** (`www.sejarah.my.id`):
     ```
     CNAME → username.github.io
     ```
4. **BASE_URL:** Biarkan `window.BASE_URL = ''` (domain root)
5. **Tunggu propagasi DNS** (5 menit — 24 jam) lalu website live!

---

## ⚙️ Konfigurasi BASE_URL

`BASE_URL` memberi tahu JavaScript di mana data `data/events.json` berada. Ini penting untuk deployment ke subpath GitHub Pages.

### Dimana mengaturnya?

Buka `index.html`, cari bagian ini:

```html
<script>
    window.BASE_URL = '';
</script>
```

### Tabel Konfigurasi

| Skenario | Contoh URL | `BASE_URL` |
|----------|-----------|------------|
| User Site | `username.github.io` | `''` (default) |
| Custom Domain | `sejarah.my.id` | `''` (default) |
| Project Site | `username.github.io/arsip` | `'/arsip'` |
| Project Site (lain) | `username.github.io/sejarah-ri` | `'/sejarah-ri'` |

### Bagaimana cara kerjanya?

Di `assets/js/data.js`, fungsi `getDataPath()` menangani path secara otomatis:

```javascript
getDataPath(relativePath) {
    const base = window.BASE_URL || '';
    if (!base) {
        // Relative path — browser resolve otomatis
        return relativePath;  // → 'data/events.json'
    }
    if (!base.startsWith('/')) {
        return '/' + base + '/' + relativePath;
    }
    return base + '/' + relativePath;  // → '/repo-name/data/events.json'
}
```

> **PENTING:** Gunakan **relative path** (tanpa leading `/`) di `index.html` untuk file seperti `assets/css/style.css`. Absolute path seperti `/css/style.css` akan broken di subpath deployment. Proyek ini sudah menggunakan relative path semua ✅.

---

## 🤖 GitHub Actions — Auto Deploy

Setiap kali kamu push ke branch `main`, GitHub Actions akan otomatis:
1. **Checkout** repo kamu
2. **Upload seluruh file** sebagai artifact
3. **Deploy** ke GitHub Pages

### File Workflow

Lokasi: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Trigger Manual

Kamu juga bisa trigger deploy manual dari tab **Actions** → **Deploy to GitHub Pages** → **Run workflow**.

### Cek Status

1. Buka repo di GitHub
2. Klik tab **Actions**
3. Lihat workflow terbaru — centang hijau = sukses

---

## 📝 Panduan Kontribusi Data

Kontribusi data sangat terbuka! Kamu bisa menambahkan peristiwa sejarah baru dengan mengedit `data/events.json`.

### Format Data JSON

Setiap peristiwa memiliki struktur berikut:

```json
{
  "id": 51,
  "judul": "Nama Peristiwa",
  "tanggal": "1945-08-17",
  "tahun": 1945,
  "deskripsi": "Deskripsi singkat peristiwa (2-3 kalimat).",
  "koordinat": [-6.1714, 106.8273],
  "provinsi": "DKI Jakarta",
  "kategori": "Kemerdekaan",
  "era": "Revolusi",
  "sumber": "Nama Sumber Terpercaya",
  "link": "https://contoh.com/sumber"
}
```

### Field Reference

| Field | Tipe | Required | Deskripsi |
|-------|------|----------|-----------|
| `id` | Number | ✅ | Unique ID, increment dari ID terakhir |
| `judul` | String | ✅ | Nama peristiwa (maks 100 karakter) |
| `tanggal` | String | ✅ | Format: `YYYY-MM-DD`. Jika tanggal pasti tidak diketahui, gunakan estimasi (contoh: `1945-01-01`) |
| `tahun` | Number | ✅ | Tahun peristiwa (1900-2025) |
| `deskripsi` | String | ✅ | 2-3 kalimat menjelaskan peristiwa, penting, dan dampaknya |
| `koordinat` | Array | ✅ | `[latitude, longitude]`. Gunakan Google Maps untuk mencari koordinat |
| `provinsi` | String | ✅ | Provinsi tempat peristiwa terjadi. Gunakan `"-"` jika lokasi di luar negeri |
| `kategori` | String | ✅ | Salah satu dari 9 kategori yang tersedia |
| `era` | String | ✅ | Salah satu dari 7 era yang tersedia |
| `sumber` | String | ✅ | Nama sumber (museum, arsip, institusi). Cantumkan dengan benar |
| `link` | String | ✅ | URL referensi (pastikan link aktif dan relevan) |

### Kategori & Era yang Tersedia

#### Kategori

| Kategori | Warna | Contoh |
|----------|-------|--------|
| `Kemerdekaan` | 🟡 Emas | Proklamasi Kemerdekaan |
| `Pertempuran` | 🔴 Merah | Pertempuran Surabaya |
| `Diplomasi` | 🔵 Biru | KAA, ASEAN |
| `Pergerakan Nasional` | 🟢 Hijau | Sumpah Pemuda, Budi Utomo |
| `Politik` | 🟠 Oranye | G30S/PKI, Reformasi |
| `Perang Dunia` | ⚪ Abu-abu | PD II, Pendudukan Jepang |
| `Ekonomi` | 🟩 Toska | VOC, Pertamina |
| `Olahraga` | 🟣 Ungu | Asian Games 1962 |
| `Bencana` | 🔴 Gelap | Tsunami Aceh, COVID-19 |

#### Era (Urutan Kronologis)

| Era | Rentang Waktu | Warna |
|-----|--------------|-------|
| `Kolonial` | Sebelum 1900 | ⚪ Abu-abu |
| `Pergerakan` | 1900-1942 | 🟢 Hijau |
| `Revolusi` | 1945-1949 | 🔴 Merah |
| `Demokrasi` | 1950-1959 | 🔵 Biru |
| `Orde Lama` | 1959-1966 | 🟠 Oranye |
| `Orde Baru` | 1966-1998 | 🟣 Ungu |
| `Reformasi` | 1998-sekarang | 🟩 Toska |

### Panduan Koordinat

1. Buka [Google Maps](https://maps.google.com)
2. Cari lokasi peristiwa (contoh: "Lapangan IKADA Jakarta")
3. Klik kanan pada lokasi → pilih koordinat (akan tercopy)
4. Format: `[latitude, longitude]`
   - Latitude: nilai pertama (contoh: `-6.1714`)
   - Longitude: nilai kedua (contoh: `106.8273`)
5. Pastikan koordinat di Indonesia: latitude antara `-11` sampai `+6`, longitude antara `95` sampai `141`

**Contoh koordinat untuk setiap pulau besar:**

| Pulau | Kota | Koordinat |
|-------|------|-----------|
| Sumatera | Medan | `[3.5952, 98.6722]` |
| Jawa | Jakarta | `[-6.1754, 106.8272]` |
| Kalimantan | Balikpapan | `[-1.2667, 116.8333]` |
| Sulawesi | Makassar | `[-5.1477, 119.4327]` |
| Bali | Denpasar | `[-8.6500, 115.2167]` |
| NTT | Kupang | `[-10.1772, 123.6070]` |
| Maluku | Ambon | `[-3.6981, 128.1829]` |
| Papua | Jayapura | `[-2.5361, 140.5092]` |

### Checklist Kontribusi

Sebelum submit pull request, pastikan:

- [ ] Data JSON valid (tidak ada syntax error)
- [ ] `id` unik dan increment
- [ ] `judul` ditulis dengan benar (EYD)
- [ ] `tanggal` format `YYYY-MM-DD`
- [ ] `tahun` sesuai dengan tanggal
- [ ] `deskripsi` informatif, 2-3 kalimat
- [ ] `koordinat` akurat (cek di Google Maps)
- [ ] `provinsi` menggunakan nama resmi (38 provinsi)
- [ ] `kategori` dan `era` sesuai daftar
- [ ] `sumber` terpercaya (bukan blog/forum)
- [ ] `link` aktif dan valid
- [ ] Jalankan `python3 -m json.tool data/events.json` untuk validasi JSON

---

## 🔧 Troubleshooting

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| **Peta tidak muncul** | API key / CDN | Semua Leaflet via CDN gratis, tidak perlu API key. Cek koneksi internet. |
| **Data tidak termuat** | Path salah | Cek `window.BASE_URL` di `index.html`. Untuk subpath, `BASE_URL` harus diisi. |
| **404 setelah deploy** | Jekyll aktif | Pastikan file `.nojekyll` ada di root repo. |
| **Styling broken** | Path absolute | Ganti `/css/style.css` menjadi `assets/css/style.css` (relative). |
| **404 data JSON** | BASE_URL tidak sesuai | Untuk `username.github.io/repo-name`, set `BASE_URL = '/repo-name'`. |
| **GitHub Pages error** | Permission workflow | Cek **Settings → Actions → General → Workflow permissions** beri "Read and write". |

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License** — silakan gunakan, modifikasi, dan distribusikan.

Dibangun dengan ❤️ untuk melestarikan sejarah bangsa Indonesia.

---

> **Kontribusi & Masukan:** Silakan buka [issue](https://github.com) atau pull request untuk kontribusi data, fitur, atau perbaikan bug.
