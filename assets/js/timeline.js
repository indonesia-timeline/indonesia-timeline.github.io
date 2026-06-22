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

    // Dimensions — responsive untuk mobile
    const isMobile = window.innerWidth < 768;
    const containerWidth = container.clientWidth || 800;
    // Mobile: SVG lebih compact, desktop: lebih lega
    const margin = {
      top: isMobile ? 24 : 40,
      right: isMobile ? 20 : 120,
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

    // Gradient for line
    const lineGrad = defs.append('linearGradient')
      .attr('id', 'timeline-line-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    lineGrad.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#c9a227')
      .attr('stop-opacity', 0.6);

    lineGrad.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', '#c9a227')
      .attr('stop-opacity', 0.3);

    lineGrad.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#c9a227')
      .attr('stop-opacity', 0);

    // Draw central vertical line
    const centerX = isMobile ? 40 : 60;

    g.append('line')
      .attr('x1', centerX)
      .attr('y1', 0)
      .attr('x2', centerX)
      .attr('y2', events.length * rowHeight)
      .attr('stroke', 'url(#timeline-line-grad)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '6,4');

    // Era separators and labels
    let currentEra = null;
    let eraStartY = 0;

    events.forEach((event, i) => {
      if (event.era !== currentEra) {
        if (currentEra !== null) {
          // Draw era bracket
          const eraEndY = i * rowHeight;
          g.append('line')
            .attr('x1', centerX + (isMobile ? 140 : 180))
            .attr('y1', eraStartY + rowHeight / 2)
            .attr('x2', centerX + (isMobile ? 140 : 180))
            .attr('y2', eraEndY - rowHeight / 2)
            .attr('stroke', this.getEraColor(currentEra))
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.3);

          g.append('line')
            .attr('x1', centerX + (isMobile ? 135 : 175))
            .attr('y1', eraStartY + rowHeight / 2)
            .attr('x2', centerX + (isMobile ? 145 : 185))
            .attr('y2', eraStartY + rowHeight / 2)
            .attr('stroke', this.getEraColor(currentEra))
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.3);

          g.append('line')
            .attr('x1', centerX + (isMobile ? 135 : 175))
            .attr('y1', eraEndY - rowHeight / 2)
            .attr('x2', centerX + (isMobile ? 145 : 185))
            .attr('y2', eraEndY - rowHeight / 2)
            .attr('stroke', this.getEraColor(currentEra))
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.3);
        }

        currentEra = event.era;
        eraStartY = i * rowHeight;

        // Era label
        g.append('text')
          .attr('x', centerX + (isMobile ? 150 : 200))
          .attr('y', i * rowHeight + rowHeight / 2 + 4)
          .attr('fill', this.getEraColor(event.era))
          .attr('font-family', 'Inter, sans-serif')
          .attr('font-size', isMobile ? 9 : 10)
          .attr('font-weight', 600)
          .attr('letter-spacing', '1px')
          .attr('text-transform', 'uppercase')
          .attr('opacity', 0.6)
          .text(`── ${event.era}`);
      }
    });

    // End bracket for last era
    if (currentEra) {
      const lastY = events.length * rowHeight;
      g.append('line')
        .attr('x1', centerX + (isMobile ? 140 : 180))
        .attr('y1', eraStartY + rowHeight / 2)
        .attr('x2', centerX + (isMobile ? 140 : 180))
        .attr('y2', lastY - rowHeight / 2)
        .attr('stroke', this.getEraColor(currentEra))
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.3);

      g.append('line')
        .attr('x1', centerX + (isMobile ? 135 : 175))
        .attr('y1', lastY - rowHeight / 2)
        .attr('x2', centerX + (isMobile ? 145 : 185))
        .attr('y2', lastY - rowHeight / 2)
        .attr('stroke', this.getEraColor(currentEra))
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.3);
    }

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

      // Horizontal connector line
      g.append('line')
        .attr('x1', centerX)
        .attr('y1', y)
        .attr('x2', centerX + (isMobile ? 40 : 50))
        .attr('y2', y)
        .attr('stroke', eraColor)
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.4);

      // Date label on the left of the circle
      g.append('text')
        .attr('x', centerX - 12)
        .attr('y', y + 4)
        .attr('text-anchor', 'end')
        .attr('fill', '#9a9ab0')
        .attr('font-family', 'Inter, sans-serif')
        .attr('font-size', isMobile ? 10 : 11)
        .attr('font-weight', 500)
        .text(event.tahun);

      // Circle node
      const circleGroup = g.append('g')
        .attr('class', 'timeline-node')
        .attr('cursor', 'pointer')
        .style('filter', 'url(#timeline-shadow)');

      // Outer ring
      circleGroup.append('circle')
        .attr('class', 'timeline-ring')
        .attr('cx', centerX)
        .attr('cy', y)
        .attr('r', 11)
        .attr('fill', 'rgba(22, 33, 62, 0.9)')
        .attr('stroke', eraColor)
        .attr('stroke-width', 2)
        .attr('opacity', 0.3);

      // Inner dot
      circleGroup.append('circle')
        .attr('class', 'timeline-circle')
        .attr('cx', centerX)
        .attr('cy', y)
        .attr('r', 5)
        .attr('fill', catStyle.color)
        .attr('stroke', eraColor)
        .attr('stroke-width', 1)
        .style('transition', 'r 0.2s ease, stroke-width 0.2s ease');

      // Hover effects
      circleGroup.on('mouseenter', () => {
        circleGroup.select('.timeline-circle')
          .attr('r', 7)
          .attr('stroke-width', 3);
        circleGroup.select('.timeline-ring')
          .attr('r', 14)
          .attr('opacity', 0.6);
      });

      circleGroup.on('mouseleave', () => {
        circleGroup.select('.timeline-circle')
          .attr('r', 5)
          .attr('stroke-width', 1);
        circleGroup.select('.timeline-ring')
          .attr('r', 11)
          .attr('opacity', 0.3);
      });

      // Title (right side)
      const titleText = g.append('text')
        .attr('class', 'timeline-title')
        .attr('x', centerX + (isMobile ? 50 : 60))
        .attr('y', y)
        .attr('dy', '-2px')
        .attr('fill', '#e8e8f0')
        .attr('font-family', 'Playfair Display, serif')
        .attr('font-size', isMobile ? 12 : 14)
        .attr('font-weight', 600)
        .text(this.truncateText(event.judul, isMobile ? 25 : 45));

      // Category badge below title
      g.append('text')
        .attr('x', centerX + (isMobile ? 50 : 60))
        .attr('y', y)
        .attr('dy', '14px')
        .attr('fill', catStyle.color)
        .attr('font-family', 'Inter, sans-serif')
        .attr('font-size', isMobile ? 9 : 10)
        .attr('font-weight', 500)
        .attr('opacity', 0.7)
        .text(`${event.kategori} · ${event.provinsi}`);

      // Tooltip show/hide
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
        timelineTooltip.style.left = `${margin.left + centerX + (isMobile ? 55 : 65)}px`;
        timelineTooltip.style.top = `${y + scrollTop + rect.top - 50}px`;
      };

      const hideTooltip = () => {
        timelineTooltip.style.display = 'none';
      };

      // Click to zoom to map
      const handleClick = () => {
        if (typeof MAP !== 'undefined' && MAP.instance) {
          MAP.flyToEvent(event);
          document.querySelector('.nav-link[href="#peta"]')?.click();
        }
      };

      // Attach events: circle + title
      circleGroup.on('click', handleClick);
      circleGroup.on('mouseenter', showTooltip);
      circleGroup.on('mouseleave', hideTooltip);

      titleText.on('click', handleClick);
      titleText.on('mouseenter', () => {
        circleGroup.select('.timeline-circle')
          .attr('r', 7)
          .attr('stroke-width', 3);
      });
      titleText.on('mouseleave', () => {
        circleGroup.select('.timeline-circle')
          .attr('r', 5)
          .attr('stroke-width', 1);
      });
      titleText.on('mouseenter', showTooltip);
      titleText.on('mouseleave', hideTooltip);
    });

    // Add auto-scroll behavior
    const svgEl = this.svg.node();
    if (svgEl) {
      svgEl.style.overflowX = 'auto';
      svgEl.style.overflowY = 'visible';
    }

    // Era filter setup
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
