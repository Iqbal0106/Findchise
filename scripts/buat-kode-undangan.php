<?php
/* =========================================================================
   PEMBUAT KODE UNDANGAN ADMIN FINDCHISEE
   -------------------------------------------------------------------------
   Skrip ini membuat KODE UNDANGAN sekali pakai. Kode tersebut dipakai di
   halaman pages/admin-register.html untuk membuat akun admin.

   Karena skrip ini hanya bisa dijalankan pengelola langsung di server,
   pendaftaran admin tidak dapat dilakukan oleh sembarang orang. Halaman
   registrasi admin memang bisa dibuka publik, tetapi tanpa kode undangan
   yang sah akun admin tidak akan dibuat.

   Kode disimpan di tabel admin_invites sebagai hash password_hash(), jadi
   kode aslinya tidak pernah tersimpan di database.

   CARA PAKAI (Command Prompt / PowerShell di folder proyek):

       c:\xampp\php\php.exe "scripts\buat-kode-undangan.php"

   Skrip menanyakan catatan dan masa berlaku, lalu menampilkan kode satu kali
   saja. Salin kode itu dan berikan hanya kepada orang yang berwenang.

   PENOLAKAN AKSES:
   - Skrip langsung berhenti bila dijalankan lewat browser (bukan mode CLI).
   - Folder scripts/ diblokir dari akses HTTP oleh scripts/.htaccess.

   Melihat daftar kode yang masih aktif (langsung di database):

       SELECT id, note, created_at, expires_at FROM admin_invites
       WHERE used_at IS NULL ORDER BY id DESC;
   ========================================================================= */

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Akses ditolak: skrip ini hanya boleh dijalankan dari terminal, bukan dari browser.');
}

require_once __DIR__ . '/../api/config/database.php';

function tanya(string $label): string
{
    echo $label;
    return trim((string) fgets(STDIN));
}

function stop(string $pesan): void
{
    echo PHP_EOL . 'Gagal: ' . $pesan . PHP_EOL;
    exit(1);
}

/* Buat kode yang mudah dibaca manusia: tanpa huruf/angka yang mirip
   (0/O dan 1/I) supaya tidak salah ketik saat diberikan ke orang lain. */
function buatKode(): string
{
    $abjad = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $grup = [];

    for ($i = 0; $i < 4; $i++) {
        $bagian = '';
        for ($j = 0; $j < 4; $j++) {
            $bagian .= $abjad[random_int(0, strlen($abjad) - 1)];
        }
        $grup[] = $bagian;
    }

    return 'ADM-' . implode('-', $grup);
}

echo PHP_EOL . '=== Pembuat kode undangan admin Findchisee ===' . PHP_EOL;

try {
    $catatan = tanya('Catatan kode (boleh kosong)          : ');

    $masaBerlaku = tanya('Masa berlaku dalam hari (kosong=selamanya): ');
    $kedaluwarsa = null;

    if ($masaBerlaku !== '') {
        if (!ctype_digit($masaBerlaku) || (int) $masaBerlaku < 1) {
            stop('masa berlaku harus berupa angka hari, minimal 1.');
        }
        $kedaluwarsa = date('Y-m-d H:i:s', strtotime('+' . (int) $masaBerlaku . ' days'));
    }

    $kode = buatKode();

    $stmt = $pdo->prepare(
        'INSERT INTO admin_invites (code_hash, note, expires_at) VALUES (?, ?, ?)'
    );
    $stmt->execute([
        password_hash($kode, PASSWORD_DEFAULT),
        $catatan !== '' ? mb_substr($catatan, 0, 100) : null,
        $kedaluwarsa,
    ]);

    echo PHP_EOL . 'Kode undangan berhasil dibuat.' . PHP_EOL;
    echo '  Kode        : ' . $kode . PHP_EOL;
    echo '  Catatan     : ' . ($catatan !== '' ? $catatan : '-') . PHP_EOL;
    echo '  Kedaluwarsa : ' . ($kedaluwarsa ?? 'tanpa kedaluwarsa') . PHP_EOL;
    echo PHP_EOL . 'Kode hanya ditampilkan sekali dan hanya bisa dipakai untuk satu akun.' . PHP_EOL;
    echo 'Berikan kode ini kepada orang yang berwenang, lalu minta dia membuka:' . PHP_EOL;
    echo '  http://localhost/Findchisee%20web%27/pages/admin-register.html' . PHP_EOL;
} catch (PDOException $e) {
    error_log('Buat kode undangan gagal: ' . $e->getMessage());
    stop('terjadi kesalahan pada database.');
}
