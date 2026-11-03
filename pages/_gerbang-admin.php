<?php
/* Gerbang halaman admin.
   Di-include paling atas oleh setiap halaman admin supaya isi halaman tidak
   pernah dikirim ke browser sebelum sesi admin diverifikasi di server.
   Bukan admin -> dialihkan ke halaman login admin. */

require_once __DIR__ . '/../api/admin/_bootstrap.php';

$adminHalaman = adminSaatIni($pdo);

if ($adminHalaman === null) {
    header('Location: admin-login.html?next=' . rawurlencode(basename($_SERVER['PHP_SELF'])));
    exit;
}

/* Halaman admin tidak boleh disimpan di cache browser maupun proxy. */
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
