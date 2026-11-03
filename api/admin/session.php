<?php

require_once __DIR__ . '/_bootstrap.php';

try {
    $admin = adminSaatIni($pdo);

    if (!$admin) {
        kirimJson(401, [
            'success' => false,
            'admin'   => null,
            'message' => 'Sesi admin tidak aktif.',
        ]);
    }

    kirimJson(200, [
        'success'    => true,
        'admin'      => adminUntukKlien($admin),
        'csrf_token' => tokenCsrfAdmin(),
        'idle_detik' => FC_ADMIN_IDLE,
    ]);
} catch (PDOException $e) {
    error_log('Cek sesi admin gagal: ' . $e->getMessage());
    gagal(500, 'Terjadi kesalahan pada server.');
}
