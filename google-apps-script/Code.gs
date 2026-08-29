/**
 * =====================================================================
 * CODE.GS — Backend Google Apps Script untuk Undangan Wisuda Online
 * =====================================================================
 * File ini dijalankan di dalam Google Spreadsheet (Extensions > Apps
 * Script), lalu di-deploy sebagai "Web App" agar bisa dipanggil dari
 * halaman index.html / admin.html lewat fetch() (lihat sheets-api.js).
 *
 * STRUKTUR SPREADSHEET YANG DIBUTUHKAN (dibuat otomatis oleh
 * getOrCreateSheet() jika belum ada):
 *
 * Sheet "Tamu":
 *   Token | Nama | Link | Status | Waktu Dibuat | Waktu Dibuka
 *
 * Sheet "Ucapan":
 *   Nama | Pesan | Waktu
 *
 * Cara deploy: lihat README.md bagian "Setup Google Apps Script".
 * =====================================================================
 */

// -----------------------------------------------------------------
// KONFIGURASI — WAJIB DIUBAH sebelum deploy
// -----------------------------------------------------------------

// Kunci sederhana untuk melindungi endpoint admin (tambah tamu, lihat
// daftar tamu) dari orang yang tidak berkepentingan. Ganti dengan
// string acak milikmu sendiri, lalu masukkan nilai yang sama di
// halaman admin.html saat login.
// CATATAN KEAMANAN: ini BUKAN sistem autentikasi yang kuat, hanya
// pengaman dasar. Jangan bagikan URL Web App + admin key ke publik.
const ADMIN_KEY = 'priahitam';

// URL dasar halaman undangan kamu setelah di-hosting (tanpa trailing
// slash), dipakai untuk menyusun link personal tamu.
// Contoh: 'https://namakamu.github.io/undangan-wisuda'
const BASE_URL = 'GANTI_DENGAN_URL_HOSTING_UNDANGAN_KAMU';

const SHEET_TAMU = 'Tamu';
const SHEET_UCAPAN = 'Ucapan';


/**
 * doGet
 * Router untuk semua request GET (mengambil data). Dipetakan lewat
 * parameter "action" di query string.
 *
 * @param {GoogleAppsScript.Events.DoGet} e
 * @returns {GoogleAppsScript.Content.TextOutput} JSON response
 */
function doGet(e) {
  const action = e.parameter.action;

  try {
    switch (action) {
      case 'getMessages':
        return jsonResponse({ success: true, data: getMessages() });

      case 'getGuest':
        return jsonResponse({ success: true, data: getGuestByToken(e.parameter.token) });

      case 'getGuestList':
        requireAdminKey(e.parameter.adminKey);
        return jsonResponse({ success: true, data: getGuestList() });

      default:
        return jsonResponse({ success: false, message: 'Action tidak dikenali' });
    }
  } catch (err) {
    return jsonResponse({ success: false, message: err.message });
  }
}

/**
 * doPost
 * Router untuk semua request POST (mengubah data). Body dikirim
 * sebagai JSON text (lihat sheets-api.js -> sheetsApiPost), dipetakan
 * lewat field "action" di dalam body.
 *
 * @param {GoogleAppsScript.Events.DoPost} e
 * @returns {GoogleAppsScript.Content.TextOutput} JSON response
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    switch (action) {
      case 'addMessage':
        return jsonResponse({ success: true, data: addMessage(body.nama, body.pesan) });

      case 'addGuest':
        requireAdminKey(body.adminKey);
        return jsonResponse({ success: true, data: addGuest(body.nama) });

      case 'markOpened':
        return jsonResponse({ success: true, data: markOpened(body.token) });

      default:
        return jsonResponse({ success: false, message: 'Action tidak dikenali' });
    }
  } catch (err) {
    return jsonResponse({ success: false, message: err.message });
  }
}


// =====================================================================
// FUNGSI-FUNGSI UNTUK SHEET "UCAPAN" (Buku Tamu / Pesan & Doa)
// =====================================================================

/**
 * getMessages
 * Mengambil semua baris di sheet "Ucapan" dan mengubahnya menjadi
 * array of object supaya mudah diolah di JS frontend.
 *
 * @returns {Array<{nama:string, pesan:string, waktu:string}>}
 */
function getMessages() {
  const sheet = getOrCreateSheet(SHEET_UCAPAN, ['Nama', 'Pesan', 'Waktu']);
  const rows = sheet.getDataRange().getValues();
  rows.shift(); // buang baris header

  return rows
    .filter((row) => row[0]) // buang baris kosong
    .map((row) => ({
      nama: String(row[0]),
      pesan: String(row[1]),
      waktu: formatTanggal(row[2]),
    }));
}

/**
 * addMessage
 * Menambahkan satu baris ucapan & doa baru ke sheet "Ucapan".
 *
 * @param {string} nama
 * @param {string} pesan
 * @returns {{success: boolean}}
 */
function addMessage(nama, pesan) {
  if (!nama || !pesan) throw new Error('Nama dan pesan wajib diisi');

  const sheet = getOrCreateSheet(SHEET_UCAPAN, ['Nama', 'Pesan', 'Waktu']);
  sheet.appendRow([
    sanitizeText(nama).substring(0, 100),
    sanitizeText(pesan).substring(0, 500),
    new Date(),
  ]);

  return { success: true };
}


// =====================================================================
// FUNGSI-FUNGSI UNTUK SHEET "TAMU" (Daftar tamu & link personal)
// =====================================================================

/**
 * addGuest
 * Menambahkan tamu baru: generate token unik, susun link personal,
 * lalu simpan ke sheet "Tamu".
 *
 * @param {string} nama
 * @returns {{token:string, link:string}}
 */
function addGuest(nama) {
  if (!nama) throw new Error('Nama tamu wajib diisi');

  const sheet = getOrCreateSheet(SHEET_TAMU, ['Token', 'Nama', 'Link', 'Status', 'Waktu Dibuat', 'Waktu Dibuka']);
  const token = generateToken();
  const link = `${BASE_URL}/index.html?to=${token}`;

  sheet.appendRow([
    token,
    sanitizeText(nama).substring(0, 100),
    link,
    'Belum Dibuka',
    new Date(),
    '',
  ]);

  return { token, link };
}

/**
 * getGuestByToken
 * Mencari satu tamu berdasarkan token, dipakai untuk menyapa nama
 * tamu secara personal di halaman undangan.
 *
 * @param {string} token
 * @returns {{nama:string}|null}
 */
function getGuestByToken(token) {
  if (!token) return null;

  const sheet = getOrCreateSheet(SHEET_TAMU, ['Token', 'Nama', 'Link', 'Status', 'Waktu Dibuat', 'Waktu Dibuka']);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(token)) {
      return { nama: String(rows[i][1]) };
    }
  }
  return null;
}

/**
 * markOpened
 * Menandai bahwa tamu dengan token tertentu sudah membuka
 * undangannya (mengisi kolom Status & Waktu Dibuka).
 *
 * @param {string} token
 * @returns {{success: boolean}}
 */
function markOpened(token) {
  if (!token) return { success: false };

  const sheet = getOrCreateSheet(SHEET_TAMU, ['Token', 'Nama', 'Link', 'Status', 'Waktu Dibuat', 'Waktu Dibuka']);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(token)) {
      const rowNumber = i + 1; // +1 karena getRange 1-indexed & ada header
      sheet.getRange(rowNumber, 4).setValue('Sudah Dibuka'); // kolom D = Status
      // Hanya isi "Waktu Dibuka" sekali saja (saat pertama kali dibuka)
      if (!rows[i][5]) {
        sheet.getRange(rowNumber, 6).setValue(new Date()); // kolom F = Waktu Dibuka
      }
      return { success: true };
    }
  }
  return { success: false };
}

/**
 * getGuestList
 * Mengambil seluruh daftar tamu (dipakai di halaman admin).
 *
 * @returns {Array<Object>}
 */
function getGuestList() {
  const sheet = getOrCreateSheet(SHEET_TAMU, ['Token', 'Nama', 'Link', 'Status', 'Waktu Dibuat', 'Waktu Dibuka']);
  const rows = sheet.getDataRange().getValues();
  rows.shift(); // buang header

  return rows
    .filter((row) => row[0])
    .reverse() // tamu terbaru muncul di atas
    .map((row) => ({
      token: String(row[0]),
      nama: String(row[1]),
      link: String(row[2]),
      status: String(row[3]),
      waktuDibuat: formatTanggal(row[4]),
      waktuDibuka: row[5] ? formatTanggal(row[5]) : '-',
    }));
}


// =====================================================================
// UTILITAS
// =====================================================================

/**
 * getOrCreateSheet
 * Mengambil sheet berdasarkan nama; jika belum ada, sheet baru akan
 * dibuat otomatis lengkap dengan baris header.
 *
 * @param {string} name
 * @param {Array<string>} headers
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

/**
 * generateToken
 * Membuat string acak pendek (8 karakter alfanumerik) sebagai token
 * unik untuk link undangan personal tiap tamu.
 *
 * @returns {string}
 */
function generateToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let token = '';
  for (let i = 0; i < 8; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * requireAdminKey
 * Menghentikan eksekusi (throw error) jika admin key yang dikirim
 * tidak cocok dengan ADMIN_KEY di konfigurasi atas.
 *
 * @param {string} key
 */
function requireAdminKey(key) {
  if (key !== ADMIN_KEY) {
    throw new Error('Admin key salah atau tidak diisi');
  }
}

/**
 * sanitizeText
 * Membersihkan whitespace berlebih dari teks input sebelum disimpan
 * ke spreadsheet.
 *
 * @param {string} text
 * @returns {string}
 */
function sanitizeText(text) {
  return String(text).trim().replace(/\s+/g, ' ');
}

/**
 * formatTanggal
 * Mengubah objek Date dari spreadsheet menjadi string tanggal yang
 * mudah dibaca, format Indonesia.
 *
 * @param {Date|string} date
 * @returns {string}
 */
function formatTanggal(date) {
  if (!date) return '';
  try {
    return Utilities.formatDate(new Date(date), 'GMT+7', 'dd MMM yyyy, HH:mm') + ' WIB';
  } catch (err) {
    return String(date);
  }
}

/**
 * jsonResponse
 * Helper untuk membungkus object JS menjadi TextOutput JSON yang
 * benar, siap dikirim sebagai response HTTP.
 *
 * @param {Object} obj
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
