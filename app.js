/* ===========================================================
   GBS BARTENDING - FINAL APP.JS (2025)
   Reliable access, editing, petty cash, uploads, and recipes
=========================================================== */

/* --- SPLASH SCREEN --- */
document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash");
  const main = document.getElementById("mainContent");
  const enterBtn = document.getElementById("enterBtn");
  const eventBtn = document.getElementById("eventBtn");

  function revealSite() {
    splash.classList.add("hide");
    if (main) main.style.display = "block";
  }

  if (enterBtn) enterBtn.addEventListener("click", revealSite);
  if (eventBtn) eventBtn.addEventListener("click", revealSite);
});

/* --- CONFIG --- */
const PASS = "0000"; // shared passcode for both Admin + Member access

/* --- MODALS --- */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = "flex";
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = "none";
}
function promptMember() {
  openModal("memberModal");
}
function promptAdmin() {
  openModal("adminModal");
}

/* ===========================================================
   MEMBER ACCESS ("Tonight’s Event") - LOCALSTORAGE FIX
=========================================================== */
function unlockMember() {
  const pinInput = document.getElementById("memberPin");
  if (!pinInput) {
    alert("Missing input field for passcode.");
    return;
  }

  const value = pinInput.value.trim();
  if (value === PASS) {
    console.log("✅ Correct PIN entered. Saving access...");
    localStorage.setItem("gbs_member_ok", "true");

    // double-check that it's saved
    setTimeout(() => {
      const check = localStorage.getItem("gbs_member_ok");
      console.log("Member session check:", check);

      if (check === "true") {
        closeModal("memberModal");
        window.location.href = "tonight.html";
      } else {
        alert("⚠️ Session failed to save — please try again.");
      }
    }, 300);
  } else {
    alert("❌ Incorrect passcode.");
  }
}

function ensureMember() {
  const ok = localStorage.getItem("gbs_member_ok");
  console.log("Checking member access:", ok);

  if (ok !== "true") {
    alert("Access restricted. Please enter via the 'Tonight’s Event' portal.");
    window.location.href = "index.html";
  } else {
    console.log("✅ Member access granted");
  }
}

/* ===========================================================
   ADMIN ACCESS + INLINE EDITING
=========================================================== */
function unlockAdmin() {
  const value = document.getElementById("adminPin").value.trim();
  if (value === PASS) {
    localStorage.setItem("gbs_admin_ok", "true");
    closeModal("adminModal");
    window.location.href = "admin.html";
  } else {
    alert("Incorrect admin code.");
  }
}

function adminInit() {
  const ok = localStorage.getItem("gbs_admin_ok");
  if (ok !== "true") {
    alert("Admin access only. Please log in from the home page.");
    window.location.href = "index.html";
  } else {
    enableEditing();
  }
}

function adminLogout() {
  localStorage.removeItem("gbs_admin_ok");
  disableEditing();
  alert("Logged out successfully.");
  window.location.href = "index.html";
}

function enableEditing() {
  document.querySelectorAll("[data-edit]").forEach((el) => {
    el.contentEditable = true;
    el.style.outline = "1px dashed #444";
    el.style.outlineOffset = "2px";
  });
  const toolbar = document.getElementById("adminBar");
  if (toolbar) toolbar.style.display = "flex";

  document.querySelectorAll("[id][data-edit]").forEach((el) => {
    const v = localStorage.getItem("gbs_edit_" + el.id);
    if (v) el.innerHTML = v;
  });
}

function disableEditing() {
  document.querySelectorAll("[data-edit]").forEach((el) => {
    el.contentEditable = false;
    el.style.outline = "";
  });
  const toolbar = document.getElementById("adminBar");
  if (toolbar) toolbar.style.display = "none";
}

function adminSave() {
  document.querySelectorAll("[id][data-edit]").forEach((el) => {
    localStorage.setItem("gbs_edit_" + el.id, el.innerHTML);
  });
  const toast = document.getElementById("toast");
  if (toast) {
    toast.style.display = "block";
    setTimeout(() => (toast.style.display = "none"), 1500);
  }
}

/* ===========================================================
   PETTY CASH TRACKER
=========================================================== */
function pettyInit() {
  const data = JSON.parse(localStorage.getItem("gbs_petty") || "[]");
  data.forEach((r) => addPettyRow(r));
