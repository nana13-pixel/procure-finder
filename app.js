
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

/* Procurement Needs elements */

const needForm = document.getElementById("needForm");
const saveNeedButton = document.getElementById("saveNeedButton");
const needsTableBody = document.getElementById("needsTableBody");
const needsSearch = document.getElementById("needsSearch");
const needsStatusFilter = document.getElementById("needsStatusFilter");
const needLeadSelect = document.getElementById("needLeadId");

const totalNeedsElement = document.getElementById("totalNeeds");
const activeNeedsElement = document.getElementById("activeNeeds");
const wonNeedsElement = document.getElementById("wonNeeds");
const totalNeedValueElement = document.getElementById("totalNeedValue");

let allLeads = [];
let allNeeds = [];
let editingNeedId = null;

/* =========================================
   CONSTANTS
========================================= */

const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Interested",
  "Need Confirmed",
  "Referred",
  "Won",
  "Lost"
];

const NEED_STATUSES = [
  "Identified",
  "Qualified",
  "Referred",
  "In Progress",
  "Won",
  "Lost"
];

const NEED_URGENCIES = [
  "Low",
  "Normal",
  "High",
  "Urgent"
];

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
  return status || "New";
}

function getStatusClass(status) {
  const normalized = String(status || "")
    .toLowerCase()
    .replace(/\s+/g, "-");

  return `status-${normalized}`;
}

function showError(message) {
  alert(message || "Terjadi kesalahan. Silakan coba lagi.");
}

function setButtonLoading(button, loading, loadingText, normalText) {
  if (!button) return;

  button.disabled = loading;
  button.textContent = loading ? loadingText : normalText;
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

  if (selectedPage) selectedPage.classList.add("active");

  if (pageTitle) pageTitle.textContent = pageNames[page];

  if (breadcrumb) {
    breadcrumb.textContent = page.replaceAll("-", " ").toUpperCase();
  }

  document.getElementById("sidebar")?.classList.remove("open");

  if (page === "lead-database") loadLeads();
  if (page === "dashboard") loadDashboard();
  if (page === "procurement-needs") loadProcurementNeeds();

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

    const searchURL =
      "https://www.google.com/search?q=" + encodeURIComponent(query);

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
   LEAD FORM
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
      status: formData.get("status") || "New",
      notes: formData.get("notes")?.toString().trim() || null
    };

    if (!lead.company_name) {
      showError("Nama perusahaan atau instansi wajib diisi.");
      return;
    }

    setButtonLoading(
      saveLeadButton,
      true,
      "Menyimpan...",
      "＋ Simpan Calon Klien"
    );

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
      setButtonLoading(
        saveLeadButton,
        false,
        "Menyimpan...",
        "＋ Simpan Calon Klien"
      );
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

    return searchText.includes(keyword) &&
      (!selectedStatus || lead.status === selectedStatus);
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
      <td><strong>${escapeHTML(lead.company_name)}</strong></td>
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
      "New",
      "Contacted",
      "Interested",
      "Need Confirmed",
      "Referred"
    ];

    const active = allLeads.filter(lead =>
      activeStatuses.includes(lead.status)
    ).length;

    const successfulPO = allLeads.filter(lead =>
      lead.status === "Won"
    ).length;

    if (totalLeadsElement) totalLeadsElement.textContent = total;
    if (activeLeadsElement) activeLeadsElement.textContent = active;
    if (poCountElement) poCountElement.textContent = successfulPO;

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

function renderPipeline() {
  if (!pipelineSummaryElement) return;

  pipelineSummaryElement.innerHTML = LEAD_STATUSES.map(status => {
    const count = allLeads.filter(lead =>
      lead.status === status
    ).length;

    return `
      <div class="pipeline-row">
        <span>${escapeHTML(status)}</span>
        <strong>${count}</strong>
      </div>
    `;
  }).join("");
}

/* =========================================
   PROCUREMENT NEEDS - LOAD DATA
========================================= */

async function fetchProcurementNeeds() {
  const { data, error } = await supabase
    .from("procurement_needs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

async function loadProcurementNeeds() {
  if (!needsTableBody) return;

  needsTableBody.innerHTML = `
    <tr>
      <td colspan="8" class="empty-cell">
        Memuat Procurement Needs...
      </td>
    </tr>
  `;

  try {
    const [needs, leads] = await Promise.all([
      fetchProcurementNeeds(),
      fetchLeads()
    ]);

    allNeeds = needs;
    allLeads = leads;

    populateNeedLeadOptions();
    renderProcurementNeeds();
    renderNeedStats();

  } catch (error) {
    console.error("Load Procurement Needs error:", error);

    needsTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-cell">
          Gagal memuat data: ${escapeHTML(error.message)}
        </td>
      </tr>
    `;
  }
}

/* =========================================
   PROCUREMENT NEEDS - LEAD OPTIONS
========================================= */

function populateNeedLeadOptions() {
  if (!needLeadSelect) return;

  const selectedValue = needLeadSelect.value;

  needLeadSelect.innerHTML = `
    <option value="">-- Tidak dihubungkan ke Lead --</option>
    ${allLeads.map(lead => `
      <option value="${escapeHTML(lead.id)}">
        ${escapeHTML(lead.company_name)}
      </option>
    `).join("")}
  `;

  if (selectedValue) {
    needLeadSelect.value = selectedValue;
  }
}

/* =========================================
   PROCUREMENT NEEDS - SAVE
========================================= */

function setupNeedForm() {
  if (!needForm) return;

  needForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!needForm.reportValidity()) return;

    const formData = new FormData(needForm);

    const need = {
      lead_id: formData.get("lead_id") || null,
      need_title: formData.get("need_title")?.toString().trim(),
      description: formData.get("description")?.toString().trim() || null,
      category: formData.get("category")?.toString().trim() || null,
      estimated_value: Number(formData.get("estimated_value")) || 0,
      location: formData.get("location")?.toString().trim() || null,
      urgency: formData.get("urgency") || "Normal",
      target_date: formData.get("target_date") || null,
      status: formData.get("status") || "Identified"
    };

    if (!need.need_title) {
      showError("Judul kebutuhan pengadaan wajib diisi.");
      return;
    }

    if (!NEED_STATUSES.includes(need.status)) {
      showError("Status Procurement Needs tidak valid.");
      return;
    }

    if (!NEED_URGENCIES.includes(need.urgency)) {
      showError("Tingkat urgensi tidak valid.");
      return;
    }

    setButtonLoading(
      saveNeedButton,
      true,
      "Menyimpan...",
      "＋ Simpan Procurement Need"
    );

    try {
      let result;

      if (editingNeedId) {
        result = await supabase
          .from("procurement_needs")
          .update(need)
          .eq("id", editingNeedId);
      } else {
        result = await supabase
          .from("procurement_needs")
          .insert([need]);
      }

      if (result.error) throw result.error;

      alert(
        editingNeedId
          ? "Procurement Need berhasil diperbarui!"
          : "Procurement Need berhasil ditambahkan!"
      );

      resetNeedForm();
      await loadProcurementNeeds();

    } catch (error) {
      console.error("Save Procurement Need error:", error);

      showError(
        "Procurement Need gagal disimpan.\n\n" +
        error.message +
        "\n\nPeriksa izin tabel, RLS, dan constraint database."
      );

    } finally {
      setButtonLoading(
        saveNeedButton,
        false,
        "Menyimpan...",
        "＋ Simpan Procurement Need"
      );
    }
  });
}

/* =========================================
   PROCUREMENT NEEDS - RESET FORM
========================================= */

function resetNeedForm() {
  if (!needForm) return;

  needForm.reset();
  editingNeedId = null;

  const title = document.getElementById("needFormTitle");
  if (title) title.textContent = "Tambah Procurement Need";

  if (saveNeedButton) {
    saveNeedButton.textContent = "＋ Simpan Procurement Need";
  }

  const cancelButton = document.getElementById("cancelNeedEdit");
  if (cancelButton) cancelButton.hidden = true;
}

/* =========================================
   PROCUREMENT NEEDS - EDIT
========================================= */

function editProcurementNeed(id) {
  const need = allNeeds.find(item => item.id === id);

  if (!need || !needForm) return;

  editingNeedId = id;

  needForm.elements.namedItem("lead_id").value = need.lead_id || "";
  needForm.elements.namedItem("need_title").value = need.need_title || "";
  needForm.elements.namedItem("category").value = need.category || "";
  needForm.elements.namedItem("estimated_value").value =
    need.estimated_value ?? 0;
  needForm.elements.namedItem("location").value = need.location || "";
  needForm.elements.namedItem("urgency").value = need.urgency || "Normal";
  needForm.elements.namedItem("target_date").value = need.target_date || "";
  needForm.elements.namedItem("status").value = need.status || "Identified";
  needForm.elements.namedItem("description").value =
    need.description || "";

  const title = document.getElementById("needFormTitle");
  if (title) title.textContent = "Edit Procurement Need";

  if (saveNeedButton) {
    saveNeedButton.textContent = "Simpan Perubahan";
  }

  const cancelButton = document.getElementById("cancelNeedEdit");
  if (cancelButton) cancelButton.hidden = false;

  needForm.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

/* =========================================
   PROCUREMENT NEEDS - DELETE
========================================= */

async function deleteProcurementNeed(id) {
  const confirmed = confirm(
    "Yakin ingin menghapus Procurement Need ini?"
  );

  if (!confirmed) return;

  try {
    const { error } = await supabase
      .from("procurement_needs")
      .delete()
      .eq("id", id);

    if (error) throw error;

    alert("Procurement Need berhasil dihapus!");

    await loadProcurementNeeds();

  } catch (error) {
    console.error("Delete Procurement Need error:", error);
    showError("Gagal menghapus data: " + error.message);
  }
}

/* =========================================
   PROCUREMENT NEEDS - RENDER TABLE
========================================= */

function renderProcurementNeeds() {
  if (!needsTableBody) return;

  const keyword = needsSearch?.value.trim().toLowerCase() || "";
  const selectedStatus = needsStatusFilter?.value || "";

  const filtered = allNeeds.filter(need => {
    const linkedLead = allLeads.find(lead => lead.id === need.lead_id);

    const searchText = [
      need.need_title,
      need.category,
      need.location,
      need.description,
      linkedLead?.company_name
    ].join(" ").toLowerCase();

    return searchText.includes(keyword) &&
      (!selectedStatus || need.status === selectedStatus);
  });

  if (!filtered.length) {
    needsTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-cell">
          Belum ada Procurement Needs yang cocok.
        </td>
      </tr>
    `;
    return;
  }

  needsTableBody.innerHTML = filtered.map(need => {
    const linkedLead = allLeads.find(lead => lead.id === need.lead_id);

    return `
      <tr>
        <td>
          <strong>${escapeHTML(need.need_title)}</strong>
          <small class="need-description">
            ${escapeHTML(need.description || "")}
          </small>
        </td>
        <td>${escapeHTML(need.category || "-")}</td>
        <td>${escapeHTML(linkedLead?.company_name || "-")}</td>
        <td>${escapeHTML(need.location || "-")}</td>
        <td>${escapeHTML(formatCurrency(need.estimated_value))}</td>
        <td>
          <span class="status-badge ${getStatusClass(need.status)}">
            ${escapeHTML(need.status || "Identified")}
          </span>
        </td>
        <td>${escapeHTML(formatDate(need.target_date))}</td>
        <td>
          <div class="table-actions">
            <button
              type="button"
              class="table-action"
              data-edit-need="${escapeHTML(need.id)}"
            >Edit</button>
            <button
              type="button"
              class="table-action delete-action"
              data-delete-need="${escapeHTML(need.id)}"
            >Hapus</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

/* =========================================
   PROCUREMENT NEEDS - STATISTICS
========================================= */

function renderNeedStats() {
  const total = allNeeds.length;

  const active = allNeeds.filter(need =>
    !["Won", "Lost"].includes(need.status)
  ).length;

  const won = allNeeds.filter(need =>
    need.status === "Won"
  ).length;

  const totalValue = allNeeds.reduce((sum, need) => {
    return sum + (Number(need.estimated_value) || 0);
  }, 0);

  if (totalNeedsElement) totalNeedsElement.textContent = total;
  if (activeNeedsElement) activeNeedsElement.textContent = active;
  if (wonNeedsElement) wonNeedsElement.textContent = won;

  if (totalNeedValueElement) {
    totalNeedValueElement.textContent = formatCurrency(totalValue);
  }
}

/* =========================================
   PROCUREMENT NEEDS - EVENTS
========================================= */

function setupNeedEvents() {
  needsSearch?.addEventListener("input", renderProcurementNeeds);
  needsStatusFilter?.addEventListener("change", renderProcurementNeeds);

  needsTableBody?.addEventListener("click", event => {
    const editButton = event.target.closest("[data-edit-need]");
    const deleteButton = event.target.closest("[data-delete-need]");

    if (editButton) {
      editProcurementNeed(editButton.dataset.editNeed);
    }

    if (deleteButton) {
      deleteProcurementNeed(deleteButton.dataset.deleteNeed);
    }
  });

  document.getElementById("cancelNeedEdit")?.addEventListener("click", () => {
    resetNeedForm();
  });
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
  setupNeedForm();
  setupNeedEvents();
  setupDate();

  await loadDashboard();
}

initializeApp();
