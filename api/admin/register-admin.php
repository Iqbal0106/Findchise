<?php
/* Pendaftaran akun admin.
   Endpoint ini boleh dipanggil tanpa sesi: siapa pun yang membuka halaman
   pages/admin-register.html dapat membuat akun admin. Syarat kode undangan
   sudah dihapus, jadi tidak ada lagi otorisasi tambahan di sisi backend.

   Akun yang dibuat diberi role marketplace 'franchisee' sekaligus is_admin = 1
   supaya email yang sama tetap bisa dipakai login sebagai pengguna biasa.
   Password disimpan sebagai hash password_hash(). */

require_once __DIR__ . '/_bootstrap.php';

try {
    pastikanMetode('POST');
    $data = bacaIsiJson();

    $nama = trim((string) ($data['nama'] ?? ''));
    $email = strtolower(trim((string) ($data['email'] ?? '')));
    $password = (string) ($data['password'] ?? '');

    if (mb_strlen($nama) < 3 || mb_strlen($nama) > 100) {
        gagal(422, 'Nama harus terdiri dari 3-100 karakter.');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) {
        gagal(422, 'Format email tidak valid.');
    }
    if (strlen($password) < 8 ||
        !preg_match('/[A-Za-z]/', $password) ||
        !preg_match('/[0-9]/', $password)) {
        gagal(422, 'Password harus minimal 8 karakter dan mengandung huruf serta angka.');
    }

    /* Email tidak boleh bentrok dengan akun yang sudah ada. */
    $cek = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $cek->execute([$email]);
    if ($cek->fetch()) {
        gagal(409, 'Email sudah terdaftar. Gunakan email lain atau langsung masuk.');
    }

    $stmt = $pdo->prepare(
        "INSERT INTO users (name, email, password, role, status, is_admin)
         VALUES (?, ?, ?, 'franchisee', 'aktif', 1)"
    );
    $stmt->execute([$nama, $email, password_hash($password, PASSWORD_DEFAULT)]);
    $idBaru = (int) $pdo->lastInsertId();

    kirimJson(201, [
        'success' => true,
        'message' => 'Akun admin berhasil dibuat. Silakan masuk lewat halaman login admin.',
        'user'    => [
            'id'    => $idBaru,
            'name'  => $nama,
            'email' => $email,
        ],
    ]);
} catch (PDOException $e) {
    /* 23000 = pelanggaran UNIQUE KEY email, misalnya dua permintaan bersamaan. */
    if ($e->getCode() === '23000') {
        gagal(409, 'Email sudah terdaftar. Gunakan email lain atau langsung masuk.');
    }
    error_log('Pendaftaran admin gagal: ' . $e->getMessage());
    gagal(500, 'Terjadi kesalahan pada server.');
}
