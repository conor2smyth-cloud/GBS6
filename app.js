/* ===========================================================
   GBS BARTENDING - APP.JS (cache-busted)
   build: 2025-10-09T22:45Z
=========================================================== */

/* --- SPLASH SCREEN --- */
document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash");
  const main = document.getElementById("mainContent");
  const enterBtn = document.getElementById("enterBtn");
  const eventBtn = document.getElementById("eventBtn");
  function revealSite() {
    if (splash) splash.classList.add("hide");
    if (main) main.style.display = "block";
  }
  if (enterBtn) enterBtn.addEventListener("click", (e)=>{ /* keep splash or reveal—your choice */ });
  if (eventBtn) eventBtn.addEventListener("click", ()=>{ /* modal opens; no page reload */ });
});

/* --- CONFIG --- */
const PASS = "0000"; // shared code

/* --- MODALS --- */
function openModal(id){ const m=document.getElementById(id); if(m) m.style.display="flex"; }
function closeModal(id){ const m=document.getElementById(id); if(m) m.style.display="none"; }
function promptMember(){ openModal("memberModal"); }
function promptAdmin(){ openModal("adminModal"); }

/* ========== MEMBER ACCESS (Tonight’s Event) using localStorage ========== */
function unlockMember(){
  const pin = document.getElementById("memberPin")?.value.trim();
  if (pin === PASS){
    localStorage.setItem("gbs_member_ok","true");
    closeModal("memberModal");
    setTimeout(()=>{ window.location.href="tonight.html"; }, 300);
  } else { alert("Incorrect passcode."); }
}
function ensureMember(){
  const ok = localStorage.getItem("gbs_member_ok");
  if (ok !== "true"){
    alert("Access restricted. Please enter via the 'Tonight’s Event' portal.");
    window.location.href="index.html";
  }
}

/* ========== ADMIN ACCESS + INLINE EDITING ========== */
function unlockAdmin(){
  const pin = document.getElementById("adminPin")?.value.trim();
  if (pin === PASS){
    localStorage.setItem("gbs_admin_ok","true");
    closeModal("adminModal");
    window.location.href="admin.html";
  } else { alert("Incorrect admin code."); }
}
function adminInit(){
  const ok = localStorage.getItem("gbs_admin_ok");
  if (ok !== "true"){ alert("Admin access only. Please log in from the home page."); window.location.href="index.html"; }
  else { enableEditing(); }
}
function adminLogout(){ localStorage.removeItem("gbs_admin_ok"); disableEditing(); alert("Logged out successfully."); window.location.href="index.html"; }

function enableEditing(){
  document.querySelectorAll("[data-edit]").forEach(el=>{
    el.contentEditable=true; el.style.outline="1px dashed #444"; el.style.outlineOffset="2px";
  });
  const bar=document.getElementById("adminBar"); if (bar) bar.style.display="flex";
  document.querySelectorAll("[id][data-edit]").forEach(el=>{
    const v=localStorage.getItem("gbs_edit_"+el.id); if (v) el.innerHTML=v;
  });
}
function disableEditing(){
  document.querySelectorAll("[data-edit]").forEach(el=>{ el.contentEditable=false; el.style.outline=""; });
  const bar=document.getElementById("adminBar"); if (bar) bar.style.display="none";
}
function adminSave(){
  document.querySelectorAll("[id][data-edit]").forEach(el=>{ localStorage.setItem("gbs_edit_"+el.id, el.innerHTML); });
  const t=document.getElementById("toast"); if(t){ t.style.display="block"; setTimeout(()=>t.style.display="none",1500); }
}

/* ========== PETTY CASH (Item, Amount, Price, Staff, Paid) ========== */
function pettyInit(){
  const data=JSON.parse(localStorage.getItem("gbs_petty")||"[]");
  const body=document.getElementById("pettyBody"); if (!body) return;
  body.innerHTML=""; data.forEach(addPettyRow); pettyTotal();
}
function addPettyRow(r={}){
  const body=document.getElementById("pettyBody"); if (!body) return;
  const tr=document.createElement("tr");
  ["item","amount","price","staff"].forEach(k=>{
    const td=document.createElement("td"); const i=document.createElement("input");
    i.type=(k==="amount"||k==="price")?"number":"text"; i.value=r[k]||""; i.oninput=pettyTotal;
    td.appendChild(i); tr.appendChild(td);
  });
  const tdPaid=document.createElement("td"); const cb=document.createElement("input"); cb.type="checkbox"; cb.checked=r.paid||false; tdPaid.appendChild(cb); tr.appendChild(tdPaid);
  body.appendChild(tr);
}
function pettySave(){
  const rows=[...document.querySelectorAll("#pettyBody tr")];
  const data=rows.map(tr=>{
    const [i,a,p,s]=[...tr.querySelectorAll("input[type='text'],input[type='number']")].map(x=>x.value);
    const paid=tr.querySelector("input[type='checkbox']").checked;
    return {item:i,amount:a,price:p,staff:s,paid};
  });
  localStorage.setItem("gbs_petty", JSON.stringify(data)); pettyTotal(true);
}
function pettyTotal(show){
  let total=0;
  [...document.querySelectorAll("#pettyBody tr")].forEach(tr=>{
    const price=parseFloat(tr.querySelectorAll("input[type='number']")[1]?.value||"0"); if(!isNaN(price)) total+=price;
  });
  const el=document.getElementById("pettyTotal"); if(el) el.textContent=total.toFixed(2);
  if (show){ const t=document.getElementById("toast"); if(t){ t.style.display="block"; setTimeout(()=>t.style.display="none",1500); } }
}

/* ========== RECIPE MODAL ========== */
function initRecipes(){
  const cards=document.querySelectorAll(".recipe-card"); const modal=document.getElementById("recipeModal");
  if(!cards.length||!modal) return;
  const hero=document.getElementById("recipeHero"), title=document.getElementById("recipeTitle"),
        ing=document.getElementById("recipeIngredients"), steps=document.getElementById("recipeSteps");
  cards.forEach(c=>{
    c.addEventListener("click", ()=>{
      title.textContent=c.dataset.title||"Recipe"; hero.src=c.dataset.img;
      ing.innerHTML=""; (c.dataset.ingredients||"").split("|").forEach(x=>{ if(x.trim()){ const li=document.createElement("li"); li.textContent=x.trim(); ing.appendChild(li); }});
      steps.innerHTML=""; (c.dataset.steps||"").split("|").forEach(x=>{ if(x.trim()){ const li=document.createElement("li"); li.textContent=x.trim(); steps.appendChild(li); }});
      modal.style.display="flex";
    });
  });
  document.getElementById("recipeClose").addEventListener("click", ()=> modal.style.display="none");
  modal.addEventListener("click",(e)=>{ if(e.target===modal) modal.style.display="none"; });
}

/* ========== EVENT GALLERY UPLOAD ========== */
function initUpload(){
  const drop=document.getElementById("dropzone"), thumbs=document.getElementById("thumbs"), rail=document.getElementById("rail");
  if(!drop) return;
  function handle(files){
    [...files].forEach(f=>{
      if(!f.type.startsWith("image/")) return;
      const img=document.createElement("img"); img.src=URL.createObjectURL(f);
      img.style.width="100%"; img.style.borderRadius="10px"; img.style.border="1px solid #333";
      thumbs?.appendChild(img.cloneNode()); rail?.appendChild(img);
    });
  }
  drop.addEventListener("click",()=>{ const i=document.createElement("input"); i.type="file"; i.accept="image/*"; i.multiple=true; i.onchange=(e)=>handle(e.target.files); i.click(); });
  drop.addEventListener("dragover",(e)=>{ e.preventDefault(); drop.style.borderColor="rgba(255,26,26,.5)"; });
  drop.addEventListener("dragleave",()=>{ drop.style.borderColor="rgba(255,255,255,.18)"; });
  drop.addEventListener("drop",(e)=>{ e.preventDefault(); drop.style.borderColor="rgba(255,255,255,.18)"; handle(e.dataTransfer.files); });
}

/* ========== AUTO SCROLL GALLERY RAIL ========== */
function initRail(){
  const rail=document.getElementById("rail"); if(!rail) return;
  setInterval(()=>{ rail.scrollTop=(rail.scrollTop+2) % (rail.scrollHeight - rail.clientHeight + 1); }, 60);
}

/* ========== EXPORTS (needed by inline HTML) ========== */
window.unlockMember = unlockMember;
window.ensureMember = ensureMember;
window.unlockAdmin  = unlockAdmin;
window.adminInit    = adminInit;
window.adminLogout  = adminLogout;
window.adminSave    = adminSave;
window.pettyInit    = pettyInit;
window.addPettyRow  = addPettyRow;
window.pettySave    = pettySave;
window.initRecipes  = initRecipes;
window.initUpload   = initUpload;
window.initRail     = initRail;
window.promptMember = promptMember;
window.promptAdmin  = promptAdmin;
window.closeModal   = closeModal;
