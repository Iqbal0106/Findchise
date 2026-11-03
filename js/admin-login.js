const formLoginAdmin = document.getElementById("form-login-admin");
const pesanAdmin = document.getElementById("pesan");
const tombolMasukAdmin = document.getElementById("tombol-masuk-admin");

const paramsAdmin = new URLSearchParams(window.location.search);

function tujuanSetelahMasukAdmin() {
  const next = paramsAdmin.get("next");
  if (next && !next.includes(":") && !next.startsWith("//")) return next;
  return "admin-dashboard.php";
}

if (paramsAdmin.get("keluar") === "1") {
  tampilkanPesan(pesanAdmin, "ok", "Anda telah keluar dari sesi admin.");
} else if (paramsAdmin.get("daftar") === "1") {
  tampilkanPesan(pesanAdmin, "ok", "Akun admin berhasil dibuat. Silakan masuk dengan email dan password Anda.");
}

/* Bila sesi server masih aktif, langsung alihkan ke dashboard admin. */
(async () => {
  const admin = await adminSaatIni();
  if (admin) window.location.replace(tujuanSetelahMasukAdmin());
})();

/* ---------- Form login admin ---------- */

formLoginAdmin.addEventListener("submit", async (e) => {
  e.preventDefault();
  sembunyikanPesan(pesanAdmin);
  setErrorField("email", "");
  setErrorField("password", "");

  const nilai = {
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value
  };

  const error = {};
  if (!nilai.email) error.email = "Email wajib diisi.";
  else if (!validasiEmailAdmin(nilai.email)) error.email = "Format email belum benar.";
  if (!nilai.password) error.password = "Password wajib diisi.";

  if (Object.keys(error).length > 0) {
    Object.keys(error).forEach((kunci) => setErrorField(kunci, error[kunci]));
    tampilkanPesan(pesanAdmin, "err", "Periksa kembali email dan password Anda.");
    return;
  }

  tombolMasukAdmin.disabled = true;
  tombolMasukAdmin.textContent = "Memeriksa...";

  try {
    const { respons, data } = await adminApi("login.php", {
      method: "POST",
      body: { email: nilai.email, password: nilai.password }
    });

    if (!respons.ok || !data || data.success !== true) {
      throw new Error((data && data.message) || "Login admin gagal. Silakan coba lagi.");
    }

    tampilkanPesan(pesanAdmin, "ok", "Login berhasil. Mengalihkan ke dashboard admin...");
    window.location.replace(tujuanSetelahMasukAdmin());
  } catch (kesalahan) {
    const teks = kesalahan instanceof TypeError
      ? "Tidak dapat menghubungi server. Periksa koneksi Anda lalu coba lagi."
      : kesalahan.message;
    tampilkanPesan(pesanAdmin, "err", teks);
    tombolMasukAdmin.disabled = false;
    tombolMasukAdmin.textContent = "Masuk sebagai admin";
  }
});

["email", "password"].forEach((id) => {
  const input = document.getElementById(id);
  if (input) input.addEventListener("input", () => setErrorField(id, ""));
});
