const state = {
  file: null,
  jobs: [],
  selectedJob: null,
  scanTimer: null,
  scanStartedAt: 0,
  scanMinMs: 10000,
  scanPreviewUrl: null,
  jobSearchTimer: null,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function setText(node, value) {
  if (node) node.textContent = value;
}

function setHidden(node, hidden) {
  if (node) node.hidden = hidden;
}

function setHtml(node, value) {
  if (node) node.innerHTML = value;
}

const ui = {
  homeGrid: $("#homeGrid"),
  resultsPanel: $("#resultsPanel"),
  apiStatus: $("#apiStatus"),
  apiLabel: $("#apiLabel"),
  resetAll: $("#resetAll"),
  brandReset: $("#brandReset"),
  cvFile: $("#cvFile"),
  dropzone: $("#dropzone"),
  fileTitle: $("#fileTitle"),
  fileHint: $("#fileHint"),
  scanPercent: $("#scanPercent"),
  scanLabel: $("#scanLabel"),
  scanPreview: $("#scanPreview"),
  loader: $("#loader"),
  loaderText: $("#loaderText"),
  errorBox: $("#errorBox"),
  heroScore: $("#heroScore"),
  levelMetric: $("#levelMetric"),
  experienceMetric: $("#experienceMetric"),
  skillsMetric: $("#skillsMetric"),
  profileCard: $("#profileCard"),
  skillsList: $("#skillsList"),
  skillsCount: $("#skillsCount"),
  jobsList: $("#jobsList"),
  jobsCount: $("#jobsCount"),
  recommendJobs: $("#recommendJobs"),
  selectedJob: $("#selectedJob"),
  letterModule: $("#letterModule"),
  letterText: $("#letterText"),
  copyLetter: $("#copyLetter"),
  activityFeed: $("#activityFeed"),
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setLoading(active, text = "Analyse en cours...") {
  setHidden(ui.loader, !active);
  setText(ui.loaderText, text);
  document.body.style.cursor = active ? "progress" : "default";
}

function showError(message) {
  setHidden(ui.resultsPanel, false);
  setHidden(ui.errorBox, false);
  setText(ui.errorBox, message);
}

function clearError() {
  setHidden(ui.errorBox, true);
  setText(ui.errorBox, "");
}

function formData() {
  const data = new FormData();
  data.append("file", state.file);
  return data;
}

async function api(path, options = {}) {
  const response = await fetch(path, options);
  const type = response.headers.get("content-type") || "";
  const body = type.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    const detail = typeof body === "object" ? body.detail || JSON.stringify(body) : body;
    throw new Error(detail || `Erreur HTTP ${response.status}`);
  }
  return body;
}

function pct(value, max = 100) {
  const number = Number(value || 0);
  return `${Math.round(max === 1 ? number * 100 : number)}%`;
}

function formatSalary(job = {}) {
  const min = Number(job.salary_min || 0);
  const max = Number(job.salary_max || 0);
  const money = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  if (min && max) return `${money.format(min)} - ${money.format(max)}`;
  if (min) return `Des ${money.format(min)}`;
  if (max) return `Jusqu'a ${money.format(max)}`;
  return "Salaire non communique";
}

function setTab(name) {
  $$(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === name));
  $$(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === `${name}Tab`));
}

function clearScanPreview() {
  if (state.scanPreviewUrl) {
    URL.revokeObjectURL(state.scanPreviewUrl);
    state.scanPreviewUrl = null;
  }
  setHtml(ui.scanPreview, "");
}

function renderScanPreview(file) {
  if (!ui.scanPreview) return;
  clearScanPreview();
  state.scanPreviewUrl = URL.createObjectURL(file);
  const safeName = escapeHtml(file.name);

  if (file.type.startsWith("image/")) {
    setHtml(ui.scanPreview, `<img class="scan-document-media" src="${state.scanPreviewUrl}" alt="Apercu du CV ${safeName}" />`);
    return;
  }

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    setHtml(ui.scanPreview, `<embed class="scan-document-media" src="${state.scanPreviewUrl}#toolbar=0&navpanes=0&scrollbar=0" type="application/pdf" aria-label="Apercu du CV ${safeName}" />`);
    return;
  }

  setHtml(ui.scanPreview, `
    <div class="scan-document-fallback">
      <strong>CV</strong>
      <span></span><span></span><span></span><span></span><span></span>
      <small>${safeName}</small>
    </div>
  `);
}

function startScanAnimation(file) {
  clearInterval(state.scanTimer);
  let value = 0;
  const labels = ["Lecture du CV...", "Scan ligne par ligne...", "Extraction des competences...", "Preparation des resultats..."];

  state.scanStartedAt = Date.now();
  ui.dropzone.classList.remove("complete");
  ui.dropzone.classList.add("scanning");
  renderScanPreview(file);
  setText(ui.fileTitle, file.name);
  setText(ui.fileHint, `${Math.round(file.size / 1024)} Ko`);
  setText(ui.scanPercent, "0%");
  setText(ui.scanLabel, labels[0]);

  state.scanTimer = setInterval(() => {
    value = Math.min(value + Math.ceil(Math.random() * 7), 96);
    setText(ui.scanPercent, `${value}%`);
    setText(ui.scanLabel, labels[Math.min(Math.floor(value / 28), labels.length - 1)]);
  }, 240);
}

function finishScanAnimation() {
  clearInterval(state.scanTimer);
  state.scanTimer = null;
  const elapsed = Date.now() - state.scanStartedAt;
  const remaining = Math.max(state.scanMinMs - elapsed, 0);
  setTimeout(() => {
    setText(ui.scanPercent, "100%");
    setText(ui.scanLabel, "Ready");
    ui.dropzone.classList.add("complete");
    setTimeout(() => {
      ui.dropzone.classList.remove("scanning", "complete");
      ui.homeGrid.classList.add("analysis-complete");
      setHidden(ui.resultsPanel, false);
      setHidden(ui.resetAll, false);
      clearScanPreview();
    }, 520);
  }, remaining);
}

function updateActivity(profile = {}) {
  const skills = Array.isArray(profile.competences) ? profile.competences.length : 0;
  setHtml(ui.activityFeed, `
    <div><span></span><p>${escapeHtml(profile.nom || "CV analyse")}</p><small>Now</small></div>
    <div><span></span><p>${skills} competences detectees</p><small>Skills</small></div>
    <div><span></span><p>${profile.niveau || "Niveau"} - ${profile.annees_experience ?? 0} an(s)</p><small>Profile</small></div>
  `);
}

function renderSkills(skills = []) {
  const clean = skills.filter(Boolean);
  setText(ui.skillsCount, `${clean.length} detectees`);
  setText(ui.skillsMetric, clean.length || "--");
  setHtml(ui.skillsList, clean.length
    ? clean.map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`).join("")
    : `<span class="tag">Aucune competence detectee</span>`);
}

function renderProfile(profile = {}) {
  const score = Math.round(profile.ats_score || 0);
  setText(ui.heroScore, score || "--");
  ui.heroScore?.closest(".readiness-ring")?.style.setProperty("--score", score);
  setText(ui.levelMetric, profile.niveau || "--");
  setText(ui.experienceMetric, `${profile.annees_experience ?? 0} an(s) d'experience`);
  renderSkills(Array.isArray(profile.competences) ? profile.competences : []);
  ui.profileCard.classList.remove("empty");
  setHtml(ui.profileCard, `
    <p class="card-kicker">Profil candidat</p>
    <h3>${escapeHtml(profile.nom || "Candidat")}</h3>
    <div class="profile-meta">
      <span>${escapeHtml(profile.email || "Email non detecte")}</span>
      <span>${escapeHtml(profile.telephone || "Telephone non detecte")}</span>
      <span>${escapeHtml(profile.niveau || "Niveau inconnu")}</span>
      <span>${profile.annees_experience ?? 0} an(s)</span>
    </div>
  `);
  updateActivity(profile);
}

async function analyzeUploadedCv(file) {
  state.file = file;
  state.selectedJob = null;
  state.jobs = [];
  clearError();
  setLoading(true, "Analyse du CV...");

  try {
    startScanAnimation(file);
    const result = await api("/analyze-scores", { method: "POST", body: formData() });
    renderProfile(result.cv_profile || {});
    renderSkills(result.skills || result.cv_profile?.competences || []);
    setHidden(ui.recommendJobs, false);
    setText(ui.jobsCount, "0");
    setHtml(ui.jobsList, `<div class="empty-state">Lancez les recommandations pour voir les offres compatibles.</div>`);
    setHidden(ui.letterModule, true);
    setTab("profile");
    finishScanAnimation();
  } catch (error) {
    clearInterval(state.scanTimer);
    clearScanPreview();
    ui.dropzone.classList.remove("scanning", "complete");
    showError(`Analyse impossible: ${error.message}`);
  } finally {
    setLoading(false);
  }
}

function startJobSearchAnimation() {
  clearInterval(state.jobSearchTimer);
  const startedAt = Date.now();
  setText(ui.jobsCount, "...");
  setHtml(ui.jobsList, `
    <div class="job-searching">
      <div class="search-radar"><span></span><span></span><span></span></div>
      <div>
        <strong>Recherche des offres compatibles</strong>
        <p><span id="jobSearchElapsed">0s</span> - Matching Adzuna par competences</p>
      </div>
    </div>
  `);
  state.jobSearchTimer = setInterval(() => {
    const elapsed = Math.round((Date.now() - startedAt) / 1000);
    const node = $("#jobSearchElapsed");
    if (node) node.textContent = `${elapsed}s`;
  }, 500);
}

function stopJobSearchAnimation() {
  clearInterval(state.jobSearchTimer);
  state.jobSearchTimer = null;
}

function renderJobs(matches = []) {
  state.jobs = matches;
  state.selectedJob = null;
  setHidden(ui.selectedJob, true);
  setText(ui.jobsCount, matches.length);
  setHidden(ui.letterModule, true);
  setText(ui.letterText, "Choisissez une offre dans l'onglet jobs pour generer une lettre.");

  setHtml(ui.jobsList, matches.length
    ? matches.map((job, index) => {
        const missing = job.competences_manquantes || [];
        const matched = job.top_skills_match || [];
        return `
          <article class="job-row" data-job-index="${index}">
            <div>
              <h4>${escapeHtml(job.titre_poste || "Poste")}</h4>
              <p>${escapeHtml(job.entreprise || "Entreprise inconnue")}</p>
              <div class="job-meta">
                <span class="job-chip">${formatSalary(job)}</span>
                <span class="job-chip">${escapeHtml(job.location || "Localisation non precisee")}</span>
                <span class="job-chip">${escapeHtml(job.contract_time || "Contrat non precise")}</span>
                <span class="job-chip">${escapeHtml(job.category || "Categorie non precisee")}</span>
              </div>
              <div class="job-skills">
                ${matched.slice(0, 6).map((skill) => `<span class="job-chip">${escapeHtml(skill)}</span>`).join("")}
                ${missing.length ? missing.slice(0, 8).map((skill) => `<span class="job-chip missing-skill">${escapeHtml(skill)}</span>`).join("") : `<span class="job-chip">Aucune competence critique manquante</span>`}
              </div>
            </div>
            <div class="job-actions">
              <span class="match-score">${pct(job.score, 1)}</span>
              <button type="button" data-select-job="${index}">Voir</button>
              <button type="button" data-letter-job="${index}">Generer la lettre</button>
            </div>
          </article>
        `;
      }).join("")
    : `<div class="empty-state">Aucune offre compatible trouvee pour le moment.</div>`);
}

async function runJobs() {
  if (!state.file) {
    showError("Importez d'abord un CV.");
    return;
  }
  clearError();
  setTab("jobs");
  setLoading(true, "Recherche des offres compatibles...");
  startJobSearchAnimation();
  try {
    const params = new URLSearchParams({ source: "api", top_n: "8", job_title: "" });
    const result = await api(`/match-jobs?${params}`, { method: "POST", body: formData() });
    renderSkills(result.skills || []);
    renderJobs(result.matches || []);
  } catch (error) {
    showError(`Matching jobs impossible: ${error.message}`);
  } finally {
    stopJobSearchAnimation();
    setLoading(false);
  }
}

function selectJob(index) {
  const job = state.jobs?.[index];
  if (!job) return;
  state.selectedJob = job;
  setHidden(ui.selectedJob, false);
  setHtml(ui.selectedJob, `
    <strong>${escapeHtml(job.titre_poste || "Poste cible")}</strong>
    <span>${escapeHtml(job.entreprise || "Entreprise inconnue")} - ${pct(job.score, 1)} de compatibilite</span>
  `);
  $$(".job-row").forEach((row) => row.classList.remove("selected"));
  $(`[data-job-index="${index}"]`)?.classList.add("selected");
}

async function runLetter(index = null) {
  if (index !== null) selectJob(Number(index));
  if (!state.file || !state.selectedJob) {
    showError("Choisissez d'abord une offre.");
    return;
  }
  clearError();
  setTab("letter");
  setHidden(ui.letterModule, false);
  setLoading(true, "Redaction de la lettre IA...");
  try {
    const data = formData();
    const title = state.selectedJob.titre_poste || "Poste cible";
    const company = state.selectedJob.entreprise ? ` chez ${state.selectedJob.entreprise}` : "";
    data.append("job_title", `${title}${company}`);
    const result = await api("/generate-cover-letter", { method: "POST", body: data });
    setText(ui.letterText, result.lettre_motivation || "Aucune lettre generee.");
  } catch (error) {
    showError(`Lettre impossible: ${error.message}`);
  } finally {
    setLoading(false);
  }
}

function resetAll() {
  clearInterval(state.scanTimer);
  clearInterval(state.jobSearchTimer);
  state.file = null;
  state.jobs = [];
  state.selectedJob = null;
  clearScanPreview();
  ui.cvFile.value = "";
  setText(ui.fileTitle, "Importer votre CV");
  setText(ui.fileHint, "PDF, DOCX, PNG ou JPG");
  ui.dropzone.classList.remove("scanning", "complete", "dragging");
  ui.homeGrid.classList.remove("analysis-complete");
  setHidden(ui.resultsPanel, true);
  setHidden(ui.resetAll, true);
  setHidden(ui.recommendJobs, true);
  setHtml(ui.jobsList, "");
  setHtml(ui.skillsList, "");
  setText(ui.jobsCount, "0");
  setText(ui.heroScore, "--");
  ui.heroScore?.closest(".readiness-ring")?.style.setProperty("--score", 0);
  clearError();
  window.location.hash = "";
}

async function checkHealth() {
  try {
    await api("/health");
    ui.apiStatus.classList.add("online");
    ui.apiStatus.classList.remove("offline");
    setText(ui.apiLabel, "Connecte");
  } catch {
    ui.apiStatus.classList.add("offline");
    ui.apiStatus.classList.remove("online");
    setText(ui.apiLabel, "Hors ligne");
  }
}

ui.cvFile.addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (file) await analyzeUploadedCv(file);
});

["dragenter", "dragover"].forEach((name) => {
  ui.dropzone.addEventListener(name, (event) => {
    event.preventDefault();
    ui.dropzone.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach((name) => {
  ui.dropzone.addEventListener(name, (event) => {
    event.preventDefault();
    ui.dropzone.classList.remove("dragging");
  });
});

ui.dropzone.addEventListener("drop", async (event) => {
  const [file] = event.dataTransfer.files;
  if (file) await analyzeUploadedCv(file);
});

ui.recommendJobs.addEventListener("click", runJobs);
ui.resetAll.addEventListener("click", resetAll);
ui.brandReset.addEventListener("click", (event) => {
  event.preventDefault();
  resetAll();
});
ui.copyLetter.addEventListener("click", () => {
  const text = ui.letterText?.textContent.trim();
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    setText(ui.copyLetter, "Copie");
    setTimeout(() => { setText(ui.copyLetter, "Copier"); }, 1200);
  });
});

$$(".tab").forEach((button) => button.addEventListener("click", () => setTab(button.dataset.tab)));
ui.jobsList.addEventListener("click", (event) => {
  const select = event.target.closest("[data-select-job]");
  const letter = event.target.closest("[data-letter-job]");
  if (select) selectJob(Number(select.dataset.selectJob));
  if (letter) runLetter(Number(letter.dataset.letterJob));
});

checkHealth();
