/* ─────────────────────────────────────────────
   BuildDNA — Interactive Blueprint JS
   Canvas Pan, Zoom, Connections, and Side Panel
───────────────────────────────────────────── */

'use strict';

document.addEventListener('DOMContentLoaded', async () => {

  // Load report data from state API
  let report = typeof HotDog_API !== 'undefined' ? HotDog_API.getCurrentAnalysis() : null;

  // Fallback: load from API if no cached session
  if (!report) {
    console.warn('[Blueprint] No cached report — running analysis...');
    try {
      const params = new URLSearchParams(window.location.search);
      const url = params.get('url') || 'https://github.com/vercel/next.js';
      await HotDog_API.analyzeRepository(url, () => {});
      report = HotDog_API.getCurrentAnalysis();
    } catch (err) {
      document.body.innerHTML = `<div style="padding:48px;text-align:center;color:#A1A1AA;font-family:Inter,sans-serif">
        <h2 style="color:#FAFAFA;margin-bottom:12px">Analysis Required</h2>
        <p>${err.message}</p>
        <p style="margin-top:16px"><a href="index.html" style="color:#8B5CF6">Return home</a> and run analysis with the backend server (<code>npm run dev</code>).</p>
      </div>`;
      return;
    }
  }

  // Update repository metadata headers
  document.getElementById('bp-project-name').textContent = report.repoName;

  // Update back button link dynamically to preserve target repo URL
  const backBtn = document.querySelector('.back-btn');
  if (backBtn && report.url) {
    backBtn.setAttribute('href', `dashboard.html?url=${encodeURIComponent(report.url)}`);
  }

  // ─── DOM SELECTORS ───
  const canvasWrapper = document.getElementById('canvas-wrapper');
  const canvasPannable = document.getElementById('canvas-pannable');
  const connectionsSvg = document.getElementById('connections-svg');
  const layersContainer = document.getElementById('layers-container');
  const detailsPanel = document.getElementById('details-panel');
  const panelContent = document.getElementById('panel-content');
  const closePanel = document.getElementById('close-panel');
  const searchInput = document.getElementById('bp-search-input');
  const searchDropdown = document.getElementById('search-dropdown');
  const toggleInsights = document.getElementById('toggle-insights');
  const insightsPanel = document.getElementById('insights-panel');
  const miniMapIndicator = document.getElementById('mini-map-indicator');

  // Canvas zoom/pan transform states
  let scale = 0.95;
  let panX = -850;
  let panY = -350;
  let isPanning = false;
  let startX = 0;
  let startY = 0;

  // Render layer boxes dynamically from blueprint structure
  const layerMap = {
    "Client Layer": "user",
    "Edge Layer": "frontend",
    "Application Layer": "backend",
    "Data Layer": "database",
    "External Services": "external",
    "Web Server Layer": "frontend"
  };

  function renderBlueprint() {
    layersContainer.innerHTML = '';
    
    // Add User Layer at top if missing
    let layers = [...report.blueprint.layers];
    if (!layers.some(l => l.name === "Client Layer" || l.name === "User Layer")) {
      layers.unshift({
        name: "Client Layer",
        nodes: [{ icon: "👤", name: "User Client", desc: "Browser access" }]
      });
    }

    layers.forEach((layer) => {
      const layerId = layerMap[layer.name] || "external";
      
      const layerRow = document.createElement('div');
      layerRow.className = 'bp-layer-row';
      layerRow.dataset.layerId = layerId;

      layerRow.innerHTML = `
        <div class="layer-heading">${layer.name}</div>
        <div class="layer-nodes-row">
          ${layer.nodes.map(node => {
            // Find key in technologies list if available
            const matchingTech = report.technologies.find(t => t.name.toLowerCase() === node.name.toLowerCase()) || {};
            const techKey = matchingTech.key || node.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            return `
              <div class="node-card" data-tech="${techKey}" data-name="${node.name}">
                <div class="node-logo">${node.icon || "⚙️"}</div>
                <div class="node-meta">
                  <div class="node-name">${node.name}</div>
                  <div class="node-cat">${node.desc || "Component"}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
      layersContainer.appendChild(layerRow);
    });

    // Draw connection lines after DOM renders
    setTimeout(() => {
      drawConnections();
      updateMiniMap();
    }, 100);
  }

  // Draw arrow connection lines between corresponding nodes
  function drawConnections() {
    connectionsSvg.innerHTML = '';
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
      <marker id="arrow" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="#52525B"/>
      </marker>
      <marker id="arrow-active" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="#60A5FA"/>
      </marker>
    `;
    connectionsSvg.appendChild(defs);

    const cards = document.querySelectorAll('.node-card');
    const relationData = report.relationships || [];

    relationData.forEach((rel, idx) => {
      // Find cards representing the 'from' and 'to' endpoints
      let fromCard, toCard;
      cards.forEach(card => {
        const name = card.dataset.name.toLowerCase();
        if (name.includes(rel.from.toLowerCase()) || rel.from.toLowerCase().includes(name)) fromCard = card;
        if (name.includes(rel.to.toLowerCase()) || rel.to.toLowerCase().includes(name)) toCard = card;
      });

      if (fromCard && toCard) {
        // Check if layers are visible
        const fromParent = fromCard.closest('.bp-layer-row');
        const toParent = toCard.closest('.bp-layer-row');
        if (fromParent.classList.contains('hidden') || toParent.classList.contains('hidden')) return;

        // Calculate card centers
        const rectFrom = fromCard.getBoundingClientRect();
        const rectTo = toCard.getBoundingClientRect();
        const wrapperRect = canvasPannable.getBoundingClientRect();

        // Convert coordinates to pannable canvas space
        const x1 = (rectFrom.left + rectFrom.width / 2 - wrapperRect.left) / scale;
        const y1 = (rectFrom.bottom - wrapperRect.top) / scale;
        const x2 = (rectTo.left + rectTo.width / 2 - wrapperRect.left) / scale;
        const y2 = (rectTo.top - wrapperRect.top) / scale;

        // Draw line group
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute('class', 'connection-group');
        group.dataset.relationIdx = idx;

        // Invisible fat line for easy click selection
        const clickablePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        clickablePath.setAttribute('d', `M ${x1} ${y1} L ${x2} ${y2}`);
        clickablePath.setAttribute('class', 'connection-clickable');

        // Visible dash line path
        const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
        line.setAttribute('d', `M ${x1} ${y1} L ${x2} ${y2}`);
        line.setAttribute('class', 'connection-line');
        line.setAttribute('id', `conn-line-${idx}`);
        line.setAttribute('marker-end', 'url(#arrow)');

        group.appendChild(clickablePath);
        group.appendChild(line);

        // Connection click handler
        group.addEventListener('click', (e) => {
          e.stopPropagation();
          highlightConnection(idx);
          openConnectionDetails(rel);
        });

        connectionsSvg.appendChild(group);
      }
    });
  }

  // Update canvas CSS transforms
  function applyTransform() {
    canvasPannable.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    updateMiniMapIndicator();
  }

  // ─── INTERACTION STATE CONTROLLERS ───
  function highlightConnection(idx) {
    document.querySelectorAll('.connection-line').forEach(line => {
      line.classList.remove('active');
      line.setAttribute('marker-end', 'url(#arrow)');
    });
    const activeLine = document.getElementById(`conn-line-${idx}`);
    if (activeLine) {
      activeLine.classList.add('active');
      activeLine.setAttribute('marker-end', 'url(#arrow-active)');
    }
  }

  function openConnectionDetails(rel) {
    detailsPanel.classList.add('open');
    panelContent.innerHTML = `
      <div class="panel-section">
        <span class="panel-sec-label">Connection Pathway</span>
        <h3 class="panel-node-title">${rel.from} ──> ${rel.to}</h3>
        <span class="panel-node-cat">System Communication</span>
      </div>

      <div class="panel-divider" style="height:1px;background:var(--border);margin:20px 0;"></div>

      <div class="panel-section">
        <span class="panel-sec-label">Relationship Description</span>
        <p class="panel-sec-text" style="font-size:14px;color:var(--text-primary);line-height:1.7;">${rel.detail}</p>
      </div>

      <div class="panel-section" style="margin-top:24px;">
        <span class="panel-sec-label">Data Transaction Type</span>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 12px;font-size:12.5px;font-family:var(--font-mono);color:var(--accent-light);">
          ${rel.label.toUpperCase()}
        </div>
      </div>
    `;
  }

  function openNodeDetails(techKey, nodeName) {
    detailsPanel.classList.add('open');
    
    // Find detailed tech database definition
    const tech = report.technologies.find(t => t.key === techKey) || {};
    
    const analogy = tech.realWorldAnalogy || tech.analogy || `${nodeName} acts as a specialized component inside the system layer.`;

    panelContent.innerHTML = `
      <div class="panel-section">
        <span class="panel-sec-label">${tech.catDisplay || "System Module"}</span>
        <h3 class="panel-node-title">${nodeName}</h3>
        <span class="panel-node-cat">Technology Card</span>
      </div>

      <div class="panel-section">
        <span class="panel-sec-label">What it is</span>
        <p class="panel-sec-text">${tech.role || "An integrated tool or software utility used to execute tasks inside the codebase architecture."}</p>
      </div>

      <div class="panel-section">
        <span class="panel-sec-label">Why this project uses it</span>
        <p class="panel-sec-text">${tech.insight || "Selected to ensure clean separation of concerns and maintainable modular queries."}</p>
      </div>

      <div class="panel-section" style="margin-top:20px;">
        <span class="panel-sec-label">Real-World Analogy</span>
        <div class="panel-analogy-box">
          ${analogy}
        </div>
      </div>

      <div class="panel-btn-wrap">
        <a href="knowledge-card.html?technology=${encodeURIComponent(techKey)}&url=${encodeURIComponent(report.url)}" class="back-btn" style="width:100%;justify-content:center;background:var(--text-primary);color:var(--bg);border:none;">Open Full Knowledge Card</a>
      </div>
    `;
  }

  // ─── CANVAS MOUSE PAN & ZOOM EVENTS ───
  canvasWrapper.addEventListener('mousedown', (e) => {
    // Avoid pan conflict with details click
    if (e.target.closest('.node-card') || e.target.closest('.layer-toggles-card')) return;
    isPanning = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
    canvasPannable.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    applyTransform();
  });

  window.addEventListener('mouseup', () => {
    isPanning = false;
    canvasPannable.style.cursor = 'grab';
  });

  // Wheel zoom controls
  canvasWrapper.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomIntensity = 0.08;
    const mouseX = e.clientX - canvasWrapper.getBoundingClientRect().left;
    const mouseY = e.clientY - canvasWrapper.getBoundingClientRect().top;

    const canvasX = (mouseX - panX) / scale;
    const canvasY = (mouseY - panY) / scale;

    if (e.deltaY < 0) {
      scale = Math.min(2, scale + zoomIntensity);
    } else {
      scale = Math.max(0.4, scale - zoomIntensity);
    }

    panX = mouseX - canvasX * scale;
    panY = mouseY - canvasY * scale;

    applyTransform();
  }, { passive: false });

  // Control button triggers
  document.getElementById('zoom-in').addEventListener('click', () => {
    scale = Math.min(2, scale + 0.15);
    applyTransform();
  });

  document.getElementById('zoom-out').addEventListener('click', () => {
    scale = Math.max(0.4, scale - 0.15);
    applyTransform();
  });

  document.getElementById('zoom-reset').addEventListener('click', () => {
    scale = 0.95;
    panX = -850;
    panY = -350;
    applyTransform();
  });

  // Close panel
  closePanel.addEventListener('click', () => {
    detailsPanel.classList.remove('open');
  });

  // Node clicks
  layersContainer.addEventListener('click', (e) => {
    const card = e.target.closest('.node-card');
    if (!card) return;
    
    // Toggle active classes
    document.querySelectorAll('.node-card').forEach(c => c.classList.remove('active', 'highlighted'));
    card.classList.add('active');

    const techKey = card.dataset.tech;
    const nodeName = card.dataset.name;
    openNodeDetails(techKey, nodeName);
  });

  // ─── LAYER TOGGLE CHECKBOX CONTROLLER ───
  const toggles = document.querySelectorAll('.layer-toggles-card input');
  toggles.forEach(input => {
    input.addEventListener('change', () => {
      const layerId = input.dataset.layer;
      const targetRow = document.querySelector(`.bp-layer-row[data-layer-id="${layerId}"]`);
      if (targetRow) {
        targetRow.classList.toggle('hidden', !input.checked);
        // Redraw SVG path boundaries
        drawConnections();
        updateMiniMap();
      }
    });
  });

  // ─── SEARCH INPUT AND AUTOFOCUS CONTROLLERS ───
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) {
      searchDropdown.classList.remove('active');
      return;
    }

    const cards = document.querySelectorAll('.node-card');
    let matches = [];
    cards.forEach(card => {
      const name = card.dataset.name;
      const techKey = card.dataset.tech;
      if (name.toLowerCase().includes(query)) {
        matches.push({ name, techKey, card });
      }
    });

    if (matches.length > 0) {
      searchDropdown.innerHTML = matches.map(m => `
        <div class="search-result-item" data-tech="${m.techKey}">
          <span>${m.name}</span>
          <span class="search-result-cat">Focus Node</span>
        </div>
      `).join('');
      searchDropdown.classList.add('active');
    } else {
      searchDropdown.innerHTML = `<div class="search-result-item" style="color:var(--text-muted);">No match found</div>`;
      searchDropdown.classList.add('active');
    }
  });

  // Dropdown list click focus
  searchDropdown.addEventListener('click', (e) => {
    const item = e.target.closest('.search-result-item');
    if (!item || !item.dataset.tech) return;

    const techKey = item.dataset.tech;
    const targetCard = document.querySelector(`.node-card[data-tech="${techKey}"]`);

    if (targetCard) {
      // Highlight target node
      document.querySelectorAll('.node-card').forEach(c => c.classList.remove('active', 'highlighted'));
      targetCard.classList.add('highlighted');

      // Pan/Center target card to screen viewport coordinate
      const rect = targetCard.getBoundingClientRect();
      const wrapperRect = canvasWrapper.getBoundingClientRect();
      
      // Calculate coordinates to center
      panX = wrapperRect.width / 2 - (targetCard.offsetLeft + 1000 + rect.width / 2) * scale;
      panY = wrapperRect.height / 2 - (targetCard.offsetTop + 100 + rect.height / 2) * scale;

      applyTransform();
      openNodeDetails(techKey, targetCard.dataset.name);
    }

    searchInput.value = '';
    searchDropdown.classList.remove('active');
  });

  // Hide dropdown click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.bp-search-container')) {
      searchDropdown.classList.remove('active');
    }
  });

  // ─── ARCHITECTURE INSIGHTS COLLAPSIBLE ───
  toggleInsights.addEventListener('click', () => {
    const isOpen = insightsPanel.classList.toggle('open');
    toggleInsights.textContent = isOpen ? "Hide Insights Panel" : "Show Insights Panel";
  });

  // ─── MINI MAP CONTROLLER ───
  const miniMapSvg = document.getElementById('mini-map-svg');

  function updateMiniMap() {
    miniMapSvg.innerHTML = '';
    const layerRows = document.querySelectorAll('.bp-layer-row:not(.hidden)');
    
    // Draw miniature nodes on minimap SVG
    layerRows.forEach((row, rowIdx) => {
      const cards = row.querySelectorAll('.node-card');
      const y = 15 + rowIdx * 16;
      
      cards.forEach((card, cardIdx) => {
        const x = 30 + cardIdx * 34;
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', 22);
        rect.setAttribute('height', 8);
        rect.setAttribute('rx', 1.5);
        rect.setAttribute('fill', 'var(--border-strong)');
        miniMapSvg.appendChild(rect);
      });
    });
    updateMiniMapIndicator();
  }

  function updateMiniMapIndicator() {
    // Reflect main pannable container box position
    const wrapRect = canvasWrapper.getBoundingClientRect();
    const indWidth = Math.max(30, (wrapRect.width / 3000) * 140);
    const indHeight = Math.max(20, (wrapRect.height / 2000) * 90);
    
    // Map pan offset back to coordinates
    const indX = Math.min(100, Math.max(0, (-panX / 3000) * 140));
    const indY = Math.min(65, Math.max(0, (-panY / 2000) * 90));

    miniMapIndicator.style.width = `${indWidth}px`;
    miniMapIndicator.style.height = `${indHeight}px`;
    miniMapIndicator.style.left = `${4 + indX}px`;
    miniMapIndicator.style.top = `${4 + indY}px`;
  }

  // Redraw SVG connections on window resizing
  window.addEventListener('resize', () => {
    drawConnections();
    updateMiniMap();
  });

  // Start initialization
  renderBlueprint();
  applyTransform();

});
