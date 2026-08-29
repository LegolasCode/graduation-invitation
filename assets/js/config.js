/**
 * =====================================================================
 * CONFIG.JS
 * =====================================================================
 * Semua data yang sering diubah dikumpulkan di file ini supaya kamu
 * TIDAK perlu mengubah file HTML/JS lain saat mengganti info wisuda.
 *
 * Cara pakai: ubah nilai di object CONFIG di bawah ini sesuai kebutuhan.
 * =====================================================================
 */

const CONFIG = {
  // -------------------------------------------------------------
  // 1. DATA WISUDAWAN
  // -------------------------------------------------------------
  wisudawan: {
    nama: "Muhammad Nur Diaztara",
    gelar: "Sarjana Teknik Komputer",
    fakultas: "Fakultas Teknologi Informasi",
    universitas: "Universitas Andalas",
    fotoProfil: "assets/images/profile-photo.jpg", // foto lingkaran di hero section
    fotoBackground: "assets/images/bg-hero.jpg", // foto besar di background hero section
  },

  // -------------------------------------------------------------
  // 2. UCAPAN UNDANGAN (section 2)
  // -------------------------------------------------------------
  undangan: {
    judul: "Dengan penuh rasa syukur & sukacita,",
    isiPesan:
      "Kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu " +
      "pada acara wisuda kami. Kehadiran serta doa restu Anda merupakan suatu " +
      "kehormatan dan kebahagiaan bagi kami.",
    ayatAtauQuote:
      "\u201CSukses adalah hasil dari kerja keras, doa, dan restu orang-orang terkasih.\u201D",
  },

  // -------------------------------------------------------------
  // 3. TANGGAL & WAKTU ACARA (dipakai kalender & countdown)
  // -------------------------------------------------------------
  acara: {
    // Format ISO: "YYYY-MM-DDTHH:mm:ss" -> zona waktu WIB (+07:00)
    tanggalISO: "2026-09-20T08:00:00+07:00",
    tanggalTampil: "Minggu, 20 September 2026",
    jamTampil: "08.00 WIB - Selesai",
  },

  // -------------------------------------------------------------
  // 4. LOKASI ACARA (section 4)
  // -------------------------------------------------------------
  lokasi: {
    namaTempat: "Auditorium Universitas Andalas",
    alamat: "Limau Manis, Kec. Pauh, Kota Padang, Sumatera Barat 25175",
    tanggal: "Minggu, 20 September 2026",
    jam: "08:00 WIB - Selesai",
    // Koordinat Presisi Auditorium UNAND Padang (Latitude, Longitude)
    lat: -0.914498,
    lng: 100.461877,
    mapsLinkUrl: "https://maps.app.goo.gl/7YseFqQoZwfr2WDz8", // Link rute peta
  },

  // -------------------------------------------------------------
  // 5. GALERI FOTO (section 5) - semester 1 s/d 8
  // -------------------------------------------------------------
  // Taruh file foto di assets/images/gallery/ lalu sesuaikan nama filenya.
  galeri: {
    barisAtas: [
      { src: "assets/images/gallery/atas-1.jpg" },
      { src: "assets/images/gallery/atas-2.jpg" },
      { src: "assets/images/gallery/atas-3.jpg" },
      { src: "assets/images/gallery/atas-4.jpg" },
      { src: "assets/images/gallery/atas-5.jpg" },
      { src: "assets/images/gallery/atas-6.jpg" },
      { src: "assets/images/gallery/atas-7.jpg" },
      { src: "assets/images/gallery/atas-8.jpg" },
      { src: "assets/images/gallery/atas-9.jpg" },
      { src: "assets/images/gallery/atas-10.jpg" },
      { src: "assets/images/gallery/atas-11.jpg" },
      { src: "assets/images/gallery/atas-12.jpg" },
    ],
    barisBawah: [
      { src: "assets/images/gallery/bawah-1.jpg" },
      { src: "assets/images/gallery/bawah-2.jpg" },
      { src: "assets/images/gallery/bawah-3.jpg" },
      { src: "assets/images/gallery/bawah-4.jpg" },
      { src: "assets/images/gallery/bawah-5.jpg" },
      { src: "assets/images/gallery/bawah-6.jpg" },
      { src: "assets/images/gallery/bawah-7.jpg" },
      { src: "assets/images/gallery/bawah-8.jpg" },
      { src: "assets/images/gallery/bawah-9.jpg" },
      { src: "assets/images/gallery/bawah-10.jpg" },
      { src: "assets/images/gallery/bawah-11.jpg" },
      { src: "assets/images/gallery/bawah-12.jpg" },
    ],
  },

  // -------------------------------------------------------------
  // 6. FOOTER (section 7)
  // -------------------------------------------------------------
  footer: {
    ucapanTerimaKasih: "Terima kasih atas doa, dukungan, dan kehadiran Anda.",
    quote:
      "\u201CSetiap langkah kecil hari ini adalah pondasi kesuksesan di masa depan.\u201D",
    instagramUsername: "@mhd_diaztara",
    instagramUrl: "https://www.instagram.com/mhd_diaztara/",
  },

  // -------------------------------------------------------------
  // 7. INTEGRASI GOOGLE SHEETS (lewat Google Apps Script Web App)
  // -------------------------------------------------------------
  // WAJIB diisi setelah kamu deploy Code.gs sebagai Web App.
  // Lihat README.md bagian "Setup Google Apps Script" untuk caranya.
  api: {
    // Contoh: "https://script.google.com/macros/s/XXXXXXXXXXXX/exec"
    appsScriptUrl:
      "https://script.google.com/macros/s/AKfycbwb0-l9KwqwlXqEhpEhwaCDv1u_DpdgT1XXrlbZjy_zVV39OPol0jcfZWL_DtjJVIW4/exec",
  },
};

// Object dibekukan (Object.freeze) supaya tidak sengaja diubah oleh script lain saat runtime.
Object.freeze(CONFIG);
