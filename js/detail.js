/* Logika halaman detail: menampilkan satu franchise berdasarkan parameter ?id=.
   Bagian data yang belum diisi pemilik brand ditampilkan sebagai
   "Informasi belum tersedia" - tidak dikarang. */

const idFranchise = new URLSearchParams(window.location.search).get("id");
const daftarFranchise = typeof FRANCHISES !== "undefined" ? FRANCHISES : [];
const franchise = daftarFranchise.find((f) => f.id === idFranchise) || null;

const heroDetail = document.getElementById("hero-detail");
const isiDetail = document.getElementById("isi-detail");

const PESAN_KOSONG = "Informasi belum tersedia";

const IKON_LOKASI =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>';
const IKON_CEK =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 13 4 4L19 7"/></svg>';
const IKON_INFO =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>';
const IKON_UANG =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="6" width="19" height="12" rx="3"/><circle cx="12" cy="12" r="2.6"/></svg>';
const IKON_BUKU =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5Z"/><path d="M19 18v3H6.5A2.5 2.5 0 0 1 4 18.5"/></svg>';
const IKON_BINTANG =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z"/></svg>';
const IKON_SYARAT =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4h6a2 2 0 0 1 2 2H7a2 2 0 0 1 2-2Z"/><path d="M7 6H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1"/><path d="m9 14 2 2 4-4"/></svg>';
const IKON_BISNIS =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18"/><path d="M5 21V8l7-5 7 5v13"/><path d="M10 21v-5h4v5"/></svg>';

/* Nilai yang tidak tersedia tetap ditampilkan sebagai keterangan, bukan dikarang. */
function teksAtauKosong(teks) {
  const bersih = String(teks === null || teks === undefined ? "" : teks).trim();
  if (!bersih) return '<span class="tidak-ada">' + PESAN_KOSONG + "</span>";
  return escapeHtml(bersih);
}

function baris(label, teks) {
  return '<div><dt>' + escapeHtml(label) + "</dt><dd>" + teksAtauKosong(teks) + "</dd></div>";
}

function itemFitur(label, teks) {
  return (
    '<li class="fitur-item"><span class="fitur-ikon" aria-hidden="true">' + IKON_CEK + "</span>" +
    '<div class="fitur-isi"><strong>' + escapeHtml(label) + "</strong><span>" +
    teksAtauKosong(teks) + "</span></div></li>"
  );
}

function kartu(ikon, judul, deskripsi, isi, kelasTambahan) {
  return (
    '<section class="kartu ' + (kelasTambahan || "") + '">' +
    '<div class="kartu-judul"><span class="kartu-ikon" aria-hidden="true">' + ikon + "</span>" +
    "<div><h2>" + escapeHtml(judul) + "</h2>" +
    (deskripsi ? '<p class="kartu-sub">' + escapeHtml(deskripsi) + "</p>" : "") +
    "</div></div>" + isi + "</section>"
  );
}

function tampilkanTidakDitemukan() {
  document.title = "Franchise tidak ditemukan - Findchisee";
  heroDetail.innerHTML =
    '<div class="detail-hero-inner"><div class="detail-hero-identitas">' +
    "<h1>Franchise tidak ditemukan</h1>" +
    '<p class="detail-hero-tagline">Brand yang Anda cari tidak ada di katalog Findchisee.</p>' +
    "</div></div>";
  isiDetail.innerHTML =
    '<div class="empty-state">' +
    '<span class="empty-ikon" aria-hidden="true"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></span>' +
    "<h3>Data brand tidak ditemukan</h3>" +
    "<p>ID franchise yang diminta tidak cocok dengan brand mana pun di katalog.</p>" +
    '<a class="btn btn-solid" href="index.html#franchise">Kembali ke katalog</a></div>';
}

function tampilkanDetail(f) {
  document.title = f.nama + " - Findchisee";

  const lokasi = (f.lokasi || "").trim();
  const namaAman = escapeHtml(f.nama);

  /* --- Bagian 1: informasi utama (hero) --- */
  heroDetail.innerHTML =
    '<div class="detail-hero-inner">' +
    '<span class="logo-tile logo-tile-lg" aria-hidden="true">' + escapeHtml(f.nama.charAt(0)) + "</span>" +
    '<div class="detail-hero-identitas">' +
    "<h1>" + namaAman + "</h1>" +
    '<p class="detail-hero-meta">' +
    "<span>" + escapeHtml(f.kategori) + "</span>" +
    '<span class="detail-meta-ikon">' + IKON_LOKASI +
    "<span>" + (lokasi ? escapeHtml(lokasi) : PESAN_KOSONG) + "</span></span>" +
    '<span class="badge">' + escapeHtml(f.model) + "</span>" +
    '<span class="badge">' + escapeHtml(f.pengelolaan) + "</span>" +
    (f.halal ? '<span class="badge badge-halal">Halal</span>' : "") +
    "</p>" +
    '<p class="detail-hero-tagline">' + escapeHtml(f.tagline) + "</p>" +
    "</div></div>";

  /* Deskripsi turunan hanya memakai data yang benar-benar ada di katalog. */
  const sejarah = f.berdiri ? "Mulai beroperasi pada tahun " + f.berdiri + "." : "";
  const konsep = f.model && f.pengelolaan
    ? "Dijalankan dengan model " + f.model + " dan sistem pengelolaan " + f.pengelolaan + "."
    : "";
  const catatanKerjaSama = "Perkiraan balik modal " + f.bep + " bulan dengan estimasi ROI " + f.roi + "% per tahun.";

  const kartuInvestasi = kartu(IKON_UANG, "Informasi investasi",
    "Angka investasi diambil dari data brand dan dapat berubah sewaktu-waktu.",
    '<dl class="detail-list">' +
      baris("Modal awal", formatRupiah(f.modal)) +
      baris("Harga paket franchise", "") +
      baris("Perkiraan balik modal", f.bep + " bulan") +
      baris("Estimasi ROI per tahun", f.roi + "%") +
      baris("Rincian biaya", "") +
      baris("Fasilitas dalam paket", "") +
    "</dl>");

  const kartuDeskripsi = kartu(IKON_BUKU, "Deskripsi bisnis",
    "Profil, konsep, dan target pasar brand.",
    '<dl class="detail-list">' +
      baris("Profil usaha", "") +
      baris("Sejarah / latar belakang", sejarah) +
      baris("Konsep bisnis", konsep) +
      baris("Target pasar", "") +
    "</dl>");

  const kartuKeunggulan = kartu(IKON_BINTANG, "Keunggulan franchise",
    "Dukungan yang didapat mitra dari pemilik brand.",
    '<ul class="daftar-fitur">' +
      itemFitur("Keunggulan produk", "") +
      itemFitur("Dukungan operasional", "") +
      itemFitur("Pelatihan mitra", "") +
      itemFitur("Dukungan pemasaran", "") +
    "</ul>");

  const kartuSyarat = kartu(IKON_SYARAT, "Persyaratan calon mitra",
    "Ketentuan yang harus dipenuhi sebelum bekerja sama.",
    '<dl class="detail-list">' +
      baris("Persyaratan calon franchisee", "") +
      baris("Ketentuan kerja sama", "") +
      baris("Informasi tambahan", catatanKerjaSama) +
    "</dl>");

  /* --- Bagian 6: informasi franchisor --- */
  const kartuFranchisor = kartu(IKON_BISNIS, "Informasi franchisor",
    "Pemilik brand belum mengisi kontak di Findchisee.",
    '<dl class="detail-list">' +
      baris("Nama pemilik / perusahaan", "") +
      baris("Profil singkat", "") +
      baris("Kontak", "") +
    "</dl>");

  /* --- Bagian 7: call to action --- */
  const kembaliKeDetail = "detail.html?id=" + encodeURIComponent(f.id);
  const pengguna = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  const tombolMinat = pengguna
    ? '<button type="button" class="btn btn-aqua" id="cta-minat">Ajukan minat</button>'
    : '<a class="btn btn-aqua" href="login.html?next=' + encodeURIComponent(kembaliKeDetail) + '">Ajukan minat</a>';

  const kartuCta =
    '<section class="kartu kartu-cta">' +
    '<div class="kartu-judul"><span class="kartu-ikon" aria-hidden="true">' + IKON_INFO + "</span>" +
    "<div><h2>Ajukan minat</h2>" +
    '<p class="kartu-sub">Hubungi pemilik ' + namaAman + " atau ajukan minat kemitraan.</p></div></div>" +
    '<div class="cta-modal"><span>Modal mulai dari</span><strong>' + formatRupiah(f.modal) + "</strong></div>" +
    '<div class="cta-aksi">' +
    '<button type="button" class="btn btn-terang" id="cta-hubungi">Hubungi pemilik franchise</button>' +
    tombolMinat +
    '<a class="btn btn-terang" href="index.html#franchise">Kembali ke katalog</a>' +
    "</div>" +
    '<div class="alert" id="pesan-cta" hidden></div>' +
    "</section>";

  isiDetail.innerHTML =
    '<div class="detail-layout">' +
    '<div class="detail-kolom">' +
      kartu(IKON_INFO, "Informasi utama", "Identitas brand yang terdaftar di Findchisee.",
        '<dl class="detail-list">' +
          baris("Nama brand", f.nama) +
          baris("Kategori usaha", f.kategori) +
          baris("Lokasi", lokasi) +
          baris("Model bisnis", f.model) +
          baris("Sistem pengelolaan", f.pengelolaan) +
          baris("Sertifikasi halal", f.halal ? "Sudah bersertifikat" : "Belum bersertifikat") +
          baris("Ringkasan bisnis", f.tagline) +
          baris("Galeri foto", "") +
        "</dl>") +
      kartuInvestasi +
      kartuDeskripsi +
      kartuKeunggulan +
      kartuSyarat +
    "</div>" +
    '<aside class="detail-aside">' + kartuFranchisor + kartuCta + "</aside>" +
    "</div>";

  /* --- Aksi tombol --- */
  const pesan = document.getElementById("pesan-cta");

  document.getElementById("cta-hubungi").addEventListener("click", () => {
    tampilkanPesan(pesan, "ok",
      "Kontak pemilik " + f.nama + " belum tersedia di Findchisee. Gunakan tombol Ajukan minat " +
      "agar tim Findchisee menghubungkan Anda.");
  });

  const tombolMinatEl = document.getElementById("cta-minat");
  if (tombolMinatEl) {
    tombolMinatEl.addEventListener("click", () => {
      tampilkanPesan(pesan, "ok",
        "Pengajuan minat langsung dari halaman ini belum tersedia. Silakan hubungi pemilik brand " +
        "setelah informasi kontak diisi.");
    });
  }
}

if (franchise) tampilkanDetail(franchise);
else tampilkanTidakDitemukan();
