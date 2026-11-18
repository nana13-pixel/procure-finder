
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://inskhhkztoganifgbhrt.supabase.co";
const SUPABASE_KEY = "sb_publishable_Aa6oBTaQZGKLs8SZw9m-Lw_RhRXSkoU";
const API_URL = "https://procure-finder-api.septiananana3.workers.dev";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById("webSearchForm");
const input = document.getElementById("webSearchInput");

if (form && input) {
  const panel = form.closest(".finder-panel");

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
        <input id="opLocation" value="Seluruh Indonesia"
          placeholder="Provinsi atau kota">
      </label>
    </div>
    <div id="opResults" class="op-results">
      <p class="muted">Masukkan kata kunci untuk mulai mencari peluang.</p>
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
      padding:11px;
      border:1px solid #eeecf4;
      border-radius:9px;
      background:white;
      color:#28243b;
    }
    .op-results {
      display:grid;
      gap:14px;
      margin-top:20px;
    }
    .op-card {
      padding:16px;
      border:1px solid #eeecf4;
      border-radius:12px;
      background:white;
    }
    .op-card h4 {
      margin:0 0 9px;
      color:#28243b;
    }
    .op-card p {
      font-size:13px;
      line-height:1.6;
      color:#777386;
      overflow-wrap:anywhere;
    }
    .op-card a {
      color:#7965d8;
      font-size:13px;
      overflow-wrap:anywhere;
    }
    .op-meta {
      font-size:12px;
      color:#89869a;
      margin:8px 0;
    }
    .op-save {
      border:0;
      border-radius:8px;
      padding:10px 13px;
      background:#7965d8;
      color:white;
      font-weight:600;
      margin-top:10px;
      cursor:pointer;
    }
    .op-save:disabled { opacity:.6; }
    .op-note {
      font-size:12px;
      color:#89869a;
      margin-top:10px;
    }
  `;
  document.head.appendChild(style);

  const resultsBox = document.getElementById("opResults");

  function escapeHTML(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#039;"
    })[char]);
  }

  let searchResults = [];

  // Menangkap pencarian sebelum handler Google lama berjalan.
  form.addEventListener("submit", async event => {
    event.preventDefault();
    event.stopImmediatePropagation();

    const keyword = input.value.trim();
    if (!keyword) return;

    const sector = document.getElementById("opSector").value;
    const category = document.getElementById("opCategory").value;
    const location = document.getElementById("opLocation").value.trim()
      || "Indonesia";

    resultsBox.innerHTML = "<p>Mencari peluang di seluruh sumber publik...</p>";

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const token = sessionData.session?.access_token;

      if (!token) throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");

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
        throw new Error(data.message || "Pencarian gagal.");
      }

      searchResults = data.results || [];

      if (!searchResults.length) {
        resultsBox.innerHTML = "<p>Belum ada hasil. Coba kata kunci lain.</p>";
        return;
      }

      resultsBox.innerHTML = `
        <div>
          <strong>${searchResults.length} hasil ditemukan</strong>
          <p class="op-note">
            Hasil pencarian publik. Periksa bukti dan kontak sebelum menghubungi.
          </p>
        </div>
        ${searchResults.map((item, index) => `
          <article class="op-card">
            <h4>${escapeHTML(item.title)}</h4>
            <div class="op-meta">
              Status: Belum diverifikasi
            </div>
            <p>${escapeHTML(item.content)}</p>
            <a href="${escapeHTML(item.url)}"
               target="_blank" rel="noopener noreferrer">
              Buka sumber informasi ↗
            </a>
            <br>
            <button class="op-save" type="button" data-save="${index}">
              Simpan sebagai prospek
            </button>
          </article>
        `).join("")}
      `;

    } catch (error) {
      console.error(error);
      resultsBox.innerHTML =
        `<p>Gagal mencari: ${escapeHTML(error.message)}</p>`;
    }
  }, true);

  resultsBox.addEventListener("click", async event => {
    const button = event.target.closest("[data-save]");
    if (!button) return;

    const item = searchResults[Number(button.dataset.save)];
    if (!item) return;

    button.disabled = true;
    button.textContent = "Menyimpan...";

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Silakan login ulang.");

      const sector =
        document.getElementById("opSector").value || "Private";

      const category =
        document.getElementById("opCategory").value || "Belum dikategorikan";

      const location =
        document.getElementById("opLocation").value.trim();

      const { data: prospect, error: prospectError } = await supabase
        .from("prospects")
        .insert([{
          organization_name: item.title,
          sector,
          business_category: category,
          province: location,
          contact_source_url: item.url,
          verification_status: "Unverified",
          notes: "Nama organisasi dan kontak perlu diperiksa dari sumber asli."
        }])
        .select()
        .single();

      if (prospectError) throw prospectError;

      const { data: opportunity, error: opportunityError } = await supabase
        .from("opportunities")
        .insert([{
          prospect_id: prospect.id,
          opportunity_title: item.title,
          need_category: category,
          description: item.content,
          opportunity_type: "Potential Need",
          opportunity_status: "Unverified",
          location
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
          source_url: item.url,
          evidence_description: item.content,
          found_at: new Date().toISOString()
        }]);

      if (sourceError) throw sourceError;

      button.textContent = "✓ Tersimpan";
      alert("Prospek dan sumber informasi berhasil disimpan.");

    } catch (error) {
      console.error(error);
      button.disabled = false;
      button.textContent = "Coba simpan lagi";
      alert("Gagal menyimpan: " + error.message);
    }
  });
}

