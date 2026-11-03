/* Logika halaman beranda: render filter, filter + urutkan data, render kartu. */

const URUTAN = [
  { nilai: "nama-naik", label: "Nama A - Z" },
  { nilai: "nama-turun", label: "Nama Z - A" },
  { nilai: "modal-naik", label: "Modal terendah" },
  { nilai: "modal-turun", label: "Modal tertinggi" }
];

/* Rentang modal minimal. Batas maksimal memakai BATAS_MODAL dari data.js. */
const BATAS_MODAL_MIN = [
  { label: "Semua modal", nilai: 0 },
  { label: "Minimal Rp 10 juta", nilai: 10000000 },
  { label: "Minimal Rp 25 juta", nilai: 25000000 },
  { label: "Minimal Rp 50 juta", nilai: 50000000 },
  { label: "Minimal Rp 100 juta", nilai: 100000000 }
];

const DEFAULT_FILTER = {
  cari: "", kategori: "", model: "", lokasi: "",
  modalMin: 0, modalMaks: 0, urut: "nama-naik"
};

const state = Object.assign({}, DEFAULT_FILTER);

/* Daftar lokasi diambil dari data. Bila brand belum punya field lokasi,
   daftarnya kosong dan filter lokasi otomatis disembunyikan. */
const DAFTAR_LOKASI = [...new Set(
  FRANCHISES.map((f) => (f.lokasi || "").trim()).filter(Boolean)
)].sort((a, b) => a.localeCompare(b, "id"));

const el = {
  chips: document.getElementById("chips"),
  form: document.getElementById("filter-form"),
  cari: document.getElementById("cari"),
  model: document.getElementById("model"),
  lokasi: document.getElementById("lokasi"),
  fieldLokasi: document.getElementById("field-lokasi"),
  catatanLokasi: document.getElementById("catatan-lokasi"),
  modalMin: document.getElementById("modal-min"),
  modal: document.getElementById("modal"),
  urutkan: document.getElementById("urutkan"),
  daftar: document.getElementById("daftar-merchant"),
  jumlah: document.getElementById("jumlah-hasil"),
  ringkasan: document.getElementById("ringkasan-filter"),
  resetFilter: document.getElementById("reset-filter"),
  kosong: document.getElementById("kosong"),
  kosongPesan: document.getElementById("kosong-pesan"),
  resetKosong: document.getElementById("reset-kosong")
};

const IKON_LOKASI =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>';

/* ---------- Render kontrol filter ---------- */

function renderChips() {
  const semua = ["Semua", ...KATEGORI];
  el.chips.innerHTML = semua.map((nama) => {
    const nilai = nama === "Semua" ? "" : nama;
    const aktif = state.kategori === nilai;
    return `<button type="button" class="chip" data-kategori="${escapeHtml(nilai)}" aria-pressed="${aktif}">${escapeHtml(nama)}</button>`;
  }).join("");
}

function opsiHTML(daftar) {
  return daftar.map((b) => `<option value="${escapeHtml(String(b.nilai))}">${escapeHtml(b.label)}</option>`).join("");
}

function renderSelects() {
  el.model.innerHTML =
    '<option value="">Semua model</option>' +
    MODEL_BISNIS.map((m) => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join("");

  el.modalMin.innerHTML = opsiHTML(BATAS_MODAL_MIN);
  el.modal.innerHTML = opsiHTML(BATAS_MODAL);
  el.urutkan.innerHTML = URUTAN
    .map((u) => `<option value="${u.nilai}">${escapeHtml(u.label)}</option>`)
    .join("");
  el.urutkan.value = state.urut;

  /* Filter lokasi hanya ditampilkan bila data lokasi benar-benar tersedia. */
  if (DAFTAR_LOKASI.length > 0) {
    el.lokasi.innerHTML =
      '<option value="">Semua lokasi</option>' +
      DAFTAR_LOKASI.map((l) => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`).join("");
    el.fieldLokasi.hidden = false;
  } else {
    el.fieldLokasi.hidden = true;
    if (el.catatanLokasi) el.catatanLokasi.hidden = false;
  }
}

/* ---------- Filter, urutkan, render kartu ---------- */

function getHasil() {
  const kunci = state.cari.trim().toLowerCase();

  const hasil = FRANCHISES.filter((f) => {
    const cocokNama = (f.nama || "").toLowerCase().includes(kunci);
    const cocokKategori = !state.kategori || f.kategori === state.kategori;
    const cocokModel = !state.model || f.model === state.model;
    const cocokLokasi = !state.lokasi || (f.lokasi || "") === state.lokasi;
    const cocokMin = !state.modalMin || f.modal >= state.modalMin;
    const cocokMaks = !state.modalMaks || f.modal <= state.modalMaks;
    return cocokNama && cocokKategori && cocokModel && cocokLokasi && cocokMin && cocokMaks;
  });

  const pembanding = {
    "nama-naik": (a, b) => a.nama.localeCompare(b.nama, "id"),
    "nama-turun": (a, b) => b.nama.localeCompare(a.nama, "id"),
    "modal-naik": (a, b) => a.modal - b.modal,
    "modal-turun": (a, b) => b.modal - a.modal
  }[state.urut];

  return hasil.sort(pembanding || ((a, b) => a.nama.localeCompare(b.nama, "id")));
}

function kartuHTML(f) {
  const lokasi = (f.lokasi || "").trim();
  return `
    <article class="card">
      <div class="card-top">
        <span class="logo-tile" aria-hidden="true">${escapeHtml(f.nama.charAt(0))}</span>
        <div class="card-identitas">
          <h3>${escapeHtml(f.nama)}</h3>
          <p class="card-kategori">${escapeHtml(f.kategori)}</p>
        </div>
        ${f.halal ? '<span class="badge badge-halal">Halal</span>' : ""}
      </div>

      <p class="card-lokasi">
        ${IKON_LOKASI}
        <span>${lokasi ? escapeHtml(lokasi) : "Lokasi belum tersedia"}</span>
      </p>

      <p class="card-tagline">${escapeHtml(f.tagline)}</p>

      <div class="badges">
        <span class="badge">${escapeHtml(f.model)}</span>
        <span class="badge">${escapeHtml(f.pengelolaan)}</span>
      </div>

      <dl class="stats">
        <div><dt>Balik modal</dt><dd>${escapeHtml(String(f.bep))} bulan</dd></div>
        <div><dt>ROI</dt><dd>${escapeHtml(String(f.roi))}%</dd></div>
        <div><dt>Outlet</dt><dd>${escapeHtml(String(f.outlet))}</dd></div>
        <div><dt>Berdiri</dt><dd>${escapeHtml(String(f.berdiri))}</dd></div>
      </dl>

      <div class="card-bottom">
        <div class="card-modal">
          <span class="modal-label">Modal mulai dari</span>
          <p class="modal-nilai">${formatRupiah(f.modal)}</p>
        </div>
        <a class="btn btn-solid" href="detail.html?id=${encodeURIComponent(f.id)}">Lihat detail</a>
      </div>
    </article>`;
}

/* Ringkasan filter yang sedang aktif supaya pengguna tahu kenapa hasilnya sedikit. */
function labelFilterAktif() {
  const aktif = [];
  if (state.cari.trim()) aktif.push("Kata kunci: " + state.cari.trim());
  if (state.kategori) aktif.push("Kategori: " + state.kategori);
  if (state.model) aktif.push("Model: " + state.model);
  if (state.lokasi) aktif.push("Lokasi: " + state.lokasi);

  const batasMaks = BATAS_MODAL.find((b) => b.nilai === state.modalMaks && b.nilai !== 0);
  if (state.modalMin) {
    const min = BATAS_MODAL_MIN.find((b) => b.nilai === state.modalMin);
    if (min) aktif.push("Modal " + min.label.replace("Minimal ", "minimal "));
  }
  if (batasMaks) aktif.push("Modal " + batasMaks.label.replace("Sampai ", "maksimal "));

  const labelUrut = URUTAN.find((u) => u.nilai === state.urut);
  if (labelUrut && state.urut !== "nama-naik") aktif.push("Urut: " + labelUrut.label);
  return aktif;
}

function renderRingkasan(hasil) {
  const aktif = labelFilterAktif();
  el.resetFilter.hidden = aktif.length === 0;
  el.ringkasan.hidden = aktif.length === 0;

  if (aktif.length === 0) {
    el.ringkasan.innerHTML = "";
    return;
  }

  el.ringkasan.innerHTML =
    '<span class="ringkasan-label">Filter aktif</span>' +
    aktif.map((t) => `<span class="ringkasan-chip">${escapeHtml(t)}</span>`).join("");

  if (hasil.length === 0) {
    el.kosongPesan.textContent =
      "Tidak ada brand yang cocok dengan " + aktif.join(", ") + ". Longgarkan salah satu filter untuk melihat lebih banyak brand.";
  } else {
    el.kosongPesan.textContent = "Coba ubah kata kunci, naikkan modal maksimal, atau pilih kategori lain.";
  }
}

function render() {
  const hasil = getHasil();
  el.daftar.innerHTML = hasil.map(kartuHTML).join("");
  el.jumlah.textContent = `${hasil.length} dari ${FRANCHISES.length} franchise ditampilkan`;
  el.kosong.hidden = hasil.length > 0;
  el.daftar.hidden = hasil.length === 0;
  renderRingkasan(hasil);
}

/* ---------- Event ---------- */

function resetFilter() {
  Object.assign(state, DEFAULT_FILTER);
  el.cari.value = "";
  el.model.value = "";
  el.modalMin.value = "0";
  el.modal.value = "0";
  el.urutkan.value = state.urut;
  if (DAFTAR_LOKASI.length > 0) el.lokasi.value = "";
  renderChips();
  render();
}

el.chips.addEventListener("click", (e) => {
  const tombol = e.target.closest(".chip");
  if (!tombol) return;
  state.kategori = tombol.dataset.kategori;
  renderChips();
  render();
});

el.cari.addEventListener("input", (e) => { state.cari = e.target.value; render(); });
el.model.addEventListener("change", (e) => { state.model = e.target.value; render(); });
el.lokasi.addEventListener("change", (e) => { state.lokasi = e.target.value; render(); });
el.modalMin.addEventListener("change", (e) => { state.modalMin = Number(e.target.value); render(); });
el.modal.addEventListener("change", (e) => { state.modalMaks = Number(e.target.value); render(); });
el.urutkan.addEventListener("change", (e) => { state.urut = e.target.value; render(); });
el.form.addEventListener("submit", (e) => e.preventDefault());
el.resetFilter.addEventListener("click", resetFilter);
el.resetKosong.addEventListener("click", resetFilter);

/* ---------- Mulai ---------- */

renderSelects();
renderChips();
render();
