import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://inskhhkztoganifgbhrt.supabase.co";
const SUPABASE_KEY = "sb_publishable_Aa6oBTaQZGKLs8SZw9m-Lw_RhRXSkoU";
const API_URL = "https://procure-finder-api.septiananana3.workers.dev";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById("webSearchForm");
const input = document.getElementById("webSearchInput");

if (form && input && !form.dataset.opportunityReady) {
  form.dataset.opportunityReady = "true";

  const panel = document.createElement("div");

  panel.innerHTML = `
    <div class="opportunity-filters">
      <label>
        Sektor calon klien
        <select id="opSector">
          <option value="">Pemerintah + Swasta</option>
          <option value="Government">Pemerintah</option>
          <option value="Private">Swasta</option>
        </select>
      </label>

      <label>
        Kategori kebutuhan
        <select id="opCategory">
          <option value="">Semua kategori</option>
          <option>Pengadaan Umum</option>
          <option>Instalasi Listrik</option>
          <option>PDAM dan Perpipaan</option>
          <option>Konstruksi dan Infrastruktur</option>
          <option>Teknologi Informasi</option>
          <option>Maintenance</option>
          <option>Cleaning Service</option>
          <option>Security</option>
        </select>
      </label>

      <label>
        Wilayah pencarian
        <input id="opLocation"
          value="Seluruh Indonesia"
          placeholder="Contoh: Bandung, Jawa Barat">
      </label>
    </div>

    <div class="op-intelligence">
      <div class="op-intelligence-title">
        <span>PROCURE FINDER</span>
        <strong>CLIENT INTELLIGENCE</strong>
      </div>
      <p>
        Temukan perusahaan dan instansi potensial, informasi kontak
        publik, serta indikasi kebutuhan untuk akuisisi klien.
      </p>
      <div class="op-search-tags">
        <span>Company Discovery</span>
        <span>Contact Discovery</span>
        <span>Need Analysis</span>
      </div>
    </div>

    <div id="opSummary"></div>

    <div id="opResults" class="op-results">
      <div class="op-empty">
        Masukkan kata kunci untuk menemukan calon klien.
      </div>
    </div>
  `;

  form.appendChild(panel);

  const style = document.createElement("style");

  style.textContent = `
    .opportunity-filters {
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(150px,1fr));
      gap:12px;
      margin-top:18px;
    }

    .opportunity-filters label {
      display:flex;
      flex-direction:column;
      gap:7px;
      font-size:13px;
      font-weight:600;
    }

    .opportunity-filters input,
    .opportunity-filters select {
      width:100%;
      min-width:0;
      box-sizing:border-box;
      padding:11px;
      border:1px solid #eeecf4;
      border-radius:9px;
      background:white;
      color:#28243b;
    }

    .op-intelligence {
      margin-top:18px;
      padding:16px;
      background:#f5f3ff;
      border:1px solid #e8e3ff;
      border-radius:12px;
    }

    .op-intelligence-title {
      display:flex;
      flex-wrap:wrap;
      gap:6px;
      color:#6250bd;
      font-size:12px;
    }

    .op-intelligence-title strong {
      color:#28243b;
    }

    .op-intelligence p {
      margin:8px 0;
      color:#777386;
      font-size:12px;
      line-height:1.7;
    }

    .op-search-tags {
      display:flex;
      flex-wrap:wrap;
      gap:6px;
    }

    .op-search-tags span {
      padding:5px 8px;
      background:white;
      border-radius:20px;
      color:#6250bd;
      font-size:10px;
    }

    .op-results {
      display:grid;
      gap:14px;
      margin-top:18px;
    }

    .op-empty {
      padding:22px;
      text-align:center;
      color:#89869a;
      border:1px dashed #dedbe9;
      border-radius:12px;
      font-size:13px;
    }

    .op-summary {
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:8px;
      margin-top:15px;
    }

    .op-summary-item {
      padding:12px 8px;
      border:1px solid #eeecf4;
      border-radius:10px;
      background:white;
      text-align:center;
    }

    .op-summary-item strong {
      display:block;
      color:#6250bd;
      font-size:20px;
    }

    .op-summary-item span {
      font-size:10px;
      color:#89869a;
    }

    .op-card {
      padding:16px;
      border:1px solid #eeecf4;
      border-radius:13px;
      background:white;
      min-width:0;
    }

    .op-card h4 {
      margin:0 0 7px;
      color:#28243b;
      font-size:16px;
      line-height:1.5;
      overflow-wrap:anywhere;
    }

    .op-subtitle {
      color:#89869a;
      font-size:11px;
      overflow-wrap:anywhere;
    }

    .op-badges {
      display:flex;
      flex-wrap:wrap;
      gap:5px;
      margin:12px 0;
    }

    .op-tag {
      display:inline-block;
      padding:5px 9px;
      background:#f0edff;
      color:#6250bd;
      border-radius:20px;
      font-size:10px;
      font-weight:600;
    }

    .op-tag.neutral {
      background:#f3f3f5;
      color:#666;
    }

    .op-tag.active {
      background:#e6f6ed;
      color:#18794e;
    }

    .op-tag.warning {
      background:#fff4df;
      color:#946200;
    }

    .op-section {
      border-top:1px solid #eeecf4;
      margin-top:13px;
      padding-top:12px;
    }

    .op-section strong {
      font-size:12px;
      color:#28243b;
    }

    .op-detail {
      margin-top:7px;
      font-size:12px;
      color:#777386;
      line-height:1.7;
      overflow-wrap:anywhere;
    }

    .op-contact {
      display:grid;
      gap:8px;
      margin-top:9px;
      font-size:12px;
      overflow-wrap:anywhere;
    }

    .op-contact a,
    .op-source a {
      color:#6250bd;
      text-decoration:none;
      overflow-wrap:anywhere;
    }

    .op-evidence {
      padding:11px;
      background:#faf9fd;
      border-radius:9px;
      margin-top:9px;
      font-size:12px;
      line-height:1.7;
      color:#777386;
      overflow-wrap:anywhere;
    }

    .op-score-row {
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:10px;
      margin-top:10px;
      font-size:12px;
    }

    .op-score {
      font-size:16px;
      font-weight:700;
      color:#6250bd;
    }

    .op-score-track {
      height:6px;
      background:#eeecf4;
      border-radius:10px;
      margin-top:7px;
      overflow:hidden;
    }

    .op-score-fill {
      height:100%;
      background:#7965d8;
      border-radius:10px;
    }

    .op-actions {
      display:flex;
      flex-wrap:wrap;
      gap:8px;
      margin-top:14px;
    }

    .op-button {
      border:0;
      border-radius:8px;
      padding:10px 13px;
      background:#7965d8;
      color:white;
      font-size:12px;
      font-weight:600;
      cursor:pointer;
    }

    .op-button.secondary {
      background:#f0edff;
      color:#6250bd;
    }

    .op-button:disabled {
      opacity:.6;
      cursor:not-allowed;
    }

    .op-pitch {
      display:none;
      width:100%;
      min-height:150px;
      box-sizing:border-box;
      margin-top:10px;
      padding:11px;
      border:1px solid #eeecf4;
      border-radius:9px;
      font-size:12px;
      line-height:1.6;
      resize:vertical;
    }

    .op-note {
      font-size:10px;
      color:#89869a;
      line-height:1.6;
      margin-top:10px;
    }

    @media(max-width:480px) {
      .op-card { padding:13px; }
      .op-actions { flex-direction:column; }
      .op-button { width:100%; }
      .op-summary-item strong { font-size:17px; }
    }
  `;

  document.head.appendChild(style);

  const resultsBox = document.getElementById("opResults");
  const summaryBox = document.getElementById("opSummary");

  let searchResults = [];

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  }

  function getDomain(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  }

  function getOrganization(item) {
    const title = String(item.title || "").trim();
    const domain = getDomain(item.url);

    // Jika judul tampak seperti nama organisasi, gunakan judul.
    const looksLikeOrganization =
      title.length > 2 &&
      title.length < 90 &&
      !/[.!?]\s/.test(title) &&
      !/^(berita|news|artikel|pengumuman|daftar|cara|mengenal)\b/i.test(title);

    if (looksLikeOrganization) {
      return {
        name: title,
        confidence: "Nama dari judul sumber"
      };
    }

    // Jika belum jelas, tampilkan domain sebagai identitas sumber.
    if (domain) {
      return {
        name: domain,
        confidence: "Nama organisasi perlu diverifikasi"
      };
    }

    return {
      name: "Organisasi belum teridentifikasi",
      confidence: "Identitas belum tersedia"
    };
  }

  function extractEmails(text) {
    const matches = String(text || "").match(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    ) || [];

    return [...new Set(
      matches.map(value => value.replace(/[.,;:]+$/, ""))
    )].slice(0, 8);
  }

  function extractPhones(text) {
    const matches = String(text || "").match(
      /(?:\+?62|0)[\s().-]*(?:\d[\s().-]*){7,13}/g
    ) || [];

    return [...new Set(
      matches
        .map(value => value.replace(/[^\d+]/g, ""))
        .filter(value => {
          const digits = value.replace(/\D/g, "");
          return digits.length >= 9 && digits.length <= 14;
        })
    )].slice(0, 8);
  }

  function extractLocation(text, selectedLocation) {
    const value = String(text || "");

    const cities = [
      "Jakarta", "Bandung", "Surabaya", "Semarang",
      "Yogyakarta", "Medan", "Makassar", "Palembang",
      "Denpasar", "Balikpapan", "Samarinda", "Pontianak",
      "Pekanbaru", "Malang", "Cirebon", "Bekasi",
      "Tangerang", "Bogor", "Depok", "Solo"
    ];

    const found = cities.find(city =>
      new RegExp(`\\b${city}\\b`, "i").test(value)
    );

    if (found) return found;

    if (
      selectedLocation &&
      selectedLocation.toLowerCase() !== "seluruh indonesia"
    ) {
      return selectedLocation;
    }

    return "Belum diketahui";
  }

  function classifyNeed(text, selectedCategory) {
    const value = String(text || "").toLowerCase();

    const categories = [
      {
        name: "Pengadaan Umum",
        words: [
          "pengadaan barang", "procurement", "supplier",
          "vendor", "pembelian barang", "distributor"
        ]
      },
      {
        name: "Instalasi Listrik",
        words: [
          "instalasi listrik", "panel listrik",
          "jaringan listrik", "kelistrikan",
          "electrical", "gardu", "kabel listrik"
        ]
      },
      {
        name: "PDAM dan Perpipaan",
        words: [
          "pdam", "air bersih", "perpipaan",
          "pipa hdpe", "jaringan air",
          "water supply", "pompa air", "plumbing"
        ]
      },
      {
        name: "Konstruksi dan Infrastruktur",
        words: [
          "konstruksi", "infrastruktur",
          "pembangunan gedung", "proyek jalan",
          "renovasi", "civil works"
        ]
      },
      {
        name: "Teknologi Informasi",
        words: [
          "teknologi informasi", "software",
          "hardware", "server", "jaringan komputer",
          "it support", "sistem informasi"
        ]
      },
      {
        name: "Maintenance",
        words: [
          "maintenance", "pemeliharaan",
          "perawatan", "perbaikan mesin", "service berkala"
        ]
      },
      {
        name: "Cleaning Service",
        words: [
          "cleaning service", "jasa kebersihan",
          "kebersihan gedung", "housekeeping"
        ]
      },
      {
        name: "Security",
        words: [
          "security", "jasa keamanan",
          "pengamanan", "tenaga keamanan"
        ]
      }
    ];

    const detected = categories
      .filter(category =>
        category.words.some(word => value.includes(word))
      )
      .map(category => category.name);

    // Kategori yang dipilih pengguna bukan bukti kebutuhan.
    if (selectedCategory && !detected.includes(selectedCategory)) {
      return detected;
    }

    return [...new Set(detected)];
  }

  function detectOpportunity(text) {
    const value = String(text || "").toLowerCase();

    const activeWords = [
      "permintaan penawaran",
      "request for quotation",
      "open tender",
      "pengumuman pengadaan",
      "jadwal pengadaan",
      "dokumen pemilihan",
      "rfq"
    ];

    const potentialWords = [
      "proyek",
      "pembangunan",
      "perluasan",
      "pengembangan",
      "pemeliharaan",
      "renovasi",
      "kebutuhan"
    ];

    if (activeWords.some(word => value.includes(word))) {
      return {
        type: "Active",
        label: "Indikasi kebutuhan aktif",
        note: "Ditemukan istilah yang mengindikasikan proses pengadaan. Periksa sumber asli untuk memastikan proses masih berlangsung."
      };
    }

    if (potentialWords.some(word => value.includes(word))) {
      return {
        type: "Potential",
        label: "Potensial",
        note: "Ada indikasi aktivitas atau kebutuhan yang mungkin relevan, tetapi belum membuktikan permintaan pengadaan aktif."
      };
    }

    return {
      type: "Unverified",
      label: "Belum terverifikasi",
      note: "Organisasi ditemukan, tetapi bukti kebutuhan belum cukup kuat."
    };
  }

  function calculateScore(data) {
    let score = 15;

    if (data.phones.length) score += 15;
    if (data.emails.length) score += 15;
    if (data.domain) score += 10;
    if (data.needs.length) score += 15;

    if (data.opportunity.type === "Potential") score += 10;
    if (data.opportunity.type === "Active") score += 20;

    if (data.rawContent.length > 500) score += 5;

    return Math.min(score, 95);
  }

  function createPitch(name, needs) {
    const offer = needs.length
      ? needs.join(", ")
      : "pengadaan barang dan jasa";

    return `Yth. Tim Procurement / Pengadaan ${name},

Perkenalkan, kami dari [NAMA PERUSAHAAN ANDA].

Kami ingin memperkenalkan layanan kami di bidang ${offer} dan menjajaki peluang kerja sama untuk mendukung kebutuhan operasional maupun pengadaan perusahaan Bapak/Ibu.

Apabila berkenan, kami dapat mengirimkan profil perusahaan serta informasi layanan untuk dipertimbangkan sebagai calon mitra/vendor.

Terima kasih atas waktu dan perhatiannya.

Hormat kami,
[NAMA]
[NOMOR KONTAK]`;
  }

  function analyzeItem(item) {
    // Gunakan raw_content dari backend, bukan hanya ringkasan artikel.
    const rawContent = String(item.raw_content || "");
    const content = String(item.content || "");
    const title = String(item.title || "");

    const fullText = [
      title,
      content,
      rawContent
    ].join("\n");

    const organization = getOrganization(item);
    const domain = getDomain(item.url);
    const phones = extractPhones(fullText);
    const emails = extractEmails(fullText);
    const needs = classifyNeed(
      fullText,
      document.getElementById("opCategory").value
    );

    const opportunity = detectOpportunity(fullText);

    const data = {
      organization,
      domain,
      phones,
      emails,
      needs,
      opportunity,
      rawContent,
      content,
      location: extractLocation(
        fullText,
        document.getElementById("opLocation").value
      )
    };

    data.score = calculateScore(data);
    data.pitch = createPitch(organization.name, needs);

    return data;
  }

  function renderResults() {
    if (!searchResults.length) {
      resultsBox.innerHTML = `
        <div class="op-empty">
          Belum ada prospek yang ditemukan.
          Coba kata kunci atau wilayah lain.
        </div>
      `;

      summaryBox.innerHTML = "";
      return;
    }

    const analyses = searchResults.map(analyzeItem);

    const activeCount = analyses.filter(
      item => item.opportunity.type === "Active"
    ).length;

    const potentialCount = analyses.filter(
      item => item.opportunity.type === "Potential"
    ).length;

    const contactCount = analyses.filter(
      item => item.phones.length || item.emails.length
    ).length;

    summaryBox.innerHTML = `
      <div class="op-summary">
        <div class="op-summary-item">
          <strong>${searchResults.length}</strong>
          <span>Sumber ditemukan</span>
        </div>
        <div class="op-summary-item">
          <strong>${contactCount}</strong>
          <span>Ada kontak terdeteksi</span>
        </div>
        <div class="op-summary-item">
          <strong>${activeCount + potentialCount}</strong>
          <span>Indikasi kebutuhan</span>
        </div>
      </div>
    `;

    resultsBox.innerHTML = analyses.map((data, index) => {
      const item = searchResults[index];

      const badgeClass =
        data.opportunity.type === "Active"
          ? "active"
          : data.opportunity.type === "Potential"
            ? "warning"
            : "neutral";

      const phoneHTML = data.phones.length
        ? data.phones.map(phone => `
            <div>
              Telepon:
              <a href="tel:${escapeHTML(phone)}">
                ${escapeHTML(phone)}
              </a>
            </div>
          `).join("")
        : "<div>Telepon: Belum ditemukan</div>";

      const emailHTML = data.emails.length
        ? data.emails.map(email => `
            <div>
              Email:
              <a href="mailto:${escapeHTML(email)}">
                ${escapeHTML(email)}
              </a>
            </div>
          `).join("")
        : "<div>Email: Belum ditemukan</div>";

      const needHTML = data.needs.length
        ? data.needs.map(need =>
            `<span class="op-tag">${escapeHTML(need)}</span>`
          ).join("")
        : `<span class="op-tag neutral">Kebutuhan belum teridentifikasi</span>`;

      return `
        <article class="op-card">
          <div class="op-subtitle">
            PROFIL CALON KLIEN #${index + 1}
          </div>

          <h4>${escapeHTML(data.organization.name)}</h4>

          <div class="op-subtitle">
            ${escapeHTML(data.organization.confidence)}
          </div>

          <div class="op-badges">
            <span class="op-tag ${badgeClass}">
              ${escapeHTML(data.opportunity.label)}
            </span>
            <span class="op-tag neutral">
              ${escapeHTML(data.location)}
            </span>
          </div>

          <div class="op-score-row">
            <span>Skor kecocokan awal</span>
            <span class="op-score">${data.score}/100</span>
          </div>

          <div class="op-score-track">
            <div class="op-score-fill"
              style="width:${data.score}%"></div>
          </div>

          <div class="op-section">
            <strong>Informasi organisasi</strong>
            <div class="op-detail">
              Domain:
              ${
                data.domain
                  ? `<a href="https://${escapeHTML(data.domain)}" target="_blank" rel="noopener noreferrer">${escapeHTML(data.domain)}</a>`
                  : "Belum tersedia"
              }
            </div>
            <div class="op-detail">
              Lokasi: ${escapeHTML(data.location)}
            </div>
          </div>

          <div class="op-section">
            <strong>Kontak publik yang terdeteksi</strong>
            <div class="op-contact">
              ${phoneHTML}
              ${emailHTML}
              <div>WhatsApp: Belum diverifikasi</div>
            </div>
          </div>

          <div class="op-section">
            <strong>Potensi kebutuhan</strong>
            <div class="op-badges">
              ${needHTML}
            </div>
            <div class="op-note">
              Kategori di atas dideteksi dari isi sumber,
              bukan konfirmasi langsung dari perusahaan.
            </div>
          </div>

          <div class="op-section">
            <strong>Informasi pendukung</strong>
            <div class="op-evidence">
              ${escapeHTML(
                data.content ||
                "Ringkasan sumber tidak tersedia."
              )}
            </div>
          </div>

          <div class="op-section">
            <strong>Sumber dan verifikasi</strong>
            <div class="op-detail op-source">
              <a href="${escapeHTML(item.url || "#")}"
                 target="_blank"
                 rel="noopener noreferrer">
                Buka halaman sumber asli ↗
              </a>
            </div>
            <div class="op-note">
              ${escapeHTML(data.opportunity.note)}
              ${item.published_date
                ? " Tanggal publikasi: " + escapeHTML(item.published_date)
                : ""}
            </div>
          </div>

          <div class="op-actions">
            <button class="op-button secondary"
              type="button" data-pitch="${index}">
              Siapkan pitching
            </button>

            <button class="op-button"
              type="button" data-save="${index}">
              Simpan calon klien
            </button>
          </div>

          <textarea class="op-pitch"
            id="opPitch${index}"
            readonly>${escapeHTML(data.pitch)}</textarea>

          <button class="op-button secondary"
            type="button"
            data-copy="${index}"
            style="display:none">
            Salin pesan pitching
          </button>

          <p class="op-note">
            Skor adalah alat penyaringan awal, bukan jaminan prospek
            akan membeli. Periksa nama, kontak, kebutuhan, dan sumber
            sebelum melakukan penawaran.
          </p>
        </article>
      `;
    }).join("");
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    event.stopImmediatePropagation();

    const keyword = input.value.trim();

    if (!keyword) return;

    const sector = document.getElementById("opSector").value;
    const category = document.getElementById("opCategory").value;
    const location =
      document.getElementById("opLocation").value.trim() ||
      "Indonesia";

    resultsBox.innerHTML = `
      <div class="op-empty">
        Sedang mencari perusahaan, instansi, kontak publik,
        dan indikasi kebutuhan...
      </div>
    `;

    summaryBox.innerHTML = "";
    searchResults = [];

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error(
          "Sesi login tidak ditemukan. Silakan login ulang."
        );
      }

      const response = await fetch(`${API_URL}/api/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          keyword,
          category,
          location,
          sector
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Pencarian gagal."
        );
      }

      searchResults = data.results || [];
      renderResults();

    } catch (error) {
      console.error(error);

      resultsBox.innerHTML = `
        <div class="op-empty">
          Gagal mencari: ${escapeHTML(error.message)}
        </div>
      `;
    }
  }, true);

  resultsBox.addEventListener("click", async event => {
    const pitchButton = event.target.closest("[data-pitch]");

    if (pitchButton) {
      const index = Number(pitchButton.dataset.pitch);
      const textarea =
        document.getElementById(`opPitch${index}`);

      const copyButton = resultsBox.querySelector(
        `[data-copy="${index}"]`
      );

      const isVisible = textarea.style.display === "block";

      textarea.style.display = isVisible ? "none" : "block";
      copyButton.style.display = isVisible ? "none" : "inline-block";

      return;
    }

    const copyButton = event.target.closest("[data-copy]");

    if (copyButton) {
      const index = Number(copyButton.dataset.copy);
      const pitch = analyzeItem(searchResults[index]).pitch;

      try {
        await navigator.clipboard.writeText(pitch);
        copyButton.textContent = "Pesan berhasil disalin";
      } catch {
        const textarea =
          document.getElementById(`opPitch${index}`);

        textarea.focus();
        textarea.select();
        copyButton.textContent = "Pilih teks lalu salin";
      }

      return;
    }

    const saveButton = event.target.closest("[data-save]");

    if (!saveButton) return;

    const index = Number(saveButton.dataset.save);
    const item = searchResults[index];

    if (!item) return;

    const selectedSector =
      document.getElementById("opSector").value;

    if (!selectedSector) {
      alert(
        "Pilih sektor Pemerintah atau Swasta sebelum menyimpan."
      );
      return;
    }

    const analysis = analyzeItem(item);

    saveButton.disabled = true;
    saveButton.textContent = "Menyimpan...";

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!sessionData.session) {
        throw new Error("Silakan login ulang.");
      }

      const selectedCategory =
        document.getElementById("opCategory").value;

      const category =
        selectedCategory ||
        analysis.needs[0] ||
        "Belum dikategorikan";

      const selectedLocation =
        document.getElementById("opLocation").value.trim();

      const isNationwide =
        !selectedLocation ||
        selectedLocation.toLowerCase() === "seluruh indonesia";

      const { data: prospect, error: prospectError } =
        await supabase
          .from("prospects")
          .insert([{
            organization_name: analysis.organization.name,
            sector: selectedSector,
            business_category: category,
            city: isNationwide ? null : selectedLocation,
            phone: analysis.phones[0] || null,
            email: analysis.emails[0] || null,
            whatsapp_number: null,
            contact_source_url: item.url || null,
            verification_status: "Unverified",
            notes:
              "Identitas: " +
              analysis.organization.confidence +
              ". Skor awal: " +
              analysis.score +
              "/100. Status: " +
              analysis.opportunity.label +
              ". Kontak dan kebutuhan harus diverifikasi."
          }])
          .select()
          .single();

      if (prospectError) throw prospectError;

      const { data: opportunity, error: opportunityError } =
        await supabase
          .from("opportunities")
          .insert([{
            prospect_id: prospect.id,
            opportunity_title: analysis.organization.name,
            need_category: category,
            description: analysis.content || "",
            opportunity_type: "Potential Need",
            opportunity_status: "Unverified",
            location: isNationwide
              ? "Indonesia"
              : selectedLocation
          }])
          .select()
          .single();

      if (opportunityError) throw opportunityError;

      const { error: sourceError } =
        await supabase
          .from("opportunity_sources")
          .insert([{
            prospect_id: prospect.id,
            opportunity_id: opportunity.id,
            source_name: "Tavily Search",
            source_url: item.url || "",
            evidence_description:
              analysis.content || "",
            found_at: new Date().toISOString()
          }]);

      if (sourceError) throw sourceError;

      saveButton.textContent = "Tersimpan";

      alert(
        "Calon klien, peluang, dan sumber berhasil disimpan."
      );

    } catch (error) {
      console.error(error);

      saveButton.disabled = false;
      saveButton.textContent = "Coba simpan lagi";

      alert(
        "Gagal menyimpan prospek: " + error.message
      );
    }
  });

}
