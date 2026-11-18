import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://inskhhkztoganifgbhrt.supabase.co";
const SUPABASE_KEY = "sb_publishable_Aa6oBTaQZGKLs8SZw9m-Lw_RhRXSkoU";
const API_URL = "https://procure-finder-api.septiananana3.workers.dev";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById("webSearchForm");
const input = document.getElementById("webSearchInput");

if (form && input && !form.dataset.opportunityReady) {
  form.dataset.opportunityReady = "true";

  const filters = document.createElement("div");

  filters.innerHTML = `
    <div class="opportunity-filters">
      <label>
        Sektor
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
        Wilayah
        <input id="opLocation"
          value="Seluruh Indonesia"
          placeholder="Provinsi atau kota">
      </label>
    </div>

    <div class="op-search-info">
      <strong>PROCURE FINDER INTELLIGENCE</strong>
      <p>
        Temukan organisasi, indikasi kebutuhan, dan informasi
        kontak publik untuk mendukung kegiatan akuisisi.
      </p>
    </div>

    <div id="opResults" class="op-results">
      <div class="op-empty">
        Masukkan kata kunci untuk mulai menemukan calon klien.
      </div>
    </div>
  `;

  form.appendChild(filters);

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

    .op-search-info {
      margin-top:18px;
      padding:14px;
      background:#f5f3ff;
      border:1px solid #e8e3ff;
      border-radius:11px;
    }

    .op-search-info strong {
      color:#6250bd;
      font-size:13px;
    }

    .op-search-info p {
      margin:6px 0 0;
      color:#777386;
      font-size:12px;
      line-height:1.6;
    }

    .op-results {
      display:grid;
      gap:15px;
      margin-top:20px;
    }

    .op-empty {
      padding:22px;
      text-align:center;
      color:#89869a;
      border:1px dashed #dedbe9;
      border-radius:12px;
      font-size:13px;
    }

    .op-card {
      padding:16px;
      border:1px solid #eeecf4;
      border-radius:13px;
      background:white;
      min-width:0;
    }

    .op-card h4 {
      margin:0 0 9px;
      color:#28243b;
      font-size:16px;
      line-height:1.5;
    }

    .op-card p {
      font-size:13px;
      line-height:1.7;
      color:#777386;
      overflow-wrap:anywhere;
    }

    .op-meta {
      font-size:12px;
      color:#89869a;
      margin:8px 0;
      line-height:1.6;
    }

    .op-tag {
      display:inline-block;
      padding:5px 9px;
      margin:3px 4px 3px 0;
      background:#f0edff;
      color:#6250bd;
      border-radius:20px;
      font-size:11px;
      font-weight:600;
    }

    .op-tag.neutral {
      background:#f3f3f5;
      color:#666;
    }

    .op-section {
      border-top:1px solid #eeecf4;
      margin-top:13px;
      padding-top:12px;
    }

    .op-section strong {
      font-size:13px;
      color:#28243b;
    }

    .op-contact {
      display:grid;
      gap:7px;
      margin-top:9px;
      font-size:13px;
      overflow-wrap:anywhere;
    }

    .op-contact a {
      color:#6250bd;
      text-decoration:none;
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

    .op-actions {
      display:flex;
      flex-wrap:wrap;
      gap:8px;
      margin-top:13px;
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
      min-height:125px;
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
      font-size:11px;
      color:#89869a;
      line-height:1.6;
      margin-top:10px;
    }

    .op-score {
      font-weight:700;
      color:#6250bd;
    }

    @media(max-width:480px) {
      .op-card { padding:13px; }
      .op-actions { flex-direction:column; }
      .op-button { width:100%; }
    }
  `;

  document.head.appendChild(style);

  const resultsBox = document.getElementById("opResults");

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

  function extractEmails(text) {
    const matches = String(text || "").match(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    ) || [];

    return [...new Set(matches)];
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
    )];
  }

  function classifyNeed(text, selectedCategory) {
    const value = String(text || "").toLowerCase();

    const categories = [
      {
        name: "Pengadaan Umum",
        words: [
          "pengadaan barang",
          "pengadaan umum",
          "procurement",
          "pembelian barang",
          "belanja barang",
          "vendor barang",
          "supplier"
        ]
      },
      {
        name: "Instalasi Listrik",
        words: [
          "instalasi listrik",
          "panel listrik",
          "jaringan listrik",
          "kelistrikan",
          "electrical",
          "gardu",
          "kabel listrik"
        ]
      },
      {
        name: "PDAM dan Perpipaan",
        words: [
          "pdam",
          "air bersih",
          "perpipaan",
          "pipa hdpe",
          "jaringan air",
          "water supply",
          "pompa air",
          "plumbing"
        ]
      },
      {
        name: "Konstruksi dan Infrastruktur",
        words: [
          "konstruksi",
          "infrastruktur",
          "pembangunan gedung",
          "proyek jalan",
          "renovasi",
          "civil works"
        ]
      },
      {
        name: "Teknologi Informasi",
        words: [
          "teknologi informasi",
          "software",
          "hardware",
          "server",
          "jaringan komputer",
          "it support",
          "sistem informasi"
        ]
      },
      {
        name: "Maintenance",
        words: [
          "maintenance",
          "pemeliharaan",
          "perawatan",
          "perbaikan mesin",
          "service berkala"
        ]
      },
      {
        name: "Cleaning Service",
        words: [
          "cleaning service",
          "jasa kebersihan",
          "kebersihan gedung",
          "housekeeping"
        ]
      },
      {
        name: "Security",
        words: [
          "security",
          "jasa keamanan",
          "pengamanan",
          "tenaga keamanan"
        ]
      }
    ];

    const detected = categories
      .filter(category =>
        category.words.some(word => value.includes(word))
      )
      .map(category => category.name);

    if (selectedCategory && !detected.includes(selectedCategory)) {
      detected.unshift(selectedCategory + " (kategori pencarian)");
    }

    return [...new Set(detected)];
  }

  function detectOpportunity(text) {
    const value = String(text || "").toLowerCase();

    const activeWords = [
      "tender",
      "pengumuman pengadaan",
      "permintaan penawaran",
      "request for quotation",
      "rfq",
      "open tender",
      "lelang",
      "jadwal pengadaan",
      "dokumen pemilihan",
      "kerangka acuan kerja",
      "rencana umum pengadaan"
    ];

    const potentialWords = [
      "proyek",
      "pembangunan",
      "perluasan",
      "pengembangan",
      "kebutuhan",
      "pemeliharaan",
      "renovasi",
      "operasional"
    ];

    if (activeWords.some(word => value.includes(word))) {
      return {
        status: "Indikasi kebutuhan aktif",
        type: "Active",
        note: "Terdapat kata atau frasa yang mengindikasikan proses pengadaan. Periksa sumber asli untuk memastikan statusnya."
      };
    }

    if (potentialWords.some(word => value.includes(word))) {
      return {
        status: "Potensial",
        type: "Potential",
        note: "Informasi menunjukkan kemungkinan kebutuhan, tetapi belum membuktikan adanya permintaan pengadaan aktif."
      };
    }

    return {
      status: "Belum terverifikasi",
      type: "Unverified",
      note: "Organisasi ditemukan, tetapi bukti kebutuhan belum cukup kuat."
    };
  }

  function calculateScore(text, phones, emails, needCategories) {
    const value = String(text || "").toLowerCase();

    let score = 20;

    if (phones.length) score += 15;
    if (emails.length) score += 15;
    if (needCategories.length) score += 20;

    if (
      /tender|pengadaan|permintaan penawaran|proyek aktif|rfq|lelang/.test(value)
    ) {
      score += 20;
    } else if (
      /proyek|pembangunan|pemeliharaan|perluasan|kebutuhan/.test(value)
    ) {
      score += 10;
    }

    if (/\.go\.id|\.ac\.id|\.co\.id|\.com/.test(value)) {
      score += 5;
    }

    return Math.min(score, 95);
  }

  function createPitch(name, category) {
    const offer = category.length
      ? category.join(", ")
      : "pengadaan barang dan jasa";

    return `Yth. Tim Pengadaan / Procurement ${name},

Perkenalkan, kami dari [NAMA PERUSAHAAN ANDA].

Kami ingin memperkenalkan layanan kami di bidang ${offer}. Kami melihat informasi mengenai organisasi Bapak/Ibu dan ingin menjajaki kemungkinan kerja sama untuk mendukung kebutuhan pengadaan maupun operasional perusahaan.

Apabila berkenan, kami ingin mengirimkan profil perusahaan dan informasi layanan untuk dapat dipertimbangkan sebagai calon mitra/vendor.

Terima kasih atas waktu dan perhatiannya.

Hormat kami,
[NAMA]
[NOMOR KONTAK]`;
  }

  function renderResults() {
    if (!searchResults.length) {
      resultsBox.innerHTML = `
        <div class="op-empty">
          Belum ada hasil. Coba kata kunci atau wilayah lain.
        </div>
      `;
      return;
    }

    resultsBox.innerHTML = `
      <div>
        <strong>${searchResults.length} hasil pencarian</strong>
        <p class="op-note">
          Analisis berdasarkan informasi yang tersedia dari hasil pencarian publik.
          Semua kontak dan kebutuhan harus diverifikasi sebelum pitching.
        </p>
      </div>

      ${searchResults.map((item, index) => {
        const text = `${item.title || ""} ${item.content || ""}`;
        const phones = extractPhones(text);
        const emails = extractEmails(text);
        const needs = classifyNeed(
          text,
          document.getElementById("opCategory").value
        );
        const opportunity = detectOpportunity(text);
        const score = calculateScore(text, phones, emails, needs);
        const pitch = createPitch(item.title, needs);

        item.analysis = {
          phones,
          emails,
          needs,
          opportunity,
          score,
          pitch
        };

        return `
          <article class="op-card">
            <h4>${escapeHTML(item.title || "Tanpa judul")}</h4>

            <div>
              <span class="op-tag">${escapeHTML(opportunity.status)}</span>
              ${
                needs.length
                  ? needs.map(need =>
                      `<span class="op-tag neutral">${escapeHTML(need)}</span>`
                    ).join("")
                  : `<span class="op-tag neutral">Kategori belum terdeteksi</span>`
              }
            </div>

            <div class="op-meta">
              Skor kecocokan awal:
              <span class="op-score">${score}/100</span>
              <br>
              Skor ini merupakan indikator penyaringan, bukan jaminan
              perusahaan sedang membutuhkan layanan.
            </div>

            <div class="op-section">
              <strong>Informasi organisasi dan kebutuhan</strong>
              <p>${escapeHTML(item.content || "Tidak ada ringkasan tersedia.")}</p>
            </div>

            <div class="op-section">
              <strong>Informasi kontak publik</strong>

              <div class="op-contact">
                ${
                  phones.length
                    ? phones.map(phone =>
                        `<div>Telepon terdeteksi: <a href="tel:${escapeHTML(phone)}">${escapeHTML(phone)}</a></div>`
                      ).join("")
                    : `<div>Telepon: Belum ditemukan dalam ringkasan sumber.</div>`
                }

                ${
                  emails.length
                    ? emails.map(email =>
                        `<div>Email: <a href="mailto:${escapeHTML(email)}">${escapeHTML(email)}</a></div>`
                      ).join("")
                    : `<div>Email: Belum ditemukan dalam ringkasan sumber.</div>`
                }

                <div>WhatsApp: Belum diverifikasi</div>
              </div>
            </div>

            <div class="op-section">
              <strong>Analisis peluang</strong>
              <div class="op-evidence">
                ${escapeHTML(opportunity.note)}
              </div>
            </div>

            <div class="op-section">
              <strong>Sumber informasi</strong>
              <p>
                <a href="${escapeHTML(item.url || "#")}"
                   target="_blank"
                   rel="noopener noreferrer">
                  Buka sumber asli ↗
                </a>
              </p>
            </div>

            <div class="op-actions">
              <button class="op-button secondary"
                type="button" data-pitch="${index}">
                Siapkan pitching
              </button>

              <button class="op-button"
                type="button" data-save="${index}">
                Simpan prospek
              </button>
            </div>

            <textarea class="op-pitch"
              id="opPitch${index}"
              readonly>${escapeHTML(pitch)}</textarea>

            <button class="op-button secondary"
              type="button"
              data-copy="${index}"
              style="display:none">
              Salin pesan pitching
            </button>

            <p class="op-note">
              Kontak hanya diekstrak dari judul dan ringkasan hasil pencarian.
              Periksa sumber asli untuk memastikan keakuratan.
            </p>
          </article>
        `;
      }).join("")}
    `;
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
        Sedang mencari organisasi, kebutuhan, dan kontak publik...
      </div>
    `;

    searchResults = [];

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
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
          `${data.message || "Pencarian gagal."} | Status: ${data.auth_status || response.status} | Detail: ${data.detail || "Tidak ada detail"}`
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
      const textarea = document.getElementById(`opPitch${index}`);
      const copyButton = resultsBox.querySelector(
        `[data-copy="${index}"]`
      );

      textarea.style.display =
        textarea.style.display === "block" ? "none" : "block";

      copyButton.style.display =
        textarea.style.display === "block" ? "inline-block" : "none";

      return;
    }

    const copyButton = event.target.closest("[data-copy]");

    if (copyButton) {
      const index = Number(copyButton.dataset.copy);
      const pitch = searchResults[index]?.analysis?.pitch;

      if (!pitch) return;

      try {
        await navigator.clipboard.writeText(pitch);
        copyButton.textContent = "✓ Pesan berhasil disalin";
      } catch (error) {
        const textarea = document.getElementById(`opPitch${index}`);
        textarea.focus();
        textarea.select();
        copyButton.textContent = "Pilih teks lalu salin";
      }

      return;
    }

    const button = event.target.closest("[data-save]");

    if (!button) return;

    const index = Number(button.dataset.save);
    const item = searchResults[index];

    if (!item || !item.analysis) return;

    const selectedSector =
      document.getElementById("opSector").value;

    if (!selectedSector) {
      alert(
        "Pilih sektor Pemerintah atau Swasta sebelum menyimpan prospek."
      );
      return;
    }

    button.disabled = true;
    button.textContent = "Menyimpan...";

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!sessionData.session) {
        throw new Error("Silakan login ulang.");
      }

      const category =
        document.getElementById("opCategory").value ||
        item.analysis.needs[0] ||
        "Belum dikategorikan";

      const location =
        document.getElementById("opLocation").value.trim();

      const isNationwide =
        !location ||
        location.toLowerCase() === "seluruh indonesia";

      const { data: prospect, error: prospectError } =
        await supabase
          .from("prospects")
          .insert([{
            organization_name: item.title || "Organisasi belum diketahui",
            sector: selectedSector,
            business_category: category,
            city: isNationwide ? null : location,
            phone: item.analysis.phones[0] || null,
            email: item.analysis.emails[0] || null,
            whatsapp_number: null,
            contact_source_url: item.url || null,
            verification_status: "Unverified",
            notes:
              "Skor kecocokan awal: " +
              item.analysis.score +
              "/100. " +
              "Status kebutuhan: " +
              item.analysis.opportunity.status +
              ". Kontak perlu diverifikasi dari sumber asli."
          }])
          .select()
          .single();

      if (prospectError) throw prospectError;

      const { data: opportunity, error: opportunityError } =
        await supabase
          .from("opportunities")
          .insert([{
            prospect_id: prospect.id,
            opportunity_title: item.title || "Peluang belum diketahui",
            need_category: category,
            description: item.content || "",
            opportunity_type: "Potential Need",
            opportunity_status: "Unverified",
            location: isNationwide ? "Indonesia" : location
          }])
          .select()
          .single();

      if (opportunityError) throw opportunityError;

      const { error: sourceError } = await supabase
        .from("opportunity_sources")
        .insert([{
          prospect_id: prospect.id,
          opportunity_id: opportunity.id,
          source_name: "Tavily Search",
          source_url: item.url || "",
          evidence_description: item.content || "",
          found_at: new Date().toISOString()
        }]);

      if (sourceError) throw sourceError;

      button.textContent = "✓ Tersimpan";

      alert(
        "Prospek, peluang, dan sumber informasi berhasil disimpan."
      );

    } catch (error) {
      console.error(error);

      button.disabled = false;
      button.textContent = "Coba simpan lagi";

      alert("Gagal menyimpan: " + error.message);
    }
  });
}
