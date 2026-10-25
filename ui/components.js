/**
 * OFLIM UI Components: Film Cassette Dock & Optical Lens Filter Chips
 * Builds and manages the authentic 35mm canister carousel and optical color glass filters.
 */

class UIComponents {
  /**
   * Build 19 Authentic 35mm Film Cassettes in Carousel Dock
   */
  static renderFilmCarousel(container, presets, activeIndex, onSelect) {
    if (!container) return;
    container.innerHTML = '';

    presets.forEach((preset, idx) => {
      const cassette = document.createElement('div');
      cassette.className = `film-cassette ${idx === activeIndex ? 'active' : ''}`;
      cassette.dataset.index = idx;

      // Authentic DX code stripes simulation
      const dxStripes = '||||||||'.split('').map((_, i) => `<span style="opacity: ${i % 2 === 0 ? 0.9 : 0.3};">|</span>`).join('');

      cassette.innerHTML = `
        <div class="cassette-top">
          <span class="cassette-brand">${preset.brand}</span>
          <span class="cassette-iso-pill">ISO ${preset.iso}</span>
        </div>
        <div class="cassette-name">${preset.name}</div>
        <div class="cassette-bottom">
          <span class="cassette-year">${preset.year}</span>
          <span class="cassette-dx-code">${preset.code} ${dxStripes}</span>
        </div>
      `;

      cassette.addEventListener('click', () => {
        if (onSelect) onSelect(idx);
      });

      container.appendChild(cassette);
    });
  }

  /**
   * Smoothly center active cassette in carousel view
   */
  static updateActiveCassette(container, activeIndex) {
    if (!container) return;
    const cards = container.querySelectorAll('.film-cassette');
    cards.forEach((c, i) => {
      c.classList.toggle('active', i === activeIndex);
    });

    const activeCard = cards[activeIndex];
    if (activeCard) {
      activeCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  /**
   * Build Optical Lens Filter Grid
   */
  static renderFilterChips(container, filters, activeId, onSelect) {
    if (!container) return;
    container.innerHTML = '';

    filters.forEach((filter) => {
      const cell = document.createElement('div');
      cell.className = `optical-filter-cell ${filter.id === activeId ? 'active' : ''}`;
      cell.dataset.id = filter.id;

      cell.innerHTML = `
        <div class="filter-disc-bezel">
          <div class="filter-disc-core" style="background-color: ${filter.hex}"></div>
        </div>
        <span class="filter-cell-name">${filter.name}</span>
        <span class="filter-cell-wave">${filter.wavelength}</span>
      `;

      cell.addEventListener('click', () => {
        if (onSelect) onSelect(filter);
      });

      container.appendChild(cell);
    });
  }

  static updateActiveFilter(container, activeId) {
    if (!container) return;
    container.querySelectorAll('.optical-filter-cell').forEach(c => {
      c.classList.toggle('active', c.dataset.id === activeId);
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UIComponents };
}
