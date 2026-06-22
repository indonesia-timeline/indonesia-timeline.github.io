/* ========================================
   TIMELINE.JS — D3.js Vertical Timeline
   ======================================== */

const TIMELINE = {
  svg: null,
  currentData: [],
  tooltip: null,

  /**
   * Warna berdasarkan era
   */
  getEraColor(era) {
    return DATA.eraColors[era] || '#95a5a6';
  },

  /**
   * Inisialisasi dan render timeline
   */
  render(events) {
    const container = document.getElementById('d3Timeline');
    const loading = document.getElementById('timelineLoading');
    container.innerHTML = '';

    if (!events || events.length === 0) {
      loading.textContent = 'Tidak ada peristiwa untuk ditampilkan';
      loading.style.display = 'block';
      return;
    }

    loading.style.display = 'none';
    this.currentData = events;

    // Dimensions — responsive untuk mobile & tablet
    const vw = window.innerWidth;
    const isMobile = vw < 768;
    const isTablet = vw >= 768 && vw < 1024;
    const containerWidth = container.clientWidth || 800;

    const margin = {
      top: isMobile ? 24 : 40,
      right: isMobile ? 16 : (isTablet ? 40 : 120),
      bottom: isMobile ? 24 : 40,
      left: isMobile ? 50 : 120
    };
    const rowHeight = isMobile ? 60 : 70;
    const minWidth = isMobile ? Math.max(containerWidth, 360) : 800;
    const width = Math.max(minWidth, events.length * 26 + margin.left + margin.right);
    const height = events.length * rowHeight + margin.top + margin.bottom;

    // Create SVG
    this.svg = d3.select('#d3Timeline')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('overflow', 'visible');

    const g = this.svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Define defs (gradients, drop shadows)
    const defs = this.svg.append('defs');

    // Shadow filter
    defs.append('filter')
      .attr('id', 'timeline-shadow')
      .append('feDropShadow')
      .attr('dx', 0)
      .attr('dy', 2)
      .attr('stdDeviation', 4)
      .attr('flood-color', 'rgba(0,0,0,0.4)');

    // Gradient for line — solid gold
    const lineGrad = defs.append('linearGradient')
      .attr('id', 'timeline-line-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    lineGrad.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#c9a227')
      .attr('stop-opacity', 0.5);

    lineGrad.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#c9a227')
      .attr('stop-opacity', 0.35);

    // Draw central vertical line
    const centerX = isMobile ? 40 : (isTablet ? 50 : 60);
    const eraLabelX = centerX - (isMobile ? 36 : (isTablet ? 38 : 42));
    const charSpacing = isMobile ? 9 : 10;

    g.append('line')
      .attr('x1', centerX)
      .attr('y1', 0)
      .attr('x2', centerX)
      .attr('y2', events.length * rowHeight + 10)
      .attr('stroke', 'url(#timeline-line-grad)')
      .attr('stroke-width', 2.5);

    // Era labels — VERTICAL (kebawah) menggunakan tspan per karakter
    let currentEra = null;
    let eraStartY = 0;

    events.forEach((event, i) => {
      if (event.era !== currentEra) {
        if (currentEra !== null) {
          // Separator line antar era
          const sepY = i * rowHeight;
          g.append('line')
            .attr('x1', centerX - 20)
            .attr('y1', sepY)
            .attr('x2', centerX + (isMobile ? 80 : (isTablet ? 100 : 150)))
            .attr('y2', sepY)
            .attr('stroke', 'rgba(42,42,74,0.15)')
            .attr('stroke-width', 1);
        }

        currentEra = event.era;
        eraStartY = i * rowHeight;

        // Hitung untuk vertical label
        const eraEventCount = events.filter(e => e.era === event.era).length;
        const eraHeight = eraEventCount * rowHeight;
        const eraMidY = i * rowHeight + eraHeight / 2;
        const textHeight = event.era.length * charSpacing;
        const startY = eraMidY - textHeight / 2 + charSpacing / 2;

        const eraColor = this.getEraColor(event.era);
        const eraText = event.era.toUpperCase();
        const labelText = g.append('text')
          .attr('x', eraLabelX)
          .attr('y', startY)
          .attr('text-anchor', 'middle')
          .attr('fill', eraColor)
          .attr('font-family', 'Inter, sans-serif')
          .attr('font-size', isMobile ? 9 : 10)
          .attr('font-weight', 700)
          .attr('letter-spacing', '0.5px')
          .attr('opacity', 0.5);

        // Stack each character vertically
        eraText.split('').forEach((char, ci) => {
          labelText.append('tspan')
            .attr('x', eraLabelX)
            .attr('dy', ci === 0 ? 0 : `${charSpacing}px`)
            .text(char);
        });
      }
    });

    // Create tooltip element once
    let timelineTooltip = document.getElementById('timelineTooltip');
    if (!timelineTooltip) {
      timelineTooltip = document.createElement('div');
      timelineTooltip.id = 'timelineTooltip';
      timelineTooltip.className = 'timeline-tooltip';
      timelineTooltip.style.display = 'none';
      document.querySelector('.timeline-container').appendChild(timelineTooltip);
    }

    // Draw each event
    events.forEach((event, i) => {
      const y = i * rowHeight + rowHeight / 2;
      const catStyle = DATA.getCategoryStyle(event.kategori);
      const eraColor = this.getEraColor(event.era);

      // Date label on the left
      g.append('text')
        .attr('x', centerX - 14)
        .attr('y', y + 4)
        .attr('text-anchor', 'end')
        .attr('fill', '#9a9ab0')
        .attr('font-family', 'Inter, sans-serif')
        .attr('font-size', isMobile ? 10 : 11)
        .attr('font-weight', 600)
        .text(event.tahun);

      // Circle node
      const circleGroup = g.append('g')
        .attr('class', 'timeline-node')
        .attr('cursor', 'pointer');

      // Outer ring
      circleGroup.append('circle')
        .attr('class', 'timeline-ring')
        .attr('cx', centerX)
        .attr('cy', y)
        .attr('r', 12)
        .attr('fill', 'rgba(15, 15, 26, 0.95)')
        .attr('stroke', eraColor)
        .attr('stroke-width', 2.5)
        .attr('opacity', 0.7);

      // Inner dot
      circleGroup.append('circle')
        .attr('class', 'timeline-circle')
        .attr('cx', centerX)
        .attr('cy', y)
        .attr('r', 6)
        .attr('fill', catStyle.color)
        .attr('stroke', 'none')
        .style('filter', 'url(#timeline-shadow)')
        .style('transition', 'r 0.2s ease');

      // Hover effects
      circleGroup.on('mouseenter', () => {
        circleGroup.select('.timeline-circle').attr('r', 8);
        circleGroup.select('.timeline-ring').attr('r', 15).attr('opacity', 0.9);
      });
      circleGroup.on('mouseleave', () => {
        circleGroup.select('.timeline-circle').attr('r', 6);
        circleGroup.select('.timeline-ring').attr('r', 12).attr('opacity', 0.7);
      });

      // Horizontal connector line
      g.append('line')
        .attr('class', 'connector-line')
        .attr('x1', centerX + 13)
        .attr('y1', y)
        .attr('x2', centerX + (isMobile ? 44 : (isTablet ? 48 : 58)))
        .attr('y2', y)
        .attr('stroke', eraColor)
        .attr('stroke-width', 2.5)
        .attr('opacity', 0.6);

      // Title (right side)
      const titleX = centerX + (isMobile ? 50 : (isTablet ? 55 : 65));
      const maxTitleLen = isMobile ? 25 : (isTablet ? 35 : 45);

      const titleText = g.append('text')
        .attr('class', 'timeline-title')
        .attr('x', titleX)
        .attr('y', y)
        .attr('dy', '-2px')
        .attr('fill', '#e8e8f0')
        .attr('font-family', 'Playfair Display, serif')
        .attr('font-size', isMobile ? 12 : 14)
        .attr('font-weight', 600)
        .text(this.truncateText(event.judul, maxTitleLen));

      // Category badge below title
      g.append('text')
        .attr('x', titleX)
        .attr('y', y)
        .attr('dy', '15px')
        .attr('fill', catStyle.color)
        .attr('font-family', 'Inter, sans-serif')
        .attr('font-size', isMobile ? 9 : 10)
        .attr('font-weight', 500)
        .attr('opacity', 0.6)
        .text(this.truncateText(`${event.kategori} · ${event.provinsi}`, isMobile ? 30 : 50));

      // Tooltip
      const showTooltip = () => {
        timelineTooltip.innerHTML = `
          <h4>${event.judul}</h4>
          <div class="tt-meta">
            <i class="fas fa-calendar-alt"></i> ${DATA.formatDate(event.tanggal)} &middot;
            <i class="fas fa-map-marker-alt"></i> ${event.provinsi}
          </div>
          <p>${event.deskripsi.substring(0, 120)}...</p>
          <div class="tt-meta" style="margin-top:6px;border-top:1px solid var(--color-border);padding-top:6px;">
            <i class="fas fa-book"></i> ${event.sumber}
          </div>
        `;
        const rect = this.svg.node().getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        timelineTooltip.style.display = 'block';
        timelineTooltip.style.left = `${Math.min(margin.left + centerX + (isMobile ? 55 : 65), vw - 340)}px`;
        timelineTooltip.style.top = `${Math.max(y + scrollTop + rect.top - 50, scrollTop + 20)}px`;
        timelineTooltip.style.maxWidth = isMobile ? '260px' : '320px';
      };

      const hideTooltip = () => {
        timelineTooltip.style.display = 'none';
      };

      // Click handler
      const handleClick = () => {
        if (typeof MAP !== 'undefined' && MAP.instance) {
          MAP.flyToEvent(event);
          document.querySelector('.nav-link[href="#peta"]')?.click();
        }
      };

      circleGroup.on('click', handleClick);
      circleGroup.on('mouseenter', showTooltip);
      circleGroup.on('mouseleave', hideTooltip);

      titleText.on('click', handleClick);
      titleText.on('mouseenter', showTooltip);
      titleText.on('mouseleave', hideTooltip);
    });

    // Ensure scrollable
    const svgEl = this.svg.node();
    if (svgEl) {
      svgEl.style.overflowX = 'auto';
      svgEl.style.overflowY = 'visible';
    }

    // Filter setup
    this.setupFilterChips();
  },

  /**
   * Truncate text with ellipsis
   */
  truncateText(text, maxLen) {
    if (!text) return '';
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
  },

  /**
   * Populate era and category filter chips
   */
  setupFilterChips() {
    const eraContainer = document.getElementById('eraFilterTimeline');
    const catContainer = document.getElementById('categoryFilterTimeline');

    // Skip if already populated
    if (eraContainer.querySelectorAll('.chip').length > 1) return;

    // Add era chips
    DATA.eras.forEach(era => {
      const chip = document.createElement('button');
      chip.className = 'chip';
      chip.dataset.era = era;
      chip.textContent = era;
      chip.style.borderColor = DATA.eraColors[era];
      chip.style.color = DATA.eraColors[era];
      chip.addEventListener('click', () => {
        eraContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.applyFilters();
      });
      eraContainer.appendChild(chip);
    });

    // Add category chips
    DATA.getCategories().forEach(cat => {
      const chip = document.createElement('button');
      chip.className = 'chip';
      chip.dataset.category = cat;
      chip.textContent = cat;
      const style = DATA.getCategoryStyle(cat);
      chip.style.borderColor = style.color;
      chip.style.color = style.color;
      chip.addEventListener('click', () => {
        catContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.applyFilters();
      });
      catContainer.appendChild(chip);
    });
  },

  /**
   * Apply timeline filters based on active chips
   */
  applyFilters() {
    const activeEra = document.querySelector('#eraFilterTimeline .chip.active')?.dataset.era || 'all';
    const activeCategory = document.querySelector('#categoryFilterTimeline .chip.active')?.dataset.category || 'all';

    let filtered = [...DATA.events];

    if (activeEra !== 'all') {
      filtered = filtered.filter(e => e.era === activeEra);
    }
    if (activeCategory !== 'all') {
      filtered = filtered.filter(e => e.kategori === activeCategory);
    }

    this.render(filtered);
  }
};
