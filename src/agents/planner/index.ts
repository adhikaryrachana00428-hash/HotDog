import type { AgentContext, PlannerAgentOutput } from '../types.js';

export async function runPlannerAgent(context: AgentContext): Promise<PlannerAgentOutput> {
  const { scraped } = context;
  const dependencyFiles = Object.keys(scraped.dependencyFiles);
  const hasPackageJson = dependencyFiles.includes('package.json');
  const hasPython = dependencyFiles.some(file => ['requirements.txt', 'pyproject.toml'].includes(file));
  const inferredType = hasPython
    ? 'Python service or data-centric application'
    : hasPackageJson
      ? 'JavaScript/TypeScript application'
      : 'Repository with mixed engineering assets';

  const analysisPlan = [
    'Inspect dependency manifests and repository metadata',
    'Reconstruct architectural layers from detected technologies',
    'Enrich each technology with implementation knowledge and trade-offs',
    'Generate relationships, recommendations, and learning guidance',
  ];

  const priority = [
    'Architecture and runtime boundaries',
    'Primary frameworks and data layer',
    'Developer experience and operational readiness',
  ];

  const missingContext = [
    ...(scraped.readme ? [] : ['Repository README or project overview']),
    ...(dependencyFiles.length === 0 ? ['Dependency manifests'] : []),
    ...(scraped.githubMeta?.description ? [] : ['Project purpose summary']),
    'Deployment and environment configuration',
  ];

  return {
    projectType: inferredType,
    analysisPlan,
    priority,
    missingContext,
  };
}
