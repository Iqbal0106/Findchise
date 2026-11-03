<?php
require_once __DIR__ . '/_bootstrap.php';

try {
    wajibAdmin($pdo);

    /* Statistik role hanya menghitung pengguna biasa (is_admin = 0) supaya
       total = franchisee + franchisor + admin. Akun yang sekaligus admin
       dihitung pada kartu "Admin". */
    $stat = $pdo->query(
        "SELECT
            COUNT(*)                                AS total,
            SUM(role = 'franchisee' AND is_admin = 0) AS franchisee,
            SUM(role = 'franchisor' AND is_admin = 0) AS franchisor,
            SUM(is_admin = 1)                       AS admin,
            SUM(status = 'aktif')                   AS aktif,
            SUM(status = 'pending')                 AS pending,
            SUM(status = 'nonaktif')                AS nonaktif
         FROM users"
    )->fetch();

    $angka = [];
    foreach (['total', 'franchisee', 'franchisor', 'admin', 'aktif', 'pending', 'nonaktif'] as $kunci) {
        $angka[$kunci] = (int) ($stat[$kunci] ?? 0);
    }

    $stmt = $pdo->query(
        'SELECT id, name, email, role, is_admin, status, created_at
         FROM users
         ORDER BY created_at DESC, id DESC
         LIMIT 5'
    );

    $terbaru = [];
    foreach ($stmt->fetchAll() as $baris) {
        $terbaru[] = [
            'id'         => (int) $baris['id'],
            'name'       => $baris['name'],
            'email'      => $baris['email'],
            'role'       => $baris['role'],
            'is_admin'   => (int) $baris['is_admin'] === 1,
            'status'     => $baris['status'],
            'created_at' => $baris['created_at']
                ? date(DATE_ATOM, strtotime($baris['created_at']))
                : null,
        ];
    }

    kirimJson(200, [
        'success'             => true,
        'statistik'           => $angka,
        'pendaftaran_terbaru' => $terbaru,
    ]);
} catch (PDOException $e) {
    error_log('Ambil dashboard admin gagal: ' . $e->getMessage());
    gagal(500, 'Terjadi kesalahan pada server.');
}
