/**
 * =====================================================================
 * COUNTDOWN.JS
 * =====================================================================
 * Mengisi tanggal & jam acara pada kartu kalender, serta menjalankan
 * timer mundur (hari, jam, menit, detik) menuju hari-H wisuda.
 * Semua sumber tanggal diambil dari CONFIG.acara di config.js supaya
 * gampang diganti tanpa menyentuh file ini.
 * =====================================================================
 */

let countdownIntervalId = null;

/**
 * initCountdown
 * Titik masuk module ini. Mengisi info tanggal statis lalu memulai
 * interval untuk update angka countdown setiap detik.
 */
function initCountdown() {
  renderCalendarInfo();
  renderCalendarGrid();
  updateCountdown(); // render pertama kali supaya tidak ada jeda 1 detik
  countdownIntervalId = setInterval(updateCountdown, 1000);
}

/**
 * renderCalendarInfo
 * Menampilkan tanggal & jam acara (teks) ke dalam kartu kalender.
 */
function renderCalendarInfo() {
  const tanggalEl = document.getElementById('calendar-tanggal');
  const jamEl = document.getElementById('calendar-jam');

  if (tanggalEl) tanggalEl.textContent = CONFIG.acara.tanggalTampil;
  if (jamEl) jamEl.textContent = CONFIG.acara.jamTampil;
}

/**
 * renderCalendarGrid
 * Menggambar mini kalender bulan berjalan (grid 7 kolom) dan menandai
 * tanggal wisuda dengan highlight warna gold.
 */
function renderCalendarGrid() {
  const gridEl = document.getElementById('calendar-grid');
  const monthLabelEl = document.getElementById('calendar-month-label');
  if (!gridEl) return;

  const eventDate = new Date(CONFIG.acara.tanggalISO);
  const year = eventDate.getFullYear();
  const month = eventDate.getMonth(); // 0-11
  const eventDay = eventDate.getDate();

  const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  if (monthLabelEl) monthLabelEl.textContent = `${namaBulan[month]} ${year}`;

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Minggu
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  let html = '';

  // Header nama hari (Min - Sab)
  const namaHariPendek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  namaHariPendek.forEach((hari) => {
    html += `<div class="text-[10px] uppercase tracking-wider text-text-light/40 font-medium">${hari}</div>`;
  });

  // Sel kosong sebelum tanggal 1 (supaya tanggal 1 jatuh di kolom hari yang benar)
  for (let i = 0; i < firstDayOfMonth; i++) {
    html += `<div></div>`;
  }

  // Sel tanggal 1 s/d akhir bulan
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const isEventDay = day === eventDay;
    const cellClass = isEventDay
      ? 'bg-gold text-slate-950 font-bold shadow-lg shadow-gold/30 scale-110'
      : 'text-text-light/70';
    html += `<div class="flex items-center justify-center h-8 w-8 mx-auto rounded-full text-xs md:text-sm transition-all ${cellClass}">${day}</div>`;
  }

  gridEl.innerHTML = html;
}

/**
 * updateCountdown
 * Menghitung selisih waktu sekarang dengan tanggal acara, lalu
 * menampilkannya dalam format hari/jam/menit/detik. Dipanggil setiap
 * 1 detik lewat setInterval.
 */
function updateCountdown() {
  const eventDate = new Date(CONFIG.acara.tanggalISO).getTime();
  const now = new Date().getTime();
  const distance = eventDate - now;

  const dayEl = document.getElementById('countdown-days');
  const hourEl = document.getElementById('countdown-hours');
  const minuteEl = document.getElementById('countdown-minutes');
  const secondEl = document.getElementById('countdown-seconds');
  const labelEl = document.getElementById('countdown-label');

  // Jika tanggal acara sudah lewat, hentikan timer & tampilkan pesan
  if (distance <= 0) {
    if (countdownIntervalId) clearInterval(countdownIntervalId);
    [dayEl, hourEl, minuteEl, secondEl].forEach((el) => {
      if (el) el.textContent = '00';
    });
    if (labelEl) labelEl.textContent = 'Acara sedang/telah berlangsung';
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // padStart supaya selalu tampil 2 digit, mis. "05" bukan "5"
  if (dayEl) dayEl.textContent = String(days).padStart(2, '0');
  if (hourEl) hourEl.textContent = String(hours).padStart(2, '0');
  if (minuteEl) minuteEl.textContent = String(minutes).padStart(2, '0');
  if (secondEl) secondEl.textContent = String(seconds).padStart(2, '0');
}
