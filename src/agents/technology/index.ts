import type { AgentContext, TechnologyAgentOutput } from '../types.js';
import type { Technology } from '../../../types/schema.js';

const TECHNOLOGY_REGISTRY: Record<string, Omit<Technology, 'key' | 'insight' | 'whyProjectUses'>> = {
  next: { name: 'Next.js', cat: 'frontend', catDisplay: 'Frontend · Framework', logoText: '▲', logoClass: 'tc-logo--dark', role: 'React meta-framework for routing, SSR, and API routes.', whatItIs: 'A React framework with file-system routing and server rendering.', whyExists: 'Provides opinionated routing, rendering, and deployment patterns for modern web apps.', advantages: ['Unified frontend and API', 'Edge deployment support'], limitations: ['Learning curve for App Router'], alternatives: ['Remix', 'SvelteKit', 'Astro'], analogy: 'A blueprint for a full-stack application.', learnNext: ['App Router conventions', 'Server Components'] },
  react: { name: 'React', cat: 'frontend', catDisplay: 'Frontend · Library', logoText: '⚛️', logoClass: 'tc-logo--dark', role: 'Component-based UI library.', whatItIs: 'JavaScript library for building user interfaces with components.', whyExists: 'Enables reusable, declarative UI at scale.', advantages: ['Large ecosystem', 'Component model'], limitations: ['Requires companion libraries for routing/data'], alternatives: ['Vue', 'Svelte', 'Solid'], analogy: 'Lego blocks for user interfaces.', learnNext: ['Hooks', 'Component patterns'] },
  typescript: { name: 'TypeScript', cat: 'language', catDisplay: 'Language', logoText: 'TS', logoClass: 'tc-logo--ts', role: 'Statically typed JavaScript superset.', whatItIs: 'Typed superset of JavaScript compiled to plain JavaScript.', whyExists: 'Catches type errors at compile time in large codebases.', advantages: ['Type safety', 'Better IDE support'], limitations: ['Compilation overhead'], alternatives: ['JavaScript + JSDoc'], analogy: 'GPS that warns before wrong turns.', learnNext: ['Strict mode', 'Generics'] },
  prisma: { name: 'Prisma', cat: 'backend', catDisplay: 'Backend · ORM', logoText: '◈', logoClass: 'tc-logo--prisma', role: 'Type-safe database ORM.', whatItIs: 'Schema-first ORM generating a typed database client.', whyExists: 'Eliminates untyped SQL strings in application code.', advantages: ['Auto-generated types', 'Migration tooling'], limitations: ['Cold start overhead on serverless'], alternatives: ['Drizzle', 'Kysely'], analogy: 'A translator between TypeScript and SQL.', learnNext: ['Schema modeling', 'Migrations'] },
  postgres: { name: 'PostgreSQL', cat: 'database', catDisplay: 'Database · Relational', logoText: '🐘', logoClass: 'tc-logo--postgres', role: 'Primary relational database.', whatItIs: 'ACID-compliant open-source relational database.', whyExists: 'Structured data requires transactional integrity.', advantages: ['Reliability', 'Rich query features'], limitations: ['Scaling requires planning'], alternatives: ['MySQL', 'SQLite'], analogy: 'A professional librarian for your data.', learnNext: ['Indexing', 'Query optimization'] },
  tailwindcss: { name: 'Tailwind CSS', cat: 'frontend', catDisplay: 'Frontend · Styling', logoText: 'TW', logoClass: 'tc-logo--dark', role: 'Utility-first CSS framework.', whatItIs: 'CSS framework using composable utility classes.', whyExists: 'Speeds UI development without writing custom CSS files.', advantages: ['Rapid prototyping', 'Consistent design tokens'], limitations: ['Verbose class names in markup'], alternatives: ['CSS Modules', 'Styled Components'], analogy: 'Pre-cut fabric pieces you stitch together.', learnNext: ['Design tokens', 'Responsive utilities'] },
  clerk: { name: 'Clerk', cat: 'auth', catDisplay: 'Auth · Identity', logoText: '🔐', logoClass: 'tc-logo--clerk', role: 'Hosted authentication platform.', whatItIs: 'Managed auth with sign-in UI and session management.', whyExists: 'Auth is security-critical and difficult to build correctly.', advantages: ['Zero auth infrastructure', 'Pre-built UI'], limitations: ['Vendor dependency'], alternatives: ['Auth.js', 'Better Auth'], analogy: 'Security desk at a building entrance.', learnNext: ['Middleware validation', 'Organization tenants'] },
  redis: { name: 'Redis', cat: 'database', catDisplay: 'Database · Cache', logoText: '⚡', logoClass: 'tc-logo--redis', role: 'In-memory cache and message broker.', whatItIs: 'In-memory data store for caching and pub/sub.', whyExists: 'Disk databases are too slow for sessions and hot cache data.', advantages: ['Sub-millisecond latency', 'TTL expiration'], limitations: ['Memory-bound storage'], alternatives: ['Memcached', 'Upstash'], analogy: 'Books on your desk instead of in the library archive.', learnNext: ['Cache invalidation', 'Session storage'] },
  express: { name: 'Express', cat: 'backend', catDisplay: 'Backend · Framework', logoText: 'Ex', logoClass: 'tc-logo--dark', role: 'Minimal Node.js HTTP server framework.', whatItIs: 'Lightweight routing and middleware framework for Node.js.', whyExists: 'Provides HTTP routing without heavy opinions.', advantages: ['Minimal', 'Large middleware ecosystem'], limitations: ['Unopinionated structure'], alternatives: ['Fastify', 'Hono', 'NestJS'], analogy: 'A bare workshop — you bring the tools.', learnNext: ['Middleware chains', 'Router patterns'] },
  django: { name: 'Django', cat: 'backend', catDisplay: 'Full Stack · Framework', logoText: 'D', logoClass: 'tc-logo--dark', role: 'Batteries-included Python web framework.', whatItIs: 'High-level Python framework with ORM, admin, and auth built in.', whyExists: 'Reduces boilerplate for common web application patterns.', advantages: ['Built-in admin', 'Security defaults'], limitations: ['Monolithic scaling model'], alternatives: ['Flask', 'FastAPI'], analogy: 'A furnished gated community with everything pre-built.', learnNext: ['MTV pattern', 'ORM migrations'] },
};

export async function runTechnologyAgent(context: AgentContext): Promise<TechnologyAgentOutput> {
  const { scraped } = context;
  const detected = new Map<string, Technology>();
  const dependencyFiles = Object.values(scraped.dependencyFiles);
  const searchText = [scraped.markdown, ...dependencyFiles, scraped.githubMeta?.description || '', ...(scraped.githubMeta?.topics || [])].join('\n').toLowerCase();

  const addTech = (key: string, insight: string) => {
    const base = TECHNOLOGY_REGISTRY[key];
    if (!base || detected.has(key)) return;
    detected.set(key, {
      id: key,
      name: base.name,
      category: base.cat,
      displayCategory: base.catDisplay,
      role: base.role,
      insight,
      key,
      cat: base.cat,
      catDisplay: base.catDisplay,
      whatItIs: base.whatItIs,
      whyExists: base.whyExists,
      whyProjectUses: insight,
      advantages: base.advantages,
      limitations: base.limitations,
      alternatives: base.alternatives,
      analogy: base.analogy,
      learnNext: base.learnNext,
    });
  };

  if (scraped.dependencyFiles['package.json']) {
    try {
      const manifest = JSON.parse(scraped.dependencyFiles['package.json']) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
      const deps = { ...(manifest.dependencies || {}), ...(manifest.devDependencies || {}) };
      for (const dep of Object.keys(deps)) {
        const depKey = dep.split('/').pop()?.replace('@', '') || dep;
        if (TECHNOLOGY_REGISTRY[depKey]) addTech(depKey, `Detected in package.json as "${dep}".`);
        if (dep.includes('next')) addTech('next', 'Primary application framework listed in package.json.');
        if (dep.includes('react') && !dep.includes('react-')) addTech('react', 'UI library dependency in package.json.');
        if (dep.includes('prisma')) addTech('prisma', 'Database ORM dependency in package.json.');
        if (dep.includes('tailwind')) addTech('tailwindcss', 'Styling framework in package.json.');
        if (dep.includes('clerk')) addTech('clerk', 'Authentication provider in package.json.');
        if (dep.includes('redis') || dep.includes('ioredis')) addTech('redis', 'Caching layer dependency in package.json.');
        if (dep.includes('pg') || dep.includes('postgres')) addTech('postgres', 'PostgreSQL client dependency in package.json.');
      }
    } catch {
      // Ignore invalid manifest data.
    }
  }

  if (scraped.dependencyFiles['requirements.txt'] || scraped.dependencyFiles['pyproject.toml']) {
    addTech('django', 'Python web framework inferred from dependency files.');
  }

  if (scraped.primaryLanguage) {
    const langLower = scraped.primaryLanguage.toLowerCase();
    if (langLower.includes('typescript')) addTech('typescript', `Primary language: ${scraped.primaryLanguage}.`);
    if (langLower.includes('javascript')) addTech('react', `Primary language: ${scraped.primaryLanguage}.`);
    if (langLower.includes('python')) addTech('django', `Primary language: ${scraped.primaryLanguage}.`);
  }

  for (const [key] of Object.entries(TECHNOLOGY_REGISTRY)) {
    if (searchText.includes(key) && !detected.has(key)) {
      addTech(key, 'Referenced in repository documentation or configuration.');
    }
  }

  const technologies = [...detected.values()].slice(0, 12);
  return { technologies, detectedDependencies: technologies.map(tech => tech.key ?? tech.id ?? '') };
}
