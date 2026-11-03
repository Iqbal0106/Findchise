<?php require_once __DIR__ . '/_gerbang-admin.php'; ?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dashboard Admin - Findchisee</title>
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
          <p class="eyebrow">Dashboard admin</p>
          <h1 id="sapaan-admin">Halo, <?php echo htmlspecialchars($adminHalaman['name'], ENT_QUOTES, 'UTF-8'); ?></h1>
        </div>
        <a class="btn btn-outline" href="index.html">Lihat situs</a>
      </header>

      <main class="admin-content" id="isi-dashboard-admin">
        <p class="empty">Memuat data dashboard...</p>
      </main>

    </div>

  </div>

  <script src="../js/common.js"></script>
  <script src="../js/admin-auth.js"></script>
  <script src="../js/admin-dashboard.js"></script>
</body>
</html>
