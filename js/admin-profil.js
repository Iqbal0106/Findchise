const formProfil = document.getElementById("form-profil");
const formPassword = document.getElementById("form-password");
const pesanProfil = document.getElementById("pesan-profil");
const pesanPassword = document.getElementById("pesan-password");
const detailAdmin = document.getElementById("detail-admin");
const detailSesi = document.getElementById("detail-sesi");
const tombolEdit = document.getElementById("tombol-edit");
const aksiProfil = document.getElementById("aksi-profil");
const tombolSimpan = document.getElementById("tombol-simpan");
const tombolBatal = document.getElementById("tombol-batal");
const tombolPassword = document.getElementById("tombol-password");
const tombolKeluarProfil = document.getElementById("tombol-keluar-profil");

const inputNama = document.getElementById("nama");
const inputEmail = document.getElementById("email");

/* Data admin yang sedang login, sumbernya dari server. */
let adminSekarang = null;

/* ---------- Render ---------- */

function renderOverview(admin) {
  const labelPeran = ROLE_LABEL_ADMIN[admin.role] || admin.role;
  const status = STATUS_LABEL_ADMIN[admin.status] || admin.status;

  document.getElementById("overview-avatar").textContent = inisialDariNama(admin.name);
  document.getElementById("overview-nama").textContent = admin.name;
  document.getElementById("overview-email").textContent = admin.email;
  document.getElementById("overview-terdaftar").textContent = formatTanggal(admin.created_at);
  document.getElementById("overview-status").innerHTML =
    `<span class="pill pill-${escapeHtml(admin.status)}">${escapeHtml(status)}</span>`;

  const lencana = ["Administrator"];
  if (!admin.is_admin) lencana.length = 0;
  lencana.push("ID #" + admin.id, labelPeran);
  document.getElementById("overview-lencana").innerHTML = lencana
    .map((teks) => `<span class="lencana">${escapeHtml(teks)}</span>`)
    .join("");
}

function renderAkun(admin) {
  const labelPeran = ROLE_LABEL_ADMIN[admin.role] || admin.role;
  const status = STATUS_LABEL_ADMIN[admin.status] || admin.status;

  detailAdmin.innerHTML = `
    <div><dt>ID admin</dt><dd class="mono">${escapeHtml(String(admin.id))}</dd></div>
    <div><dt>Email akun</dt><dd>${escapeHtml(admin.email)}</dd></div>
    <div><dt>Tanggal pembuatan</dt><dd>${escapeHtml(formatTanggal(admin.created_at))}</dd></div>
    <div><dt>Status akun</dt><dd><span class="pill pill-${escapeHtml(admin.status)}">${escapeHtml(status)}</span></dd></div>
    <div><dt>Jenis akun</dt><dd>${escapeHtml("Admin (" + labelPeran + ")")}</dd></div>`;
}

function renderSesi() {
  const idleDetik = (INFO_SESI_ADMIN && INFO_SESI_ADMIN.idle_detik) || 3600;
  const menit = Math.round(idleDetik / 60);

  detailSesi.innerHTML = `
    <div><dt>Status sesi</dt><dd><span class="pill pill-aktif">Aktif</span></dd></div>
    <div><dt>Metode autentikasi</dt><dd>Sesi server (cookie HttpOnly)</dd></div>
    <div><dt>Batas tidak aktif</dt><dd>${escapeHtml(String(menit))} menit</dd></div>
    <div><dt>Perlindungan CSRF</dt><dd><span class="pill pill-aktif">Aktif</span></dd></div>`;
}

function isiFormProfil(admin) {
  inputNama.value = admin.name || "";
  inputEmail.value = admin.email || "";
}

function renderSemua(admin) {
  adminSekarang = admin;
  renderOverview(admin);
  renderAkun(admin);
  isiFormProfil(admin);
}

/* ---------- Mode edit ---------- */

function setModeEdit(aktif) {
  inputNama.readOnly = !aktif;
  inputEmail.readOnly = !aktif;
  tombolEdit.hidden = aktif;
  aksiProfil.hidden = !aktif;

  if (aktif) {
    inputNama.focus();
  } else {
    setErrorField("nama", "");
    setErrorField("email", "");
    sembunyikanPesan(pesanProfil);
  }
}

tombolEdit.addEventListener("click", () => setModeEdit(true));

tombolBatal.addEventListener("click", () => {
  if (adminSekarang) isiFormProfil(adminSekarang);
  setModeEdit(false);
});

/* ---------- Halaman ---------- */

(async () => {
  const admin = await wajibAdmin();
  if (!admin) return;

  renderNavAdmin("profil", admin);
  renderSemua(admin);
  renderSesi();
  setModeEdit(false);

  /* Ubah nama & email */
  formProfil.addEventListener("submit", async (e) => {
    e.preventDefault();
    sembunyikanPesan(pesanProfil);
    setErrorField("nama", "");
    setErrorField("email", "");

    const nilai = {
      nama: inputNama.value.trim(),
      email: inputEmail.value.trim()
    };

    const error = {};
    if (nilai.nama.length < 3) error.nama = "Nama minimal 3 karakter.";
    if (!validasiEmailAdmin(nilai.email)) error.email = "Format email belum benar.";

    if (Object.keys(error).length > 0) {
      Object.keys(error).forEach((kunci) => setErrorField(kunci, error[kunci]));
      tampilkanPesan(pesanProfil, "err", "Periksa kembali data yang ditandai merah.");
      return;
    }

    tombolSimpan.disabled = true;
    tombolSimpan.textContent = "Menyimpan...";

    try {
      const { respons, data } = await adminApi("profile.php", {
        method: "POST",
        body: nilai
      });

      if (!respons.ok || !data || data.success !== true) {
        throw new Error((data && data.message) || "Gagal memperbarui profil.");
      }

      renderSemua(data.admin);
      setModeEdit(false);
      tampilkanPesan(pesanProfil, "ok", data.message || "Profil admin berhasil diperbarui.");
    } catch (kesalahan) {
      const teks = kesalahan instanceof TypeError
        ? "Tidak dapat menghubungi server. Periksa koneksi Anda lalu coba lagi."
        : kesalahan.message;
      tampilkanPesan(pesanProfil, "err", teks);
    } finally {
      tombolSimpan.disabled = false;
      tombolSimpan.textContent = "Simpan perubahan";
    }
  });

  [inputNama, inputEmail].forEach((input) => {
    input.addEventListener("input", () => setErrorField(input.id, ""));
  });

  /* Ubah password */
  formPassword.addEventListener("submit", async (e) => {
    e.preventDefault();
    sembunyikanPesan(pesanPassword);
    ["password-lama", "password-baru", "konfirmasi"].forEach((id) => setErrorField(id, ""));

    const nilai = {
      lama: document.getElementById("password-lama").value,
      baru: document.getElementById("password-baru").value,
      konfirmasi: document.getElementById("konfirmasi").value
    };

    const error = {};
    if (!nilai.lama) error["password-lama"] = "Password lama wajib diisi.";
    if (nilai.baru.length < 8) error["password-baru"] = "Password baru minimal 8 karakter.";
    else if (!/[A-Za-z]/.test(nilai.baru) || !/[0-9]/.test(nilai.baru)) {
      error["password-baru"] = "Password baru harus berisi huruf dan angka.";
    }
    if (nilai.konfirmasi !== nilai.baru) {
      error["konfirmasi"] = "Konfirmasi password tidak sama.";
    }

    if (Object.keys(error).length > 0) {
      Object.keys(error).forEach((kunci) => setErrorField(kunci, error[kunci]));
      tampilkanPesan(pesanPassword, "err", "Periksa kembali data password yang ditandai merah.");
      return;
    }

    tombolPassword.disabled = true;
    tombolPassword.textContent = "Mengubah...";

    try {
      const { respons, data } = await adminApi("change-password.php", {
        method: "POST",
        body: { password_lama: nilai.lama, password_baru: nilai.baru }
      });

      if (!respons.ok || !data || data.success !== true) {
        throw new Error((data && data.message) || "Gagal mengubah password.");
      }

      formPassword.reset();
      tampilkanPesan(pesanPassword, "ok", data.message || "Password admin berhasil diubah.");
    } catch (kesalahan) {
      const teks = kesalahan instanceof TypeError
        ? "Tidak dapat menghubungi server. Periksa koneksi Anda lalu coba lagi."
        : kesalahan.message;
      tampilkanPesan(pesanPassword, "err", teks);
    } finally {
      tombolPassword.disabled = false;
      tombolPassword.textContent = "Ubah password";
    }
  });

  ["password-lama", "password-baru", "konfirmasi"].forEach((id) => {
    document.getElementById(id).addEventListener("input", () => setErrorField(id, ""));
  });

  /* Keluar dari sesi admin */
  if (tombolKeluarProfil) {
    tombolKeluarProfil.addEventListener("click", () => keluarAdmin());
  }
})();
