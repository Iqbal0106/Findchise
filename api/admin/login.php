<?php

require_once __DIR__ . '/_bootstrap.php';

try {
    pastikanMetode('POST');
    $data = bacaIsiJson();

    $email = strtolower(trim((string) ($data['email'] ?? '')));
    $password = (string) ($data['password'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        gagal(422, 'Format email tidak valid.');
    }
    if ($password === '') {
        gagal(422, 'Password wajib diisi.');
    }

    $stmt = $pdo->prepare(
        'SELECT id, name, email, password, role, is_admin, status, created_at
         FROM users WHERE email = ? LIMIT 1'
    );
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    /* Pesan sengaja sama untuk email tidak ada dan password salah. */
    if (!$user || !password_verify($password, $user['password'])) {
        gagal(401, 'Email atau password salah.');
    }

    /* Hak admin berasal dari kolom is_admin, bukan dari role marketplace. */
    if ((int) $user['is_admin'] !== 1) {
        gagal(403, 'Akun ini bukan akun admin. Halaman admin hanya untuk pengelola Findchisee.');
    }

    if ($user['status'] === 'nonaktif') {
        gagal(403, 'Akun admin ini sedang dinonaktifkan.');
    }
    if ($user['status'] !== 'aktif') {
        gagal(403, 'Akun admin ini belum aktif.');
    }

    mulaiSesiAdminUntuk((int) $user['id']);

    kirimJson(200, [
        'success' => true,
        'message' => 'Login admin berhasil.',
        'admin'   => adminUntukKlien($user),
    ]);
} catch (PDOException $e) {
    error_log('Login admin gagal: ' . $e->getMessage());
    gagal(500, 'Terjadi kesalahan pada server.');
}
