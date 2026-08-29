/**
 * =====================================================================
 * MAIN.JS
 * =====================================================================
 * Entry point halaman index.html. Menjalankan inisialisasi semua
 * module lain secara berurutan setelah DOM selesai dimuat.
 *
 * Urutan file yang harus di-load di index.html SEBELUM file ini:
 *   config.js -> content.js -> snow.js -> envelope.js -> countdown.js
 *   -> gallery.js -> sheets-api.js -> guestbook.js -> guest-link.js
 *   -> main.js
 * =====================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initStaticContent();                   // isi teks statis dari config.js ke semua section
  initSnowEffect('snow-container', 60); // efek salju berjalan di seluruh halaman
  initEnvelope();                        // logika buka amplop + auto scroll
  initGuestLink();                       // sapaan nama tamu personal dari ?to=
  initCountdown();                       // kalender + countdown hari-H
  initGallery();                         // galeri foto semester 1-8 + lightbox
  initGuestbook();                       // form & daftar ucapan/doa
  initScrollReveal();                    // animasi fade-in saat section masuk viewport
  initSmoothNav();                       // klik ikon navigasi -> scroll ke section
});

/**
 * initScrollReveal
 * Menambahkan class "reveal-visible" pada elemen ber-class "reveal"
 * begitu elemen tersebut masuk ke area pandang (viewport) saat
 * discroll, menggunakan IntersectionObserver (ringan, tanpa listener
 * scroll manual).
 */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-6');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => observer.observe(el));
}

/**
 * initSmoothNav
 * Memasang smooth-scroll untuk semua link internal (href="#id") di
 * halaman, misalnya tombol/ikon navigasi pintasan antar section.
 */
function initSmoothNav() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
