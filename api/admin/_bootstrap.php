<?php
/* Helper bersama untuk seluruh endpoint admin Findchisee.
   Sesi admin memakai sesi PHP di sisi server (cookie HttpOnly), terpisah dari
   sesi user biasa yang disimpan browser di sessionStorage. */

require_once __DIR__ . '/../config/database.php';

const FC_ADMIN_SESI = 'findchisee_admin';
const FC_ADMIN_IDLE = 3600; /* detik tanpa aktivitas sebelum sesi admin berakhir */

/* ---------- Sesi ---------- */

function mulaiSesiAdmin(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    session_name(FC_ADMIN_SESI);
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => !empty($_SERVER['HTTPS']),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function akhiriSesiAdmin(): void
{
    mulaiSesiAdmin();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $p['path'],
            $p['domain'],
            (bool) $p['secure'],
            (bool) $p['httponly']
        );
    }
    session_destroy();
}

function mulaiSesiAdminUntuk(int $idAdmin): void
{
    mulaiSesiAdmin();
    /* Cegah session fixation: id sesi diganti setelah login berhasil. */
    session_regenerate_id(true);
    $_SESSION['admin_id'] = $idAdmin;
    $_SESSION['terakhir_aktif'] = time();
}

/* ---------- Respons JSON ---------- */

function kirimJson(int $kode, array $isi): void
{
    http_response_code($kode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($isi, JSON_UNESCAPED_UNICODE);
    exit;
}

function gagal(int $kode, string $pesan): void
{
    kirimJson($kode, ['success' => false, 'message' => $pesan]);
}

function pastikanMetode(string $metode): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $metode) {
        gagal(405, 'Metode permintaan tidak diizinkan.');
    }
}

function bacaIsiJson(): array
{
    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        gagal(400, 'Data permintaan tidak valid.');
    }
    return $data;
}

/* ---------- CSRF ---------- */

/* Ambil token CSRF milik sesi admin, buat sekali bila belum ada.
   Token dikirim ke browser lewat session.php dan harus disertakan lagi pada
   setiap permintaan yang mengubah data. */
function tokenCsrfAdmin(): string
{
    mulaiSesiAdmin();
    if (empty($_SESSION['csrf_admin']) || !is_string($_SESSION['csrf_admin'])) {
        $_SESSION['csrf_admin'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_admin'];
}

/* Tolak permintaan yang tidak membawa token CSRF yang cocok.
   Token dibaca dari header X-CSRF-Token atau dari isi JSON. */
function wajibCsrfAdmin(array $data = []): void
{
    mulaiSesiAdmin();
    $tersimpan = (string) ($_SESSION['csrf_admin'] ?? '');
    $dikirim = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? ($data['csrf_token'] ?? '');

    if ($tersimpan === '' || !is_string($dikirim) || $dikirim === '' ||
        !hash_equals($tersimpan, $dikirim)) {
        gagal(403, 'Token keamanan tidak valid. Muat ulang halaman lalu coba lagi.');
    }
}

/* ---------- Hak akses admin ---------- */

/* Hak admin ditentukan kolom is_admin, bukan kolom role. Dengan begitu satu akun
   bisa punya peran marketplace (franchisee/franchisor) sekaligus menjadi admin.
   Dibaca ulang dari database pada setiap permintaan: akun yang hak admin-nya
   dicabut atau status-nya tidak lagi 'aktif' langsung kehilangan akses. */
function ambilAdminAktif(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare(
        "SELECT id, name, email, role, is_admin, status, created_at
         FROM users
         WHERE id = ? AND is_admin = 1 AND status = 'aktif'
         LIMIT 1"
    );
    $stmt->execute([$id]);
    $baris = $stmt->fetch();
    return $baris ?: null;
}

function adminSaatIni(PDO $pdo): ?array
{
    mulaiSesiAdmin();

    $id = (int) ($_SESSION['admin_id'] ?? 0);
    if ($id <= 0) {
        return null;
    }

    $terakhir = (int) ($_SESSION['terakhir_aktif'] ?? 0);
    if ($terakhir > 0 && time() - $terakhir > FC_ADMIN_IDLE) {
        akhiriSesiAdmin();
        return null;
    }

    $admin = ambilAdminAktif($pdo, $id);
    if (!$admin) {
        akhiriSesiAdmin();
        return null;
    }

    $_SESSION['terakhir_aktif'] = time();
    return $admin;
}

/* Dipakai semua endpoint yang butuh admin. Menghentikan permintaan bila bukan admin. */
function wajibAdmin(PDO $pdo): array
{
    $admin = adminSaatIni($pdo);
    if (!$admin) {
        gagal(401, 'Sesi admin tidak aktif. Silakan masuk kembali.');
    }
    return $admin;
}

/* Bentuk data admin yang boleh dikirim ke browser (tanpa password/hash). */
function adminUntukKlien(array $admin): array
{
    return [
        'id'         => (int) $admin['id'],
        'name'       => $admin['name'],
        'email'      => $admin['email'],
        'role'       => $admin['role'],
        'is_admin'   => (int) ($admin['is_admin'] ?? 0) === 1,
        'status'     => $admin['status'],
        'created_at' => $admin['created_at']
            ? date(DATE_ATOM, strtotime($admin['created_at']))
            : null,
    ];
}
