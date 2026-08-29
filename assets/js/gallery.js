/**
 * =====================================================================
 * GALLERY.JS
 * =====================================================================
 * Merender grid galeri foto (semester 1 - 8) berdasarkan data di
 * CONFIG.galeri, serta menampilkan lightbox (foto besar + caption)
 * saat salah satu thumbnail diklik.
 * =====================================================================
 */

/**
 * initGallery
 * Titik masuk module ini. Merender grid foto & memasang event listener
 * untuk membuka/menutup lightbox.
 */
function initGallery() {
  renderGalleryGrid();
  setupLightboxEvents();
}

/**
 * renderGalleryGrid
 * Membuat elemen thumbnail untuk tiap foto di CONFIG.galeri dan
 * memasukkannya ke dalam container #gallery-grid.
 */
function renderGalleryGrid() {
  const gridEl = document.getElementById('gallery-grid');
  if (!gridEl) return;

  const html = CONFIG.galeri
    .map(
      (item, index) => `
      <button
        type="button"
        class="gallery-item group relative aspect-square overflow-hidden rounded-xl border border-white/10 shadow-lg"
        data-index="${index}"
        aria-label="Lihat foto semester ${item.semester}"
      >
        <img
          src="${item.src}"
          alt="Foto semester ${item.semester} - ${item.caption}"
          loading="lazy"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onerror="this.src='https://placehold.co/600x600/1e293b/c29043?text=Semester+${item.semester}'"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent"></div>
        <span class="absolute bottom-2 left-3 text-xs md:text-sm font-serif-display text-gold tracking-wide">
          Semester ${item.semester}
        </span>
      </button>
    `
    )
    .join('');

  gridEl.innerHTML = html;

  // Pasang event klik per thumbnail (event delegation dari container juga
  // bisa, tapi loop langsung lebih sederhana untuk jumlah foto sedikit)
  gridEl.querySelectorAll('.gallery-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index, 10);
      openLightbox(index);
    });
  });
}

/**
 * openLightbox
 * Menampilkan modal lightbox berisi foto ukuran besar + caption sesuai
 * index foto yang diklik.
 *
 * @param {number} index - index foto pada CONFIG.galeri
 */
function openLightbox(index) {
  const item = CONFIG.galeri[index];
  if (!item) return;

  const lightbox = document.getElementById('gallery-lightbox');
  const imgEl = document.getElementById('lightbox-image');
  const captionEl = document.getElementById('lightbox-caption');

  if (!lightbox || !imgEl || !captionEl) return;

  imgEl.src = item.src;
  imgEl.alt = `Foto semester ${item.semester}`;
  imgEl.onerror = () => {
    imgEl.src = `https://placehold.co/900x900/1e293b/c29043?text=Semester+${item.semester}`;
  };
  captionEl.textContent = `Semester ${item.semester} — ${item.caption}`;

  lightbox.classList.remove('hidden');
  lightbox.classList.add('flex');
  document.body.classList.add('no-scroll');
}

/**
 * closeLightbox
 * Menutup modal lightbox dan mengembalikan scroll body ke normal.
 */
function closeLightbox() {
  const lightbox = document.getElementById('gallery-lightbox');
  if (!lightbox) return;

  lightbox.classList.add('hidden');
  lightbox.classList.remove('flex');
  document.body.classList.remove('no-scroll');
}

/**
 * setupLightboxEvents
 * Memasang event listener untuk menutup lightbox: klik tombol close,
 * klik area gelap di luar foto, atau menekan tombol Escape.
 */
function setupLightboxEvents() {
  const lightbox = document.getElementById('gallery-lightbox');
  const closeBtn = document.getElementById('lightbox-close-btn');

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      // Hanya tutup jika klik tepat di backdrop, bukan di foto/caption
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}
