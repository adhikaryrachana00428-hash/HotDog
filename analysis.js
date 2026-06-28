/* ─────────────────────────────────────────────
   BuildDNA — Analysis Pipeline Orchestrator
   Integrates with Anakin Scraper & Wire API
───────────────────────────────────────────── */

'use strict';

// Generate session ID
const sessionId = 'DNA-' + Math.random().toString(36).slice(2,6).toUpperCase() + '-' + Date.now().toString(36).slice(-4).toUpperCase();
document.getElementById('session-id').textContent = sessionId;

// Read target URL from query parameters
const params = new URLSearchParams(window.location.search);
const targetUrl = params.get('url') || 'https://github.com/vercel/next.js';

// Display truncated URL below the page title
const subtitle = document.querySelector('.page-subtitle');
if (subtitle) {
  const display = targetUrl.length > 60 ? targetUrl.slice(0, 57) + '…' : targetUrl;
  subtitle.innerHTML = `Our AI engineering agents are collaborating to reverse-engineer your project.<br><span style="font-family:var(--mono,monospace);font-size:12px;color:var(--text-tertiary);margin-top:4px;display:inline-block;">${display}</span>`;
}

// Global UI State elements
const progressFill = document.getElementById('progress-fill');
const progressPct = document.getElementById('progress-pct');
const progressEta = document.getElementById('progress-eta');
const progressTrack = document.getElementById('progress-track');
const feedScroll = document.getElementById('feed-scroll');
const feedEmpty = document.getElementById('feed-empty');
const wireStatusBadge = document.getElementById('wire-status-badge');
const wireAgents = document.getElementById('wire-agents');
const agentsCount = document.getElementById('agents-count');
const summaryCard = document.getElementById('summary-card');

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

function now() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
}

function setProgress(pct, etaText) {
  progressFill.style.width = pct + '%';
  progressTrack.setAttribute('aria-valuenow', pct);
  progressPct.textContent = Math.round(pct) + '%';
  if (etaText) progressEta.textContent = etaText;
  if (pct >= 100) {
    progressPct.classList.add('complete');
    progressFill.classList.add('complete');
    progressEta.textContent = 'Complete';
  }
}

function addFeedEntry(text, htmlContent) {
  if (feedEmpty) feedEmpty.remove();
  const entry = document.createElement('div');
  entry.className = 'feed-entry';
  entry.innerHTML = `
    <span class="feed-time">${now()}</span>
    <span class="feed-text">${htmlContent || text}</span>
  `;
  feedScroll.appendChild(entry);
  feedScroll.scrollTop = feedScroll.scrollHeight;
}

const activePills = {};
function addWireAgent(name, done = false) {
  if (activePills[name]) return activePills[name];
  const pill = document.createElement('span');
  pill.className = 'wire-agent-pill' + (done ? ' agent-done' : '');
  pill.textContent = name;
  wireAgents.appendChild(pill);
  activePills[name] = pill;
  return pill;
}

function setStageActive(stageNum) {
  const stage = document.getElementById(`stage-${stageNum}`);
  if (stage) stage.classList.add('active');
  agentsCount.textContent = `${stageNum} / 8`;
}

function setStageStatus(stageNum, text) {
  const statusEl = document.getElementById(`status-${stageNum}`);
  if (statusEl) statusEl.textContent = text;
}

function setStageComplete(stageNum, completionText) {
  const stage = document.getElementById(`stage-${stageNum}`);
  if (stage) {
    stage.classList.remove('active');
    stage.classList.add('done');
  }
  const completion = document.getElementById(`completion-${stageNum}`);
  if (completion) completion.textContent = completionText;
  setStageStatus(stageNum, completionText);
}

function addDiscovery(listId, text) {
  const list = document.getElementById(listId);
  if (!list) return;
  const item = document.createElement('div');
  item.className = 'discovery-item';
  item.innerHTML = `
    <span class="d-check">
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <path d="M1 4.5l2 2L7 2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
    <span>${text}</span>
  `;
  list.appendChild(item);
}

function addLogItem(feedId, text, done = false) {
  const feed = document.getElementById(feedId);
  if (!feed) return;
  const item = document.createElement('div');
  item.className = 'log-item' + (done ? ' done-log' : '');
  item.innerHTML = `<span class="log-dot"></span><span>${text}</span>`;
  feed.appendChild(item);
}

function addTechChip(text) {
  const chips = document.getElementById('tech-chips');
  if (!chips) return;
  const chip = document.createElement('span');
  chip.className = 'tech-chip';
  chip.textContent = text;
  chips.appendChild(chip);
  setTimeout(() => chip.classList.add('confirmed'), 100);
}

async function buildArchDiagram() {
  const nodes = [0,1,2,3,4,5];
  for (const i of nodes) {
    const node = document.getElementById(`arch-${i}`);
    const arr = document.getElementById(`arch-arr-${i}`);
    if (node) node.classList.add('visible');
    await wait(300);
    if (arr) arr.classList.add('visible');
  }
  nodes.forEach(i => {
    const node = document.getElementById(`arch-${i}`);
    if (node) node.classList.add('done-node');
  });
}

/** Render architecture preview from Wire blueprint JSON */
async function renderBlueprintFromReport(blueprint) {
  const container = document.querySelector('.arch-preview-inner');
  if (!container || !blueprint.layers) {
    await buildArchDiagram();
    return;
  }
  container.innerHTML = blueprint.layers.map((layer, idx) => `
    <div class="arch-node visible done-node" id="arch-${idx}">
      <span class="arch-node-icon">${layer.nodes[0]?.icon || '⚙️'}</span>
      <span class="arch-node-label">${layer.name}</span>
    </div>
    ${idx < blueprint.layers.length - 1 ? `<div class="arch-arrow visible" id="arch-arr-${idx}">↓</div>` : ''}
  `).join('');
}

// ─── Core Ingestion & Analysis Orchestration ───
async function runAnalysis() {
  wireStatusBadge.textContent = 'Active';
  wireStatusBadge.classList.add('active-badge');
  addFeedEntry('', `<strong>Wire API</strong>: Initiating engineering intelligence session ${sessionId}`);

  try {
    const result = await HotDog_API.analyzeRepository(targetUrl, async (progress) => {
      setProgress(progress.pct, `Analyzing…`);
      
      switch (progress.stage) {
        case 0: // Anakin Scraper Ingestion
          setStageActive(1);
          setStageStatus(1, progress.status);
          addWireAgent("Universal Scraper");
          addFeedEntry('', `Universal Scraper: Ingesting repository payload from target URL`);
          
          // Show simulated live file discoveries
          addDiscovery('discoveries-1', 'Repository metadata');
          addDiscovery('discoveries-1', 'README.md files');
          addDiscovery('discoveries-1', 'package.json dependencies');
          addDiscovery('discoveries-1', 'Configuration files');
          addDiscovery('discoveries-1', 'Deployment configs');
          break;

        case 1: // Planner Agent
          setStageComplete(1, 'Ingested codebase metadata successfully.');
          if (activePills["Universal Scraper"]) activePills["Universal Scraper"].classList.add('agent-done');
          
          setStageActive(2);
          setStageStatus(2, progress.status);
          addWireAgent("Planner");
          addFeedEntry('', `Wire Planner: Dispatching 7 parallel analysis engines`);
          addDiscovery('discoveries-2', 'Created workflow dependency trees');
          addDiscovery('discoveries-2', 'Established coordination networks');
          break;

        case 2: // Tech Detector
          setStageComplete(2, 'Created workflow execution structure.');
          if (activePills["Planner"]) activePills["Planner"].classList.add('agent-done');

          setStageActive(3);
          setStageStatus(3, progress.status);
          addWireAgent("Tech Detector");
          addFeedEntry('', `Tech Detector: Parsing configuration settings`);
          break;

        case 3: // Architecture Agent
          setStageComplete(3, 'Scanned dependencies.');
          if (activePills["Tech Detector"]) activePills["Tech Detector"].classList.add('agent-done');

          setStageActive(4);
          setStageStatus(4, progress.status);
          addWireAgent("Architecture");
          addFeedEntry('', `Architecture Agent: Reconstructing runtime data layers`);
          break;

        case 4: // Documentation Agent
          setStageComplete(4, 'Mapped structural system boundaries.');
          if (activePills["Architecture"]) activePills["Architecture"].classList.add('agent-done');

          setStageActive(5);
          setStageStatus(5, progress.status);
          addWireAgent("Doc Agent");
          addFeedEntry('', `Doc Agent: Writing educational explainers`);
          break;

        case 5: // Engineering Advisor
          setStageComplete(5, 'Compiled knowledge libraries.');
          if (activePills["Doc Agent"]) activePills["Doc Agent"].classList.add('agent-done');

          setStageActive(6);
          setStageStatus(6, progress.status);
          addWireAgent("Advisor");
          addFeedEntry('', `Advisor: Inspecting structural optimizations`);
          break;

        case 6: // Learning Roadmap
          setStageComplete(6, 'Smart advisory list calculated.');
          if (activePills["Advisor"]) activePills["Advisor"].classList.add('agent-done');

          setStageActive(7);
          setStageStatus(7, progress.status);
          addWireAgent("Roadmap");
          addFeedEntry('', `Roadmap Agent: Sequencing educational stages`);
          break;

        case 7: // Confidence Agent
          setStageComplete(7, 'Completed roadmap prerequisites.');
          if (activePills["Roadmap"]) activePills["Roadmap"].classList.add('agent-done');

          setStageActive(8);
          setStageStatus(8, progress.status);
          addWireAgent("Report Gen");
          addFeedEntry('', `Report Generator: Consolidating structured reports`);
          break;
      }
    });

    // Populate visual details from Wire JSON (not hardcoded)
    if (result.technologies) {
      result.technologies.forEach(t => addTechChip(t.name));
    }

    if (result.blueprint?.layers) {
      await renderBlueprintFromReport(result.blueprint);
    } else {
      await buildArchDiagram();
    }

    // Stage 5 Logs
    addLogItem('log-5', 'Documentation agent enriched knowledge cards.', true);

    // Stage 6 Recommendations
    if (result.recommendations) {
      result.recommendations.forEach(r => addDiscovery('discoveries-6', r.title));
    }

    // Stage 7 Roadmap
    if (result.roadmap) {
      result.roadmap.forEach(p => addDiscovery('discoveries-7', p.title));
    }

    // Stage 8 Report Compiles
    addDiscovery('discoveries-8', 'Compiled tech cards');
    addDiscovery('discoveries-8', 'Validated architecture nodes');
    addDiscovery('discoveries-8', 'Report finalized');

    // Finalize UI
    setStageComplete(8, 'Engineering Intelligence Report is ready.');
    if (activePills["Report Gen"]) activePills["Report Gen"].classList.add('agent-done');

    setProgress(100, 'Complete');
    agentsCount.textContent = "8 / 8";
    agentsCount.classList.add('complete');
    wireStatusBadge.textContent = 'Complete';
    addFeedEntry('', `<strong>Wire API</strong>: Analysis finished. Report saved as unified structured JSON. 🎉`);

    // Show summary card
    await wait(600);
    summaryCard.setAttribute('aria-hidden', 'false');
    summaryCard.classList.add('visible');
    summaryCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  } catch (err) {
    console.error("Pipeline failure:", err);
    wireStatusBadge.textContent = 'Error';
    addFeedEntry('', `<span style="color:var(--red);">Orchestrator encountered error: ${err.message}</span>`);
  }
}

// ── Dashboard redirection ──
document.getElementById('open-dashboard-btn').addEventListener('click', () => {
  window.location.href = `dashboard.html?url=${encodeURIComponent(targetUrl)}`;
});

// ── Trigger analysis on page load ──
(async () => {
  await wait(600);
  await runAnalysis();
})();
