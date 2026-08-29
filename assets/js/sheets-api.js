/**
 * =====================================================================
 * SHEETS-API.JS
 * =====================================================================
 * Lapisan komunikasi antara halaman web (vanilla JS) dengan Google
 * Spreadsheet, lewat perantara Google Apps Script yang di-deploy
 * sebagai "Web App" (lihat google-apps-script/Code.gs).
 *
 * Kenapa tidak langsung pakai Google Sheets API resmi dari client-side?
 * Karena Google Sheets API butuh OAuth/API key yang TIDAK aman jika
 * ditaruh di kode JS publik (bisa dicuri & disalahgunakan). Apps Script
 * Web App jadi "jembatan" backend sederhana yang aman dipanggil dari
 * browser tanpa perlu expose kredensial apapun.
 *
 * Semua fungsi di sini mengembalikan Promise (async/await friendly).
 * =====================================================================
 */

/**
 * sheetsApiGet
 * Helper generik untuk request GET ke Apps Script Web App.
 *
 * @param {Object} params - query params, mis. { action: 'getMessages' }
 * @returns {Promise<Object>} hasil parse JSON dari response
 */
async function sheetsApiGet(params) {
  const url = new URL(CONFIG.api.appsScriptUrl);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url.toString(), { method: 'GET' });
  if (!response.ok) throw new Error(`Gagal mengambil data (status ${response.status})`);
  return response.json();
}

/**
 * sheetsApiPost
 * Helper generik untuk request POST ke Apps Script Web App.
 * Menggunakan text/plain sebagai content-type agar terhindar dari
 * preflight CORS OPTIONS request (Apps Script Web App tidak selalu
 * menghandle preflight dengan baik).
 *
 * @param {Object} body - payload yang dikirim, akan di-JSON.stringify
 * @returns {Promise<Object>} hasil parse JSON dari response
 */
async function sheetsApiPost(body) {
  const response = await fetch(CONFIG.api.appsScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Gagal mengirim data (status ${response.status})`);
  return response.json();
}

/**
 * fetchGuestMessages
 * Mengambil seluruh daftar ucapan & doa dari sheet "Ucapan", diurutkan
 * dari yang paling baru.
 *
 * @returns {Promise<Array<{nama:string, pesan:string, waktu:string}>>}
 */
async function fetchGuestMessages() {
  const result = await sheetsApiGet({ action: 'getMessages' });
  return result.data || [];
}

/**
 * submitGuestMessage
 * Mengirim ucapan & doa baru dari form Buku Tamu ke sheet "Ucapan".
 *
 * @param {string} nama
 * @param {string} pesan
 * @returns {Promise<Object>} response dari server, mis. { success: true }
 */
async function submitGuestMessage(nama, pesan) {
  return sheetsApiPost({ action: 'addMessage', nama, pesan });
}

/**
 * fetchGuestByToken
 * Mengambil data satu tamu undangan berdasarkan token unik di URL
 * (?to=TOKEN), dipakai untuk menyapa nama tamu secara personal di
 * halaman undangan.
 *
 * @param {string} token
 * @returns {Promise<{nama:string}|null>}
 */
async function fetchGuestByToken(token) {
  const result = await sheetsApiGet({ action: 'getGuest', token });
  return result.data || null;
}

/**
 * markInvitationOpened
 * Menandai di spreadsheet bahwa tamu dengan token tertentu sudah
 * membuka undangannya (opsional, berguna untuk tracking kehadiran).
 *
 * @param {string} token
 */
async function markInvitationOpened(token) {
  if (!token) return;
  try {
    await sheetsApiPost({ action: 'markOpened', token });
  } catch (err) {
    // Gagal tracking tidak boleh mengganggu pengalaman utama user,
    // jadi cukup dicatat di console saja.
    console.warn('Gagal mencatat status "dibuka":', err);
  }
}

/**
 * addGuestToSheet
 * (Dipakai di halaman admin) Menambahkan nama tamu baru ke sheet
 * "Tamu" dan meminta server men-generate token unik untuk link
 * undangan personal.
 *
 * @param {string} nama
 * @param {string} adminKey - kunci sederhana untuk mencegah orang
 *   sembarangan menambah data tamu, lihat README.
 * @returns {Promise<{token:string, link:string}>}
 */
async function addGuestToSheet(nama, adminKey) {
  const result = await sheetsApiPost({ action: 'addGuest', nama, adminKey });
  return result.data;
}

/**
 * fetchAllGuests
 * (Dipakai di halaman admin) Mengambil seluruh daftar tamu beserta
 * status undangannya (sudah dibuka atau belum).
 *
 * @param {string} adminKey
 * @returns {Promise<Array<Object>>}
 */
async function fetchAllGuests(adminKey) {
  const result = await sheetsApiGet({ action: 'getGuestList', adminKey });
  return result.data || [];
}
