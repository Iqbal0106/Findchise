<?php
require_once __DIR__ . '/_bootstrap.php';

try {
    pastikanMetode('POST');
    $admin = wajibAdmin($pdo);
    $data = bacaIsiJson();
    wajibCsrfAdmin($data);

    $lama = (string) ($data['password_lama'] ?? '');
    $baru = (string) ($data['password_baru'] ?? '');

    if ($lama === '') {
        gagal(422, 'Password lama wajib diisi.');
    }
    if (strlen($baru) < 8 ||
        !preg_match('/[A-Za-z]/', $baru) ||
        !preg_match('/[0-9]/', $baru)) {
        gagal(422, 'Password baru minimal 8 karakter serta mengandung huruf dan angka.');
    }

    $stmt = $pdo->prepare('SELECT password FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([(int) $admin['id']]);
    $hash = $stmt->fetchColumn();

    if (!$hash || !password_verify($lama, $hash)) {
        gagal(422, 'Password lama tidak sesuai.');
    }
    if (password_verify($baru, $hash)) {
        gagal(422, 'Password baru tidak boleh sama dengan password lama.');
    }

    $ubah = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
    $ubah->execute([password_hash($baru, PASSWORD_DEFAULT), (int) $admin['id']]);

    /* Id sesi diperbarui supaya sesi lama tidak bisa dipakai ulang. */
    mulaiSesiAdmin();
    session_regenerate_id(true);
    $_SESSION['admin_id'] = (int) $admin['id'];
    $_SESSION['terakhir_aktif'] = time();

    kirimJson(200, [
        'success' => true,
        'message' => 'Password admin berhasil diubah.',
    ]);
} catch (PDOException $e) {
    error_log('Ubah password admin gagal: ' . $e->getMessage());
    gagal(500, 'Terjadi kesalahan pada server.');
}
