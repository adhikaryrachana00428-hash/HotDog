'use strict';

function esc(value) {
  const div = document.createElement('div');
  div.textContent = value == null ? '' : String(value);
  return div.innerHTML;
}

function asList(value) {
  return Array.isArray(value) ? value : [];
}

function section(id, title, body) {
  return `
    <section id="${id}" class="chapter-section">
      <h2 class="chapter-title">${esc(title)}</h2>
      ${body}
    </section>
  `;
}

function paragraph(text, className = 'progressive-para') {
  return `<p class="${className}">${esc(text || 'Not provided by the Engineering Knowledge Agent.')}</p>`;
}

function list(items) {
  const values = asList(items);
  return values.length
    ? `<ul class="learning-list">${values.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`
    : paragraph('Not provided by the Engineering Knowledge Agent.');
}

function renderKnowledgeCard(report, tech) {
  document.title = `${tech.name} — Technology Knowledge Card · HotDog`;
  document.getElementById('repo-breadcrumb').textContent = report.repoName;
  document.getElementById('tech-breadcrumb').textContent = tech.name;
  document.getElementById('tech-logo').textContent = tech.logoText || tech.name.slice(0, 2).toUpperCase();
  document.getElementById('tech-category').textContent = tech.catDisplay || tech.cat || 'Technology';
  document.getElementById('tech-name').textContent = tech.name;
  document.getElementById('tech-role').textContent = tech.role || tech.whatItIs || '';
  document.getElementById('stat-category').textContent = tech.catDisplay || tech.cat || '--';
  document.getElementById('stat-fit').textContent = tech.insight || tech.whyProjectUses || 'Generated from live analysis';
  document.getElementById('stat-related').textContent = asList(tech.relatedTechnologies).join(', ') || report.technologies.filter(t => t.key !== tech.key).slice(0, 3).map(t => t.name).join(', ') || '--';
  document.getElementById('stat-learn').textContent = asList(tech.learnNext || tech.learnNextRecommendations)[0] || '--';

  const chapters = [
    ['what-is-it', '01. What Is It?', paragraph(tech.whatItIs || tech.role)],
    ['why-created', '02. Why Was It Created?', paragraph(tech.whyExists)],
    ['problem-solved', '03. Engineering Problem Solved', paragraph(tech.problemSolved)],
    ['how-it-works', '04. Internal Working', paragraph(tech.howItWorks)],
    ['why-in-project', '05. Why This Project Uses It', `<div class="tldr-box"><span class="tldr-title">Project Context</span><p>${esc(tech.whyProjectUses || tech.insight)}</p></div>`],
    ['advantages', '06. Advantages', list(tech.advantages)],
    ['limitations', '07. Limitations', list(tech.limitations)],
    ['tradeoffs', '08. Trade-offs', list(tech.tradeOffs)],
    ['alternatives', '09. Modern Alternatives', list(tech.modernAlternatives || tech.alternatives)],
    ['beginner', '10. Beginner Explanation', paragraph(tech.beginnerExplanation)],
    ['intermediate', '11. Intermediate Explanation', paragraph(tech.intermediateExplanation)],
    ['advanced', '12. Advanced Explanation', paragraph(tech.advancedExplanation)],
    ['analogy', '13. Real-world Analogy', `<div class="analogy-card"><p>${esc(tech.realWorldAnalogy || tech.analogy)}</p></div>`],
    ['mistakes', '14. Common Mistakes', list(tech.commonMistakes)],
    ['learn-next', '15. Learn Next', list(tech.learnNextRecommendations || tech.learnNext)],
  ];

  document.getElementById('knowledge-nav').innerHTML = '<div class="spy-title">Module Chapters</div>' +
    chapters.map(([id, title], index) => `<a href="#${id}" class="spy-link${index === 0 ? ' active' : ''}">${esc(title)}</a>`).join('');
  document.getElementById('knowledge-sections').innerHTML =
    chapters.map(([id, title, body]) => section(id, title, body)).join('');

  const backLink = document.getElementById('back-link');
  backLink.href = `dashboard.html?url=${encodeURIComponent(report.url)}`;
}

function renderError(message) {
  document.getElementById('knowledge-content').innerHTML = `
    <section class="tech-hero">
      <div class="tech-hero-logo">!</div>
      <div class="tech-hero-meta">
        <div class="tech-category-pill">Error</div>
        <h1 class="tech-name">Knowledge card unavailable</h1>
        <p class="tech-headline">${esc(message)}</p>
      </div>
    </section>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    const report = typeof HotDog_API !== 'undefined' ? HotDog_API.getCurrentAnalysis() : null;
    if (!report) {
      renderError('Run an analysis first so the page can load the live EngineeringReport.');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const requestedKey = params.get('technology');
    const tech = report.technologies.find(item => item.key === requestedKey || item.id === requestedKey) || report.technologies[0];
    if (!tech) {
      renderError('The EngineeringReport did not include technology knowledge cards.');
      return;
    }

    renderKnowledgeCard(report, tech);
  } catch (error) {
    renderError(error instanceof Error ? error.message : 'Unexpected rendering error.');
  }
});
