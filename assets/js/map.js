/* ========================================
   MAP.JS — Interactive Leaflet Map
   ======================================== */

const MAP = {
  instance: null,
  markers: [],
  markerClusterGroup: null,
  geoJsonLayer: null,

  /**
   * Kategori marker icons
   */
  createIcon(color) {
    return L.divIcon({
      className: 'custom-marker-icon',
      html: `<div style="
        width: 16px; height: 16px;
        background: ${color};
        border: 3px solid var(--color-bg-card, #16213e);
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        transition: transform 0.2s;
      "></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -10]
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

      // Popup content
      const popupContent = `
        <h4>${event.judul}</h4>
        <div class="popup-meta">
          <i class="fas fa-calendar-alt"></i> ${DATA.formatDate(event.tanggal)} &middot;
          <i class="fas fa-map-marker-alt"></i> ${event.provinsi}
        </div>
        <div class="popup-meta">
          <span style="color:${catStyle.color}">●</span> ${event.kategori} &middot;
          <i class="fas fa-clock"></i> Era ${event.era}
        </div>
        <p style="font-size:0.82rem;margin-top:6px;color:#aaa;">${event.deskripsi.substring(0, 150)}...</p>
        <a href="${event.link}" target="_blank" rel="noopener" style="color:${catStyle.color};font-size:0.78rem;margin-top:6px;display:inline-block;">
          <i class="fas fa-external-link-alt"></i> Sumber: ${event.sumber}
        </a>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
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
