/**
 * =====================================================================
 * ADMIN.JS
 * =====================================================================
 * Logika untuk halaman admin.html:
 * 1. Simpan/baca "admin key" sederhana dari localStorage (bukan sistem
 *    login sungguhan — lihat catatan keamanan di README).
 * 2. Tambah nama tamu baru -> minta server generate token unik ->
 *    tampilkan link personal yang siap dibagikan.
 * 3. Tampilkan seluruh daftar tamu beserta status "sudah dibuka" atau
 *    belum, dan tombol salin link untuk masing-masing.
 * =====================================================================
 */

const ADMIN_KEY_STORAGE = 'undangan_admin_key';

document.addEventListener('DOMContentLoaded', () => {
  initAdminKeyGate();
});

/**
 * initAdminKeyGate
 * Menampilkan form admin key jika belum tersimpan di localStorage,
 * atau langsung menampilkan dashboard admin jika sudah ada.
 */
function initAdminKeyGate() {
  const savedKey = localStorage.getItem(ADMIN_KEY_STORAGE);
  const gateForm = document.getElementById('admin-key-form');
  const dashboard = document.getElementById('admin-dashboard');

  if (savedKey) {
    showAdminDashboard(savedKey);
  } else {
    if (gateForm) gateForm.classList.remove('hidden');
    if (dashboard) dashboard.classList.add('hidden');
  }

  if (gateForm) {
    gateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('admin-key-input');
      const key = input.value.trim();
      if (!key) return;
      localStorage.setItem(ADMIN_KEY_STORAGE, key);
      showAdminDashboard(key);
    });
  }

  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem(ADMIN_KEY_STORAGE);
      window.location.reload();
    });
  }
}

/**
 * showAdminDashboard
 * Menampilkan dashboard utama admin & memuat data tamu pertama kali.
 *
 * @param {string} adminKey
 */
function showAdminDashboard(adminKey) {
  const gateForm = document.getElementById('admin-key-form');
  const dashboard = document.getElementById('admin-dashboard');
  if (gateForm) gateForm.classList.add('hidden');
  if (dashboard) dashboard.classList.remove('hidden');

  const addForm = document.getElementById('add-guest-form');
  if (addForm) {
    addForm.addEventListener('submit', (e) => handleAddGuest(e, adminKey));
  }

  loadGuestList(adminKey);

  const refreshBtn = document.getElementById('refresh-guest-list-btn');
  if (refreshBtn) refreshBtn.addEventListener('click', () => loadGuestList(adminKey));
}

/**
 * handleAddGuest
 * Menangani submit form "Tambah Tamu": mengirim nama ke server,
 * menerima token + link personal, lalu menampilkannya siap disalin.
 *
 * @param {SubmitEvent} e
 * @param {string} adminKey
 */
async function handleAddGuest(e, adminKey) {
  e.preventDefault();

  const namaInput = document.getElementById('guest-nama-input');
  const submitBtn = document.getElementById('add-guest-submit-btn');
  const resultBox = document.getElementById('add-guest-result');
  const errorBox = document.getElementById('add-guest-error');

  const nama = namaInput.value.trim();
  if (errorBox) errorBox.classList.add('hidden');
  if (!nama) return;

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="spinner"></span> Memproses...`;

  try {
    const result = await addGuestToSheet(nama, adminKey);
    namaInput.value = '';

    if (resultBox) {
      resultBox.classList.remove('hidden');
      resultBox.innerHTML = renderGeneratedLinkCard(nama, result.link);
      attachCopyButtonEvents(resultBox);
    }

    // Refresh daftar tamu supaya tamu baru langsung terlihat di tabel
    loadGuestList(adminKey);
  } catch (err) {
    console.error(err);
    if (errorBox) {
      errorBox.textContent = 'Gagal menambah tamu. Periksa Admin Key & URL Apps Script di config.js.';
      errorBox.classList.remove('hidden');
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Generate Link';
  }
}

/**
 * loadGuestList
 * Mengambil & merender seluruh daftar tamu ke dalam tabel.
 *
 * @param {string} adminKey
 */
async function loadGuestList(adminKey) {
  const tableBody = document.getElementById('guest-table-body');
  const emptyState = document.getElementById('guest-table-empty');
  if (!tableBody) return;

  tableBody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-text-light/50 text-sm">Memuat data...</td></tr>`;

  try {
    const guests = await fetchAllGuests(adminKey);

    if (!guests || guests.length === 0) {
      tableBody.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    tableBody.innerHTML = guests.map(renderGuestRow).join('');
    attachCopyButtonEvents(tableBody);
  } catch (err) {
    console.error(err);
    tableBody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-red-400 text-sm">Gagal memuat daftar tamu. Cek Admin Key / koneksi.</td></tr>`;
  }
}

/**
 * renderGeneratedLinkCard
 * Membuat markup kartu hasil generate link untuk 1 tamu yang baru
 * ditambahkan.
 *
 * @param {string} nama
 * @param {string} link
 * @returns {string} HTML
 */
function renderGeneratedLinkCard(nama, link) {
  return `
    <div class="bg-slate-900/60 border border-gold/30 rounded-lg p-4">
      <p class="text-sm text-text-light/60 mb-1">Link untuk <span class="text-gold font-medium">${escapeHtml(nama)}</span>:</p>
      <div class="flex items-center gap-2">
        <input type="text" readonly value="${escapeHtml(link)}" class="flex-1 bg-slate-950/60 border border-white/10 rounded px-3 py-2 text-xs md:text-sm text-white" />
        <button type="button" class="copy-link-btn shrink-0 bg-gold hover:bg-gold-hover text-white text-xs md:text-sm font-semibold px-3 py-2 rounded" data-link="${escapeHtml(link)}">
          Salin
        </button>
      </div>
    </div>
  `;
}

/**
 * renderGuestRow
 * Membuat markup 1 baris tabel daftar tamu.
 *
 * @param {{nama:string, token:string, link:string, status:string, waktuDibuat:string}} guest
 * @returns {string} HTML
 */
function renderGuestRow(guest) {
  const statusBadge = guest.status === 'Sudah Dibuka'
    ? `<span class="inline-block px-2 py-1 rounded-full text-[11px] bg-emerald-500/20 text-emerald-400">Sudah Dibuka</span>`
    : `<span class="inline-block px-2 py-1 rounded-full text-[11px] bg-slate-500/20 text-slate-400">Belum Dibuka</span>`;

  return `
    <tr class="border-b border-white/5">
      <td class="py-3 px-3 text-sm text-white">${escapeHtml(guest.nama)}</td>
      <td class="py-3 px-3">${statusBadge}</td>
      <td class="py-3 px-3">
        <div class="flex items-center gap-2">
          <input type="text" readonly value="${escapeHtml(guest.link)}" class="w-40 md:w-64 bg-slate-950/60 border border-white/10 rounded px-2 py-1 text-[11px] text-white/70" />
          <button type="button" class="copy-link-btn shrink-0 text-gold hover:text-gold-hover text-xs font-semibold" data-link="${escapeHtml(guest.link)}">
            Salin
          </button>
        </div>
      </td>
      <td class="py-3 px-3 text-xs text-text-light/40">${escapeHtml(guest.waktuDibuat || '-')}</td>
    </tr>
  `;
}

/**
 * attachCopyButtonEvents
 * Memasang event listener "salin ke clipboard" pada semua tombol
 * dengan class .copy-link-btn di dalam container tertentu.
 *
 * @param {HTMLElement} container
 */
function attachCopyButtonEvents(container) {
  container.querySelectorAll('.copy-link-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const link = btn.dataset.link;
      try {
        await navigator.clipboard.writeText(link);
        const originalText = btn.textContent;
        btn.textContent = 'Tersalin!';
        setTimeout(() => { btn.textContent = originalText; }, 1500);
      } catch (err) {
        console.error('Gagal menyalin link:', err);
      }
    });
  });
}

/**
 * escapeHtml
 * Sama seperti versi di guestbook.js — membersihkan input dari
 * karakter HTML berbahaya sebelum ditampilkan.
 *
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
