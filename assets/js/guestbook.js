/**
 * =====================================================================
 * GUESTBOOK.JS
 * =====================================================================
 * Mengatur section "Ucapan & Doa": submit form (nama + pesan) ke
 * Google Spreadsheet lewat sheets-api.js, lalu menampilkan daftar
 * ucapan yang sudah masuk di bawah form.
 * =====================================================================
 */

/**
 * initGuestbook
 * Titik masuk module ini. Memuat daftar ucapan yang sudah ada &
 * memasang event submit pada form.
 */
function initGuestbook() {
  loadAndRenderMessages();

  const form = document.getElementById('guestbook-form');
  if (form) form.addEventListener('submit', handleGuestbookSubmit);
}

/**
 * loadAndRenderMessages
 * Mengambil seluruh ucapan dari spreadsheet dan merendernya ke dalam
 * daftar di bawah form. Menampilkan state loading & error yang jelas.
 */
async function loadAndRenderMessages() {
  const listEl = document.getElementById('guestbook-list');
  if (!listEl) return;

  listEl.innerHTML = `<p class="text-center text-text-light/50 text-sm py-4">Memuat ucapan...</p>`;

  try {
    const messages = await fetchGuestMessages();
    renderMessages(messages);
  } catch (err) {
    console.error(err);
    listEl.innerHTML = `<p class="text-center text-red-400/80 text-sm py-4">Gagal memuat ucapan. Coba muat ulang halaman.</p>`;
  }
}

/**
 * renderMessages
 * Menggambar daftar kartu ucapan ke dalam DOM.
 *
 * @param {Array<{nama:string, pesan:string, waktu:string}>} messages
 */
function renderMessages(messages) {
  const listEl = document.getElementById('guestbook-list');
  const countEl = document.getElementById('guestbook-count');
  if (!listEl) return;

  if (countEl) countEl.textContent = messages.length;

  if (messages.length === 0) {
    listEl.innerHTML = `<p class="text-center text-text-light/50 text-sm py-4">Jadilah yang pertama mengirimkan ucapan & doa \u{1F64F}</p>`;
    return;
  }

  // Tampilkan yang paling baru di atas
  const sorted = [...messages].reverse();

  listEl.innerHTML = sorted
    .map(
      (msg) => `
      <div class="guestbook-card bg-slate-900/50 backdrop-blur-sm rounded-lg p-4 text-left">
        <p class="font-serif-display text-gold text-sm md:text-base">${escapeHtml(msg.nama)}</p>
        <p class="text-text-light/80 text-sm mt-1 leading-relaxed">${escapeHtml(msg.pesan)}</p>
        ${msg.waktu ? `<p class="text-text-light/30 text-[11px] mt-2">${escapeHtml(msg.waktu)}</p>` : ''}
      </div>
    `
    )
    .join('');
}

/**
 * handleGuestbookSubmit
 * Dipanggil saat form ucapan & doa di-submit. Melakukan validasi
 * sederhana, mengirim data ke spreadsheet, lalu me-refresh daftar
 * ucapan supaya kiriman baru langsung terlihat.
 *
 * @param {SubmitEvent} e
 */
async function handleGuestbookSubmit(e) {
  e.preventDefault();

  const namaInput = document.getElementById('guestbook-nama');
  const pesanInput = document.getElementById('guestbook-pesan');
  const submitBtn = document.getElementById('guestbook-submit-btn');
  const errorEl = document.getElementById('guestbook-error');

  const nama = namaInput.value.trim();
  const pesan = pesanInput.value.trim();

  if (errorEl) errorEl.classList.add('hidden');

  if (!nama || !pesan) {
    if (errorEl) {
      errorEl.textContent = 'Nama dan pesan wajib diisi.';
      errorEl.classList.remove('hidden');
    }
    return;
  }

  // Nonaktifkan tombol & tampilkan spinner selama proses kirim
  setSubmitLoading(submitBtn, true);

  try {
    await submitGuestMessage(nama, pesan);
    namaInput.value = '';
    pesanInput.value = '';
    await loadAndRenderMessages(); // refresh daftar supaya kiriman baru muncul
  } catch (err) {
    console.error(err);
    if (errorEl) {
      errorEl.textContent = 'Gagal mengirim ucapan. Periksa koneksi internet lalu coba lagi.';
      errorEl.classList.remove('hidden');
    }
  } finally {
    setSubmitLoading(submitBtn, false);
  }
}

/**
 * setSubmitLoading
 * Mengganti tampilan tombol submit antara state normal & loading.
 *
 * @param {HTMLButtonElement} btn
 * @param {boolean} isLoading
 */
function setSubmitLoading(btn, isLoading) {
  if (!btn) return;
  btn.disabled = isLoading;
  btn.innerHTML = isLoading
    ? `<span class="spinner"></span> Mengirim...`
    : `Kirim Ucapan`;
}

/**
 * escapeHtml
 * Membersihkan input user dari karakter HTML berbahaya sebelum
 * ditampilkan ke DOM, supaya terhindar dari XSS lewat isi pesan.
 *
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
