
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* =========================================
   SUPABASE CONFIGURATION
========================================= */

const SUPABASE_URL = "https://inskhhkztoganifgbhrt.supabase.co";
const SUPABASE_KEY = "sb_publishable_Aa6oBTaQZGKLs8SZw9m-Lw_RhRXSkoU";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* =========================================
   ELEMENTS
========================================= */

const loadingScreen = document.getElementById("loadingScreen");
const appShell = document.getElementById("appShell");

const pageTitle = document.getElementById("pageTitle");
const breadcrumb = document.getElementById("breadcrumb");

const totalLeadsElement = document.getElementById("totalLeads");
const activeLeadsElement = document.getElementById("activeLeads");
const poCountElement = document.getElementById("poCount");

const recentLeadsElement = document.getElementById("recentLeads");
const pipelineSummaryElement = document.getElementById("pipelineSummary");

const leadForm = document.getElementById("leadForm");
const saveLeadButton = document.getElementById("saveLeadButton");

const leadsTableBody = document.getElementById("leadsTableBody");
const databaseSearch = document.getElementById("databaseSearch");
const statusFilter = document.getElementById("statusFilter");

let allLeads = [];

/* =========================================
   HELPERS
========================================= */

function showLoading() {
  if (loadingScreen) loadingScreen.hidden = false;
  if (appShell) appShell.hidden = true;
}

function showApplication() {
  if (loadingScreen) loadingScreen.hidden = true;
  if (appShell) appShell.hidden = false;
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function getStatusLabel(status) {
  const labels = {
    new: "New",
    contacted: "Contacted",
    interested: "Interested",
    need_confirmed: "Need Confirmed",
    referred: "Referred",
    quotation: "Quotation",
    po: "PO",
    lost: "Lost"
  };

  return labels[status] || status || "New";
}

function getStatusClass(status) {
  const allowed = [
    "new",
    "contacted",
    "interested",
    "need_confirmed",
    "referred",
    "quotation",
    "po",
    "lost"
  ];

  return allowed.includes(status) ? `status-${status}` : "status-badge";
}

function showError(message) {
  alert(message || "Terjadi kesalahan. Silakan coba lagi.");
}

/* =========================================
   AUTHENTICATION
========================================= */

async function checkSession() {
  showLoading();

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    if (!data.session) {
      window.location.replace("/login.html");
      return false;
    }

    showApplication();

    return true;

  } catch (error) {
    console.error("Session error:", error);

    window.location.replace("/login.html");

    return false;
  }
}

async function logout() {
  const button = document.getElementById("logoutButton");

  if (button) {
    button.disabled = true;
    button.textContent = "Logging out...";
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    window.location.replace("/login.html");

  } catch (error) {
    console.error("Logout error:", error);

    showError("Logout gagal: " + error.message);

    if (button) {
      button.disabled = false;
      button.innerHTML = "<span>↪</span> Logout";
    }
  }
}

/* =========================================
   NAVIGATION
========================================= */

const pageNames = {
  dashboard: "Dashboard Overview",
  "client-finder": "Client Finder",
  "lead-database": "Lead Database",
  "procurement-needs": "Procurement Needs",
  "partner-management": "Partner Management",
  "deal-po": "Deal & PO",
  "fee-tracker": "Fee Tracker",
  reports: "Reports"
};

function navigateTo(page) {
  if (!pageNames[page]) page = "dashboard";

  document.querySelectorAll(".page-section").forEach(section => {
    section.classList.remove("active");
  });

  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("active", link.dataset.page === page);
  });

  const selectedPage = document.getElementById(`page-${page}`);

  if (selectedPage) {
    selectedPage.classList.add("active");
  }

  if (pageTitle) pageTitle.textContent = pageNames[page];

  if (breadcrumb) {
    breadcrumb.textContent = page.replaceAll("-", " ").toUpperCase();
  }

  document.getElementById("sidebar")?.classList.remove("open");

  if (page === "lead-database") {
    loadLeads();
  }

  if (page === "dashboard") {
    loadDashboard();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setupNavigation() {
  document.querySelectorAll("[data-page]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();

      const page = link.dataset.page;

      history.replaceState(null, "", `#${page}`);

      navigateTo(page);
    });
  });

  document.querySelectorAll("[data-go]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();

      const page = link.dataset.go;

      history.replaceState(null, "", `#${page}`);

      navigateTo(page);
    });
  });

  const initialPage = window.location.hash.replace("#", "");

  navigateTo(pageNames[initialPage] ? initialPage : "dashboard");

  document.getElementById("mobileMenuButton")?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.toggle("open");
  });

  document.getElementById("logoutButton")?.addEventListener("click", logout);
}

/* =========================================
   GOOGLE SEARCH
========================================= */

function setupWebSearch() {
  const searchForm = document.getElementById("webSearchForm");
  const searchInput = document.getElementById("webSearchInput");

  searchForm?.addEventListener("submit", event => {
    event.preventDefault();

    const query = searchInput?.value.trim();

    if (!query) {
      showError("Masukkan kata kunci pencarian terlebih dahulu.");
      return;
    }

    const searchURL = "https://www.google.com/search?q=" +
      encodeURIComponent(query);

    window.open(searchURL, "_blank", "noopener,noreferrer");
  });

  document.querySelectorAll("[data-query]").forEach(button => {
    button.addEventListener("click", () => {
      if (!searchInput) return;

      searchInput.value = button.dataset.query || "";

      searchInput.focus();
    });
  });
}

/* =========================================
   SAVE LEAD
========================================= */

function setupLeadForm() {
  leadForm?.addEventListener("submit", async event => {
    event.preventDefault();

    if (!leadForm.reportValidity()) return;

    const formData = new FormData(leadForm);

    const lead = {
      company_name: formData.get("company_name")?.toString().trim(),
      pic: formData.get("pic_name")?.toString().trim() || null,
      phone: formData.get("phone")?.toString().trim() || null,
      email: formData.get("email")?.toString().trim() || null,
      website: formData.get("website")?.toString().trim() || null,
      address: formData.get("address")?.toString().trim() || null,
      city: formData.get("city")?.toString().trim() || null,
      business_category: formData.get("business_category") || null,
      source: formData.get("source") || null,
      source_url: formData.get("source_url")?.toString().trim() || null,
      status: formData.get("status") || "new",
      notes: formData.get("notes")?.toString().trim() || null
    };

    if (!lead.company_name) {
      showError("Nama perusahaan atau instansi wajib diisi.");
      return;
    }

    saveLeadButton.disabled = true;
    saveLeadButton.textContent = "Menyimpan...";

    try {
      const { error } = await supabase
        .from("leads")
        .insert([lead]);

      if (error) throw error;

      alert("Calon klien berhasil disimpan!");

      leadForm.reset();

      await loadLeads();
      await loadDashboard();

      navigateTo("lead-database");

    } catch (error) {
      console.error("Save lead error:", error);

      showError(
        "Data belum berhasil disimpan.\n\n" +
        error.message +
        "\n\nPeriksa struktur kolom database dan kebijakan akses."
      );

    } finally {
      saveLeadButton.disabled = false;
      saveLeadButton.innerHTML = "＋ Simpan Calon Klien";
    }
  });
}

/* =========================================
   LOAD LEADS
========================================= */

async function fetchLeads() {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

async function loadLeads() {
  if (!leadsTableBody) return;

  leadsTableBody.innerHTML = `
    <tr>
      <td colspan="6" class="empty-cell">Memuat data lead...</td>
    </tr>
  `;

  try {
    allLeads = await fetchLeads();

    renderLeadTable();

  } catch (error) {
    console.error("Load leads error:", error);

    leadsTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-cell">
          Gagal memuat data: ${escapeHTML(error.message)}
        </td>
      </tr>
    `;
  }
}

/* =========================================
   RENDER LEAD TABLE
========================================= */

function renderLeadTable() {
  if (!leadsTableBody) return;

  const keyword = databaseSearch?.value.trim().toLowerCase() || "";
  const selectedStatus = statusFilter?.value || "";

  const filtered = allLeads.filter(lead => {
    const searchText = [
      lead.company_name,
      lead.city,
      lead.business_category,
      lead.pic,
      lead.email
    ].join(" ").toLowerCase();

    const matchesKeyword = searchText.includes(keyword);
    const matchesStatus = !selectedStatus || lead.status === selectedStatus;

    return matchesKeyword && matchesStatus;
  });

  if (!filtered.length) {
    leadsTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-cell">
          Tidak ada data yang cocok.
        </td>
      </tr>
    `;
    return;
  }

  leadsTableBody.innerHTML = filtered.map(lead => `
    <tr>
      <td>
        <strong>${escapeHTML(lead.company_name)}</strong>
      </td>
      <td>${escapeHTML(lead.business_category || "-")}</td>
      <td>${escapeHTML(lead.city || "-")}</td>
      <td>${escapeHTML(lead.phone || lead.email || "-")}</td>
      <td>
        <span class="status-badge ${getStatusClass(lead.status)}">
          ${escapeHTML(getStatusLabel(lead.status))}
        </span>
      </td>
      <td>${escapeHTML(formatDate(lead.created_at))}</td>
    </tr>
  `).join("");
}

/* =========================================
   DASHBOARD
========================================= */

async function loadDashboard() {
  try {
    allLeads = await fetchLeads();

    const total = allLeads.length;

    const activeStatuses = [
      "new",
      "contacted",
      "interested",
      "need_confirmed",
      "referred",
      "quotation"
    ];

    const active = allLeads.filter(lead =>
      activeStatuses.includes(lead.status)
    ).length;

    const successfulPO = allLeads.filter(lead =>
      lead.status === "po"
    ).length;

    if (totalLeadsElement) {
      totalLeadsElement.textContent = total;
    }

    if (activeLeadsElement) {
      activeLeadsElement.textContent = active;
    }

    if (poCountElement) {
      poCountElement.textContent = successfulPO;
    }

    renderRecentLeads();
    renderPipeline();

  } catch (error) {
    console.error("Dashboard error:", error);

    if (recentLeadsElement) {
      recentLeadsElement.innerHTML = `
        <p class="muted">Data dashboard belum dapat dimuat.</p>
      `;
    }
  }
}

/* =========================================
   RECENT LEADS
========================================= */

function renderRecentLeads() {
  if (!recentLeadsElement) return;

  const recent = allLeads.slice(0, 5);

  if (!recent.length) {
    recentLeadsElement.innerHTML = `
      <span>▤</span>
      <strong>Belum ada data calon klien</strong>
      <p>Mulai tambahkan calon klien melalui Client Finder.</p>
    `;
    return;
  }

  recentLeadsElement.innerHTML = recent.map(lead => `
    <div class="pipeline-row">
      <span>${escapeHTML(lead.company_name)}</span>
      <span class="status-badge ${getStatusClass(lead.status)}">
        ${escapeHTML(getStatusLabel(lead.status))}
      </span>
    </div>
  `).join("");
}

/* =========================================
   PIPELINE SUMMARY
========================================= */

function renderPipeline() {
  if (!pipelineSummaryElement) return;

  const statuses = [
    ["New", "new"],
    ["Contacted", "contacted"],
    ["Interested", "interested"],
    ["Need Confirmed", "need_confirmed"],
    ["Referred", "referred"],
    ["Quotation", "quotation"],
    ["PO", "po"],
    ["Lost", "lost"]
  ];

  pipelineSummaryElement.innerHTML = statuses.map(([label, key]) => {
    const count = allLeads.filter(lead => lead.status === key).length;

    return `
      <div class="pipeline-row">
        <span>${label}</span>
        <strong>${count}</strong>
      </div>
    `;
  }).join("");
}

/* =========================================
   SEARCH AND FILTER EVENTS
========================================= */

function setupDatabaseFilters() {
  databaseSearch?.addEventListener("input", renderLeadTable);
  statusFilter?.addEventListener("change", renderLeadTable);
}

/* =========================================
   DATE LABEL
========================================= */

function setupDate() {
  const dateElement = document.getElementById("todayLabel");

  if (!dateElement) return;

  dateElement.textContent = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

/* =========================================
   INITIALIZATION
========================================= */

async function initializeApp() {
  const authenticated = await checkSession();

  if (!authenticated) return;

  setupNavigation();
  setupWebSearch();
  setupLeadForm();
  setupDatabaseFilters();
  setupDate();

  await loadDashboard();
}

initializeApp();
