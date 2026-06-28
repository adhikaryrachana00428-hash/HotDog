/* ─────────────────────────────────────────────
   HotDog — Frontend API Client
   Connects to backend Anakin + Wire pipeline via SSE
───────────────────────────────────────────── */

'use strict';

const HotDog_API = (() => {
  const STORAGE_KEY = 'hotdog_current_analysis';

  /** API base — same origin when served by Express, or explicit override */
  const API_BASE = (() => {
    if (typeof window !== 'undefined' && window.HOTDOG_API_BASE) {
      return window.HOTDOG_API_BASE.replace(/\/$/, '');
    }
    // When opened as file:// or separate static server, default to backend port
    if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
      return 'http://localhost:3001';
    }
    return '';
  })();

  /**
   * Run full analysis pipeline: validate → Anakin scrape → Wire orchestrate.
   * @param {string} url - GitHub repository URL
   * @param {(progress: {stage: number, status: string, pct: number}) => void} onProgress
   * @returns {Promise<object>} FinalReport JSON
   */
  async function analyzeRepository(url, onProgress) {
    if (!url || !url.trim()) {
      throw new Error('Repository URL is required.');
    }
    
    // Basic URL validation and sanitization
    const trimmedUrl = url.trim();
    try {
      const parsedUrl = new URL(trimmedUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Only HTTP and HTTPS URLs are allowed.');
      }
    } catch {
      throw new Error('Invalid URL format.');
    }

    onProgress?.({ stage: 0, status: 'Validating repository URL...', pct: 0 });

    const response = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: trimmedUrl }),
    });

    if (!response.ok) {
      let message = `Analysis request failed (${response.status})`;
      try {
        const err = await response.json();
        message = err.error || message;
      } catch { /* ignore */ }
      throw new Error(message);
    }

    if (!response.body) {
      throw new Error('No response stream from analysis server. Is the backend running?');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finalReport = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const event = JSON.parse(line.slice(6));
          if (event.type === 'progress') {
            onProgress?.(event.payload);
          } else if (event.type === 'complete') {
            finalReport = normalizeReport(event.payload);
          } else if (event.type === 'error') {
            throw new Error(event.payload.message || 'Analysis pipeline error.');
          }
        } catch (parseErr) {
          if (parseErr instanceof SyntaxError) continue;
          throw parseErr;
        }
      }
    }

    if (!finalReport) {
      throw new Error('Analysis completed without returning a report.');
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalReport));
    return finalReport;
  }

  /** Retrieve the current analysis from localStorage. */
  function getCurrentAnalysis() {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      return item ? normalizeReport(JSON.parse(item)) : null;
    } catch {
      return null;
    }
  }

  /** Validate a GitHub URL without running analysis. */
  async function validateUrl(url) {
    const response = await fetch(`${API_BASE}/api/validate-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    return response.json();
  }

  /** Check backend health and service configuration. */
  async function checkHealth() {
    try {
      const response = await fetch(`${API_BASE}/api/health`);
      return response.ok ? response.json() : null;
    } catch {
      return null;
    }
  }

  return {
    analyzeRepository,
    getCurrentAnalysis,
    validateUrl,
    checkHealth,
    normalizeReport,
    API_BASE,
  };
})();

// Export for module environments
if (typeof module !== 'undefined') module.exports = HotDog_API;
  function nonEmpty(value, fallback) {
    return typeof value === 'string' && value.trim() ? value : fallback;
  }

  function normalizeReport(report) {
    if (!report || typeof report !== 'object') {
      throw new Error('Analysis server returned an invalid report payload.');
    }
    const required = ['sessionId', 'url', 'repoName', 'summary', 'blueprint', 'technologies', 'relationships', 'recommendations', 'roadmap', 'advisor', 'metrics'];
    const missing = required.filter(key => report[key] == null);
    if (missing.length) {
      throw new Error(`EngineeringReport is missing required fields: ${missing.join(', ')}`);
    }

    report.technologies = (report.technologies || []).map((tech, idx) => {
      const key = nonEmpty(tech.key || tech.id, `technology-${idx + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const cat = nonEmpty(tech.cat || tech.category, 'other');
      const catDisplay = nonEmpty(tech.catDisplay || tech.displayCategory, cat);
      const role = nonEmpty(tech.role, `${tech.name} is used by this project.`);
      const insight = nonEmpty(tech.insight || tech.whyProjectUses, `${tech.name} was detected in the analyzed context.`);
      return {
        ...tech,
        key,
        id: tech.id || key,
        cat,
        category: tech.category || cat,
        catDisplay,
        displayCategory: tech.displayCategory || catDisplay,
        logoText: tech.logoText || nonEmpty(tech.name, '??').slice(0, 2).toUpperCase(),
        logoClass: tech.logoClass || 'tc-logo--dark',
        role,
        insight,
        whatItIs: nonEmpty(tech.whatItIs || tech.knowledgeCard?.whatItIs, role),
        whyExists: nonEmpty(tech.whyExists || tech.knowledgeCard?.whyExists, `${tech.name} solves a recurring engineering problem.`),
        whyProjectUses: nonEmpty(tech.whyProjectUses || tech.knowledgeCard?.whyProjectUses || insight, insight),
        advantages: tech.advantages?.length ? tech.advantages : tech.knowledgeCard?.advantages || ['Improves implementation clarity'],
        limitations: tech.limitations?.length ? tech.limitations : tech.knowledgeCard?.limitations || ['Requires correct configuration'],
        alternatives: tech.alternatives?.length ? tech.alternatives : tech.knowledgeCard?.alternatives || ['Comparable ecosystem tools'],
        analogy: nonEmpty(tech.analogy || tech.knowledgeCard?.analogy, `${tech.name} is a specialized tool in the project workflow.`),
        learnNext: tech.learnNext?.length ? tech.learnNext : tech.knowledgeCard?.learnNext || [`Study ${tech.name} fundamentals`],
      };
    });

    report.blueprint.layers = (report.blueprint.layers || []).map(layer => ({
      ...layer,
      nodes: (layer.nodes || []).map((node, idx) => ({
        ...node,
        id: node.id || `${layer.name}-${idx}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        icon: node.icon || '⚙️',
        desc: nonEmpty(node.desc || node.description, `${node.name} participates in ${layer.name}.`),
        description: nonEmpty(node.description || node.desc, `${node.name} participates in ${layer.name}.`),
      })),
    }));

    report.relationships = (report.relationships || []).map((rel, idx) => ({
      ...rel,
      id: rel.id || `relationship-${idx + 1}`,
      label: nonEmpty(rel.label, 'Communicates with'),
      from: nonEmpty(rel.from || rel.sourceId, 'Source'),
      to: nonEmpty(rel.to || rel.targetId, 'Target'),
      detail: nonEmpty(rel.detail || rel.description, 'These components exchange data or control flow.'),
    }));

    report.recommendations = (report.recommendations || []).map((rec, idx) => ({
      ...rec,
      id: rec.id || `recommendation-${idx + 1}`,
      type: nonEmpty(rec.type || rec.category, 'recommendation'),
      body: nonEmpty(rec.body || rec.summary || rec.rationale, 'Review this recommendation before production use.'),
      benefit: nonEmpty(rec.benefit || rec.impact, 'Improves project quality.'),
      effort: nonEmpty(rec.effort, 'Medium'),
    }));

    return report;
  }
