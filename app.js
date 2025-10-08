/* --- CONFIG --- */
const PASS = "0000"; // passcode for both member & admin access

/* --- SPLASH SCREEN --- */
document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash");
  const main = document.getElementById("mainContent");
  if (splash) {
    setTimeout(() => {
      splash.classList.add("hide");
      if (main) main.style.display = "block";
    }, 1000);
    // Optional: completely remove splash after fade
    setTimeout(() => splash.remove(), 2000);
  }
});


/* --- MODALS --- */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = "flex";
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = "none";
}

/* --- MEMBER LOCK (Tonight's Event) --- */
function promptMember() {
  openModal("memberModal");
}

function unlockMember() {
  const value = document.getElementById("memberPin").value.trim();
  if (value === PASS) {
    sessionStorage.setItem("gbs_member", "1");
    window.location = "tonight.html";
  } else {
    alert("Incorrect code. Please try again.");
  }
}

function ensureMember() {
  if (sessionStorage.getItem("gbs_member") !== "1") {
    window.location = "index.html#members-only";
  }
}

/* --- ADMIN LOCK --- */
function promptAdmin() {
  openModal("adminModal");
}

function unlockAdmin() {
  const value = document.getElementById("adminPin").value.trim();
  if (value === PASS) {
    sessionStorage.setItem("gbs_admin", "1");
    enableEditing();
    closeModal("adminModal");
  } else {
    alert("Incorrect admin code.");
  }
}

function isAdmin() {
  return sessionStorage.getItem("gbs_admin") === "1";
}

function enableEditing() {
  document.querySelectorAll("[data-edit]").forEach((el) => {
    el.contentEditable = true;
    el.style.outline = "1px dashed #444";
    el.style.outlineOffset = "2px";
  });
  const toolbar = document.getElementById("adminBar");
  if (toolbar) toolbar.style.display = "flex";

  // Restore saved edits
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

function adminInit() {
  if (isAdmin()) enableEditing();
  else disableEditing();
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

function adminLogout() {
  sessionStorage.removeItem("gbs_admin");
  disableEditing();
}

/* --- PETTY CASH TRACKER --- */
function pettyInit() {
  const data = JSON.parse(localStorage.getItem("gbs_petty") || "[]");
  data.forEach((r) => addPettyRow(r));
  pettyTotal();
}

function addPettyRow(r) {
  const tbody = document.getElementById("pettyBody");
  const tr = document.createElement("tr");
  ["date", "item", "amount", "cat"].forEach((k) => {
    const td = document.createElement("td");
    const i = document.createElement("input");
    i.value = r ? r[k] : "";
    i.type = k === "amount" ? "number" : "text";
    i.oninput = pettyTotal;
    td.appendChild(i);
    tr.appendChild(td);
  });
  tbody.appendChild(tr);
}

function pettySave() {
  const rows = [...document.querySelectorAll("#pettyBody tr")];
  const data = rows.map((tr) => {
    const [d, i, a, c] = [...tr.querySelectorAll("input")].map((x) => x.value);
    return { date: d, item: i, amount: a, cat: c };
  });
  localStorage.setItem("gbs_petty", JSON.stringify(data));
  pettyTotal(true);
}

function pettyTotal(show) {
  let total = 0;
  [...document.querySelectorAll("#pettyBody tr")].forEach((tr) => {
    const a = parseFloat(tr.querySelectorAll("input")[2].value || "0");
    if (!isNaN(a)) total += a;
  });
  const el = document.getElementById("pettyTotal");
  if (el) el.textContent = total.toFixed(2);
  if (show) {
    const toast = document.getElementById("toast");
    if (toast) {
      toast.style.display = "block";
      setTimeout(() => (toast.style.display = "none"), 1500);
    }
  }
}

/* --- RECIPE MODAL --- */
function initRecipes() {
  const cards = document.querySelectorAll(".recipe-card");
  const modal = document.getElementById("recipeModal");
  if (!cards.length || !modal) return;

  const hero = document.getElementById("recipeHero");
  const title = document.getElementById("recipeTitle");
  const ing = document.getElementById("recipeIngredients");
  const steps = document.getElementById("recipeSteps");

  cards.forEach((c) => {
    c.addEventListener("click", () => {
      title.textContent = c.dataset.title || "Recipe";
      hero.src = c.dataset.img;
      ing.innerHTML = "";
      (c.dataset.ingredients || "")
        .split("|")
        .forEach((x) => {
          if (x.trim()) {
            const li = document.createElement("li");
            li.textContent = x.trim();
            ing.appendChild(li);
          }
        });
      steps.innerHTML = "";
      (c.dataset.steps || "")
        .split("|")
        .forEach((x) => {
          if (x.trim()) {
            const li = document.createElement("li");
            li.textContent = x.trim();
            steps.appendChild(li);
          }
        });
      modal.style.display = "flex";
    });
  });

  document.getElementById("recipeClose").addEventListener("click", () => {
    modal.style.display = "none";
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
}

/* --- EVENT GALLERY UPLOAD --- */
function initUpload() {
  const drop = document.getElementById("dropzone");
  const thumbs = document.getElementById("thumbs");
  const rail = document.getElementById("rail");
  if (!drop) return;

  function handle(files) {
    [...files].forEach((f) => {
      if (!f.type.startsWith("image/")) return;
      const img = document.createElement("img");
      img.src = URL.createObjectURL(f);
      img.style.width = "100%";
      img.style.borderRadius = "10px";
      img.style.border = "1px solid #333";
      thumbs.appendChild(img.cloneNode());
      rail.appendChild(img);
    });
  }

  drop.addEventListener("click", () => {
    const i = document.createElement("input");
    i.type = "file";
    i.accept = "image/*";
    i.multiple = true;
    i.onchange = (e) => handle(e.target.files);
    i.click();
  });

  drop.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.style.borderColor = "rgba(255,26,26,.5)";
  });

  drop.addEventListener("dragleave", () => {
    drop.style.borderColor = "rgba(255,255,255,.18)";
  });

  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.style.borderColor = "rgba(255,255,255,.18)";
    handle(e.dataTransfer.files);
  });
}

/* --- AUTO-SCROLL FOR RAIL --- */
function initRail() {
  const rail = document.getElementById("rail");
  if (!rail) return;
  setInterval(() => {
    rail.scrollTop =
      (rail.scrollTop + 2) % (rail.scrollHeight - rail.clientHeight + 1);
  }, 60);
}



