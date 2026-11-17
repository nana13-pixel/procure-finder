import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://inskhhkztoganifgbhrt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Aa6oBTaQZGKLs8SZw9m-Lw_RhRXSkoU";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const $ = (id) => document.getElementById(id);
let allLeads = [];
let toastTimer;

function notify(message, isError = false) {
  const toast = $("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.style.background = isError ? "#9d4059" : "#302b43";
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function showPage(page) {
  const validPages = ["dashboard","client-finder","lead-database","procurement-needs","partner-management","deal-po","fee-tracker","reports"];
  if (!validPages.includes(page)) page = "dashboard";
  document.querySelectorAll(".page-section").forEach(section => section.classList.remove("active"));
  const target = $("page-" + page);
  if (target) target.classList.add("active");
  document.querySelectorAll(".nav-link").forEach(link => link.classList.toggle("active", link.dataset.page === page));
  const titles = {
    dashboard:"Dashboard Overview","client-finder":"Client Finder","lead-database":"Lead Database",
    "procurement-needs":"Procurement Needs","partner-management":"Partner Management",
    "deal-po":"Deal & PO","fee-tracker":"Fee Tracker",reports:"Reports"
  };
  $("pageTitle").textContent = titles[page];
  $("breadcrumb").textContent = titles[page].toUpperCase();
  $("sidebar").classList.remove("open");
  if (page === "lead-database") loadLeads();
  if (page === "dashboard") loadDashboard();
}

function navigate(page) {
  if (location.hash !== "#" + page) location.hash = page;
  showPage(page);
}

document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-page]");
  const go = event.target.closest("[data-go]");
  if (nav) {
    event.preventDefault();
    navigate(nav.dataset.page);
  } else if (go) {
    event.preventDefault();
    navigate(go.dataset.go);
  }
});

$("mobileMenuButton")?.addEventListener("click", () => $("sidebar").classList.toggle("open"));

$("logoutButton")?.addEventListener("click", async () => {
  const button = $("logoutButton");
  button.disabled = true;
  button.textContent = "Keluar...";
  const { error } = await supabase.auth.signOut();
  if (error) {
    notify("Logout gagal: " + error.message, true);
    button.disabled = false;
    button.innerHTML = "↪ <span>Logout</span>";
    return;
  }
  window.location.replace("/login.html");
});

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[char]));
}

const statusLabels = {
  new:"New", contacted:"Contacted", interested:"Interested",
  need_confirmed:"Need Confirmed", referred:"Referred",
  quotation:"Quotation", po:"PO", lost:"Lost"
};

function statusBadge(status) {
  const safe = statusLabels[status] ? status : "New";
  return `<span class="status-badge status-${escapeHtml(status || "new")}">${safe}</span>`;
}

async function loadLeads() {
  const wrap = $("leadTableWrap");
  wrap.innerHTML = '<div class="table-empty">Memuat data...</div>';
  const { data, error } = await supabase
    .from("leads")
    .select("id,company_name,pic_name,phone,email,city,business_category,status,created_at")
    .order("created_at", { ascending: false });
  if (error) {
    wrap.innerHTML = `<div class="table-empty">Gagal memuat data: ${escapeHtml(error.message)}</div>`;
    notify("Tidak bisa memuat database lead. Periksa struktur tabel dan kebijakan RLS.", true);
    return;
  }
  allLeads = data || [];
  renderLeadTable();
  updateDashboardNumbers();
}

function renderLeadTable() {
  const term = ($("databaseSearch")?.value || "").trim().toLowerCase();
  const status = $("statusFilter")?.value || "";
  const filtered = allLeads.filter(lead => {
    const text = [lead.company_name, lead.city, lead.business_category, lead.pic_name].join(" ").toLowerCase();
    return (!term || text.includes(term)) && (!status || lead.status === status);
  });
  if (!filtered.length) {
    $("leadTableWrap").innerHTML = '<div class="table-empty">Belum ada lead yang cocok. Tambahkan calon klien melalui Client Finder.</div>';
    return;
  }
  const rows = filtered.map(lead => `<tr>
    <td><strong>${escapeHtml(lead.company_name)}</strong><small>${escapeHtml(lead.business_category || "Kategori belum diisi")}</small></td>
    <td>${escapeHtml(lead.pic_name || "-")}</td>
    <td>${escapeHtml(lead.city || "-")}</td>
    <td>${escapeHtml(lead.phone || "-")}</td>
    <td>${statusBadge(lead.status)}</td>
  </tr>`).join("");
  $("leadTableWrap").innerHTML = `<table class="lead-table"><thead><tr><th>PERUSAHAAN / INSTANSI</th><th>PIC</th><th>KOTA</th><th>KONTAK</th><th>STATUS</th></tr></thead><tbody>${rows}</tbody></table>`;
}

$("databaseSearch")?.addEventListener("input", renderLeadTable);
$("statusFilter")?.addEventListener("change", renderLeadTable);

function updateDashboardNumbers() {
  $("totalLeads").textContent = allLeads.length;
  $("activeLeads").textContent = allLeads.filter(x => !["po","lost"].includes(x.status)).length;
  $("poCount").textContent = allLeads.filter(x => x.status === "po").length;
  const recent = allLeads.slice(0, 5);
  $("recentLeads").innerHTML = recent.length ? `<div class="recent-list">${recent.map(lead => `<div class="recent-row"><div><strong>${escapeHtml(lead.company_name)}</strong><small>${escapeHtml(lead.city || "Lokasi belum diisi")}</small></div>${statusBadge(lead.status)}</div>`).join("")}</div>` : '<div class="empty-state"><span>▤</span><strong>Belum ada data calon klien</strong><p>Mulai tambahkan calon klien melalui Client Finder.</p></div>';
  const stages = ["new","contacted","interested","need_confirmed","referred","quotation","po","lost"];
  $("pipelineSummary").innerHTML = stages.map(stage => {
    const count = allLeads.filter(x => x.status === stage).length;
    const percent = allLeads.length ? Math.round(count / allLeads.length * 100) : 0;
    return `<div class="pipeline-row"><span>${statusLabels[stage]}</span><div class="pipeline-track"><div class="pipeline-fill" style="width:${percent}%"></div></div><span class="pipeline-count">${count}</span></div>`;
  }).join("");
}

async function loadDashboard() {
  const { data, error } = await supabase.from("leads").select("id,company_name,pic_name,city,business_category,status,created_at").order("created_at", { ascending: false });
  if (error) {
    notify("Dashboard belum dapat membaca data lead: " + error.message, true);
    return;
  }
  allLeads = data || [];
  updateDashboardNumbers();
}

$("webSearchForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = $("webSearchInput").value.trim();
  if (!query) return;
  window.open("https://www.google.com/search?q=" + encodeURIComponent(query), "_blank", "noopener");
});

document.querySelectorAll("[data-query]").forEach(button => {
  button.addEventListener("click", () => {
    $("webSearchInput").value = button.dataset.query;
    $("webSearchInput").focus();
  });
});

$("leadForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = $("saveLeadButton");
  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  payload.company_name = (payload.company_name || "").trim();
  payload.pic_name = (payload.pic_name || "").trim() || null;
  for (const key of ["phone","email","website","address","city","source_url","notes","business_category"]) {
    payload[key] = (payload[key] || "").trim() || null;
  }
  payload.lead_score = 0;
  if (!payload.company_name) {
    notify("Nama perusahaan atau instansi wajib diisi.", true);
    return;
  }
  button.disabled = true;
  button.textContent = "Menyimpan...";
  const { error } = await supabase.from("leads").insert(payload);
  button.disabled = false;
  button.textContent = "＋ Simpan Calon Klien";
  if (error) {
    notify("Gagal menyimpan: " + error.message, true);
    return;
  }
  form.reset();
  notify("Calon klien berhasil disimpan!");
  await loadDashboard();
  navigate("lead-database");
});

async function startApp() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    window.location.replace("/login.html");
    return;
  }
  $("loadingScreen").hidden = true;
  $("appShell").hidden = false;
  document.body.classList.remove("app-loading");
  $("todayLabel").textContent = new Intl.DateTimeFormat("id-ID", { day:"numeric", month:"long", year:"numeric" }).format(new Date());
  const initialPage = location.hash.replace("#", "") || "dashboard";
  showPage(initialPage);
  await loadDashboard();
}

window.addEventListener("hashchange", () => showPage(location.hash.replace("#", "") || "dashboard"));
startApp();

