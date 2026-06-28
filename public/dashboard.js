/* ─────────────────────────────────────────────
   BuildDNA — Dashboard Interactions
   Navigation, filtering, modal, animations
───────────────────────────────────────────── */

'use strict';

// ── Section Navigation ─────────────────────────
// ── Section Navigation ─────────────────────────
const navItems    = document.querySelectorAll('.nav-item');
const sections    = document.querySelectorAll('.content-section');
const filterBtns  = document.querySelectorAll('.filter-btn');

// ── Dynamic Render Engine ──
function renderDashboard(report) {
  if (!report) return;

  // 1. Header & Repository Metadata
  const topNavRepo = document.querySelector('.topnav-repo');
  if (topNavRepo) topNavRepo.textContent = report.repoName;

  const rightRepoName = document.querySelector('.snapshot-repo-name');
  if (rightRepoName) rightRepoName.textContent = report.repoName;

  const rightRepoLink = document.querySelector('.snapshot-repo-link');
  if (rightRepoLink) {
    rightRepoLink.textContent = report.url.replace(/^https?:\/\//, '') + ' ↗';
    rightRepoLink.setAttribute('href', report.url);
  }

  // Sidebar Badges
  const badgeKnowledge = document.querySelector('.nav-item[data-section="knowledge"] .nav-badge');
  if (badgeKnowledge && report.technologies) badgeKnowledge.textContent = report.technologies.length;

  const badgeRecommendations = document.querySelector('.nav-item[data-section="recommendations"] .nav-badge');
  if (badgeRecommendations && report.recommendations) badgeRecommendations.textContent = report.recommendations.length;

  const badgeTools = document.querySelector('.nav-item[data-section="tools"] .nav-badge');
  if (badgeTools && report.tools) badgeTools.textContent = report.tools.length;

  // 2. Executive Summary - Hero Card
  const summaryTitle = document.getElementById('summary-title');
  if (summaryTitle) summaryTitle.textContent = report.summary.title;

  const summaryDesc = document.querySelector('.hero-card-desc');
  if (summaryDesc) {
    summaryDesc.innerHTML = report.summary.purpose;
  }

  // DNA Tags
  const dnaTagsContainer = document.querySelector('.dna-tags');
  if (dnaTagsContainer && report.summary.tags) {
    dnaTagsContainer.innerHTML = report.summary.tags.map((tag, idx) => {
      const colors = ['', 'accent-purple', 'accent-green', 'accent-blue'];
      const activeColor = colors[idx % colors.length];
      return `<span class="dna-tag ${activeColor}">${tag}</span>`;
    }).join('');
  }

  // Key Stats Footer
  const footerStats = document.querySelector('.hero-card-footer');
  if (footerStats && report.summary.stats) {
    const s = report.summary.stats;
    footerStats.innerHTML = `
      <div class="hero-quick-stat"><span class="hqs-num">${s.techCount}</span><span class="hqs-label">Technologies</span></div>
      <div class="hero-quick-stat"><span class="hqs-num">${s.dependencyCount}</span><span class="hqs-label">Dependencies</span></div>
      <div class="hero-quick-stat"><span class="hqs-num">${s.apiCount}</span><span class="hqs-label">External APIs</span></div>
      <div class="hero-quick-stat"><span class="hqs-num">${s.componentCount}</span><span class="hqs-label">Components</span></div>
      <div class="hero-quick-stat"><span class="hqs-num">${s.opportunityCount}</span><span class="hqs-label">Opportunities</span></div>
      <div class="hero-quick-stat"><span class="hqs-num">${s.moduleCount}</span><span class="hqs-label">Learning Modules</span></div>
    `;
  }

  // 3. Health Summary Grid
  const healthGrid = document.querySelector('.health-grid');
  if (healthGrid && report.health) {
    const h = report.health;
    healthGrid.innerHTML = `
      <div class="health-card">
        <div class="health-card-top"><span class="health-icon">📝</span><span class="health-label">Documentation Quality</span></div>
        <div class="health-bar-track"><div class="health-bar-fill" style="--fill:${h.docQuality}%;--color:#10B981"></div></div>
        <span class="health-descriptor">Excellent</span>
      </div>
      <div class="health-card">
        <div class="health-card-top"><span class="health-icon">🏛️</span><span class="health-label">Architecture Complexity</span></div>
        <div class="health-bar-track"><div class="health-bar-fill" style="--fill:${h.archComplexity}%;--color:#F59E0B"></div></div>
        <span class="health-descriptor">Advanced</span>
      </div>
      <div class="health-card">
        <div class="health-card-top"><span class="health-icon">🎓</span><span class="health-label">Learning Difficulty</span></div>
        <div class="health-bar-track"><div class="health-bar-fill" style="--fill:${h.learningDifficulty}%;--color:#F59E0B"></div></div>
        <span class="health-descriptor">Intermediate</span>
      </div>
      <div class="health-card">
        <div class="health-card-top"><span class="health-icon">🔧</span><span class="health-label">Maintainability</span></div>
        <div class="health-bar-track"><div class="health-bar-fill" style="--fill:${h.maintainability}%;--color:#10B981"></div></div>
        <span class="health-descriptor">Excellent</span>
      </div>
      <div class="health-card">
        <div class="health-card-top"><span class="health-icon">✨</span><span class="health-label">Modern Tech Usage</span></div>
        <div class="health-bar-track"><div class="health-bar-fill" style="--fill:${h.modernTech}%;--color:#10B981"></div></div>
        <span class="health-descriptor">Cutting Edge</span>
      </div>
      <div class="health-card">
        <div class="health-card-top"><span class="health-icon">💡</span><span class="health-label">Improvement Ops</span></div>
        <div class="health-bar-track"><div class="health-bar-fill" style="--fill:${h.opportunities}%;--color:#3B82F6"></div></div>
        <span class="health-descriptor">${(report.summary.stats && report.summary.stats.opportunityCount) || 15} Found</span>
      </div>
    `;
  }

  // 4. Quick Architecture Flow Nodes
  const quickArch = document.querySelector('.arch-flow');
  if (quickArch && report.blueprint.layers) {
    let html = '';
    report.blueprint.layers.forEach((layer, idx) => {
      const primaryNode = layer.nodes[0];
      html += `
        <div class="arch-flow-node clickable" data-goto="blueprint">
          <span class="afn-icon">${primaryNode.icon}</span>
          <span class="afn-label">${layer.name}</span>
          <span class="afn-sub">${primaryNode.name}</span>
        </div>
      `;
      if (idx < report.blueprint.layers.length - 1) {
        html += `<div class="arch-flow-arrow" aria-hidden="true">↓</div>`;
      }
    });
    quickArch.innerHTML = html;
  }

  // 5. Engineering Blueprint Layer rendering
  const blueprintCanvas = document.querySelector('.blueprint-canvas');
  if (blueprintCanvas && report.blueprint.layers) {
    let html = '';
    report.blueprint.layers.forEach((layer, idx) => {
      html += `
        <div class="bp-layer">
          <div class="bp-layer-label">${layer.name}</div>
          <div class="bp-nodes-row">
            ${layer.nodes.map(n => `
              <div class="bp-node bp-node--app">
                <span class="bp-node-icon">${n.icon}</span>
                <span class="bp-node-name">${n.name}</span>
                <span class="bp-node-desc">${n.desc || n.description || 'Architecture node'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      if (idx < report.blueprint.layers.length - 1) {
        html += `
          <div class="bp-arrow-down" aria-hidden="true">
            <div class="bp-arrow-line"></div>
            <div class="bp-arrow-label">DATA FLOW</div>
          </div>
        `;
      }
    });
    blueprintCanvas.innerHTML = html;
  }

  const flowSummary = document.querySelector('.flow-summary-list');
  if (flowSummary && report.blueprint.flows) {
    flowSummary.innerHTML = report.blueprint.flows.map((flow, idx) => `
      <div class="flow-item">
        <span class="flow-num">${idx + 1}</span>
        <div>${flow}</div>
      </div>
    `).join('');
  }

  // 6. Knowledge Library - Tech Cards Grid
  const techGrid = document.getElementById('tech-grid');
  if (techGrid && report.technologies) {
    techGrid.innerHTML = report.technologies.map(t => `
      <article class="tech-card" data-category="${t.cat}" data-tech="${t.key}" role="button" tabindex="0" aria-label="Open ${t.name} knowledge card">
        <div class="tc-header">
          <div class="tc-logo ${t.logoClass}">${t.logoText}</div>
          <div class="tc-meta">
            <h3 class="tc-name">${t.name}</h3>
            <span class="tc-cat">${t.catDisplay}</span>
          </div>
          <span class="tc-arrow" aria-hidden="true">→</span>
        </div>
        <p class="tc-role">${t.role}</p>
        <div class="tc-insight">
          <span class="tc-insight-icon" aria-hidden="true">💡</span>
          ${t.insight}
        </div>
      </article>
    `).join('');
  }

  // 7. Relationships
  const relChains = document.querySelector('.rel-chains');
  if (relChains && report.relationships) {
    relChains.innerHTML = report.relationships.map(r => `
      <div class="rel-chain-card">
        <div class="rel-chain-title">${r.from} ──> ${r.to}</div>
        <div class="rel-chain-path">
          <span class="rcp-node">${r.from}</span>
          <span class="rcp-arrow">→</span>
          <span class="rcp-node rcp-node--highlight">${r.label}</span>
          <span class="rcp-arrow">→</span>
          <span class="rcp-node rcp-node--success">${r.to}</span>
        </div>
        <p class="rel-chain-desc">${r.detail}</p>
      </div>
    `).join('');
  }

  // 8. Decisions
  const decisionsList = document.querySelector('.decisions-list');
  if (decisionsList && report.decisions) {
    decisionsList.innerHTML = report.decisions.map((d, idx) => `
      <div class="decision-card">
        <div class="decision-header">
          <span class="decision-num">${String(idx + 1).padStart(2, '0')}</span>
          <div>
            <h3 class="decision-title">${d.title}</h3>
            <span class="decision-impact impact-high">${d.impact}</span>
          </div>
        </div>
        <div class="decision-body">
          <div class="decision-col">
            <div class="decision-col-title">✅ Advantages Gained</div>
            <ul class="decision-points">
              ${d.pros.map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>
          <div class="decision-col">
            <div class="decision-col-title">⚠️ Tradeoffs Accepted</div>
            <ul class="decision-points tradeoff">
              ${d.cons.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `).join('');
  }

  // 9. Recommendations
  const recList = document.querySelector('.rec-list');
  if (recList && report.recommendations) {
    recList.innerHTML = report.recommendations.map(r => `
      <div class="rec-card">
        <div class="rec-header">
          <span class="rec-type-badge rec-type--upgrade">${r.type}</span>
          <h3 class="rec-title">${r.title}</h3>
        </div>
        <p class="rec-body">${r.body}</p>
        <div class="rec-meta">
          <span class="rec-effort effort-medium">${r.effort} Effort</span>
          <span class="rec-benefit">${r.benefit}</span>
        </div>
      </div>
    `).join('');
  }

  // 10. Hidden Tools
  const toolsGrid = document.querySelector('.tools-grid');
  if (toolsGrid && report.tools) {
    toolsGrid.innerHTML = report.tools.map(t => `
      <div class="tool-card">
        <div class="tool-icon">${t.icon}</div>
        <h3 class="tool-name">${t.name}</h3>
        <p class="tool-desc">${t.desc}</p>
        <span class="tool-command">${t.command}</span>
      </div>
    `).join('');
  }

  // 11. Roadmap Timeline
  const roadmapTimeline = document.querySelector('.roadmap-timeline');
  if (roadmapTimeline && report.roadmap) {
    let html = '';
    report.roadmap.forEach((phase, idx) => {
      html += `
        <div class="roadmap-phase">
          <div class="phase-header">
            <div class="phase-num">Phase ${idx + 1}</div>
            <div class="phase-meta">
              <h3 class="phase-title">${phase.title}</h3>
              <span class="phase-duration">${phase.duration}</span>
            </div>
          </div>
          <div class="phase-items">
            ${phase.items.map(item => `
              <div class="phase-item"><span class="pi-icon">📖</span> ${item}</div>
            `).join('')}
          </div>
        </div>
      `;
      if (idx < report.roadmap.length - 1) {
        html += `
          <div class="roadmap-connector" aria-hidden="true">
            <div class="rc-line"></div>
          </div>
        `;
      }
    });
    roadmapTimeline.innerHTML = html;
  }

  // 12. Right Sidebar Metadata Snapshot
  const primaryLangValue = document.querySelector('.sr-value .lang-dot');
  if (primaryLangValue) {
    primaryLangValue.style.backgroundColor = report.langColor;
    primaryLangValue.nextSibling.textContent = report.primaryLanguage;
  }
  const confidenceScore = document.querySelector('.sr-value--success');
  if (confidenceScore) {
    confidenceScore.textContent = `${report.metrics.confidence}% ↑`;
  }
  const complexityBar = document.querySelector('.cb-fill');
  if (complexityBar) {
    complexityBar.style.width = `${report.metrics.complexity}%`;
  }

  const snapshotTechPills = document.querySelector('.snapshot-tech-pills');
  if (snapshotTechPills && report.technologies) {
    snapshotTechPills.innerHTML = report.technologies.map(t => `
      <span class="stp">${t.name}</span>
    `).join('');
  }

  // Re-bind click listeners on the newly rendered components
  bindGoto();
}

// ── Initialize Analysis Data ──
(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const queryUrl = urlParams.get('url');

  // Show loading state while fetching
  const mainContent = document.querySelector('.main-content');
  const loadingEl = document.createElement('div');
  loadingEl.id = 'dashboard-loading';
  loadingEl.style.cssText = 'display:flex;align-items:center;justify-content:center;min-height:40vh;color:var(--text-2,#A1A1AA);font-size:14px;gap:10px;';
  loadingEl.innerHTML = '<span class="spin" style="display:inline-block;width:16px;height:16px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite"></span> Loading engineering intelligence...';
  if (mainContent) mainContent.prepend(loadingEl);

  let report = HotDog_API.getCurrentAnalysis();

  try {
    if (queryUrl && (!report || report.url !== queryUrl)) {
      await HotDog_API.analyzeRepository(queryUrl, () => {});
      report = HotDog_API.getCurrentAnalysis();
    } else if (!report) {
      await HotDog_API.analyzeRepository('https://github.com/vercel/next.js', () => {});
      report = HotDog_API.getCurrentAnalysis();
    }
  } catch (err) {
    loadingEl.innerHTML = `<span style="color:var(--red,#EF4444)">⚠ Analysis failed: ${err.message}. Ensure the backend is running (<code>npm run dev</code>).</span>`;
    console.error('[Dashboard]', err);
    return;
  }

  loadingEl.remove();
  currentReport = report;
  renderDashboard(report);

  if (report) {
    document.title = `${report.repoName} — Engineering Intelligence Report · BuildDNA`;
  }
})();

function showSection(name) {
  if (name === 'blueprint') {
    const urlParams = new URLSearchParams(window.location.search);
    const queryUrl = urlParams.get('url') || '';
    window.location.href = `blueprint.html` + (queryUrl ? `?url=${encodeURIComponent(queryUrl)}` : '');
    return;
  }
  
  if (name === 'recommendations') {
    const urlParams = new URLSearchParams(window.location.search);
    const queryUrl = urlParams.get('url') || '';
    window.location.href = `advisor.html` + (queryUrl ? `?url=${encodeURIComponent(queryUrl)}` : '');
    return;
  }

  if (name === 'report') {
    const urlParams = new URLSearchParams(window.location.search);
    const queryUrl = urlParams.get('url') || '';
    window.location.href = `report.html` + (queryUrl ? `?url=${encodeURIComponent(queryUrl)}` : '');
    return;
  }

  sections.forEach(s => s.classList.remove('active'));
  navItems.forEach(n => {
    n.classList.remove('active');
    n.removeAttribute('aria-current');
  });

  const target = document.getElementById(`section-${name}`);
  const navBtn = document.querySelector(`.nav-item[data-section="${name}"]`);

  if (target) {
    target.classList.add('active');
    // Trigger health bar animation when summary becomes visible
    if (name === 'summary') {
      requestAnimationFrame(() => {
        document.querySelectorAll('.health-bar-fill').forEach(bar => {
          bar.classList.add('animated');
        });
      });
    }
    // Scroll content to top
    document.querySelector('.content-main').scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  if (navBtn) {
    navBtn.classList.add('active');
    navBtn.setAttribute('aria-current', 'page');
    // Keep nav item visible in sidebar
    navBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// Sidebar nav clicks
navItems.forEach(item => {
  item.addEventListener('click', () => {
    const sec = item.dataset.section;
    if (sec) showSection(sec);
  });
});

// All [data-goto] links throughout the page
function bindGoto() {
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const target = el.dataset.goto;
      if (target) showSection(target);
    });
    // Keyboard support for non-button elements
    if (el.tagName !== 'BUTTON') {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showSection(el.dataset.goto);
        }
      });
    }
  });
}
bindGoto();

// ── Technology Filter ──────────────────────────
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    const currentTechCards = document.querySelectorAll('.tech-card');
    currentTechCards.forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.classList.remove('hidden');
        card.style.animation = 'none';
        card.offsetHeight;
        card.style.animation = 'fade-up 0.3s cubic-bezier(0.22,1,0.36,1) both';
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// ── Technology Knowledge Modal (dynamic from Wire report) ─────────────────
const overlay   = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const closeBtn  = document.getElementById('modal-close');

/** Current report reference — set after renderDashboard */
let currentReport = null;

function openModal(techKey) {
  const t = currentReport?.technologies?.find(x => x.key === techKey);
  if (!t) {
    showToast('Technology data not available. Run analysis first.');
    return;
  }

  const advantages = (t.advantages || []).map(a => `<li>${a}</li>`).join('');
  const limitations = (t.limitations || []).map(l => `<li>${l}</li>`).join('');
  const alternatives = (t.alternatives || []).map(a =>
    `<span style="font-size:12.5px;color:var(--text-2);background:var(--bg-el);border:1px solid var(--border-s);border-radius:5px;padding:4px 10px;">${a}</span>`
  ).join('');
  const learnNext = (t.learnNext || []).map(l => `<li>${l}</li>`).join('');

  modalContent.innerHTML = `
    <div class="modal-tech-header">
      <div class="modal-tech-logo ${t.logoClass || ''}">${t.logoText || '⚙️'}</div>
      <div>
        <div class="modal-tech-name">${t.name}</div>
        <div class="modal-tech-cat">${t.catDisplay || t.cat || ''}</div>
      </div>
    </div>

    <div class="modal-section">
      <div class="modal-section-title">What it is</div>
      <p class="modal-section-body">${t.whatItIs || t.role}</p>
    </div>

    <div class="modal-section">
      <div class="modal-section-title">Why it exists</div>
      <p class="modal-section-body">${t.whyExists || '—'}</p>
    </div>

    <div class="modal-section">
      <div class="modal-section-title">Why this project uses it</div>
      <div class="modal-insight-box">${t.whyProjectUses || t.insight}</div>
    </div>

    ${advantages ? `<div class="modal-section"><div class="modal-section-title">Advantages</div><ul class="decision-points">${advantages}</ul></div>` : ''}
    ${limitations ? `<div class="modal-section"><div class="modal-section-title">Limitations</div><ul class="decision-points tradeoff">${limitations}</ul></div>` : ''}

    ${t.analogy ? `
    <div class="modal-section">
      <div class="modal-section-title">Real-world analogy</div>
      <div class="modal-analogy-box">${t.analogy}</div>
    </div>` : ''}

    ${alternatives ? `
    <div class="modal-divider"></div>
    <div class="modal-section">
      <div class="modal-section-title">Modern alternatives</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;">${alternatives}</div>
    </div>` : ''}

    ${learnNext ? `
    <div class="modal-section">
      <div class="modal-section-title">Learn next</div>
      <ul class="decision-points">${learnNext}</ul>
    </div>` : ''}
  `;

  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  closeBtn.focus();
}

function closeModal() {
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Use dynamic event delegation for newly rendered tech cards inside #tech-grid
const techGridContainer = document.getElementById('tech-grid');
if (techGridContainer) {
  techGridContainer.addEventListener('click', (e) => {
    const card = e.target.closest('.tech-card');
    if (!card) return;
    const techKey = card.dataset.tech;
    window.location.href = `knowledge-card.html?technology=${encodeURIComponent(techKey)}&url=${encodeURIComponent(currentReport?.url || '')}`;
  });

  techGridContainer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('.tech-card');
      if (!card) return;
      e.preventDefault();
      const techKey = card.dataset.tech;
      window.location.href = `knowledge-card.html?technology=${encodeURIComponent(techKey)}&url=${encodeURIComponent(currentReport?.url || '')}`;
    }
  });
}

closeBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
});

// ── Health Bar Animation ────────────────────────
// Trigger on first view of summary section
const healthObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.health-bar-fill').forEach(bar => {
        bar.classList.add('animated');
      });
    }
  });
}, { threshold: 0.3 });

const summarySection = document.getElementById('section-summary');
if (summarySection) healthObserver.observe(summarySection);

// Trigger immediately if summary is the active default
setTimeout(() => {
  document.querySelectorAll('.health-bar-fill').forEach(bar => {
    bar.classList.add('animated');
  });
}, 300);

// ── Report date population ─────────────────────
function formatDate(d) {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
const today = new Date();
const reportDateEl = document.getElementById('report-date');
const snapshotDateEl = document.getElementById('snapshot-date');
if (reportDateEl) reportDateEl.textContent = formatDate(today);
if (snapshotDateEl) snapshotDateEl.textContent = formatDate(today);

// ── Export buttons ──────────────
document.getElementById('export-pdf-btn')?.addEventListener('click', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const queryUrl = urlParams.get('url') || '';
  window.open(`report.html${queryUrl ? `?url=${encodeURIComponent(queryUrl)}` : ''}`, '_blank');
  setTimeout(() => window.print?.(), 500);
});
document.getElementById('export-md-btn')?.addEventListener('click', () => {
  window.location.href = `report.html${window.location.search}`;
});
document.getElementById('export-json-btn')?.addEventListener('click', () => {
  const report = HotDog_API.getCurrentAnalysis();
  if (!report) return showToast('No analysis data available.');
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `builddna-report-${report.repoName.replace(/\//g, '-')}.json`;
  a.click();
});
document.getElementById('export-btn')?.addEventListener('click', () => {
  showSection('report');
});

// ── Toast notification ─────────────────────────
function showToast(msg) {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed;
    bottom: 88px;
    left: 50%;
    transform: translateX(-50%) translateY(8px);
    background: rgba(17,17,19,0.95);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    padding: 12px 20px;
    font-size: 13.5px;
    color: #FAFAFA;
    white-space: nowrap;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    z-index: 999;
    backdrop-filter: blur(12px);
    opacity: 0;
    transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1);
    font-family: 'Inter', sans-serif;
    max-width: calc(100vw - 48px);
    text-align: center;
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(8px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ── Scroll-triggered card animations ──────────
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.animation = `fade-up 0.4s ${i * 0.04}s cubic-bezier(0.22,1,0.36,1) both`;
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

document.querySelectorAll('.tech-card, .rec-card, .tool-card, .decision-card, .roadmap-phase').forEach(el => {
  cardObserver.observe(el);
});

// ── Inject @keyframes for fade-up (needed for filter re-animation) ──
const style = document.createElement('style');
style.textContent = `
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

// ── Mobile sidebar toggle ──────────────────────
// Inject hamburger button for mobile
const mobileMenuBtn = document.createElement('button');
mobileMenuBtn.id = 'mobile-menu-btn';
mobileMenuBtn.setAttribute('aria-label', 'Toggle navigation');
mobileMenuBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
mobileMenuBtn.style.cssText = `
  display: none;
  background: none;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  padding: 6px 8px;
  color: #A1A1AA;
  cursor: pointer;
  margin-right: 8px;
`;
document.querySelector('.topnav-left').prepend(mobileMenuBtn);

const sidebarLeft = document.getElementById('sidebar-left');

mobileMenuBtn.addEventListener('click', () => {
  sidebarLeft.classList.toggle('mobile-open');
});

// Close mobile sidebar on nav click
navItems.forEach(item => {
  item.addEventListener('click', () => {
    if (window.innerWidth < 900) {
      sidebarLeft.classList.remove('mobile-open');
    }
  });
});

// Show mobile menu button on small screens
function checkMobile() {
  mobileMenuBtn.style.display = window.innerWidth < 900 ? 'flex' : 'none';
}
checkMobile();
window.addEventListener('resize', checkMobile);

// ── Enhance arch flow node keyboard nav ───────
document.querySelectorAll('.arch-flow-node.clickable').forEach(node => {
  node.setAttribute('role', 'button');
  node.setAttribute('tabindex', '0');
  node.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const target = node.dataset.goto;
      if (target) showSection(target);
    }
  });
});
