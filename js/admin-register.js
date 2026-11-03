/* Logika halaman registrasi admin.
   Formulir ini meniru register biasa, tetapi akun yang dibuat langsung
   mendapat hak admin. JavaScript hanya melakukan validasi awal supaya pengguna
   mendapat umpan balik cepat; keputusan akhir tetap di server
   (api/admin/register-admin.php). */

const formRegisterAdmin = document.getElementById("form-register-admin");
const pesanRegisterAdmin = document.getElementById("pesan");
const tombolDaftarAdmin = document.getElementById("tombol-daftar-admin");

const FIELD_ADMIN = ["nama", "email", "password", "konfirmasi"];

function validasiRegisterAdmin(nilai) {
  const error = {};

  if (nilai.nama.length < 3) {
    error.nama = "Nama lengkap minimal 3 karakter.";
  } else if (nilai.nama.length > 100) {
    error.nama = "Nama lengkap maksimal 100 karakter.";
  }

  if (!nilai.email) {
    error.email = "Email wajib diisi.";
  } else if (!validasiEmailAdmin(nilai.email)) {
    error.email = "Format email belum benar, contoh: nama@email.com.";
  }

  if (nilai.password.length < 8) {
    error.password = "Password minimal 8 karakter.";
  } else if (!/[A-Za-z]/.test(nilai.password) || !/[0-9]/.test(nilai.password)) {
    error.password = "Password harus berisi huruf dan angka.";
  }

  if (nilai.konfirmasi !== nilai.password) {
    error.konfirmasi = "Konfirmasi password tidak sama dengan password.";
  }

  return error;
}

formRegisterAdmin.addEventListener("submit", async (e) => {
  e.preventDefault();
  sembunyikanPesan(pesanRegisterAdmin);
  FIELD_ADMIN.forEach((id) => setErrorField(id, ""));

  const nilai = {
    nama: document.getElementById("nama").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value,
    konfirmasi: document.getElementById("konfirmasi").value
  };

  const error = validasiRegisterAdmin(nilai);
  if (Object.keys(error).length > 0) {
    Object.keys(error).forEach((kunci) => setErrorField(kunci, error[kunci]));
    tampilkanPesan(pesanRegisterAdmin, "err", "Periksa kembali data yang ditandai merah di bawah.");
    return;
  }

  tombolDaftarAdmin.disabled = true;
  tombolDaftarAdmin.textContent = "Memproses...";

  try {
    /* Password hanya di-hash di server, tidak pernah disimpan di browser. */
    const { respons, data } = await adminApi("register-admin.php", {
      method: "POST",
      body: {
        nama: nilai.nama,
        email: nilai.email,
        password: nilai.password
      }
    });

    if (!respons.ok || !data || data.success !== true) {
      throw new Error((data && data.message) || "Pendaftaran admin gagal. Silakan coba lagi.");
    }

    const pengguna = data.user || {};
    tampilkanPesan(
      pesanRegisterAdmin,
      "ok",
      "Akun admin berhasil dibuat untuk " + (pengguna.email || nilai.email) + ". Mengalihkan ke halaman login admin..."
    );
    formRegisterAdmin.reset();
    setTimeout(() => {
      window.location.href = "admin-login.html?daftar=1";
    }, 1800);
  } catch (kesalahan) {
    const teks = kesalahan instanceof TypeError
      ? "Tidak dapat menghubungi server. Periksa koneksi Anda lalu coba lagi."
      : kesalahan.message;
    tampilkanPesan(pesanRegisterAdmin, "err", teks);
    tombolDaftarAdmin.disabled = false;
    tombolDaftarAdmin.textContent = "Buat akun admin";
  }
});

/* Hapus tanda error begitu pengguna mengetik ulang. */
FIELD_ADMIN.forEach((id) => {
  const input = document.getElementById(id);
  if (input) input.addEventListener("input", () => setErrorField(id, ""));
});
