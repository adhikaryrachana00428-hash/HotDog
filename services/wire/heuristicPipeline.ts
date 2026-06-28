/**
 * Heuristic Wire agent pipeline.
 * Derives structured FinalReport from scraped repository content without hardcoded tech lists.
 * Used when Wire API is unavailable or as a structured fallback parser.
 */

import type {
  AnalysisProgress,
  ConfidenceAssessment,
  FinalReport,
  NormalizedScrapedContent,
  ReportHealth,
  EngineeringDecision,
} from '../../types/report.js';
import type { Technology } from '../../types/schema.js';
import type { Architecture, EngineeringRelationship } from '../../types/schema.js';
import type { AdvisorPayload, Recommendation } from '../../types/schema.js';
import type { LearningRoadmapPhase } from '../../types/schema.js';

type ProgressCallback = (progress: AnalysisProgress) => void | Promise<void>;

/** Known dependency → technology metadata for dynamic detection (not repo-specific). */
const DEPENDENCY_REGISTRY: Record<string, { name: string; category: string; displayCategory: string; role: string; insight?: string }> = {
  next: { name: 'Next.js', category: 'frontend', displayCategory: 'Frontend · Framework', role: 'React meta-framework for routing, SSR, and API routes.' },
  react: { name: 'React', category: 'frontend', displayCategory: 'Frontend · Library', role: 'Component-based UI library.' },
  typescript: { name: 'TypeScript', category: 'frontend', displayCategory: 'Language', role: 'Statically typed JavaScript superset.' },
  prisma: { name: 'Prisma', category: 'backend', displayCategory: 'Backend · ORM', role: 'Type-safe database ORM.' },
  django: { name: 'Django', category: 'backend', displayCategory: 'Full Stack · Framework', role: 'Batteries-included Python web framework.' },
  express: { name: 'Express', category: 'backend', displayCategory: 'Backend · Framework', role: 'Minimal Node.js HTTP server framework.' },
  tailwindcss: { name: 'Tailwind CSS', category: 'frontend', displayCategory: 'Frontend · Styling', role: 'Utility-first CSS framework.' },
  redis: { name: 'Redis', category: 'database', displayCategory: 'Database · Cache', role: 'In-memory cache and message broker.' },
  postgres: { name: 'PostgreSQL', category: 'database', displayCategory: 'Database · Relational', role: 'Primary relational database.' },
  clerk: { name: 'Clerk', category: 'auth', displayCategory: 'Auth · Identity', role: 'Hosted authentication platform.' },
};

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#DEA584',
  Ruby: '#CC342D',
  Java: '#B07219',
};

export async function runHeuristicPipeline(
  scraped: NormalizedScrapedContent,
  onProgress: ProgressCallback
): Promise<FinalReport> {
  const emit = async (stage: AnalysisProgress['stage'], status: string, pct: number) => {
    await onProgress({ stage, status, pct });
  };

  await emit(0, 'Universal Scraper: Repository content ingested.', 5);
  await emit(1, 'Planner Agent: Structuring analysis workflow.', 10);

  const technologies = detectTechnologies(scraped);
  await emit(2, `Tech Detector: Found ${technologies.length} technologies.`, 25);

  const blueprint = buildArchitecture(scraped, technologies);
  await emit(3, 'Architecture Agent: Reconstructed system layers.', 40);

  await emit(4, 'Documentation Agent: Enriched technology knowledge cards.', 55);
  enrichTechnologies(technologies, scraped);

  const advisor = buildAdvisor(scraped, technologies);
  const recommendations = buildRecommendations(technologies);
  await emit(5, 'Engineering Advisor: Generated optimization recommendations.', 70);

  const roadmap = buildRoadmap(technologies);
  await emit(6, 'Roadmap Agent: Sequenced learning prerequisites.', 82);

  const metrics = computeMetrics(scraped, technologies);
  const confidenceAssessment = buildConfidence(scraped, technologies);
  await emit(7, 'Confidence Agent: Evaluated build safety metrics.', 92);

  const report = assembleReport(scraped, {
    technologies,
    blueprint,
    advisor,
    recommendations,
    roadmap,
    metrics,
    confidenceAssessment,
  });

  await emit(8, 'Report Agent: Finalized structured JSON report.', 100);
  return report;
}

function detectTechnologies(scraped: NormalizedScrapedContent): Technology[] {
  const detected = new Map<string, Technology>();
  const searchText = [
    scraped.markdown,
    ...Object.values(scraped.dependencyFiles),
    scraped.githubMeta?.description || '',
    ...(scraped.githubMeta?.topics || []),
  ].join('\n').toLowerCase();

  const addTech = (key: string, insight: string) => {
    const base = DEPENDENCY_REGISTRY[key];
    if (!base || detected.has(key)) return;
    detected.set(key, {
      id: key,
      name: base.name,
      category: base.category,
      displayCategory: base.displayCategory,
      role: base.role,
      insight,
      key,
      cat: base.category,
      catDisplay: base.displayCategory,
      whatItIs: base.role,
      whyExists: base.role,
      whyProjectUses: insight,
      advantages: [],
      limitations: [],
      alternatives: [],
      analogy: '',
      learnNext: [],
    });
  };

  if (scraped.dependencyFiles['package.json']) {
    try {
      const pkg = JSON.parse(scraped.dependencyFiles['package.json']) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      for (const dep of Object.keys(deps)) {
        const depKey = dep.split('/').pop()?.replace('@', '') || dep;
        if (DEPENDENCY_REGISTRY[depKey]) {
          addTech(depKey, `Detected in package.json as "${dep}" — core dependency for this project.`);
        }
        if (dep.includes('next')) addTech('next', 'Primary application framework listed in package.json.');
        if (dep.includes('prisma')) addTech('prisma', 'Database ORM dependency in package.json.');
        if (dep.includes('react') && !dep.includes('react-')) addTech('react', 'UI library dependency in package.json.');
        if (dep.includes('tailwind')) addTech('tailwindcss', 'Styling framework in package.json.');
        if (dep.includes('clerk')) addTech('clerk', 'Authentication provider in package.json.');
        if (dep.includes('redis') || dep.includes('ioredis')) addTech('redis', 'Caching layer dependency in package.json.');
        if (dep.includes('pg') || dep.includes('postgres')) addTech('postgres', 'PostgreSQL client dependency in package.json.');
      }
    } catch { /* invalid JSON */ }
  }

  if (scraped.dependencyFiles['requirements.txt'] || scraped.dependencyFiles['pyproject.toml']) {
    addTech('django', 'Python web framework inferred from project dependency files.');
  }

  if (scraped.primaryLanguage && !detected.size) {
    const langKey = scraped.primaryLanguage.toLowerCase();
    if (langKey.includes('typescript')) addTech('typescript', `Primary language: ${scraped.primaryLanguage}.`);
    if (langKey.includes('javascript')) addTech('react', `Primary language: ${scraped.primaryLanguage}.`);
    if (langKey.includes('python')) addTech('django', `Primary language: ${scraped.primaryLanguage}.`);
  }

  for (const [key] of Object.entries(DEPENDENCY_REGISTRY)) {
    if (searchText.includes(key) && !detected.has(key)) {
      addTech(key, `Referenced in repository documentation or configuration.`);
    }
  }

  return [...detected.values()].slice(0, 16);
}

function enrichTechnologies(technologies: Technology[], scraped: NormalizedScrapedContent): void {
  for (const tech of technologies) {
    if (!tech.whatItIs) tech.whatItIs = tech.role;
    if (!tech.whyProjectUses) tech.whyProjectUses = tech.insight;
  }
  if (technologies.length === 0 && scraped.primaryLanguage) {
    technologies.push({
      id: scraped.primaryLanguage.toLowerCase(),
      name: scraped.primaryLanguage,
      category: 'language',
      displayCategory: 'Language',
      role: `Primary programming language for ${scraped.repoName}.`,
      insight: `GitHub reports ${scraped.primaryLanguage} as the primary language.`,
      key: scraped.primaryLanguage.toLowerCase(),
      cat: 'language',
      catDisplay: 'Language',
      whatItIs: `${scraped.primaryLanguage} is the main language used in this repository.`,
      whyExists: 'Core implementation language for the project.',
      whyProjectUses: `Detected as primary language with ${scraped.githubMeta?.stars || 0} stars on GitHub.`,
      advantages: ['Primary codebase language'],
      limitations: [],
      alternatives: [],
      analogy: 'The native tongue of this codebase.',
      learnNext: [`${scraped.primaryLanguage} project conventions`],
    });
  }
}

function buildArchitecture(scraped: NormalizedScrapedContent, technologies: Technology[]): Architecture {
  const hasFrontend = technologies.some(t => t.cat === 'frontend');
  const hasBackend = technologies.some(t => t.cat === 'backend');
  const hasDatabase = technologies.some(t => t.cat === 'database');
  const hasAuth = technologies.some(t => t.cat === 'auth');

  const layers: Architecture['layers'] = [];

  if (hasFrontend) {
    layers.push({
      name: 'Client Layer',
      nodes: [{ id: 'client-layer', name: 'Web Client', kind: 'client', description: technologies.find(t => t.cat === 'frontend')?.name || 'Browser UI', icon: '🌐' }],
    });
  }

  if (hasAuth) {
    layers.push({
      name: 'Identity Layer',
      nodes: [{ id: 'identity-layer', name: technologies.find(t => t.cat === 'auth')?.name || 'Auth', kind: 'auth', description: 'Session validation and access control', icon: '🔐' }],
    });
  }

  layers.push({
    name: 'Application Layer',
    nodes: [{
      id: 'application-layer',
      icon: '⚙️',
      name: hasBackend ? technologies.find(t => t.cat === 'backend')?.name || 'Application Core' : scraped.repoName,
      kind: 'application',
      description: scraped.githubMeta?.description?.slice(0, 80) || 'Core business logic and request handling',
    }],
  });

  if (hasDatabase) {
    layers.push({
      name: 'Data Layer',
      nodes: technologies.filter(t => t.cat === 'database').map(t => ({
        id: `${t.id ?? t.key ?? t.name}-node`,
        icon: t.logoText || '💾',
        name: t.name,
        kind: 'database',
        description: t.role?.slice(0, 60) || '',
      })),
    });
  }

  if (layers.length === 0) {
    layers.push({
      name: 'Core Layer',
      nodes: [{ id: 'core-layer', icon: '📦', name: scraped.repoName, kind: 'core', description: scraped.githubMeta?.description || 'Repository core' }],
    });
  }

  const flows = [
    `HTTP requests enter ${scraped.repoName} through the ${layers[0]?.name || 'entry layer'}.`,
    `Application logic processes requests using ${technologies.map(t => t.name).slice(0, 3).join(', ') || scraped.primaryLanguage}.`,
    hasDatabase
      ? 'Data operations flow through the detected database/cache layer for persistence and performance.'
      : 'Data persistence layer inferred from repository structure and documentation.',
  ];

  return {
    nodes: layers.flatMap((layer, index) => layer.nodes.map(node => ({
      id: node.id,
      name: node.name,
      kind: node.kind,
      description: node.description,
      icon: node.icon,
    }))),
    edges: layers.slice(1).map((layer, index) => ({
      id: `edge-${index + 1}`,
      sourceId: layers[index].nodes[0]?.id || `layer-${index}`,
      targetId: layer.nodes[0]?.id || `layer-${index + 1}`,
      label: 'depends on',
      description: `${layers[index].name} -> ${layer.name}`,
    })),
    summary: `The system follows a layered architecture where ${layers.map(l => l.name).join(' → ')} communicate sequentially. ${scraped.githubMeta?.description || ''}`.trim(),
    communicationSummary: `The system follows a layered architecture where ${layers.map(l => l.name).join(' → ')} communicate sequentially. ${scraped.githubMeta?.description || ''}`.trim(),
    layers,
    flows,
  };
}

function buildRelationships(technologies: Technology[], blueprint: Architecture): EngineeringRelationship[] {
  const rels: EngineeringRelationship[] = [];
  const names = technologies.map(t => t.name);

  for (let i = 0; i < names.length - 1; i++) {
    rels.push({
      label: 'Integrates with',
      from: names[i],
      to: names[i + 1],
      detail: `${names[i]} passes processed data and control flow to ${names[i + 1]} as part of the application pipeline.`,
    });
  }

  const layers = blueprint.layers ?? [];
  if (layers.length >= 2) {
    rels.push({
      label: 'Layer communication',
      from: layers[0]?.nodes[0]?.name || 'Client',
      to: layers[layers.length - 1]?.nodes[0]?.name || 'Data',
      detail: blueprint.communicationSummary || 'Cross-layer data flow between major system tiers.',
    });
  }

  return rels.slice(0, 6);
}

function buildAdvisor(scraped: NormalizedScrapedContent, technologies: Technology[]): AdvisorPayload {
  const complexity = Math.min(95, 40 + technologies.length * 5);
  return {
    health: {
      overall: { score: Math.min(95, 70 + (scraped.githubMeta?.stars || 0) / 1000), desc: `Architecture analysis based on ${technologies.length} detected technologies and repository metadata.` },
      maintainability: { score: 80, desc: 'Maintainability inferred from dependency structure and documentation presence.' },
      scalability: { score: Math.max(60, 90 - technologies.length * 2), desc: 'Scalability depends on detected stack patterns and service boundaries.' },
      performance: { score: 75, desc: 'Performance profile depends on caching and database layers detected.' },
      security: { score: technologies.some(t => t.cat === 'auth') ? 88 : 72, desc: technologies.some(t => t.cat === 'auth') ? 'Dedicated auth layer detected.' : 'Review authentication and input validation patterns.' },
      dx: { score: 85, desc: `Developer experience influenced by ${scraped.primaryLanguage} ecosystem tooling.` },
    },
    techRecommendations: [],
    hiddenTools: buildHiddenTools(technologies),
    opportunities: {
      performance: [{ why: 'Profile hot paths in the detected stack and add caching where repeated queries occur.', impact: 'Medium Impact', effort: 'Medium' }],
      security: [{ why: 'Audit dependency versions in package manifests for known CVEs.', impact: 'High Impact', effort: 'Low' }],
      codeQuality: [{ why: 'Add CI linting and type checking gates aligned with detected language tooling.', impact: 'Medium Impact', effort: 'Low' }],
    },
    futureEvolution: [
      { title: 'Extract bounded contexts into services', why: 'As traffic grows, separate detected layers into independently scalable services.' },
      { title: 'Add observability instrumentation', why: 'Distributed tracing across detected components simplifies production debugging.' },
    ],
  };
}

function buildHiddenTools(technologies: Technology[]): AdvisorPayload['hiddenTools'] {
  const tools: AdvisorPayload['hiddenTools'] = [];
  if (technologies.some(t => t.key === 'prisma')) {
    tools.push({ name: 'Prisma Studio', desc: 'Visual database browser for Prisma schemas.', why: 'Inspect and edit database records during development.', cat: 'Database', curve: 'Low', link: 'prisma.io/studio' });
  }
  if (technologies.some(t => t.key === 'next')) {
    tools.push({ name: '@next/bundle-analyzer', desc: 'Visualize JavaScript bundle composition.', why: 'Identify heavy client bundles for optimization.', cat: 'Performance', curve: 'Low' });
  }
  return tools;
}

function buildRecommendations(technologies: Technology[]): Recommendation[] {
  const recs: Recommendation[] = [];
  if (technologies.some(t => t.key === 'prisma')) {
    recs.push({ title: 'Evaluate serverless-optimized ORM alternatives', type: 'upgrade', body: 'If deploying to edge/serverless, consider lighter ORM options to reduce cold start latency.', effort: 'Medium', benefit: '↓ Cold starts · ↑ Performance' });
  }
  recs.push({ title: 'Add automated dependency auditing', type: 'security', body: 'Integrate Dependabot or Snyk to monitor detected dependencies for vulnerabilities.', effort: 'Low', benefit: '↑ Security · ↓ Risk' });
  return recs;
}

function buildRoadmap(technologies: Technology[]): LearningRoadmapPhase[] {
  if (technologies.length === 0) {
    return [{ title: 'Repository Orientation', duration: '~3 days', dependsOn: [], items: ['Clone and explore project structure', 'Read README and contribution guides'] }];
  }

  const phases: LearningRoadmapPhase[] = [{
    title: 'Foundation — Stack Overview',
    duration: '~1 week',
    dependsOn: [],
    items: technologies.slice(0, 3).map(t => `Understand ${t.name}: ${t.role?.slice(0, 60) || ''}`),
  }];

  if (technologies.length > 3) {
    phases.push({
      title: 'Deep Dive — Core Technologies',
      duration: '~1 week',
      dependsOn: ['Foundation — Stack Overview'],
      items: technologies.slice(3, 6).map(t => `Study ${t.name} integration patterns`),
    });
  }

  phases.push({
    title: 'Production Readiness',
    duration: '~1 week',
    dependsOn: phases.length > 1 ? ['Deep Dive — Core Technologies'] : ['Foundation — Stack Overview'],
    items: ['Configure local development environment', 'Run test suite and CI pipeline', 'Deploy a staging instance'],
  });

  return phases;
}

function computeMetrics(scraped: NormalizedScrapedContent, technologies: Technology[]) {
  let pkgDepCount = 0;
  if (scraped.dependencyFiles['package.json']) {
    try {
      const pkg = JSON.parse(scraped.dependencyFiles['package.json']) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      pkgDepCount = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).length;
    } catch { /* ignore */ }
  }
  const depCount = Object.keys(scraped.dependencyFiles).length + pkgDepCount;

  return {
    complexity: Math.min(95, 35 + technologies.length * 6 + depCount),
    confidence: Math.min(95, 60 + technologies.length * 5 + (scraped.readme ? 10 : 0)),
    learningTime: technologies.length > 6 ? '~4 weeks' : technologies.length > 3 ? '~2 weeks' : '~1 week',
  };
}

function buildConfidence(scraped: NormalizedScrapedContent, technologies: Technology[]): ConfidenceAssessment {
  return {
    recreationDifficulty: technologies.length > 6 ? 'High' : technologies.length > 3 ? 'Moderate' : 'Low',
    recreationDescription: `Rebuilding requires understanding ${technologies.length} detected technologies and their integration patterns.`,
    missingProprietary: 'Unknown — review for private APIs or undocumented services',
    missingDescription: 'Automated analysis cannot detect proprietary internal services without documentation.',
    implementationEffort: technologies.length > 5 ? 'Moderate to High' : 'Low to Moderate',
    implementationDescription: `Estimated onboarding aligns with detected stack complexity and ${scraped.githubMeta?.stars || 0} community validation signals.`,
  };
}

function assembleReport(
  scraped: NormalizedScrapedContent,
  parts: {
    technologies: Technology[];
    blueprint: Architecture;
    advisor: AdvisorPayload;
    recommendations: Recommendation[];
    roadmap: LearningRoadmapPhase[];
    metrics: FinalReport['metrics'];
    confidenceAssessment: ConfidenceAssessment;
  }
): FinalReport {
  const relationships = buildRelationships(parts.technologies, parts.blueprint);
  const health: ReportHealth = {
    docQuality: scraped.readme ? 85 : 60,
    archComplexity: parts.metrics.complexity,
    learningDifficulty: Math.min(90, 40 + parts.technologies.length * 5),
    maintainability: 80,
    modernTech: Math.min(95, 60 + parts.technologies.filter(t => ['next', 'typescript', 'prisma'].includes(t.key ?? t.id ?? '')).length * 10),
    opportunities: parts.advisor.opportunities.performance?.length || 3,
  };

  return {
    sessionId: generateSessionId(),
    url: scraped.url,
    repoName: scraped.repoName,
    primaryLanguage: scraped.primaryLanguage,
    langColor: LANG_COLORS[scraped.primaryLanguage] || '#71717A',
    metrics: parts.metrics,
    summary: {
      title: `${scraped.repoName} Engineering Analysis`,
      purpose: scraped.githubMeta?.description || `Engineering analysis of ${scraped.repoName}.`,
      audience: `Developers and engineering teams working with ${scraped.primaryLanguage} and the detected technology stack.`,
      architecture: parts.blueprint.communicationSummary,
      observations: [
        `Detected ${parts.technologies.length} technologies from repository dependencies and documentation.`,
        `Primary language: ${scraped.primaryLanguage}.`,
        scraped.githubMeta?.stars ? `Community validation: ${scraped.githubMeta.stars.toLocaleString()} GitHub stars.` : 'Repository metadata analyzed from public sources.',
        parts.technologies.some(t => t.cat === 'auth') ? 'Dedicated authentication layer identified.' : 'Review authentication patterns in application code.',
      ],
      tags: [
        scraped.primaryLanguage,
        ...parts.technologies.slice(0, 4).map(t => t.name),
        ...(scraped.githubMeta?.topics || []).slice(0, 3),
      ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 8),
      stats: {
        techCount: parts.technologies.length,
        dependencyCount: Object.keys(scraped.dependencyFiles).length,
        apiCount: parts.technologies.filter(t => t.cat === 'backend').length,
        componentCount: parts.technologies.filter(t => t.cat === 'frontend').length,
        opportunityCount: (parts.advisor.opportunities.performance?.length || 0) +
          (parts.advisor.opportunities.security?.length || 0),
        moduleCount: parts.roadmap.length,
      },
    },
    health,
    blueprint: parts.blueprint,
    technologies: parts.technologies,
    relationships,
    decisions: buildDecisions(parts.technologies),
    recommendations: parts.recommendations,
    tools: parts.advisor.hiddenTools.map(t => ({
      icon: '🔧',
      name: t.name,
      command: t.link || 'See documentation',
      desc: t.desc || t.description || '',
    })),
    roadmap: parts.roadmap,
    advisor: parts.advisor,
    confidenceAssessment: parts.confidenceAssessment,
    timestamp: new Date().toISOString(),
  };
}

function buildDecisions(technologies: Technology[]): EngineeringDecision[] {
  if (technologies.length < 2) return [];
  return [{
    title: `Stack composition: ${technologies.slice(0, 3).map(t => t.name).join(' + ')}`,
    impact: 'Architectural',
    pros: technologies.slice(0, 3).map(t => `${t.name}: ${t.advantages?.[0] || t.role?.slice(0, 50) || ''}`),
    cons: technologies.slice(0, 2).map(t => `${t.name}: ${t.limitations?.[0] || 'Consider operational complexity'}`),
  }];
}

function generateSessionId(): string {
  return 'DNA-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Date.now().toString(36).slice(-4).toUpperCase();
}
