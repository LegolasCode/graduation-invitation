/**
 * =====================================================================
 * ENVELOPE.JS
 * =====================================================================
 * Mengatur seluruh interaksi halaman pembuka undangan (amplop):
 * 1. Mengunci scroll sebelum amplop dibuka
 * 2. Animasi buka amplop saat tombol "Buka Undangan" ditekan
 * 3. Auto-scroll otomatis ke section Hero (Graduation) setelah amplop
 *    selesai terbuka
 * 4. Menyembunyikan section amplop dari alur dokumen setelah animasi
 *    selesai (supaya tidak menyisakan area kosong saat discroll)
 * =====================================================================
 */

/**
 * =====================================================================
 * ENVELOPE.JS (UPDATED PREMIUM)
 * =====================================================================
 */

const INVITATION_STATE = {
  CLOSED: 'closed',
  OPENING: 'opening', 
  OPENED: 'opened',   
};

let invitationState = INVITATION_STATE.CLOSED;

function initEnvelope() {
  window.scrollTo(0, 0);
  document.body.classList.add('no-scroll');

  const openButton = document.getElementById('open-invitation-btn');
  if (openButton) {
    openButton.addEventListener('click', handleOpenInvitation);
  }
}

function handleOpenInvitation() {
  if (invitationState !== INVITATION_STATE.CLOSED) return; 
  invitationState = INVITATION_STATE.OPENING;

  const flap = document.getElementById('envelope-flap');
  const paper = document.getElementById('envelope-paper');
  const waxSeal = document.getElementById('envelope-wax-seal');
  const openButton = document.getElementById('open-invitation-btn');
  const envelopeSection = document.getElementById('envelope-section');
  const guestGreeting = document.getElementById('guest-greeting-wrapper');
  const subtitle = document.getElementById('envelope-sub-title');

  // 1. Jalankan animasi pop-out pada lilin perekat & hilangkan tombol
  if (waxSeal) waxSeal.classList.add('animate-wax-pop');
  if (openButton) openButton.classList.add('animate-fade-btn');
  
  // Memudarkan teks pendukung pelan-pelan agar fokus ke amplop
  if (guestGreeting) guestGreeting.classList.add('opacity-0');
  if (subtitle) subtitle.classList.add('opacity-0');

  // 2. Trigger rotasi penutup 3D dan translasi vertikal kertas isi
  setTimeout(() => {
    if (flap) flap.classList.add('animate-open-flap-3d');
    if (paper) paper.classList.add('animate-paper-lift-drop');
  }, 300); // Penundaan mikro setelah lilin pecah

  // Total sinkronisasi waktu animasi baru: 300ms + 600ms (flap) + 1800ms (paper) + waktu baca (~700ms) = ~3.4 detik
  const TOTAL_ANIMATION_TIME = 3400;

  setTimeout(() => {
    invitationState = INVITATION_STATE.OPENED;
    document.body.classList.remove('no-scroll');

    // Memicu auto-scroll mulus ke halaman utama (Hero Section Wisuda)
    const heroSection = document.getElementById('hero-section');
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Jalankan efek pudar dan hancurkan dari layout DOM setelah layar bergeser
    if (envelopeSection) {
      envelopeSection.classList.add('animate-envelope-fadeout');
      envelopeSection.addEventListener(
        'animationend',
        () => {
          envelopeSection.style.display = 'none';
        },
        { once: true }
      );
    }
  }, TOTAL_ANIMATION_TIME);
}