# /libs — CDN Library Backup (Optional)

Folder ini digunakan untuk menyimpan *backup* library CDN lokal jika sewaktu-waktu
CDN tidak bisa diakses. Semua library utama tetap di-load via CDN di `index.html`.

## Cara Penggunaan Backup Lokal

Jika ingin fallback ke lokal, uncomment baris berikut di `index.html`:

```html
<!-- Backup jika CDN down -->
<link rel="stylesheet" href="libs/leaflet/leaflet.css">
<script src="libs/leaflet/leaflet.js"></script>
<script src="libs/d3/d3.v7.min.js"></script>
```

## Download Library untuk Backup

```bash
# Leaflet
wget https://unpkg.com/leaflet@1.9.4/dist/leaflet.css -O libs/leaflet/leaflet.css
wget https://unpkg.com/leaflet@1.9.4/dist/leaflet.js -O libs/leaflet/leaflet.js

# D3.js
wget https://d3js.org/d3.v7.min.js -O libs/d3/d3.v7.min.js
```

> **Catatan:** Folder ini opsional. Untuk production, library CDN sudah cukup.
