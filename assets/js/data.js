/* ========================================
   DATA.JS — Load & Filter Data JSON
   ════════════════════════════════════════
   Mendukung BASE_URL untuk GitHub Pages subpath
   (username.github.io/repo-name)
   ======================================== */

const DATA = {
  events: [],
  filtered: [],
  loaded: false,

  // Kategori beserta warna
  categories: {
    'Kemerdekaan': { color: '#c9a227', icon: 'fa-flag' },
    'Pertempuran': { color: '#e74c3c', icon: 'fa-crosshairs' },
    'Diplomasi': { color: '#3498db', icon: 'fa-handshake' },
    'Pergerakan Nasional': { color: '#2ecc71', icon: 'fa-users' },
    'Politik': { color: '#e67e22', icon: 'fa-gavel' },
    'Perang Dunia': { color: '#95a5a6', icon: 'fa-globe' },
    'Ekonomi': { color: '#1abc9c', icon: 'fa-chart-line' },
    'Olahraga': { color: '#9b59b6', icon: 'fa-running' },
    'Bencana': { color: '#c0392b', icon: 'fa-exclamation-triangle' }
  },

  // Era dan urutannya
  eras: ['Kolonial', 'Pergerakan', 'Revolusi', 'Demokrasi', 'Orde Lama', 'Orde Baru', 'Reformasi'],
  eraColors: {
    'Kolonial': '#95a5a6',
    'Pergerakan': '#2ecc71',
    'Revolusi': '#e74c3c',
    'Demokrasi': '#3498db',
    'Orde Lama': '#e67e22',
    'Orde Baru': '#9b59b6',
    'Reformasi': '#1abc9c'
  },

  provinces: new Set(),
  years: new Set(),

  /**
   * Dapatkan path data dengan BASE_URL
   * Untuk GitHub Pages subpath support
   */
  getDataPath(relativePath) {
    const base = window.BASE_URL || '';
    if (!base) {
      // Relative path — browser resolve otomatis terhadap lokasi index.html
      return relativePath;
    }
    // BASE_URL harus diawali / jika manual
    if (!base.startsWith('/')) {
      return '/' + base + '/' + relativePath;
    }
    return base + '/' + relativePath;
  },

  /**
   * Load JSON dari file eksternal
   * Path otomatis menyesuaikan BASE_URL
   */
  async load() {
    try {
      const dataUrl = this.getDataPath('data/events.json');
      const response = await fetch(dataUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status} — ${dataUrl}`);
      this.events = await response.json();

      // Sort by tahun
      this.events.sort((a, b) => a.tahun - b.tahun);

      // Collect unique values
      this.events.forEach(e => {
        if (e.provinsi && e.provinsi !== '-') this.provinces.add(e.provinsi);
        this.years.add(e.tahun);
      });

      this.filtered = [...this.events];
      this.loaded = true;
      return this.events;
    } catch (err) {
      console.error('Gagal memuat data:', err);
      return [];
    }
  },

  /**
   * Get unique categories
   */
  getCategories() {
    return [...new Set(this.events.map(e => e.kategori))];
  },

  /**
   * Get events by province
   */
  getByProvince(province) {
    return this.events.filter(e => e.provinsi === province);
  },

  /**
   * Filter events berdasarkan berbagai parameter
   */
  filter({ search, era, category, province, year } = {}) {
    let results = [...this.events];

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(e =>
        e.judul.toLowerCase().includes(q) ||
        e.deskripsi.toLowerCase().includes(q) ||
        e.provinsi.toLowerCase().includes(q) ||
        e.kategori.toLowerCase().includes(q) ||
        e.sumber.toLowerCase().includes(q)
      );
    }

    if (era && era !== 'all') {
      results = results.filter(e => e.era === era);
    }

    if (category && category !== 'all') {
      results = results.filter(e => e.kategori === category);
    }

    if (province && province !== 'all') {
      results = results.filter(e => e.provinsi === province);
    }

    if (year && year !== 'all') {
      results = results.filter(e => e.tahun === parseInt(year));
    }

    this.filtered = results;
    return results;
  },

  /**
   * Format tanggal ke bahasa Indonesia
   */
  formatDate(dateStr) {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[2]);
      const month = months[parseInt(parts[1]) - 1];
      const year = parts[0];
      return `${day} ${month} ${year}`;
    }
    return dateStr;
  },

  /**
   * Get category badge color
   */
  getCategoryStyle(category) {
    return this.categories[category] || { color: '#95a5a6', icon: 'fa-tag' };
  }
};
