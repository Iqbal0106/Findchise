/* Logika dashboard pengguna: tampilan berbeda untuk franchisee dan franchisor.
   Panel admin tidak lagi dibuat di sisi browser; halaman admin dilindungi
   sesi PHP di server (pages/admin-*.php). */

function kartuStatistik(label, nilai, catatan) {
  return `
    <article class="stat-card">
      <p class="stat-label">${escapeHtml(label)}</p>
      <p class="stat-nilai">${escapeHtml(nilai)}</p>
      ${catatan ? `<p class="stat-catatan">${escapeHtml(catatan)}</p>` : ""}
    </article>`;
}

function ringkasKatalog() {
  const daftar = typeof FRANCHISES !== "undefined" ? FRANCHISES : [];
  const modalTermurah = daftar.reduce((min, f) => Math.min(min, f.modal), Infinity);
  const kategori = new Set(daftar.map((f) => f.kategori));
  return {
    jumlah: daftar.length,
    modalTermurah: Number.isFinite(modalTermurah) ? modalTermurah : 0,
    kategori: kategori.size
  };
}

function daftarAkunHTML(pengguna) {
  return `
    <dl class="detail-list">
      <div><dt>Nama lengkap</dt><dd>${escapeHtml(pengguna.nama)}</dd></div>
      <div><dt>Email</dt><dd>${escapeHtml(pengguna.email)}</dd></div>
      <div><dt>Jenis akun</dt><dd>${escapeHtml(ROLE_LABEL[pengguna.role])}</dd></div>
      <div><dt>Status akun</dt><dd><span class="pill pill-${pengguna.status}">${escapeHtml(STATUS_LABEL[pengguna.status])}</span></dd></div>
      <div><dt>Terdaftar sejak</dt><dd>${escapeHtml(formatTanggal(pengguna.terdaftar))}</dd></div>
      <div><dt>ID akun</dt><dd class="mono">${escapeHtml(pengguna.id)}</dd></div>
    </dl>`;
}

/* ---------- Franchisee ---------- */

function renderFranchisee(pengguna) {
  const katalog = ringkasKatalog();
  document.getElementById("isi-dashboard").innerHTML = `
    <div class="dash-grid">
      ${kartuStatistik("Status akun", STATUS_LABEL[pengguna.status], "Akun calon franchisee aktif otomatis.")}
      ${kartuStatistik("Franchise di katalog", String(katalog.jumlah), "Siap dibandingkan")}
      ${kartuStatistik("Modal terendah", formatRupiah(katalog.modalTermurah), "Pilihan paling ringan")}
      ${kartuStatistik("Kategori tersedia", String(katalog.kategori), "Dari makanan sampai hobi")}

      <section class="panel span-2">
        <h2>Ringkasan akun</h2>
        <p class="panel-desc">Data akun yang Anda pakai untuk masuk ke Findchisee.</p>
        ${daftarAkunHTML(pengguna)}
      </section>

      <section class="panel span-2">
        <h2>Pintasan katalog</h2>
        <p class="panel-desc">Lanjutkan pencarian franchise sesuai modal Anda.</p>
        <div class="pintasan">
          <a class="btn btn-solid" href="index.html#franchise">Lihat semua franchise</a>
          <a class="btn btn-outline" href="index.html#franchise">Filter modal sampai Rp 25 juta</a>
          <a class="btn btn-outline" href="index.html#franchise">Cari brand kategori makanan</a>
        </div>
        <ul class="tips">
          <li>Gunakan filter <strong>Modal maksimal</strong> agar hasil sesuai kemampuan Anda.</li>
          <li>Buka <strong>Lihat detail</strong> pada kartu brand untuk melihat balik modal dan jumlah outlet.</li>
          <li>Simpan beberapa kandidat sebelum menghubungi franchisor.</li>
        </ul>
      </section>
    </div>`;
}

/* ---------- Franchisor ---------- */

function renderFranchisor(pengguna) {
  const statusPengelolaan = {
    pending: "Menunggu verifikasi admin",
    aktif: "Terverifikasi",
    nonaktif: "Ditangguhkan"
  }[pengguna.status];

  const catatanVerifikasi = {
    pending: "Tim admin sedang memeriksa data brand Anda. Selama menunggu, Anda tetap bisa melihat katalog.",
    aktif: "Brand Anda sudah terverifikasi dan dapat dikelola dari dashboard.",
    nonaktif: "Akun brand dinonaktifkan sementara. Hubungi admin Findchisee untuk aktivasi."
  }[pengguna.status];

  document.getElementById("isi-dashboard").innerHTML = `
    <div class="dash-grid">
      ${kartuStatistik("Status akun", STATUS_LABEL[pengguna.status], "Hasil verifikasi admin")}
      ${kartuStatistik("Pengelolaan brand", statusPengelolaan, "Status pendaftaran brand")}
      ${kartuStatistik("Terdaftar sejak", formatTanggal(pengguna.terdaftar), "Tanggal registrasi")}
      ${kartuStatistik("Jenis akun", ROLE_LABEL[pengguna.role], "Pemilik franchise")}

      <section class="panel span-2">
        <h2>Ringkasan profil bisnis</h2>
        <p class="panel-desc">Profil yang dipakai untuk mendaftarkan brand Anda.</p>
        ${daftarAkunHTML(pengguna)}
      </section>

      <section class="panel span-2">
        <h2>Status pengelolaan brand</h2>
        <p class="panel-desc">${escapeHtml(catatanVerifikasi)}</p>
        <ol class="langkah">
          <li class="${pengguna.status !== "pending" ? "selesai" : "aktif"}">Pendaftaran akun franchisor</li>
          <li class="${pengguna.status === "aktif" ? "selesai" : pengguna.status === "pending" ? "aktif" : ""}">Verifikasi data brand oleh admin</li>
          <li class="${pengguna.status === "aktif" ? "aktif" : ""}">Pengelolaan brand di katalog</li>
        </ol>
        <div class="pintasan">
          <a class="btn btn-solid" href="index.html#franchise">Lihat katalog brand</a>
          <a class="btn btn-outline" href="dashboard.html">Segarkan status</a>
        </div>
        <p class="hint">
          Penambahan data brand baru akan tersedia setelah terhubung ke backend. Versi demo ini
          belum menyimpan data brand dari sisi pengguna.
        </p>
      </section>
    </div>`;
}

/* ---------- Mulai ---------- */

function mulaiDashboard() {
  const pengguna = wajibMasuk();
  if (!pengguna) return;

  /* Admin tidak lagi memakai dashboard ini. Akun ber-role admin diarahkan ke
     halaman admin yang hanya bisa dibuka setelah sesi PHP di server valid. */
  if (pengguna.role === ROLE.ADMIN) {
    window.location.replace("admin-login.html");
    return;
  }

  document.getElementById("label-peran").textContent = "Dashboard " + ROLE_LABEL[pengguna.role];
  document.getElementById("sapaan").textContent = "Halo, " + pengguna.nama;
  document.getElementById("sub-sapaan").textContent =
    pengguna.role === ROLE.FRANCHISOR
      ? "Pantau status verifikasi dan pengelolaan brand Anda."
      : "Ringkasan akun Anda dan pintasan menuju katalog franchise.";

  if (pengguna.role === ROLE.FRANCHISOR) renderFranchisor(pengguna);
  else renderFranchisee(pengguna);
}

mulaiDashboard();
