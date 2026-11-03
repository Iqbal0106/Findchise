<?php
/* =========================================================================
   SETUP AKUN ADMIN PERTAMA FINDCHISEE
   -------------------------------------------------------------------------
   Skrip ini SENGAJA dibuat sebagai skrip baris perintah (CLI), bukan halaman
   web, supaya hanya pengelola yang punya akses ke komputer/server bisa
   membuat akun admin. Halaman publik tidak lagi menyediakan formulir
   pembuatan admin.

   CARA PAKAI (buka Command Prompt / PowerShell di folder proyek):

       c:\xampp\php\php.exe "scripts\setup-admin.php"

   Satu email bisa dipakai sebagai pengguna biasa sekaligus admin. Skrip ini
   menangani dua kemungkinan:

   - Email SUDAH terdaftar sebagai pengguna (franchisee/franchisor):
     akun itu hanya diberi hak admin (kolom is_admin = 1). Password tidak
     diubah, jadi email tersebut tetap bisa masuk lewat halaman pengguna biasa.
   - Email BELUM terdaftar: dibuatkan akun baru dengan peran marketplace
     franchisee, status aktif, dan hak admin sekaligus.

   Hak admin disimpan di kolom is_admin, terpisah dari kolom role. Jadi
   penambahan admin tidak mengubah peran marketplace akun tersebut.

   PENOLAKAN AKSES:
   - Skrip langsung berhenti bila dijalankan lewat browser (bukan mode CLI).
   - Folder scripts/ juga diblokir dari akses HTTP oleh scripts/.htaccess.
   - Skrip otomatis berhenti bila sudah ada akun dengan is_admin = 1,
     sehingga proses setup tidak bisa dipakai ulang.

   SETELAH AKUN ADMIN PERTAMA BERHASIL DIBUAT, HAPUS SKRIP INI:

       del "scripts\setup-admin.php"

   Menghapus skrip ini adalah cara paling aman untuk menonaktifkan proses
   setup secara permanen. Bila perlu menambah admin lain, jalankan perintah
   berikut langsung di database:

       UPDATE users SET is_admin = 1 WHERE email = 'email@contoh.com';
   ========================================================================= */

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Akses ditolak: skrip setup hanya boleh dijalankan dari terminal, bukan dari browser.');
}

require_once __DIR__ . '/../api/config/database.php';

const BERKAS_SETUP = 'scripts/setup-admin.php';

/* ---------- Pembacaan input ---------- */

function tanya(string $label): string
{
    echo $label;
    return trim((string) fgets(STDIN));
}

/* Usahakan password tidak tampil di layar; bila terminal tidak mendukung
   (misalnya input dialihkan dari berkas atau pipe), pakai input biasa supaya
   skrip tidak menggantung menunggu terminal. */
function tanyaPassword(string $label): string
{
    echo $label;

    $interaktif = function_exists('stream_isatty') && @stream_isatty(STDIN);

    if ($interaktif && PHP_OS_FAMILY === 'Windows') {
        $perintah = 'powershell -NoProfile -Command "$s = Read-Host -AsSecureString;'
            . ' [Runtime.InteropServices.Marshal]::PtrToStringAuto('
            . '[Runtime.InteropServices.Marshal]::SecureStringToBSTR($s))"';
        $hasil = @shell_exec($perintah);
        if (is_string($hasil) && trim($hasil) !== '') {
            return trim($hasil);
        }
        echo '(terminal ini tidak mendukung input tersembunyi) ';
    } elseif ($interaktif) {
        @shell_exec('stty -echo');
        $hasil = trim((string) fgets(STDIN));
        @shell_exec('stty echo');
        echo PHP_EOL;
        return $hasil;
    }

    return trim((string) fgets(STDIN));
}

function stop(string $pesan): void
{
    echo PHP_EOL . 'Gagal: ' . $pesan . PHP_EOL;
    exit(1);
}

/* ---------- Jalankan ---------- */

echo PHP_EOL . '=== Setup akun admin pertama Findchisee ===' . PHP_EOL;

try {
    $jumlahAdmin = (int) $pdo->query('SELECT COUNT(*) FROM users WHERE is_admin = 1')->fetchColumn();

    if ($jumlahAdmin > 0) {
        echo 'Database sudah memiliki ' . $jumlahAdmin . ' akun admin.' . PHP_EOL;
        echo 'Proses setup hanya boleh sekali. Hapus ' . BERKAS_SETUP . ' karena sudah tidak diperlukan.' . PHP_EOL;
        exit(1);
    }

    $email = strtolower(tanya('Email admin        : '));

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) {
        stop('format email tidak valid.');
    }

    $cek = $pdo->prepare('SELECT id, name, role FROM users WHERE email = ? LIMIT 1');
    $cek->execute([$email]);
    $akun = $cek->fetch();

    if ($akun) {
        /* Email sudah terdaftar sebagai pengguna biasa: cukup aktifkan hak admin
           pada akun yang sama, tanpa membuat akun kedua dan tanpa mengubah password. */
        echo PHP_EOL . 'Email ini sudah terdaftar sebagai pengguna: ' . $akun['name']
            . ' (peran ' . $akun['role'] . ').' . PHP_EOL;
        echo 'Akun tersebut akan diberi hak admin. Password tetap seperti saat mendaftar.' . PHP_EOL;

        $jawab = strtolower(tanya('Jadikan akun ini admin? (y/t): '));
        if (!in_array($jawab, ['y', 'ya', 't'], true)) {
            stop('dibatalkan.');
        }

        $upd = $pdo->prepare('UPDATE users SET is_admin = 1 WHERE id = ?');
        $upd->execute([(int) $akun['id']]);

        echo PHP_EOL . 'Hak admin berhasil diaktifkan pada akun tersebut.' . PHP_EOL;
        echo '  ID    : ' . $akun['id'] . PHP_EOL;
        echo '  Nama  : ' . $akun['name'] . PHP_EOL;
        echo '  Email : ' . $email . PHP_EOL;
        echo '  Password: tetap seperti password akun pengguna tersebut.' . PHP_EOL;
        echo '  Akun ini tetap bisa masuk lewat halaman pengguna biasa.' . PHP_EOL;
    } else {
        /* Email belum terdaftar: buat akun baru yang sekaligus pengguna biasa
           (peran franchisee) dan punya hak admin. */
        $nama = tanya('Nama lengkap admin : ');
        $password = tanyaPassword('Password admin     : ');
        $ulangi = tanyaPassword('Ulangi password    : ');

        if (mb_strlen($nama) < 3 || mb_strlen($nama) > 100) {
            stop('nama harus terdiri dari 3-100 karakter.');
        }
        if (strlen($password) < 8 ||
            !preg_match('/[A-Za-z]/', $password) ||
            !preg_match('/[0-9]/', $password)) {
            stop('password minimal 8 karakter serta mengandung huruf dan angka.');
        }
        if ($password !== $ulangi) {
            stop('ulangan password tidak sama.');
        }

        /* Password disimpan sebagai hash bcrypt lewat password_hash(), bukan teks biasa. */
        $stmt = $pdo->prepare(
            "INSERT INTO users (name, email, password, role, status, is_admin)
             VALUES (?, ?, ?, 'franchisee', 'aktif', 1)"
        );
        $stmt->execute([$nama, $email, password_hash($password, PASSWORD_DEFAULT)]);

        echo PHP_EOL . 'Akun admin berhasil dibuat.' . PHP_EOL;
        echo '  ID    : ' . $pdo->lastInsertId() . PHP_EOL;
        echo '  Nama  : ' . $nama . PHP_EOL;
        echo '  Email : ' . $email . PHP_EOL;
        echo '  Peran marketplace: franchisee (tetap bisa masuk halaman pengguna biasa).' . PHP_EOL;
        echo '  Password disimpan sebagai hash password_hash(), bukan teks biasa.' . PHP_EOL;
    }

    echo PHP_EOL . 'Langkah berikutnya:' . PHP_EOL;
    echo '  1. Masuk lewat halaman admin-login.html memakai email dan password di atas.' . PHP_EOL;
    echo '  2. HAPUS skrip ini sekarang juga:  del "' . str_replace('/', '\\', BERKAS_SETUP) . '"' . PHP_EOL;
} catch (PDOException $e) {
    error_log('Setup admin gagal: ' . $e->getMessage());
    stop('terjadi kesalahan pada database.');
}
