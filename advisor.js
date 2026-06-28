/* ─────────────────────────────────────────────
   BuildDNA — Engineering Advisor Controller
   Dynamic rendering, filter scopes, expandable cards
───────────────────────────────────────────── */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // Load report data from state API
  let report = typeof HotDog_API !== 'undefined' ? HotDog_API.getCurrentAnalysis() : null;

  // Fallback defaults if no active analysis session exists
  if (!report) {
    console.log("[Advisor] No active session found, compiling Next.js defaults...");
    // Force default analysis synchronously so the dashboard renders safely
    (async () => {
      await HotDog_API.analyzeRepository('https://github.com/vercel/next.js', () => {});
      report = HotDog_API.getCurrentAnalysis();
      initAdvisor(report);
    })();
  } else {
    initAdvisor(report);
  }

  function initAdvisor(data) {
    if (!data || !data.advisor) return;
    
    const advisor = data.advisor;

    // 1. Breadcrumbs
    document.getElementById('repo-breadcrumb').textContent = data.repoName;
    
    // Dynamic back button & blueprint queries
    const backLink = document.getElementById('back-link');
    if (backLink) backLink.setAttribute('href', `dashboard.html?url=${encodeURIComponent(data.url)}`);
    
    const barBackLink = document.getElementById('bar-back-btn');
    if (barBackLink) barBackLink.setAttribute('href', `dashboard.html?url=${encodeURIComponent(data.url)}`);

    const blueprintLink = document.getElementById('bar-blueprint-btn');
    if (blueprintLink) blueprintLink.setAttribute('href', `blueprint.html?url=${encodeURIComponent(data.url)}`);

    // 2. Health Scores Overview
    const healthGrid = document.getElementById('health-grid');
    if (healthGrid && advisor.health) {
      const h = advisor.health;
      const metrics = [
        { name: "Overall Health", key: "overall" },
        { name: "Maintainability", key: "maintainability" },
        { name: "Scalability", key: "scalability" },
        { name: "Performance", key: "performance" },
        { name: "Security", key: "security" },
        { name: "Developer Experience", key: "dx" }
      ];

      healthGrid.innerHTML = metrics.map(m => {
        const item = h[m.key] || { score: 80, desc: "Standard modular system design." };
        const scoreClass = item.score < 80 ? "medium" : "";
        return `
          <div class="health-score-card">
            <div class="health-score-header">
              <span class="health-score-name">${m.name}</span>
              <span class="health-score-val ${scoreClass}">${item.score}%</span>
            </div>
            <div class="health-progress-bar">
              <div class="health-progress-fill ${scoreClass}" style="width: ${item.score}%"></div>
            </div>
            <p class="health-score-desc">${item.desc}</p>
          </div>
        `;
      }).join('');
    }

    // 3. Expandable Technology Recommendations
    const upgradesList = document.getElementById('upgrades-list');
    if (upgradesList && advisor.techRecommendations) {
      upgradesList.innerHTML = advisor.techRecommendations.map((rec, idx) => `
        <div class="upgrade-card" data-idx="${idx}">
          <div class="upgrade-card-header">
            <div class="upgrade-header-left">
              <div class="upgrade-tech-comparison">
                <span class="tech-name-pill">${rec.current}</span>
                <span class="comparison-arrow">→</span>
                <span class="tech-name-pill suggested">${rec.suggested}</span>
              </div>
              <span class="upgrade-confidence-badge">${rec.confidence}% Confidence</span>
            </div>
            <span class="upgrade-toggle-icon">▼</span>
          </div>
          
          <div class="upgrade-card-body">
            <div class="upgrade-details-grid">
              <div class="upgrade-column">
                <h4>Why it fits this project</h4>
                <p>${rec.why}</p>
              </div>
              <div class="upgrade-column">
                <h4>Expected Benefits</h4>
                <ul class="upgrade-list-points">
                  ${rec.benefits.map(b => `<li>${b}</li>`).join('')}
                </ul>
              </div>
              <div class="upgrade-column">
                <h4>Tradeoffs & Limitations</h4>
                <ul class="upgrade-list-points tradeoffs">
                  ${rec.tradeoffs.map(t => `<li>${t}</li>`).join('')}
                </ul>
              </div>
              <div class="upgrade-column">
                <h4>When NOT to switch</h4>
                <p>${rec.whenNot}</p>
              </div>
            </div>

            <div class="upgrade-meta-row">
              <div class="meta-item">
                <span class="meta-label">Migration Difficulty</span>
                <span class="meta-val">${rec.difficulty}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Target Layer</span>
                <span class="meta-val">${rec.current.includes("ORM") || rec.current.includes("DB") ? "Data Layer" : "Server Layer"}</span>
              </div>
            </div>
          </div>
        </div>
      `).join('');

      // Add expandable listeners
      document.querySelectorAll('.upgrade-card-header').forEach(header => {
        header.addEventListener('click', () => {
          const card = header.closest('.upgrade-card');
          card.classList.toggle('expanded');
        });
      });
    }

    // 4. Hidden Tool Discovery
    const toolsGrid = document.getElementById('tools-grid');
    if (toolsGrid && advisor.hiddenTools) {
      toolsGrid.innerHTML = advisor.hiddenTools.map(tool => `
        <div class="tool-discovery-card">
          <div class="tool-card-header">
            <div class="tool-card-title-group">
              <h3>${tool.name}</h3>
              <span class="tool-card-cat">${tool.cat}</span>
            </div>
            <span class="tool-curve-badge">${tool.curve} Curve</span>
          </div>
          <p class="tool-card-desc">${tool.desc}</p>
          <div class="tool-complement-box">
            <strong>Why it fits:</strong> ${tool.why}
          </div>
          ${tool.link ? `
            <a href="https://${tool.link}" target="_blank" rel="noopener noreferrer" class="tool-card-link">
              View Tool on GitHub
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>
              </svg>
            </a>
          ` : ''}
        </div>
      `).join('');
    }

    // 5. Improvement Opportunities Filtering
    const opportunitiesList = document.getElementById('opportunities-list');
    if (opportunitiesList && advisor.opportunities) {
      const ops = advisor.opportunities;
      let html = '';
      
      const categories = ['performance', 'security', 'codeQuality'];
      categories.forEach(cat => {
        const list = ops[cat] || [];
        list.forEach(op => {
          html += `
            <div class="opportunity-card" data-category="${cat}">
              <div class="opportunity-content-left">
                <p class="opportunity-desc">${op.why}</p>
                <span class="opportunity-category">${cat === 'codeQuality' ? 'Code Quality' : cat}</span>
              </div>
              <div class="opportunity-meta-right">
                <div class="op-meta-pill">
                  <span class="op-meta-label">Expected Impact</span>
                  <span class="op-meta-val high">${op.impact}</span>
                </div>
                <div class="op-meta-pill">
                  <span class="op-meta-label">Implementation Effort</span>
                  <span class="op-meta-val">${op.effort}</span>
                </div>
              </div>
            </div>
          `;
        });
      });

      opportunitiesList.innerHTML = html;

      // Filter Buttons Click
      const filterBtns = document.querySelectorAll('.filter-bar .filter-btn');
      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const filter = btn.dataset.filter;
          document.querySelectorAll('.opportunity-card').forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
              card.classList.remove('hidden');
            } else {
              card.classList.add('hidden');
            }
          });
        });
      });
    }

    // 6. Future Evolution Timeline
    const evolutionTimeline = document.getElementById('evolution-timeline');
    if (evolutionTimeline && advisor.futureEvolution) {
      evolutionTimeline.innerHTML = advisor.futureEvolution.map((step, idx) => `
        <div class="timeline-step">
          <div class="timeline-step-marker">${idx + 1}</div>
          <div class="timeline-step-content">
            <h3>${step.title}</h3>
            <p>${step.why}</p>
          </div>
        </div>
      `).join('');
    }
  }

  // Scroll spy listeners
  const spyLinks = document.querySelectorAll('.spy-link');
  const sections = document.querySelectorAll('.chapter-section');
  
  function updateScrollSpy() {
    let scrollPos = window.scrollY || document.documentElement.scrollTop;
    
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      
      if (scrollPos >= top && scrollPos < top + height) {
        spyLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateScrollSpy);
  updateScrollSpy();

  // Save Advisor Insights Toast
  const btnSave = document.getElementById('btn-save-advice');
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      btnSave.textContent = "Insights Saved ✓";
      btnSave.style.backgroundColor = "var(--green)";
      btnSave.style.color = "#fff";
      
      // Toast notification helper
      const toast = document.createElement('div');
      toast.className = 'toast-notification';
      toast.textContent = "✓ Advisor recommendations saved to your engineering workspace library.";
      toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%) translateY(8px);
        background: rgba(17, 17, 19, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 8px;
        padding: 10px 18px;
        font-size: 13px;
        color: #FAFAFA;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
        z-index: 1000;
        backdrop-filter: blur(8px);
        opacity: 0;
        transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1);
        font-family: 'Inter', sans-serif;
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
        setTimeout(() => toast.remove(), 250);
      }, 2800);
    });
  }

});
