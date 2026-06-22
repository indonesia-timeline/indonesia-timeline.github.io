/* ========================================
   MAP.JS — Interactive Leaflet Map
   ======================================== */

const MAP = {
  instance: null,
  markers: [],
  markerClusterGroup: null,
  geoJsonLayer: null,

  /**
   * Kategori marker icons — Lebih besar, lebih terlihat, dengan glow
   */
  createIcon(color) {
    const glowColor = color + '66';
    return L.divIcon({
      className: 'custom-marker-icon',
      html: `<div style="
        width: 20px; height: 20px;
        background: ${color};
        border: 3px solid rgba(22, 33, 62, 0.9);
        border-radius: 50%;
        box-shadow: 0 0 12px ${glowColor}, 0 3px 12px rgba(0,0,0,0.5);
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        cursor: pointer;
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -14]
    });
  },

  /**
   * Inisialisasi peta
   */
  init(center = [-2.5, 118], zoom = 5) {
    this.instance = L.map('map', {
      center,
      zoom,
      zoomControl: true,
      fadeAnimation: true,
      zoomAnimation: true,
      attributionControl: true,
    });

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
      minZoom: 3
    }).addTo(this.instance);

    // Add scale
    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(this.instance);

    // Fix size untuk mobile — pastikan peta full-width
    setTimeout(() => {
      this.instance.invalidateSize();
    }, 200);

    // Fix size lagi setelah semua konten termuat
    setTimeout(() => {
      this.instance.invalidateSize();
    }, 800);

    return this.instance;
  },

  /**
   * Render event markers di peta
   */
  renderEvents(events) {
    // Clear existing markers
    this.clearMarkers();

    events.forEach(event => {
      if (!event.koordinat || event.koordinat.length !== 2) return;

      const catStyle = DATA.getCategoryStyle(event.kategori);
      const marker = L.marker(event.koordinat, {
        icon: this.createIcon(catStyle.color),
        riseOnHover: true
      });

      // Popup dinonaktifkan — cukup pakai event card di luar peta biar ga dobel
      // (Hanya di-desktop bisa pakai popup, di-mobile cukup card external)

      // Hover effect on marker
      marker.on('mouseover', () => {
        const el = marker.getElement();
        if (el) {
          const div = el.querySelector('div');
          if (div) {
            div.style.transform = 'scale(1.4)';
            div.style.boxShadow = `0 0 20px ${catStyle.color}88, 0 4px 16px rgba(0,0,0,0.6)`;
          }
        }
      });

      marker.on('mouseout', () => {
        const el = marker.getElement();
        if (el) {
          const div = el.querySelector('div');
          if (div) {
            div.style.transform = 'scale(1)';
            div.style.boxShadow = `0 0 12px ${catStyle.color}66, 0 3px 12px rgba(0,0,0,0.5)`;
          }
        }
      });

      marker.on('click', () => {
        this.showEventCard(event);
      });

      this.markers.push(marker);
      marker.addTo(this.instance);
    });
  },

  /**
   * Tampilkan event card di atas peta
   */
  showEventCard(event) {
    const card = document.getElementById('mapEventCard');
    const content = card.querySelector('.map-event-content');
    const close = document.getElementById('mapEventClose');
    const catStyle = DATA.getCategoryStyle(event.kategori);

    content.innerHTML = `
      <h3>${event.judul}</h3>
      <div class="event-meta">
        <span><i class="fas fa-calendar-alt"></i> ${DATA.formatDate(event.tanggal)}</span>
        <span><i class="fas fa-map-marker-alt"></i> ${event.provinsi}</span>
        <span style="color:${catStyle.color}"><i class="fas ${catStyle.icon}"></i> ${event.kategori}</span>
        <span><i class="fas fa-clock"></i> Era ${event.era}</span>
      </div>
      <p>${event.deskripsi}</p>
      <div class="event-source">
        <i class="fas fa-book"></i> Sumber: ${event.sumber}
        <a href="${event.link}" target="_blank" rel="noopener" style="margin-left:auto;">
          <i class="fas fa-external-link-alt"></i> Baca selengkapnya
        </a>
      </div>
    `;

    card.classList.remove('hidden');

    close.onclick = () => {
      card.classList.add('hidden');
    };
  },

  /**
   * Hapus semua markers
   */
  clearMarkers() {
    this.markers.forEach(m => m.remove());
    this.markers = [];
    document.getElementById('mapEventCard').classList.add('hidden');
  },

  /**
   * Populate legend with categories
   */
  renderLegend() {
    const container = document.getElementById('legendItems');
    const cats = DATA.getCategories();
    container.innerHTML = cats.map(cat => {
      const style = DATA.getCategoryStyle(cat);
      return `
        <div class="legend-item">
          <span class="legend-dot" style="background:${style.color}"></span>
          ${cat}
        </div>
      `;
    }).join('');
  },

  /**
   * Fly to a specific event location
   */
  flyToEvent(event) {
    if (!event.koordinat) return;
    this.instance.flyTo(event.koordinat, 10, {
      duration: 1.5,
      easeLinearity: 0.3
    });
    setTimeout(() => {
      this.showEventCard(event);
    }, 1600);
  }
};
