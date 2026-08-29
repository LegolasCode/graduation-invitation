/**
 * =====================================================================
 * GUEST-LINK.JS
 * =====================================================================
 * Setiap tamu mendapat link personal berisi token unik, contoh:
 *   https://domainkamu.com/index.html?to=aB3xQ9
 *
 * Module ini:
 * 1. Membaca token dari parameter URL "to"
 * 2. Mengambil nama tamu terkait dari spreadsheet (lewat token)
 * 3. Menampilkan nama tamu di kartu sapaan pada section amplop
 * 4. Mencatat ke spreadsheet bahwa tamu tsb sudah membuka undangannya
 *
 * Jika tidak ada parameter "to" di URL (link umum/tanpa nama), section
 * sapaan nama akan disembunyikan dan halaman tetap berjalan normal.
 * =====================================================================
 */

/**
 * initGuestLink
 * Titik masuk module ini. Dipanggil saat halaman dimuat.
 */
async function initGuestLink() {
  const token = getTokenFromUrl();
  const greetingWrapper = document.getElementById('guest-greeting-wrapper');
  const greetingNameEl = document.getElementById('guest-greeting-name');

  // Tidak ada token di URL -> tampilkan undangan versi umum (tanpa nama)
  if (!token) {
    if (greetingWrapper) greetingWrapper.classList.add('hidden');
    return;
  }

  // URL Apps Script belum dikonfigurasi -> jangan sampai error mengganggu halaman
  if (!CONFIG.api.appsScriptUrl || CONFIG.api.appsScriptUrl.startsWith('GANTI_DENGAN')) {
    if (greetingWrapper) greetingWrapper.classList.add('hidden');
    return;
  }

  try {
    const guest = await fetchGuestByToken(token);
    if (guest && guest.nama) {
      if (greetingNameEl) greetingNameEl.textContent = guest.nama;
      if (greetingWrapper) greetingWrapper.classList.remove('hidden');

      // Catat bahwa undangan ini sudah dibuka/diakses (best-effort, tidak blocking)
      markInvitationOpened(token);
    } else {
      if (greetingWrapper) greetingWrapper.classList.add('hidden');
    }
  } catch (err) {
    console.warn('Gagal mengambil data tamu dari token:', err);
    if (greetingWrapper) greetingWrapper.classList.add('hidden');
  }
}

/**
 * getTokenFromUrl
 * Mengambil nilai parameter "to" dari URL saat ini.
 *
 * @returns {string|null}
 */
function getTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('to');
}
