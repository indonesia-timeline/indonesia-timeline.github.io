/* ========================================
   APP.JS — Main Application Logic
   ======================================== */

const APP = {
  currentView: 'grid',
  currentPage: 1,
  pageSize: 12,
  searchTimeout: null,

  /**
   * Initialize the application
   */
  async init() {
    console.log('🏛️ Arsip Sejarah Indonesia — Inisialisasi...');

    // Load data
    await DATA.load();
    console.log(`✅ ${DATA.events.length} peristiwa sejarah dimuat`);

    // Update hero stats
    this.updateHeroStats();

    // Initialize map
    MAP.init();
    MAP.renderEvents(DATA.events);
    MAP.renderLegend();

    // Render timeline
    TIMELINE.render(DATA.events);

    // Populate filters
    this.populateFilters();

    // Render archive
    this.renderArchive();

    // Setup event listeners
    this.setupEventListeners();

    // Setup scroll animations
    this.setupScrollAnimations();

    // Show initial results count
    document.getElementById('resultCount').textContent =
      `Menampilkan ${Math.min(this.pageSize, DATA.events.length)} dari ${DATA.events.length} peristiwa`;

    console.log('🚀 Arsip Sejarah Indonesia siap!');
  },

  /**
   * Update hero statistics
   */
  updateHeroStats() {
    document.getElementById('totalEvents').textContent = DATA.events.length;
    document.getElementById('totalEras').textContent = DATA.eras.length;
    document.getElementById('totalProvinces').textContent = DATA.provinces.size;
  },

  /**
   * Populate filter dropdowns
   */
  populateFilters() {
    const eraSelect = document.getElementById('filterEra');
    const catSelect = document.getElementById('filterCategory');
    const provSelect = document.getElementById('filterProvince');
    const yearSelect = document.getElementById('filterYear');

    // Eras
    DATA.eras.forEach(era => {
      eraSelect.appendChild(new Option(era, era));
    });

    // Categories
    DATA.getCategories().forEach(cat => {
      catSelect.appendChild(new Option(cat, cat));
    });

    // Provinces
    [...DATA.provinces].sort().forEach(prov => {
      provSelect.appendChild(new Option(prov, prov));
    });

    // Years
    [...DATA.years].sort((a, b) => b - a).forEach(year => {
      yearSelect.appendChild(new Option(year, year));
    });
  },

  /**
   * Render archive events in grid/list
   */
  renderArchive(resetPage = true) {
    if (resetPage) this.currentPage = 1;

    const grid = document.getElementById('archiveGrid');
    const loading = document.getElementById('archiveLoading');
    const empty = document.getElementById('archiveEmpty');
    const moreBtn = document.getElementById('loadMoreBtn');
    const moreSection = document.getElementById('archiveMore');
    const resultCount = document.getElementById('resultCount');

    const filtered = DATA.filtered;
    const total = filtered.length;
    const start = 0;
    const end = this.currentPage * this.pageSize;
    const pageEvents = filtered.slice(start, end);

    // Show/hide states
    loading.classList.add('hidden');
    grid.innerHTML = '';

    if (total === 0) {
      empty.classList.remove('hidden');
      moreSection.classList.add('hidden');
      resultCount.textContent = 'Tidak ada hasil';
      return;
    }

    empty.classList.add('hidden');

    // Render cards
    pageEvents.forEach(event => {
      const card = this.createEventCard(event);
      grid.appendChild(card);

      // Add fade-in animation with delay
      setTimeout(() => {
        card.classList.add('visible');
      }, 50);
    });

    // Update count
    const showing = Math.min(end, total);
    resultCount.textContent = `Menampilkan ${showing} dari ${total} peristiwa`;

    // Show/hide load more
    if (end >= total) {
      moreSection.classList.add('hidden');
    } else {
      moreSection.classList.remove('hidden');
    }
  },

  /**
   * Create a single event card element
   */
  createEventCard(event) {
    const catStyle = DATA.getCategoryStyle(event.kategori);
    const card = document.createElement('div');
    card.className = 'event-card fade-in';
    card.dataset.category = event.kategori;

    // Category badge color
    const badgeBg = catStyle.color + '22';
    const badgeColor = catStyle.color;

    card.innerHTML = `
      <div class="event-card-header">
        <h3 class="event-card-title">${event.judul}</h3>
        <span class="event-card-badge" style="background:${badgeBg};color:${badgeColor};border:1px solid ${badgeColor}33;">
          <i class="fas ${catStyle.icon}"></i> ${event.kategori}
        </span>
      </div>
      <div class="event-card-meta">
        <span><i class="fas fa-calendar-alt"></i> ${DATA.formatDate(event.tanggal)}</span>
        <span><i class="fas fa-map-marker-alt"></i> ${event.provinsi}</span>
        <span><i class="fas fa-clock"></i> Era ${event.era}</span>
      </div>
      <p class="event-card-desc">${event.deskripsi}</p>
      <div class="event-card-source">
        <span><i class="fas fa-book"></i> ${event.sumber}</span>
        <a href="${event.link}" target="_blank" rel="noopener" class="event-card-link">
          <i class="fas fa-external-link-alt"></i> Sumber
        </a>
      </div>
    `;

    // Click to navigate to map
    card.addEventListener('click', () => {
      if (MAP.instance) {
        MAP.flyToEvent(event);
        document.querySelector('.nav-link[href="#peta"]')?.click();
      }
    });

    return card;
  },

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');
    const navLinks = document.getElementById('navLinks');
    const navToggle = document.getElementById('navToggle');
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const archiveGrid = document.getElementById('archiveGrid');

    // Set initial grid view
    archiveGrid.className = 'archive-grid';
    archiveGrid.classList.add('grid-view');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      // Back to top button
      if (window.scrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }

      // Active nav link
      this.updateActiveNav();
    }, { passive: true });

    // Nav toggle (mobile)
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    // Close nav on link click (mobile)
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    });

    // Back to top
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Search input with debounce
    searchInput.addEventListener('input', () => {
      clearTimeout(this.searchTimeout);
      searchClear.classList.toggle('visible', searchInput.value.length > 0);

      this.searchTimeout = setTimeout(() => {
        this.applyArchiveFilters();
      }, 300);
    });

    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.classList.remove('visible');
      this.applyArchiveFilters();
    });

    // Filter dropdowns
    document.getElementById('filterEra').addEventListener('change', () => this.applyArchiveFilters());
    document.getElementById('filterCategory').addEventListener('change', () => this.applyArchiveFilters());
    document.getElementById('filterProvince').addEventListener('change', () => this.applyArchiveFilters());
    document.getElementById('filterYear').addEventListener('change', () => this.applyArchiveFilters());

    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentView = btn.dataset.view;
        archiveGrid.className = 'archive-grid';
        archiveGrid.classList.add(this.currentView + '-view');
      });
    });

    // Load more
    document.getElementById('loadMoreBtn').addEventListener('click', () => {
      this.currentPage++;
      this.renderArchive(false);
    });

    // Scroll-based active section detection
    this.updateActiveNav();
  },

  /**
   * Apply archive filters
   */
  applyArchiveFilters() {
    const search = document.getElementById('searchInput').value;
    const era = document.getElementById('filterEra').value;
    const category = document.getElementById('filterCategory').value;
    const province = document.getElementById('filterProvince').value;
    const year = document.getElementById('filterYear').value;

    DATA.filter({ search, era, category, province, year });

    // Show loading briefly
    document.getElementById('archiveLoading').classList.remove('hidden');
    document.getElementById('archiveGrid').innerHTML = '';
    document.getElementById('archiveEmpty').classList.add('hidden');

    setTimeout(() => {
      this.renderArchive();
    }, 200);
  },

  /**
   * Update active nav link based on scroll position
   */
  updateActiveNav() {
    const sections = ['peta', 'timeline', 'arsip'];
    const scrollPos = window.scrollY + 200;

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if (!link) return;

      const rect = el.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const elTop = rect.top + scrollTop;
      const elBottom = elTop + rect.height;

      if (elTop <= scrollPos && elBottom > scrollPos) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  },

  /**
   * Setup scroll-triggered fade-in animations
   */
  setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    // Observe section headers
    document.querySelectorAll('.section-header, .archive-grid').forEach(el => {
      observer.observe(el);
    });
  }
};

/* ========================================
   INIT — Start Application
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
  APP.init();
});
