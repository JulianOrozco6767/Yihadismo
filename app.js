(() => {
  const slides = [...document.querySelectorAll(".slide")];
  const total = slides.length;
  let current = 0;
  let editMode = false;

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const currentSlide = document.getElementById("currentSlide");
  const totalSlides = document.getElementById("totalSlides");
  const progressBar = document.getElementById("progressBar");
  const editBtn = document.getElementById("editBtn");
  const overviewBtn = document.getElementById("overviewBtn");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const overviewModal = document.getElementById("overviewModal");
  const overviewGrid = document.getElementById("overviewGrid");
  const closeOverview = document.getElementById("closeOverview");
  const toast = document.getElementById("toast");

  totalSlides.textContent = String(total).padStart(2, "0");

  function updateSlide(index, direction = 0) {
    if (index < 0 || index >= total) return;
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
      slide.style.zIndex = i === index ? 2 : 1;
    });
    current = index;
    currentSlide.textContent = String(current + 1).padStart(2, "0");
    progressBar.style.width = `${((current + 1) / total) * 100}%`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
    document.title = `${slides[current].dataset.title || "Presentación"} · Islam político vs. Yihadismo`;
  }

  function next(){ updateSlide(Math.min(current + 1, total - 1), 1); }
  function prev(){ updateSlide(Math.max(current - 1, 0), -1); }

  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  document.addEventListener("keydown", e => {
    if (e.target && e.target.isContentEditable) {
      if (e.key === "Escape") e.target.blur();
      return;
    }
    if (["ArrowRight","PageDown"," "].includes(e.key)) { e.preventDefault(); next(); }
    if (["ArrowLeft","PageUp"].includes(e.key)) { e.preventDefault(); prev(); }
    if (e.key === "Home") { e.preventDefault(); updateSlide(0); }
    if (e.key === "End") { e.preventDefault(); updateSlide(total - 1); }
    if (e.key.toLowerCase() === "e") toggleEdit();
    if (e.key.toLowerCase() === "o") openOverview();
    if (e.key.toLowerCase() === "f") toggleFullscreen();
    if (e.key === "Escape") closeOverviewModal();
  });

  function toggleEdit(){
    editMode = !editMode;
    document.body.classList.toggle("edit-active", editMode);
    document.querySelectorAll(".editable").forEach(el => {
      el.contentEditable = editMode ? "true" : "false";
    });
    editBtn.style.color = editMode ? "#a6a274" : "";
    showToast(editMode ? "Modo edición activado" : "Modo edición desactivado");
  }

  function saveEdits(){
    const edits = {};
    document.querySelectorAll(".editable").forEach((el, i) => {
      edits[i] = el.innerHTML;
    });
    localStorage.setItem("islam_yihadismo_slides_edits", JSON.stringify(edits));
  }

  function restoreEdits(){
    try{
      const edits = JSON.parse(localStorage.getItem("islam_yihadismo_slides_edits") || "null");
      if(!edits) return;
      document.querySelectorAll(".editable").forEach((el, i) => {
        if (edits[i] !== undefined) el.innerHTML = edits[i];
      });
    }catch(e){}
  }

  document.addEventListener("input", e => {
    if (editMode && e.target.classList.contains("editable")) saveEdits();
  });

  function buildOverview(){
    overviewGrid.innerHTML = "";
    slides.forEach((slide, i) => {
      const card = document.createElement("div");
      card.className = "overview-card";
      card.innerHTML = `<span>${String(i+1).padStart(2,"0")}</span><b>${slide.dataset.title || "Diapositiva"}</b>`;
      card.addEventListener("click", () => {
        updateSlide(i);
        closeOverviewModal();
      });
      overviewGrid.appendChild(card);
    });
  }

  function openOverview(){
    buildOverview();
    overviewModal.classList.add("open");
  }
  function closeOverviewModal(){ overviewModal.classList.remove("open"); }

  overviewBtn.addEventListener("click", openOverview);
  closeOverview.addEventListener("click", closeOverviewModal);
  overviewModal.addEventListener("click", e => {
    if(e.target === overviewModal) closeOverviewModal();
  });

  async function toggleFullscreen(){
    try{
      if(!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    }catch(e){}
  }
  fullscreenBtn.addEventListener("click", toggleFullscreen);

  let touchStartX = null;
  document.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
  }, {passive:true});
  document.addEventListener("touchend", e => {
    if(touchStartX === null) return;
    const delta = e.changedTouches[0].screenX - touchStartX;
    if(Math.abs(delta) > 55) delta < 0 ? next() : prev();
    touchStartX = null;
  }, {passive:true});

  function showToast(message){
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
  }

  restoreEdits();
  updateSlide(0);

  window.presentation = { next, prev, updateSlide, openOverview, toggleEdit };
})();
