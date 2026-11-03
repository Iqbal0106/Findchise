const ADMIN_API = "../api/admin";

/* Token CSRF sesi admin. Diisi dari session.php lalu disertakan pada setiap
   permintaan yang mengubah data. Disimpan di memori, bukan localStorage. */
let CSRF_TOKEN_ADMIN = "";

/* Data mentah sesi admin dari server (termasuk csrf_token dan batas idle). */
let INFO_SESI_ADMIN = null;

const ROLE_LABEL_ADMIN = {
  franchisee: "Calon Franchisee",
  franchisor: "Pemilik Franchise",
  admin: "Admin"
};

const STATUS_LABEL_ADMIN = {
  aktif: "Aktif",
  pending: "Menunggu verifikasi",
  nonaktif: "Nonaktif"
};

function validasiEmailAdmin(email) {
  return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(String(email || "").trim());
}

/* Inisial dari nama, dipakai pada avatar. */
function inisialDariNama(nama) {
  const bagian = String(nama || "").trim().split(/\s+/).filter(Boolean);
  if (bagian.length === 0) return "A";
  if (bagian.length === 1) return bagian[0].slice(0, 2).toUpperCase();
  return (bagian[0][0] + bagian[bagian.length - 1][0]).toUpperCase();
}

/* Kirim permintaan ke endpoint admin, kembalikan { respons, data }. */
async function adminApi(aksi, opsi = {}) {
  const konfigurasi = Object.assign({ credentials: "same-origin" }, opsi);
  const headers = Object.assign({}, konfigurasi.headers || {});

  if (konfigurasi.body !== undefined && typeof konfigurasi.body !== "string") {
    headers["Content-Type"] = "application/json";
    konfigurasi.body = JSON.stringify(konfigurasi.body);
  }

  if (CSRF_TOKEN_ADMIN) headers["X-CSRF-Token"] = CSRF_TOKEN_ADMIN;
  konfigurasi.headers = headers;

  const respons = await fetch(ADMIN_API + "/" + aksi, konfigurasi);

  let data = null;
  try {
    data = await respons.json();
  } catch (kesalahan) {
    data = null;
  }

  return { respons, data };
}

/* Ambil admin yang sedang login, atau null. Sumber kebenaran ada di server. */
async function adminSaatIni() {
  try {
    const { respons, data } = await adminApi("session.php", { method: "GET" });
    if (!respons.ok || !data || data.success !== true) return null;
    CSRF_TOKEN_ADMIN = data.csrf_token || "";
    INFO_SESI_ADMIN = data;
    return data.admin || null;
  } catch (kesalahan) {
    return null;
  }
}

/* Penjaga halaman admin: alihkan ke login admin bila sesi server tidak ada. */
async function wajibAdmin() {
  const admin = await adminSaatIni();
  if (!admin) {
    const kembali = window.location.pathname.split("/").pop() + window.location.search;
    window.location.replace("admin-login.html?next=" + encodeURIComponent(kembali));
    return null;
  }
  return admin;
}

/* Akhiri sesi admin di server, lalu kembali ke halaman login admin. */
async function keluarAdmin(arahkan = true) {
  try {
    await adminApi("logout.php", { method: "POST" });
  } catch (kesalahan) {
    /* Tetap arahkan ke halaman login walau jaringan bermasalah. */
  }
  if (arahkan) window.location.replace("admin-login.html?keluar=1");
}

/* Ikon SVG untuk menu sidebar admin. */
const IKON_ADMIN = {
  dashboard:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  profil:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/></svg>'
};

/* Isi sidebar admin: menu navigasi, data admin yang login, dan tombol keluar.
   Dipakai oleh seluruh halaman admin supaya navigasinya konsisten. */
function renderNavAdmin(halamanAktif, admin) {
  const slot = document.getElementById("menu-admin");
  if (slot) {
    const tautan = [
      { href: "admin-dashboard.php", label: "Dashboard", kunci: "dashboard" },
      { href: "admin-profil.php", label: "Profil Admin", kunci: "profil" }
    ];

    slot.innerHTML = tautan
      .map((t) => {
        const kelas = t.kunci === halamanAktif ? ' class="nav-aktif"' : "";
        return `<a href="${t.href}"${kelas}>${IKON_ADMIN[t.kunci] || ""}<span>${t.label}</span></a>`;
      })
      .join("");
  }

  if (admin) {
    const nama = document.getElementById("sidebar-nama");
    const email = document.getElementById("sidebar-email");
    const avatar = document.getElementById("sidebar-avatar");
    if (nama) nama.textContent = admin.name;
    if (email) email.textContent = admin.email;
    if (avatar) avatar.textContent = inisialDariNama(admin.name);
  }

  const tombol = document.getElementById("tombol-keluar-admin");
  if (tombol) tombol.addEventListener("click", () => keluarAdmin());
}
