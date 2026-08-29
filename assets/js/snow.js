/**
 * =====================================================================
 * SNOW.JS
 * =====================================================================
 * Membuat efek kepingan salju yang jatuh dari atas ke bawah layar
 * secara acak (posisi, ukuran, kecepatan, transparansi berbeda-beda).
 * Ini adalah versi vanilla JS dari SnowEffect.jsx (React) di kode lama.
 * =====================================================================
 */

/**
 * initSnowEffect
 * Membuat sejumlah elemen <div class="snowflake"> di dalam container
 * yang diberikan, masing-masing dengan posisi & animasi acak.
 *
 * @param {string} containerId - id elemen container tempat salju dirender
 * @param {number} count - jumlah kepingan salju yang dibuat
 */
function initSnowEffect(containerId, count = 60) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Fragment dipakai supaya browser hanya perlu 1x reflow, bukan per-elemen.
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const size = Math.random() * 4 + 1;         // ukuran 1px - 5px
    const leftPosition = Math.random() * 100;   // posisi horizontal acak 0% - 100%
    const duration = Math.random() * 7 + 5;      // durasi jatuh 5s - 12s
    const delay = Math.random() * -10;           // delay negatif = animasi sudah "berjalan" saat load
    const opacity = Math.random() * 0.6 + 0.2;   // transparansi acak
    const blur = size > 3 ? '1px' : '0px';       // salju besar sedikit blur (efek kedalaman)

    const flake = document.createElement('div');
    flake.className = 'snowflake';
    flake.style.left = `${leftPosition}%`;
    flake.style.width = `${size}px`;
    flake.style.height = `${size}px`;
    flake.style.animationDuration = `${duration}s`;
    flake.style.animationDelay = `${delay}s`;
    flake.style.opacity = opacity;
    flake.style.filter = `blur(${blur})`;

    fragment.appendChild(flake);
  }

  container.appendChild(fragment);
}
