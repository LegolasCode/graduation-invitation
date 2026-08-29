/**
 * =====================================================================
 * CONTENT.JS
 * =====================================================================
 * Mengisi teks & atribut statis di HTML berdasarkan data di CONFIG
 * (config.js), supaya semua info wisuda (nama, tanggal, lokasi, dst.)
 * cukup diubah di SATU tempat saja.
 * =====================================================================
 */

/**
 * initStaticContent
 * Titik masuk module ini. Dipanggil sekali saat halaman dimuat,
 * sebelum module lain (countdown, gallery, dsb) merender bagian
 * dinamisnya masing-masing.
 */
function initStaticContent() {
  renderHeroContent();
  renderUcapanContent();
  renderLokasiContent();
  renderFooterContent();
}

/**
 * renderHeroContent
 * Mengisi section 1 (foto & nama wisudawan) sesuai CONFIG.wisudawan.
 */
function renderHeroContent() {
  setText("hero-nama", CONFIG.wisudawan.nama);
  setText("hero-gelar", CONFIG.wisudawan.gelar);
  setText(
    "hero-fakultas-univ",
    `${CONFIG.wisudawan.fakultas} • ${CONFIG.wisudawan.universitas}`,
  );

  const heroBg = document.getElementById("hero-bg-image");
  if (heroBg)
    heroBg.style.backgroundImage = `url('${CONFIG.wisudawan.fotoBackground}')`;

  const profilePhoto = document.getElementById("hero-profile-photo");
  if (profilePhoto) {
    profilePhoto.src = CONFIG.wisudawan.fotoProfil;
    profilePhoto.onerror = () => {
      profilePhoto.src = "https://placehold.co/300x300/1e293b/c29043?text=Foto";
    };
  }
}

/**
 * renderUcapanContent
 * Mengisi section 2 (ucapan undangan) sesuai CONFIG.undangan.
 */
function renderUcapanContent() {
  setText("ucapan-judul", CONFIG.undangan.judul);
  setText("ucapan-isi", CONFIG.undangan.isiPesan);
  setText("ucapan-quote", CONFIG.undangan.ayatAtauQuote);
}

/**
 * renderLokasiContent
 * Mengisi section 4 (lokasi acara + peta) sesuai CONFIG.lokasi &
 * CONFIG.acara.
 */
function renderLokasiContent() {
  const data = CONFIG.lokasi;

  // 1. Isikan Teks Informasi
  document.getElementById("lokasi-nama-tempat").innerText = data.namaTempat;
  document.getElementById("lokasi-alamat").innerText = data.alamat;
  document.getElementById("lokasi-tanggal").innerText = data.tanggal;
  document.getElementById("lokasi-jam").innerText = data.jam;

  const mapBtn = document.getElementById("lokasi-map-link-btn");
  if (mapBtn) mapBtn.href = data.mapsLinkUrl;

  // 2. Inisialisasi OpenStreetMap via Leaflet.js
  if (document.getElementById("osm-map")) {
    const lat = data.lat || -0.914498;
    const lng = data.lng || 100.461877;

    // Inisialisasi center & level zoom peta
    const map = L.map("osm-map", {
      center: [lat, lng],
      zoom: 16,
      zoomControl: true,
      scrollWheelZoom: false, // Mencegah ter-scroll sengaja saat mengusap layar di HP
    });

    // Layer Ubin OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Dapatkan Kustom Marker Berbentuk Panah Penunjuk Lokasi
    const arrowIcon = L.divIcon({
      className: "custom-arrow-marker",
      html: `
        <div style="position: relative; display: flex; flex-direction: column; items-center: center; transform: translate(-50%, -100%);">
          <!-- Pop-up Label Nama Tempat -->
          <div style="background: #c29043; color: #ffffff; font-weight: bold; font-size: 11px; padding: 3px 8px; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); white-space: nowrap; margin-bottom: 4px; text-align: center;">
            ${data.namaTempat}
          </div>
          <!-- Ikon Panah Mengarah Kebawah -->
          <div style="width: 36px; height: 36px; background: #0f172a; border: 2px solid #c29043; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: 0 6px 12px rgba(0,0,0,0.4);">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c29043" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    // Tambahkan Marker ke Peta
    L.marker([lat, lng], { icon: arrowIcon }).addTo(map);
  }
}

/**
 * Memuat dan me-render galeri foto marquee dari CONFIG.js
 */
function loadGallerySection() {
  const galeriData = CONFIG.galeri;
  if (!galeriData) return;

  const trackAtas = document.getElementById('gallery-track-atas');
  const trackBawah = document.getElementById('gallery-track-bawah');

  function createCardHTML(item) {
    // Validasi jika item atau src tidak ada
    if (!item || !item.src) return '';

    return `
      <div class="gallery-card relative group flex-shrink-0 w-64 h-44 md:w-80 md:h-56 rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-slate-900 mx-2">
        <img src="${item.src}" 
             alt="${item.caption || 'Foto Galeri'}" 
             class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
             loading="lazy"
             onerror="this.onerror=null; this.parentElement.style.display='none';" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p class="text-white text-xs md:text-sm font-medium tracking-wide text-left">${item.caption || ''}</p>
        </div>
      </div>
    `;
  }

  // Render Baris Atas
  if (trackAtas && galeriData.barisAtas) {
    // Filter hanya item yang valid
    const validItems = galeriData.barisAtas.filter(item => item && item.src);
    const itemsHTML = validItems.map(createCardHTML).join('');
    trackAtas.innerHTML = itemsHTML + itemsHTML; // Duplikasi untuk infinite loop
  }

  // Render Baris Bawah
  if (trackBawah && galeriData.barisBawah) {
    const validItems = galeriData.barisBawah.filter(item => item && item.src);
    const itemsHTML = validItems.map(createCardHTML).join('');
    trackBawah.innerHTML = itemsHTML + itemsHTML; // Duplikasi untuk infinite loop
  }
}

/**
 * renderFooterContent
 * Mengisi section 7 (footer) sesuai CONFIG.footer.
 */
function renderFooterContent() {
  setText("footer-terima-kasih", CONFIG.footer.ucapanTerimaKasih);
  setText("footer-quote", CONFIG.footer.quote);
  setText("footer-ig-username", CONFIG.footer.instagramUsername);

  const igLink = document.getElementById("footer-ig-link");
  if (igLink) igLink.href = CONFIG.footer.instagramUrl;

  const yearEl = document.getElementById("footer-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/**
 * setText
 * Helper kecil: mengisi textContent sebuah elemen by id, dengan
 * pengecekan null supaya tidak error kalau elemen belum ada di DOM.
 *
 * @param {string} id
 * @param {string} value
 */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// Jalankan saat dokumen siap
document.addEventListener('DOMContentLoaded', loadGallerySection);
document.addEventListener("DOMContentLoaded", loadLokasiSection);

