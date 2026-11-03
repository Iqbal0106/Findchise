const isiDashboardAdmin = document.getElementById("isi-dashboard-admin");
const sapaanAdmin = document.getElementById("sapaan-admin");

function kartuStatAdmin(label, nilai, catatan) {
  return `
    <article class="stat-card">
      <p class="stat-label">${escapeHtml(label)}</p>
      <p class="stat-nilai">${escapeHtml(String(nilai))}</p>
      ${catatan ? `<p class="stat-catatan">${escapeHtml(catatan)}</p>` : ""}
    </article>`;
}

function barisPendaftaran(baris) {
  const labelPeran = ROLE_LABEL_ADMIN[baris.role] || baris.role;
  const role = baris.is_admin ? "Admin (" + labelPeran + ")" : labelPeran;
  const status = STATUS_LABEL_ADMIN[baris.status] || baris.status;
  return `
    <tr>
      <td data-label="Nama"><span class="nama-user">${escapeHtml(baris.name)}</span></td>
      <td data-label="Email">${escapeHtml(baris.email)}</td>
      <td data-label="Jenis akun">${escapeHtml(role)}</td>
      <td data-label="Status"><span class="pill pill-${escapeHtml(baris.status)}">${escapeHtml(status)}</span></td>
      <td data-label="Terdaftar">${escapeHtml(formatTanggal(baris.created_at))}</td>
    </tr>`;
}

function renderDashboardAdmin(data) {
  const s = data.statistik || {};

  const kartu = [
    kartuStatAdmin("Total pengguna", s.total, "Seluruh akun pada tabel users"),
    kartuStatAdmin("Calon franchisee", s.franchisee, "Role franchisee"),
    kartuStatAdmin("Pemilik franchise", s.franchisor, "Role franchisor"),
    kartuStatAdmin("Admin", s.admin, "Pengelola Findchisee"),
    kartuStatAdmin("Akun aktif", s.aktif, "Status aktif"),
    kartuStatAdmin("Menunggu verifikasi", s.pending, "Status pending"),
    kartuStatAdmin("Nonaktif", s.nonaktif, "Status nonaktif")
  ].join("");

  const terbaru = data.pendaftaran_terbaru || [];
  const isiTabel = terbaru.length
    ? terbaru.map(barisPendaftaran).join("")
    : '<tr><td colspan="5" class="empty">Belum ada pendaftaran.</td></tr>';

  isiDashboardAdmin.innerHTML = `
    <div class="dash-grid">
      ${kartu}
      <section class="panel span-4">
        <div class="panel-head">
          <div>
            <h2>Pendaftaran terbaru</h2>
            <p class="panel-desc">Lima akun terakhir yang mendaftar di Findchisee.</p>
          </div>
          <div class="pintasan">
            <a class="btn btn-outline btn-nav" href="admin-profil.php">Kelola profil admin</a>
          </div>
        </div>
        <div class="table-wrap">
          <table class="tabel-user">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Jenis akun</th>
                <th>Status</th>
                <th>Terdaftar</th>
              </tr>
            </thead>
            <tbody>${isiTabel}</tbody>
          </table>
        </div>
      </section>
    </div>`;
}

(async () => {
  const admin = await wajibAdmin();
  if (!admin) return;

  renderNavAdmin("dashboard", admin);
  if (sapaanAdmin) sapaanAdmin.textContent = "Halo, " + admin.name;

  try {
    const { respons, data } = await adminApi("dashboard.php", { method: "GET" });
    if (!respons.ok || !data || data.success !== true) {
      throw new Error((data && data.message) || "Gagal memuat data dashboard.");
    }
    renderDashboardAdmin(data);
  } catch (kesalahan) {
    const teks = kesalahan instanceof TypeError
      ? "Tidak dapat menghubungi server. Periksa koneksi Anda lalu coba lagi."
      : kesalahan.message;
    isiDashboardAdmin.innerHTML = `<p class="alert alert-err">${escapeHtml(teks)}</p>`;
  }
})();
