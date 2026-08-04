/* ==========================================================================
   Aligarh Cyber Crime Cell - Cyber Wednesday Awareness Campaign Portal
   Zero-Rate-Limit On-Demand Sync Engine (No 429 Rate Limit Blocks)
   ========================================================================== */

// Exact 32 Police Stations List for District Aligarh
const ALIGARH_POLICE_STATIONS = [
  "PS Akarabad",
  "PS Atruali",
  "PS Bannadevi",
  "PS Barla",
  "PS Chandaus",
  "PS Chharra",
  "PS Civil lines",
  "PS Cyber Police Station",
  "PS Dadon",
  "PS Delhigate",
  "PS Gabhana",
  "PS Gandhi Park",
  "PS Gangiri",
  "PS Gaunda",
  "PS Godha",
  "PS Gorai",
  "PS Harduaganj",
  "PS Iglas",
  "PS Jawan",
  "PS Khair",
  "PS Kotwali Nagar",
  "PS Lodha",
  "PS Madarak",
  "PS Mahuakheda",
  "PS Pali Mukimpur",
  "PS Pisawa",
  "PS Quarsi",
  "PS Rorawar",
  "PS Sasnigate",
  "PS Tappal",
  "PS Vijargarh",
  "Cyber Crime Cell"
];

// Official Admin Passcode for unlocking Admin Mode & CSV Export
const HOST_PASSCODE = "852456";

// Primary Vercel Endpoint & Direct Cloud Backup Endpoints
const API_ENDPOINTS = [
  "/api/campaigns",
  "https://jsonblob.com/api/jsonBlob/019fcde7-7ef4-7822-95ef-7b6d5902344f"
];

// Default Seed Data
const DEFAULT_CAMPAIGNS = [
  {
    srNo: 1,
    policeStation: "PS Civil lines",
    placeCampaign: "AMU Campus Hall & University Road, Aligarh",
    countPerson: 450,
    officerName: "Inspector Aligarh Cyber Crime Cell",
    date: "2026-07-29",
    photo: "images/campaign_1.jpg"
  },
  {
    srNo: 2,
    policeStation: "PS Atruali",
    placeCampaign: "Inter College Hall & Market Centre, Atrauli",
    countPerson: 320,
    officerName: "Sub-Inspector PS Atrauli",
    date: "2026-07-22",
    photo: "images/campaign_2.jpg"
  },
  {
    srNo: 3,
    policeStation: "Cyber Crime Cell",
    placeCampaign: "Police Line Auditorium, District Aligarh",
    countPerson: 600,
    officerName: "In-charge Cyber Crime Cell Aligarh",
    date: "2026-07-15",
    photo: "images/campaign_3.jpg"
  }
];

// App State
let campaigns = [];
let isAdminMode = false; // Default: Client View Mode
let currentFilterStation = "ALL";
let currentFromDate = "";
let currentToDate = "";
let currentSearchQuery = "";
let uploadedImageDataUrl = "";
let isSyncing = false;

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initCyberMatrixBackground();
  loadLocalStateFirst();
  loadCloudDataOnce();
  setupEventListeners();
  renderDashboard();
  setupSmartVisibilityPolling();
});

/* ==========================================================================
   1. Mobile Navigation Controls
   ========================================================================== */
function toggleMobileNav() {
  const navMenu = document.getElementById("nav-links-menu");
  const navIcon = document.getElementById("mobile-nav-icon");
  if (navMenu) {
    navMenu.classList.toggle("mobile-open");
  }
  if (navIcon) {
    if (navMenu && navMenu.classList.contains("mobile-open")) {
      navIcon.classList.remove("fa-bars");
      navIcon.classList.add("fa-xmark");
    } else {
      navIcon.classList.remove("fa-xmark");
      navIcon.classList.add("fa-bars");
    }
  }
}

function closeMobileNav() {
  const navMenu = document.getElementById("nav-links-menu");
  const navIcon = document.getElementById("mobile-nav-icon");
  if (navMenu) {
    navMenu.classList.remove("mobile-open");
  }
  if (navIcon) {
    navIcon.classList.remove("fa-xmark");
    navIcon.classList.add("fa-bars");
  }
}

/* ==========================================================================
   2. Admin Mode & Security Authentication
   ========================================================================== */
function toggleAdminMode() {
  if (!isAdminMode) {
    openAdminLoginModal();
  } else {
    isAdminMode = false;
    updateAdminUI();
    renderDashboard();
    alert("🔒 Logged out of Admin Mode. Switched to Client View mode.");
  }
}

function openAdminLoginModal() {
  const pwdInput = document.getElementById("admin-password-input");
  if (pwdInput) {
    pwdInput.value = "";
  }
  const modalAdmin = document.getElementById("modal-admin-login");
  if (modalAdmin) {
    modalAdmin.classList.add("active");
    setTimeout(() => {
      if (pwdInput) pwdInput.focus();
    }, 150);
  }
}

function togglePasswordVisibility() {
  const pwdInput = document.getElementById("admin-password-input");
  const eyeIcon = document.getElementById("toggle-eye-icon");
  if (pwdInput && eyeIcon) {
    if (pwdInput.type === "password") {
      pwdInput.type = "text";
      eyeIcon.classList.remove("fa-eye");
      eyeIcon.classList.add("fa-eye-slash");
    } else {
      pwdInput.type = "password";
      eyeIcon.classList.remove("fa-eye-slash");
      eyeIcon.classList.add("fa-eye");
    }
  }
}

function updateAdminUI() {
  const btnText = document.getElementById("admin-btn-text");
  const adminBtn = document.getElementById("admin-mode-btn");
  
  if (btnText && adminBtn) {
    if (isAdminMode) {
      btnText.innerText = "Admin Unlocked";
      adminBtn.style.borderColor = "var(--danger-crimson)";
      adminBtn.style.color = "var(--danger-crimson)";
      adminBtn.style.background = "rgba(255, 0, 85, 0.15)";
    } else {
      btnText.innerText = "Admin Login";
      adminBtn.style.borderColor = "var(--glass-border)";
      adminBtn.style.color = "var(--primary-cyan)";
      adminBtn.style.background = "rgba(0, 243, 255, 0.05)";
    }
  }
}

/* ==========================================================================
   3. Smart On-Demand Sync Engine (Zero Rate Limits)
   ========================================================================== */
function loadLocalStateFirst() {
  const savedData = localStorage.getItem("aligarh_cyber_wednesday_campaigns");
  if (savedData !== null) {
    try {
      const parsed = JSON.parse(savedData);
      campaigns = Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_CAMPAIGNS];
    } catch (e) {
      campaigns = [...DEFAULT_CAMPAIGNS];
    }
  } else {
    campaigns = [...DEFAULT_CAMPAIGNS];
    saveCampaignData();
  }
}

async function loadCloudDataOnce() {
  if (isSyncing) return;
  for (let url of API_ENDPOINTS) {
    try {
      const res = await fetch(url + "?t=" + Date.now(), { cache: "no-store" });
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            campaigns = data;
            reindexCampaigns();
            saveCampaignData();
            renderDashboard();
            break;
          }
        }
      }
    } catch (e) {
      // Try next endpoint silently
    }
  }
}

function setupSmartVisibilityPolling() {
  // Sync when user switches back to browser tab
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      loadCloudDataOnce();
    }
  });

  // Polite 15-second background interval (avoids 429 rate limits)
  setInterval(() => {
    loadCloudDataOnce();
  }, 15000);
}

async function syncToCloudDatabase() {
  isSyncing = true;
  saveCampaignData();
  
  for (let url of API_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(campaigns)
      });
      if (res.ok) {
        break;
      }
    } catch (err) {
      // Try next endpoint
    }
  }
  isSyncing = false;
}

function saveCampaignData() {
  localStorage.setItem("aligarh_cyber_wednesday_campaigns", JSON.stringify(campaigns));
}

/* ==========================================================================
   4. Render Dashboard Table, Gallery & Metrics
   ========================================================================== */
function renderDashboard() {
  renderMetrics();
  renderPoliceStationDropdownOptions();
  renderTable();
  renderGallery();
}

function renderMetrics() {
  const totalCampaigns = campaigns.length;
  const totalCitizens = campaigns.reduce((acc, item) => acc + Number(item.countPerson || 0), 0);
  
  const elCamp = document.getElementById("metric-total-campaigns");
  const elCit = document.getElementById("metric-total-citizens");
  const elStat = document.getElementById("metric-total-stations");
  const elWed = document.getElementById("metric-wednesdays-count");

  if (elCamp) elCamp.innerText = totalCampaigns;
  if (elCit) elCit.innerText = totalCitizens.toLocaleString();
  if (elStat) elStat.innerText = ALIGARH_POLICE_STATIONS.length;
  if (elWed) elWed.innerText = totalCampaigns;
}

function renderPoliceStationDropdownOptions() {
  const filterSelect = document.getElementById("filter-station");
  const formSelect = document.getElementById("input-station-select");

  if (filterSelect) {
    let filterHTML = `<option value="ALL">All Aligarh Police Stations (${ALIGARH_POLICE_STATIONS.length})</option>`;
    ALIGARH_POLICE_STATIONS.forEach(st => {
      filterHTML += `<option value="${st}">${st}</option>`;
    });
    filterSelect.innerHTML = filterHTML;
    filterSelect.value = currentFilterStation;
  }

  if (formSelect) {
    let formHTML = `<option value="" disabled selected>-- Select Aligarh Police Station --</option>`;
    ALIGARH_POLICE_STATIONS.forEach(st => {
      formHTML += `<option value="${st}">${st}</option>`;
    });
    formHTML += `<option value="CUSTOM">+ Add Other Aligarh Station / Outpost...</option>`;
    formSelect.innerHTML = formHTML;
  }
}

function getFilteredCampaigns() {
  return campaigns.filter(item => {
    const matchesStation = (currentFilterStation === "ALL" || item.policeStation === currentFilterStation);
    const query = currentSearchQuery.toLowerCase();
    const matchesSearch = !query || 
      (item.policeStation && item.policeStation.toLowerCase().includes(query)) ||
      (item.placeCampaign && item.placeCampaign.toLowerCase().includes(query)) ||
      (item.officerName && item.officerName.toLowerCase().includes(query)) ||
      (item.date && item.date.includes(query)) ||
      String(item.srNo).includes(query);

    let matchesFromDate = true;
    let matchesToDate = true;

    if (currentFromDate && item.date) {
      matchesFromDate = (item.date >= currentFromDate);
    }
    if (currentToDate && item.date) {
      matchesToDate = (item.date <= currentToDate);
    }
    
    return matchesStation && matchesSearch && matchesFromDate && matchesToDate;
  });
}

function renderTable() {
  const tbody = document.getElementById("campaign-table-body");
  const thAdmin = document.getElementById("th-admin-actions");
  
  if (!tbody) return;

  if (thAdmin) {
    thAdmin.style.display = isAdminMode ? "table-cell" : "none";
  }

  const filtered = getFilteredCampaigns();
  const colspanVal = isAdminMode ? 8 : 7;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="${colspanVal}">
          <div class="empty-state">
            <i class="fas fa-folder-open" style="font-size: 2.5rem; color: var(--primary-cyan); margin-bottom: 0.8rem;"></i>
            <p style="font-size: 1.05rem; font-weight: 600; color: #fff;">No Wednesday Campaign Records Found</p>
            <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 0.3rem;">Click 'New Record' button to submit new Wednesday campaign data.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  let html = "";
  filtered.forEach((item) => {
    html += `
      <tr>
        <td>
          <span class="sr-badge">${item.srNo}</span>
        </td>
        <td>
          <div class="station-cell">
            <i class="fas fa-building-shield station-icon"></i>
            <span>${escapeHTML(item.policeStation)}</span>
          </div>
        </td>
        <td>
          <div class="place-cell">
            <i class="fas fa-location-dot" style="color: var(--primary-cyan); margin-right: 6px;"></i>
            ${escapeHTML(item.placeCampaign)}
          </div>
        </td>
        <td>
          <span class="count-badge">
            <i class="fas fa-users"></i> ${Number(item.countPerson || 0).toLocaleString()}
          </span>
        </td>
        <td>
          <div class="officer-cell">
            <i class="fas fa-user-tie" style="color: var(--warning-amber); margin-right: 6px;"></i>
            ${escapeHTML(item.officerName)}
          </div>
        </td>
        <td>
          <span style="font-size: 0.85rem; color: var(--primary-cyan); font-weight: 600; white-space: nowrap;">
            <i class="fas fa-calendar-day" style="margin-right: 4px;"></i> ${item.date || 'N/A'}
          </span>
        </td>
        <td>
          <img src="${item.photo}" alt="Campaign Photo" class="table-photo-thumb" onclick="openLightbox('${item.photo}', '${escapeHTML(item.placeCampaign)}')">
        </td>
        ${isAdminMode ? `
          <td>
            <button class="action-btn" onclick="deleteCampaign(${item.srNo})" title="Delete Record (Admin Only)">
              <i class="fas fa-trash-alt"></i> Delete
            </button>
          </td>
        ` : ''}
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function renderGallery() {
  const galleryGrid = document.getElementById("gallery-grid");
  if (!galleryGrid) return;
  
  const filtered = getFilteredCampaigns();

  if (filtered.length === 0) {
    galleryGrid.innerHTML = `<p style="color: var(--text-muted); text-align: center; grid-column: 1/-1; padding: 2rem 0;">No campaign photos uploaded yet. Use 'New Record' to submit campaign data.</p>`;
    return;
  }

  let html = "";
  filtered.forEach(item => {
    html += `
      <div class="gallery-card">
        <div class="gallery-img-wrap">
          <img src="${item.photo}" alt="${escapeHTML(item.placeCampaign)}" onclick="openLightbox('${item.photo}', '${escapeHTML(item.placeCampaign)}')">
          <span class="gallery-badge"><i class="fas fa-calendar-week"></i> ${item.date || 'Wednesday'}</span>
        </div>
        <div class="gallery-body">
          <h4 class="gallery-title">${escapeHTML(item.placeCampaign)}</h4>
          <div class="gallery-meta">
            <span><i class="fas fa-shield-alt"></i> ${escapeHTML(item.policeStation)}</span>
            <span style="color: var(--success-emerald); font-weight:700;"><i class="fas fa-users"></i> ${item.countPerson}</span>
          </div>
        </div>
      </div>
    `;
  });

  galleryGrid.innerHTML = html;
}

/* ==========================================================================
   5. Event Handlers & Mobile Form Submission
   ========================================================================== */
function setupEventListeners() {
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearchQuery = e.target.value;
      renderTable();
      renderGallery();
    });
  }

  const filterStation = document.getElementById("filter-station");
  if (filterStation) {
    filterStation.addEventListener("change", (e) => {
      currentFilterStation = e.target.value;
      renderTable();
      renderGallery();
    });
  }

  const fromDate = document.getElementById("filter-from-date");
  if (fromDate) {
    fromDate.addEventListener("change", (e) => {
      currentFromDate = e.target.value;
      renderTable();
      renderGallery();
    });
  }

  const toDate = document.getElementById("filter-to-date");
  if (toDate) {
    toDate.addEventListener("change", (e) => {
      currentToDate = e.target.value;
      renderTable();
      renderGallery();
    });
  }

  const stationSelect = document.getElementById("input-station-select");
  if (stationSelect) {
    stationSelect.addEventListener("change", (e) => {
      const customGroup = document.getElementById("custom-station-group");
      if (customGroup) {
        customGroup.style.display = (e.target.value === "CUSTOM") ? "block" : "none";
      }
    });
  }

  const photoFile = document.getElementById("input-photo-file");
  if (photoFile) {
    photoFile.addEventListener("change", handleFileSelect);
  }

  const campaignForm = document.getElementById("campaign-form");
  if (campaignForm) {
    campaignForm.addEventListener("submit", handleFormSubmit);
  }

  // Admin Login Form Submit Handler
  const adminLoginForm = document.getElementById("admin-login-form");
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const pwdInput = document.getElementById("admin-password-input");
      const val = pwdInput ? pwdInput.value : "";

      if (val.trim() === HOST_PASSCODE) {
        isAdminMode = true;
        closeModal("modal-admin-login");
        updateAdminUI();
        renderDashboard();
        setTimeout(() => {
          alert("✅ Admin Mode Unlocked! Data Delete options & Admin Actions are now accessible.");
        }, 100);
      } else {
        alert("❌ Invalid Admin Passcode! Access denied.");
      }
    });
  }
}

function resetDateFilters() {
  currentFromDate = "";
  currentToDate = "";
  const fromDate = document.getElementById("filter-from-date");
  const toDate = document.getElementById("filter-to-date");
  if (fromDate) fromDate.value = "";
  if (toDate) toDate.value = "";
  renderTable();
  renderGallery();
}

/* Fast Mobile Image Compression (Max 350px) */
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement("canvas");
      const maxDim = 350;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      uploadedImageDataUrl = canvas.toDataURL("image/jpeg", 0.5);
      const previewArea = document.getElementById("photo-preview");
      if (previewArea) {
        previewArea.innerHTML = `<img src="${uploadedImageDataUrl}" alt="Uploaded Preview">`;
      }
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
}

/* Multi-Device Serverless Form Submission */
async function handleFormSubmit(e) {
  e.preventDefault();

  const stationSelect = document.getElementById("input-station-select")?.value;
  const customStation = document.getElementById("input-custom-station")?.value.trim();
  const policeStation = (stationSelect === "CUSTOM" && customStation) ? customStation : stationSelect;

  const placeCampaign = document.getElementById("input-place")?.value.trim();
  const countPerson = parseInt(document.getElementById("input-count")?.value) || 0;
  const officerName = document.getElementById("input-officer")?.value.trim();
  const photoUrlInput = document.getElementById("input-photo-url")?.value.trim();
  const campaignDate = document.getElementById("input-date")?.value || new Date().toISOString().split("T")[0];

  let photo = uploadedImageDataUrl || photoUrlInput || "images/campaign_1.jpg";

  if (!policeStation || !placeCampaign || !officerName) {
    alert("Please select a Police Station and fill in all required campaign fields!");
    return;
  }

  const newRecord = {
    srNo: campaigns.length + 1,
    policeStation: policeStation,
    placeCampaign: placeCampaign,
    countPerson: countPerson,
    officerName: officerName,
    photo: photo,
    date: campaignDate
  };

  campaigns.unshift(newRecord);
  reindexCampaigns();
  saveCampaignData();
  renderDashboard();

  closeModal('modal-add-campaign');
  resetForm();

  await syncToCloudDatabase();
  alert("🎉 Campaign record successfully saved for " + policeStation + "!");
}

function resetForm() {
  const campaignForm = document.getElementById("campaign-form");
  if (campaignForm) campaignForm.reset();
  uploadedImageDataUrl = "";
  const previewArea = document.getElementById("photo-preview");
  if (previewArea) {
    previewArea.innerHTML = `<div class="preview-placeholder"><i class="fas fa-cloud-upload-alt" style="font-size: 2rem; margin-bottom: 0.5rem;"></i><br>Uploaded photo preview will appear here</div>`;
  }
  const customGroup = document.getElementById("custom-station-group");
  if (customGroup) customGroup.style.display = "none";
}

/* Multi-Device Serverless Delete Handler */
async function deleteCampaign(srNo) {
  if (!isAdminMode) {
    alert("🔒 Delete operation restricted to Admin Mode only.");
    return;
  }

  if (confirm(`Are you sure you want to delete Cyber Wednesday record #${srNo}?`)) {
    campaigns = campaigns.filter(item => item.srNo !== srNo);
    reindexCampaigns();
    saveCampaignData();
    renderDashboard();

    await syncToCloudDatabase();
    alert(`✅ Record #${srNo} permanently deleted & live synced!`);
  }
}

function reindexCampaigns() {
  campaigns.forEach((item, idx) => {
    item.srNo = idx + 1;
  });
}

function openAddModal() {
  resetForm();
  const modalAdd = document.getElementById("modal-add-campaign");
  if (modalAdd) modalAdd.classList.add("active");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("active");
}

function openLightbox(imgSrc, caption) {
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const modalLightbox = document.getElementById("modal-lightbox");

  if (lightboxImg) lightboxImg.src = imgSrc;
  if (lightboxCaption) lightboxCaption.innerText = caption || "Aligarh Cyber Crime Cell Snapshot";
  if (modalLightbox) modalLightbox.classList.add("active");
}

/* Secure CSV Export Function */
function exportCSV() {
  if (campaigns.length === 0) {
    alert("No campaign records to export!");
    return;
  }

  if (!isAdminMode) {
    openAdminLoginModal();
    return;
  }

  generateCSVDownload();
}

function generateCSVDownload() {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Sr. No.,Police Station,Place of Campaign,Count of Person,Officer Name,Date\n";

  campaigns.forEach(item => {
    const row = [
      item.srNo,
      `"${(item.policeStation || '').replace(/"/g, '""')}"`,
      `"${(item.placeCampaign || '').replace(/"/g, '""')}"`,
      item.countPerson || 0,
      `"${(item.officerName || '').replace(/"/g, '""')}"`,
      item.date || ""
    ].join(",");
    csvContent += row + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Aligarh_Cyber_Wednesday_Awareness_Report_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  alert("✅ CSV Report successfully generated!");
}

/* ==========================================================================
   6. High-Tech Cyber Security Background Canvas
   ========================================================================== */
function initCyberMatrixBackground() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const binaryChars = "01ALIGARHCYBERCELL1930POLICE0101";
  const fontSize = 14;
  const columns = Math.floor(width / fontSize);
  const drops = Array(columns).fill(1);

  const nodes = [];
  const nodeCount = 50;
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2.5 + 1,
      color: Math.random() > 0.3 ? "rgba(0, 243, 255, " : "rgba(112, 0, 255, "
    });
  }

  function drawCyberBackground() {
    ctx.fillStyle = "rgba(5, 8, 20, 0.18)";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(0, 243, 255, 0.15)";
    ctx.font = `${fontSize}px monospace`;
    for (let i = 0; i < drops.length; i += 2) {
      const char = binaryChars[Math.floor(Math.random() * binaryChars.length)];
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    for (let i = 0; i < nodeCount; i++) {
      let n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;

      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fillStyle = n.color + "0.7)";
      ctx.fill();

      for (let j = i + 1; j < nodeCount; j++) {
        let n2 = nodes[j];
        let dx = n.x - n2.x;
        let dy = n.y - n2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 140) {
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.strokeStyle = `rgba(0, 243, 255, ${0.2 * (1 - dist / 140)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawCyberBackground);
  }

  drawCyberBackground();
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str).replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
