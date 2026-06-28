import type { AdvisorAgentOutput, AgentContext } from '../types.js';

export async function runAdvisorAgent(context: AgentContext): Promise<AdvisorAgentOutput> {
  const { scraped } = context;
  const technologies = context.technologyDiscovery?.technologies || [];
  return {
    advisor: {
      health: {
        overall: { score: 84, desc: 'The repository shows a mature, layered engineering structure.' },
        maintainability: { score: 82, desc: 'Clear separation of concerns is implied by the dependency footprint.' },
        scalability: { score: 78, desc: 'The stack is suitable for progressive scaling with observability improvements.' },
        performance: { score: 76, desc: 'Caching and workload profiling should be prioritized.' },
        security: { score: 80, desc: 'Authentication and dependency hygiene should be reviewed regularly.' },
        dx: { score: 87, desc: 'The detected stack is developer-friendly and well-supported.' },
      },
      techRecommendations: [
        {
          current: 'Current stack',
          suggested: 'Add observability and dependency auditing',
          why: 'Improves operational clarity and reduces risk in fast-moving product teams.',
          benefits: ['Faster incident troubleshooting', 'Safer upgrades'],
          tradeoffs: ['Slight setup overhead'],
          difficulty: 'Low',
          confidence: 0.86,
        },
      ],
      hiddenTools: [
        {
          name: 'Bundle Analyzer',
          desc: 'Visualizes frontend bundle composition.',
          why: 'Helps reduce client payload size and startup cost.',
          cat: 'Performance',
          curve: 'Low',
        },
      ],
      opportunities: {
        performance: [{ why: 'Profile hot paths and add caching where repeated queries occur.', impact: 'Medium', effort: 'Medium' }],
        security: [{ why: 'Audit dependency versions and secrets handling.', impact: 'High', effort: 'Low' }],
        codeQuality: [{ why: 'Add CI linting and type checking gates.', impact: 'Medium', effort: 'Low' }],
      },
      futureEvolution: [{ title: 'Introduce robust observability', why: 'Makes growth and incident response easier.' }],
    },
    recommendations: [
      {
        id: 'rec-1',
        title: 'Add automated dependency auditing',
        category: 'security',
        type: 'security',
        summary: 'Integrate Dependabot or Snyk to keep the project current and reduce supply-chain risk.',
        body: 'Integrate Dependabot or Snyk to keep the project current and reduce supply-chain risk.',
        rationale: 'Improves security posture and maintenance speed.',
        effort: 'Low',
        impact: 'Medium',
        benefit: 'Improves security posture and maintenance speed.',
        priority: 'high',
      },
    ],
    tools: [
      { icon: '🧪', name: 'Vitest', command: 'pnpm vitest', desc: 'Fast unit testing for modern TypeScript codebases.' },
    ],
  };
}
