<?php
/* Perbarui nama dan email akun admin yang sedang login. */

require_once __DIR__ . '/_bootstrap.php';

try {
    pastikanMetode('POST');
    $admin = wajibAdmin($pdo);
    $data = bacaIsiJson();
    wajibCsrfAdmin($data);

    $nama = trim((string) ($data['nama'] ?? ''));
    $email = strtolower(trim((string) ($data['email'] ?? '')));

    if (mb_strlen($nama) < 3 || mb_strlen($nama) > 100) {
        gagal(422, 'Nama harus terdiri dari 3-100 karakter.');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) {
        gagal(422, 'Format email tidak valid.');
    }

    $cek = $pdo->prepare('SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1');
    $cek->execute([$email, $admin['id']]);
    if ($cek->fetch()) {
        gagal(409, 'Email sudah dipakai akun lain.');
    }

    $stmt = $pdo->prepare('UPDATE users SET name = ?, email = ? WHERE id = ?');
    $stmt->execute([$nama, $email, (int) $admin['id']]);

    $admin['name'] = $nama;
    $admin['email'] = $email;

    kirimJson(200, [
        'success' => true,
        'message' => 'Profil admin berhasil diperbarui.',
        'admin'   => adminUntukKlien($admin),
    ]);
} catch (PDOException $e) {
    error_log('Ubah profil admin gagal: ' . $e->getMessage());
    gagal(500, 'Terjadi kesalahan pada server.');
}
