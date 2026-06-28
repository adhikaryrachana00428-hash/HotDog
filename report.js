/* ─────────────────────────────────────────────
   BuildDNA — Engineering Intelligence Report
   Dynamically compiled from Wire agent JSON
───────────────────────────────────────────── */

'use strict';

let activeReport = null;

const TOC_SECTIONS = [
  { id: 'report-title', label: 'Report Overview' },
  { id: 'exec-summary', label: 'Executive Summary' },
  { id: 'blueprint', label: 'Engineering Blueprint' },
  { id: 'knowledge-library', label: 'Technology Knowledge Library' },
  { id: 'relationships', label: 'Engineering Relationships' },
  { id: 'recommendations', label: 'Smart Recommendations' },
  { id: 'roadmap', label: 'Learning Roadmap' },
  { id: 'confidence-assess', label: 'Build Confidence Assessment' },
  { id: 'future-evolution', label: 'Future Evolution' }
];

function esc(str) {
  if (str == null) return '';
  const d = document.createElement('div');
  d.textContent = String(str);
  return d.innerHTML;
}

function complexityLabel(score) {
  if (score >= 75) return 'Advanced';
  if (score >= 50) return 'Moderate';
  return 'Low';
}

function asList(arr) {
  return Array.isArray(arr) ? arr : [];
}

function asString(val, fallback) {
  if (val != null && val !== '') return val;
  return fallback || '';
}

function techField(tech, field, fallbackField) {
  return asString(tech[field], tech[fallbackField] || '');
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const urlParam = params.get('url');

  let report = typeof HotDog_API !== 'undefined' ? HotDog_API.getCurrentAnalysis() : null;

  if (urlParam && report && report.url !== urlParam) {
    report = null;
  }

  if (!report && typeof HotDog_API !== 'undefined') {
    const targetUrl = urlParam || 'https://github.com/vercel/next.js';
    HotDog_API.analyzeRepository(targetUrl, () => {}).then(data => {
      activeReport = data;
      initReport(data);
      bindExportActions();
    });
  } else if (report) {
    activeReport = report;
    initReport(report);
    bindExportActions();
  }

  buildTOC();
  bindCollapsibles();
  bindScrollSpy();
});

function buildTOC() {
  const container = document.getElementById('toc-links');
  if (!container) return;
  container.innerHTML = TOC_SECTIONS.map((s, i) =>
    `<a href="#${s.id}" class="toc-link${i === 0 ? ' active' : ''}">${esc(s.label)}</a>`
  ).join('');
}

function initReport(data) {
  if (!data) return;
  activeReport = data;

  renderHeader(data);
  renderExecutiveSummary(data);
  renderBlueprint(data);
  renderTechLibrary(data);
  renderRelationships(data);
  renderRecommendations(data);
  renderRoadmap(data);
  renderConfidence(data);
  renderFutureEvolution(data);

  const signoff = document.getElementById('signoff-session');
  if (signoff) signoff.textContent = data.sessionId || '—';
}

function renderHeader(data) {
  setText('doc-repo-name', data.repoName);
  const urlEl = document.getElementById('doc-repo-url');
  if (urlEl) {
    urlEl.textContent = data.url;
    urlEl.href = data.url;
  }

  const date = data.timestamp ? new Date(data.timestamp) : new Date();
  setText('doc-date', date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));

  const pills = document.getElementById('doc-tech-pills');
  if (pills && data.technologies) {
    pills.innerHTML = data.technologies.map(t =>
      `<span class="meta-tech-pill">${esc(t.name)}</span>`
    ).join('');
  }

  const complexity = data.metrics?.complexity ?? 0;
  setText('doc-complexity', `${complexityLabel(complexity)} (${complexity}%)`);

  const confidence = data.metrics?.confidence ?? 0;
  setText('doc-confidence', `${confidence}%`);

  const backBtn = document.getElementById('header-back-btn');
  if (backBtn) backBtn.href = `dashboard.html?url=${encodeURIComponent(data.url)}`;
}

function renderExecutiveSummary(data) {
  const s = data.summary || {};
  setText('summary-what-it-does', s.purpose);
  setText('summary-who-its-for', s.audience);
  setText('summary-architecture', s.architecture);

  const obs = document.getElementById('summary-observations');
  if (obs) {
    const items = asList(s.observations);
    obs.innerHTML = items.length
      ? items.map(o => `<li>${esc(o)}</li>`).join('')
      : '<li>No observations recorded by the analysis agents.</li>';
  }
}

function renderBlueprint(data) {
  const bp = data.blueprint || {};
  const diagram = document.getElementById('blueprint-diagram');
  if (diagram && bp.layers) {
    diagram.innerHTML = bp.layers.map((layer, idx) => {
      const nodes = layer.nodes.map(n => `
        <div class="arch-node">
          <span class="arch-node-icon">${esc(n.icon || '⚙️')}</span>
          <div class="arch-node-info">
            <span class="arch-node-name">${esc(n.name)}</span>
            <span class="arch-node-desc">${esc(n.desc)}</span>
          </div>
        </div>
      `).join('');
      const arrow = idx < bp.layers.length - 1 ? '<div class="sab-arrow">↓</div>' : '';
      return `
        <div class="arch-layer">
          <div class="arch-layer-label">${esc(layer.name)}</div>
          <div class="arch-layer-nodes">${nodes}</div>
        </div>
        ${arrow}
      `;
    }).join('');
  }

  setText('blueprint-communication', bp.communicationSummary);

  const flows = document.getElementById('blueprint-flows');
  if (flows) {
    const flowItems = asList(bp.flows);
    flows.innerHTML = flowItems.length
      ? flowItems.map(f => `<li>${esc(f)}</li>`).join('')
      : '<li>No data flow sequences recorded.</li>';
  }
}

function renderTechLibrary(data) {
  const container = document.getElementById('tech-library-container');
  if (!container || !data.technologies) return;

  container.innerHTML = data.technologies.map(t => {
    const advantages = asList(t.advantages);
    const limitations = asList(t.limitations);
    const alternatives = asList(t.alternatives);
    const learnNext = asList(t.learnNext);

    return `
      <article class="tech-library-section">
        <header class="tls-header">
          <div class="tls-logo ${esc(t.logoClass || '')}">${esc(t.logoText || '⚙️')}</div>
          <div class="tls-name-group">
            <h3>${esc(t.name)}</h3>
            <span class="tls-cat">${esc(t.catDisplay || t.cat || '')}</span>
          </div>
        </header>

        <div class="tls-details-grid">
          <div class="tls-col">
            <h4>What It Is</h4>
            <p>${esc(techField(t, 'whatItIs', 'role'))}</p>
          </div>
          <div class="tls-col">
            <h4>Why It Exists</h4>
            <p>${esc(t.whyExists || '')}</p>
          </div>
          <div class="tls-col">
            <h4>Why This Project Uses It</h4>
            <p>${esc(techField(t, 'whyProjectUses', 'insight'))}</p>
          </div>
          <div class="tls-col">
            <h4>Advantages</h4>
            <ul class="tls-bullet-list">${advantages.map(a => `<li>${esc(a)}</li>`).join('') || '<li>—</li>'}</ul>
          </div>
          <div class="tls-col">
            <h4>Limitations</h4>
            <ul class="tls-bullet-list">${limitations.map(l => `<li>${esc(l)}</li>`).join('') || '<li>—</li>'}</ul>
          </div>
          <div class="tls-col">
            <h4>Alternatives</h4>
            <p class="tls-alternatives">${alternatives.map(a => esc(a)).join(' · ') || '—'}</p>
          </div>
          <div class="tls-col tls-col--full">
            <h4>Real-World Analogy</h4>
            <div class="tls-analogy-box">${esc(t.analogy || '')}</div>
          </div>
          <div class="tls-col tls-col--full">
            <h4>Learn Next</h4>
            <ul class="tls-bullet-list tls-learn-list">${learnNext.map(l => `<li>${esc(l)}</li>`).join('') || '<li>—</li>'}</ul>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function renderRelationships(data) {
  const container = document.getElementById('relationships-container');
  if (!container) return;

  const rels = asList(data.relationships);
  if (!rels.length) {
    container.innerHTML = '<p class="empty-state">No component relationships recorded by the Architecture Agent.</p>';
    return;
  }

  container.innerHTML = rels.map(r => `
    <div class="rel-item-card">
      <div class="rel-flow">
        <span class="rel-from">${esc(r.from)}</span>
        <span class="rel-arrow">→</span>
        <span class="rel-to">${esc(r.to)}</span>
        <span class="rel-label">${esc(r.label)}</span>
      </div>
      <p class="rel-item-desc">${esc(r.detail)}</p>
    </div>
  `).join('');
}

function renderRecommendations(data) {
  const container = document.getElementById('advisory-container');
  if (!container) return;

  let html = '';
  const advisor = data.advisor || {};

  if (advisor.techRecommendations?.length) {
    html += '<div class="adv-category"><h3 class="adv-category-title">Technology Upgrades & Migrations</h3>';
    html += advisor.techRecommendations.map(rec => `
      <div class="adv-item-section">
        <div class="adv-item-title-row">
          <h4 class="adv-item-name">${esc(rec.current)} → ${esc(rec.suggested)}</h4>
          <span class="adv-item-badge">${esc(rec.difficulty || 'Medium')} · ${rec.confidence}% confidence</span>
        </div>
        <p class="adv-item-desc">${esc(rec.why)}</p>
        <div class="adv-detail-row">
          <span><strong>Benefits:</strong> ${esc(rec.benefits?.join(', ') || '')}</span>
        </div>
        <div class="adv-detail-row">
          <span><strong>Tradeoffs:</strong> ${esc(rec.tradeoffs?.join(', ') || '')}</span>
        </div>
        ${rec.whenNot ? `<div class="adv-detail-row adv-when-not"><span><strong>When not to migrate:</strong> ${esc(rec.whenNot)}</span></div>` : ''}
      </div>
    `).join('');
    html += '</div>';
  }

  if (advisor.hiddenTools?.length) {
    html += '<div class="adv-category"><h3 class="adv-category-title">Hidden Tools</h3>';
    html += advisor.hiddenTools.map(tool => `
      <div class="adv-item-section">
        <div class="adv-item-title-row">
          <h4 class="adv-item-name">${esc(tool.name)}</h4>
          <span class="adv-item-badge adv-badge--tool">${esc(tool.cat || 'Tool')} · ${esc(tool.curve || '')} curve</span>
        </div>
        <p class="adv-item-desc">${esc(tool.desc)}</p>
        <div class="adv-detail-row"><span><strong>Why it fits:</strong> ${esc(tool.why)}</span></div>
      </div>
    `).join('');
    html += '</div>';
  }

  const opps = advisor.opportunities || {};
  const oppCategories = [
    { key: 'performance', title: 'Performance Opportunities' },
    { key: 'security', title: 'Security Improvements' },
    { key: 'codeQuality', title: 'Architecture & Code Quality' }
  ];
  const hasOpps = oppCategories.some(c => opps[c.key]?.length);
  if (hasOpps) {
    html += '<div class="adv-category"><h3 class="adv-category-title">Migration & Architecture Opportunities</h3>';
    oppCategories.forEach(cat => {
      asList(opps[cat.key]).forEach(opp => {
        html += `
          <div class="adv-item-section">
            <div class="adv-item-title-row">
              <h4 class="adv-item-name">${esc(cat.title.replace(/ Opportunities| Improvements| & Code Quality/g, ''))}</h4>
              <span class="adv-item-badge">${esc(opp.impact || '')} · ${esc(opp.effort || '')} effort</span>
            </div>
            <p class="adv-item-desc">${esc(opp.why)}</p>
          </div>
        `;
      });
    });
    html += '</div>';
  }

  if (data.recommendations?.length) {
    html += '<div class="adv-category"><h3 class="adv-category-title">General Recommendations</h3>';
    html += data.recommendations.map(rec => `
      <div class="adv-item-section">
        <div class="adv-item-title-row">
          <h4 class="adv-item-name">${esc(rec.title)}</h4>
          <span class="adv-item-badge">${esc(rec.type || 'suggestion')} · ${esc(rec.effort || '')} effort</span>
        </div>
        <p class="adv-item-desc">${esc(rec.body)}</p>
        ${rec.benefit ? `<div class="adv-detail-row"><span><strong>Expected benefit:</strong> ${esc(rec.benefit)}</span></div>` : ''}
      </div>
    `).join('');
    html += '</div>';
  }

  container.innerHTML = html || '<p class="empty-state">No recommendations generated by the Engineering Advisor Agent.</p>';
}

function renderRoadmap(data) {
  const intro = document.getElementById('roadmap-intro');
  if (intro) {
    const time = data.metrics?.learningTime || '';
    intro.textContent = time
      ? `Dependency-aware learning sequence. Estimated total time: ${time}. Complete each phase before advancing to dependent phases.`
      : 'Dependency-aware learning sequence compiled from detected technology stack.';
  }

  const container = document.getElementById('roadmap-container');
  if (!container) return;

  const phases = asList(data.roadmap);
  if (!phases.length) {
    container.innerHTML = '<p class="empty-state">No learning roadmap generated.</p>';
    return;
  }

  container.innerHTML = phases.map((phase, idx) => {
    const deps = asList(phase.dependsOn);
    const depNote = deps.length
      ? `<span class="roadmap-deps">Requires: ${deps.map(d => esc(d)).join(', ')}</span>`
      : '<span class="roadmap-deps roadmap-deps--none">No prerequisites</span>';

    return `
      <div class="roadmap-step-card">
        <div class="roadmap-num">${idx + 1}</div>
        <div class="roadmap-info">
          <h4>${esc(phase.title)}</h4>
          <div class="roadmap-meta">
            <span class="roadmap-duration">${esc(phase.duration || '')}</span>
            ${depNote}
          </div>
          <ul class="roadmap-items-bullets">
            ${asList(phase.items).map(item => `<li>${esc(item)}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }).join('');
}

function renderConfidence(data) {
  const container = document.getElementById('confidence-grid');
  if (!container) return;

  const ca = data.confidenceAssessment || {};
  const metrics = data.metrics || {};
  const healthDesc = data.advisor?.health?.overall?.desc || '';

  const cards = [
    {
      label: 'Confidence Score',
      value: `${metrics.confidence ?? 0}%`,
      desc: healthDesc || 'Overall build confidence based on codebase analysis.'
    },
    {
      label: 'Recreation Difficulty',
      value: ca.recreationDifficulty || '—',
      desc: ca.recreationDescription || ''
    },
    {
      label: 'Missing Proprietary Components',
      value: ca.missingProprietary || '—',
      desc: ca.missingDescription || ''
    },
    {
      label: 'Estimated Implementation Effort',
      value: ca.implementationEffort || '—',
      desc: ca.implementationDescription || (metrics.learningTime ? `Aligned with ${metrics.learningTime} learning timeline.` : '')
    }
  ];

  container.innerHTML = cards.map(c => `
    <div class="conf-metric-card">
      <span class="conf-label">${esc(c.label)}</span>
      <span class="conf-value">${esc(c.value)}</span>
      <p class="conf-desc">${esc(c.desc)}</p>
    </div>
  `).join('');
}

function renderFutureEvolution(data) {
  const container = document.getElementById('evolution-container');
  if (!container) return;

  const steps = asList(data.advisor?.futureEvolution);
  container.innerHTML = steps.length
    ? steps.map(step => `
        <div class="evolution-card">
          <div class="evo-bullet"></div>
          <div class="evo-info">
            <h4>${esc(step.title)}</h4>
            <p>${esc(step.why)}</p>
          </div>
        </div>
      `).join('')
    : '<p class="empty-state">No future evolution paths identified.</p>';
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text || '—';
}

function bindCollapsibles() {
  document.querySelectorAll('.section-header-click').forEach(header => {
    header.addEventListener('click', () => {
      const section = header.closest('.doc-section');
      section.classList.toggle('expanded');
      section.classList.toggle('collapsed');
    });
  });
}

function bindScrollSpy() {
  const spyLinks = document.querySelectorAll('.toc-link');
  const sections = document.querySelectorAll('.doc-section, .doc-header');

  function updateScrollSpy() {
    const scrollPos = window.scrollY || document.documentElement.scrollTop;
    let currentId = 'report-title';

    sections.forEach(section => {
      const top = section.offsetTop - 120;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    spyLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  }

  window.addEventListener('scroll', updateScrollSpy, { passive: true });
  updateScrollSpy();
}

function generateMarkdown(data) {
  const s = data.summary || {};
  const bp = data.blueprint || {};
  const ca = data.confidenceAssessment || {};
  const date = data.timestamp ? new Date(data.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  const complexity = data.metrics?.complexity ?? 0;

  let md = `# Engineering Intelligence Report\n\n`;
  md += `> **${data.repoName}** · Compiled ${date}\n\n`;
  md += `| Field | Value |\n|-------|-------|\n`;
  md += `| Repository | ${data.url} |\n`;
  md += `| Technologies | ${data.technologies?.map(t => t.name).join(', ') || '—'} |\n`;
  md += `| Complexity | ${complexityLabel(complexity)} (${complexity}%) |\n`;
  md += `| Build Confidence | ${data.metrics?.confidence ?? 0}% |\n\n`;

  md += `## Executive Summary\n\n`;
  md += `**What the project does:** ${s.purpose || '—'}\n\n`;
  md += `**Who it's for:** ${s.audience || '—'}\n\n`;
  md += `**Overall architecture:** ${s.architecture || '—'}\n\n`;
  md += `**Key observations:**\n`;
  asList(s.observations).forEach(o => { md += `- ${o}\n`; });
  md += `\n`;

  md += `## Engineering Blueprint\n\n`;
  md += `${bp.communicationSummary || ''}\n\n`;
  asList(bp.layers).forEach(l => {
    md += `### ${l.name}\n`;
    asList(l.nodes).forEach(n => { md += `- **${n.name}**: ${n.desc}\n`; });
    md += `\n`;
  });
  md += `**Data flows:**\n`;
  asList(bp.flows).forEach((f, i) => { md += `${i + 1}. ${f}\n`; });
  md += `\n`;

  md += `## Technology Knowledge Library\n\n`;
  asList(data.technologies).forEach(t => {
    md += `### ${t.name} (${t.catDisplay || t.cat || ''})\n\n`;
    md += `- **What it is:** ${techField(t, 'whatItIs', 'role')}\n`;
    md += `- **Why it exists:** ${t.whyExists || '—'}\n`;
    md += `- **Why this project uses it:** ${techField(t, 'whyProjectUses', 'insight')}\n`;
    md += `- **Advantages:** ${asList(t.advantages).join('; ') || '—'}\n`;
    md += `- **Limitations:** ${asList(t.limitations).join('; ') || '—'}\n`;
    md += `- **Alternatives:** ${asList(t.alternatives).join(', ') || '—'}\n`;
    md += `- **Analogy:** ${t.analogy || '—'}\n`;
    md += `- **Learn next:** ${asList(t.learnNext).join('; ') || '—'}\n\n`;
  });

  md += `## Engineering Relationships\n\n`;
  asList(data.relationships).forEach(r => {
    md += `- **${r.from} → ${r.to}** (${r.label}): ${r.detail}\n`;
  });
  md += `\n`;

  md += `## Smart Recommendations\n\n`;
  asList(data.advisor?.techRecommendations).forEach(rec => {
    md += `### ${rec.current} → ${rec.suggested}\n`;
    md += `${rec.why}\n`;
    md += `- Benefits: ${rec.benefits?.join(', ') || '—'}\n`;
    md += `- Tradeoffs: ${rec.tradeoffs?.join(', ') || '—'}\n\n`;
  });
  asList(data.recommendations).forEach(rec => {
    md += `### ${rec.title}\n${rec.body}\n\n`;
  });

  md += `## Personalized Learning Roadmap\n\n`;
  asList(data.roadmap).forEach((phase, i) => {
    md += `### Phase ${i + 1}: ${phase.title} (${phase.duration || ''})\n`;
    if (phase.dependsOn?.length) md += `*Prerequisites: ${phase.dependsOn.join(', ')}*\n`;
    asList(phase.items).forEach(item => { md += `- ${item}\n`; });
    md += `\n`;
  });

  md += `## Build Confidence Assessment\n\n`;
  md += `- **Confidence Score:** ${data.metrics?.confidence ?? 0}%\n`;
  md += `- **Recreation Difficulty:** ${ca.recreationDifficulty || '—'}\n`;
  md += `- **Missing Proprietary:** ${ca.missingProprietary || '—'}\n`;
  md += `- **Implementation Effort:** ${ca.implementationEffort || '—'}\n\n`;

  md += `## Future Evolution\n\n`;
  asList(data.advisor?.futureEvolution).forEach(step => {
    md += `- **${step.title}:** ${step.why}\n`;
  });

  md += `\n---\n*Report ID: ${data.sessionId || '—'} · Compiled by Wire Agent Orchestrator · BuildDNA*\n`;
  return md;
}

function bindExportActions() {
  document.getElementById('btn-copy-report')?.addEventListener('click', () => {
    if (!activeReport) return;
    const text = generateMarkdown(activeReport);
    navigator.clipboard.writeText(text).then(() => showToast('Report copied to clipboard'));
  });

  document.getElementById('btn-export-md')?.addEventListener('click', () => {
    if (!activeReport) return;
    const md = generateMarkdown(activeReport);
    const blob = new Blob([md], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Engineering-Intelligence-Report-${activeReport.repoName.replace(/\//g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Markdown export started');
  });

  document.getElementById('btn-share-report')?.addEventListener('click', () => {
    const shareUrl = activeReport
      ? `${window.location.origin}${window.location.pathname}?url=${encodeURIComponent(activeReport.url)}`
      : window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => showToast('Shareable report link copied'));
  });

  document.getElementById('btn-print-pdf')?.addEventListener('click', () => {
    window.print();
  });
}

function showToast(msg) {
  document.querySelector('.toast-notification')?.remove();
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 250);
  }, 2800);
}
