<?php require_once __DIR__ . '/_gerbang-admin.php'; ?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Profil Admin - Findchisee</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=Figtree:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>

  <div class="admin-shell">

    <aside class="admin-sidebar">
      <a class="admin-brand" href="admin-dashboard.php">
        <span class="admin-brand-mark">F</span>
        <span>Findchisee<small>Admin Panel</small></span>
      </a>

      <nav class="admin-menu" id="menu-admin" aria-label="Menu admin"></nav>

      <div class="admin-side-foot">
        <div class="admin-user">
          <span class="avatar avatar-sm" id="sidebar-avatar">A</span>
          <span>
            <strong id="sidebar-nama">Administrator</strong>
            <small id="sidebar-email">-</small>
          </span>
        </div>
        <button type="button" class="btn-keluar-admin" id="tombol-keluar-admin">Keluar</button>
      </div>
    </aside>

    <div class="admin-main">

      <header class="admin-topbar">
        <div>
          <p class="eyebrow">Pengaturan akun</p>
          <h1>Profil Admin</h1>
        </div>
        <a class="btn btn-outline" href="index.html">Lihat situs</a>
      </header>

      <main class="admin-content">

        <!-- 1. Profile overview -->
        <section class="profil-overview" aria-labelledby="overview-nama">
          <span class="avatar avatar-lg" id="overview-avatar">A</span>
          <div class="profil-identitas">
            <h2 class="profil-nama" id="overview-nama">Memuat profil...</h2>
            <p class="profil-email" id="overview-email">&nbsp;</p>
            <span class="profil-tag">Administrator Findchisee</span>
            <div class="profil-lencana" id="overview-lencana"></div>
          </div>
          <div class="profil-metrik">
            <div>
              <span>Status akun</span>
              <strong id="overview-status">-</strong>
            </div>
            <div>
              <span>Terdaftar sejak</span>
              <strong id="overview-terdaftar">-</strong>
            </div>
          </div>
        </section>

        <div class="profil-grid">

          <div class="admin-kolom">

            <!-- 2. Personal information -->
            <section class="kartu" aria-labelledby="judul-personal">
              <div class="kartu-judul">
                <span class="kartu-ikon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="M13.5 6.5 17.5 10.5"/></svg>
                </span>
                <div>
                  <h2 id="judul-personal">Informasi pribadi</h2>
                  <p class="kartu-sub">Nama dan email yang dipakai untuk masuk ke panel admin.</p>
                </div>
                <div class="kartu-aksi">
                  <button type="button" class="btn btn-outline" id="tombol-edit">Edit profil</button>
                </div>
              </div>

              <p class="alert" id="pesan-profil" hidden></p>

              <form id="form-profil" novalidate>
                <div class="field">
                  <label for="nama">Nama lengkap</label>
                  <input type="text" id="nama" name="nama" autocomplete="name" placeholder="Nama pengelola" readonly>
                  <p class="field-error" id="nama-error" hidden></p>
                </div>

                <div class="field">
                  <label for="email">Email</label>
                  <input type="email" id="email" name="email" autocomplete="email" placeholder="admin@email.com" readonly>
                  <p class="field-error" id="email-error" hidden></p>
                </div>

                <div class="form-aksi" id="aksi-profil" hidden>
                  <button type="submit" class="btn btn-solid" id="tombol-simpan">Simpan perubahan</button>
                  <button type="button" class="btn btn-outline" id="tombol-batal">Batal</button>
                </div>
              </form>
            </section>

            <!-- 3. Security settings -->
            <section class="kartu" aria-labelledby="judul-keamanan">
              <div class="kartu-judul">
                <span class="kartu-ikon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                </span>
                <div>
                  <h2 id="judul-keamanan">Keamanan akun</h2>
                  <p class="kartu-sub">Ubah password secara berkala. Password lama wajib diverifikasi.</p>
                </div>
              </div>

              <p class="alert" id="pesan-password" hidden></p>

              <form id="form-password" novalidate>
                <div class="field">
                  <label for="password-lama">Password lama</label>
                  <input type="password" id="password-lama" autocomplete="current-password" placeholder="Password saat ini">
                  <p class="field-error" id="password-lama-error" hidden></p>
                </div>

                <div class="field">
                  <label for="password-baru">Password baru</label>
                  <input type="password" id="password-baru" autocomplete="new-password" placeholder="Minimal 8 karakter">
                  <p class="hint">Minimal 8 karakter dengan kombinasi huruf dan angka.</p>
                  <p class="field-error" id="password-baru-error" hidden></p>
                </div>

                <div class="field">
                  <label for="konfirmasi">Konfirmasi password baru</label>
                  <input type="password" id="konfirmasi" autocomplete="new-password" placeholder="Ulangi password baru">
                  <p class="field-error" id="konfirmasi-error" hidden></p>
                </div>

                <div class="form-aksi">
                  <button type="submit" class="btn btn-solid" id="tombol-password">Ubah password</button>
                </div>
              </form>
            </section>

          </div>

          <div class="admin-kolom">

            <!-- 4. Account information -->
            <section class="kartu" aria-labelledby="judul-akun">
              <div class="kartu-judul">
                <span class="kartu-ikon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>
                </span>
                <div>
                  <h2 id="judul-akun">Informasi akun</h2>
                  <p class="kartu-sub">Detail teknis akun admin Anda.</p>
                </div>
              </div>
              <dl class="detail-list" id="detail-admin"></dl>
            </section>

            <!-- 5. Session and logout -->
            <section class="kartu" aria-labelledby="judul-sesi">
              <div class="kartu-judul">
                <span class="kartu-ikon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l-5-5 5-5"/><path d="M5 12h11"/></svg>
                </span>
                <div>
                  <h2 id="judul-sesi">Sesi &amp; keluar</h2>
                  <p class="kartu-sub">Sesi admin disimpan di server dan berakhir otomatis setelah tidak aktif.</p>
                </div>
              </div>

              <dl class="detail-list" id="detail-sesi"></dl>

              <div class="form-aksi">
                <button type="button" class="btn btn-outline" id="tombol-keluar-profil">Keluar dari sesi admin</button>
              </div>
            </section>

          </div>

        </div>

      </main>
    </div>

  </div>

  <script src="../js/common.js"></script>
  <script src="../js/admin-auth.js"></script>
  <script src="../js/admin-profil.js"></script>
</body>
</html>
