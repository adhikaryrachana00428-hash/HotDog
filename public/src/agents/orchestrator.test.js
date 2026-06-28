import test from 'node:test';
import assert from 'node:assert/strict';
import { runModularWirePipeline } from './orchestrator.js';
test('runModularWirePipeline produces a complete report payload', async () => {
    const scraped = {
        url: 'https://github.com/example/next-starter',
        scrapedAt: new Date().toISOString(),
        repoName: 'next-starter',
        primaryLanguage: 'TypeScript',
        readme: '# Next Starter',
        markdown: '# Next Starter\nA full-stack application with Next.js, Prisma, and PostgreSQL.',
        folderStructure: ['src', 'prisma'],
        dependencyFiles: {
            'package.json': JSON.stringify({
                dependencies: {
                    next: '^14.0.0',
                    react: '^18.0.0',
                    prisma: '^5.0.0',
                },
                devDependencies: {
                    typescript: '^5.0.0',
                    tailwindcss: '^3.0.0',
                },
            }),
        },
        githubMeta: {
            fullName: 'example/next-starter',
            description: 'A modern starter project.',
            language: 'TypeScript',
            topics: ['nextjs', 'typescript'],
            stars: 120,
            defaultBranch: 'main',
            dependencyFiles: {
                'package.json': JSON.stringify({ dependencies: { next: '^14.0.0' } }),
            },
        },
        rawPayload: {},
    };
    const report = await runModularWirePipeline(scraped, async () => undefined);
    assert.equal(report.repoName, 'next-starter');
    assert.ok(report.technologies.length >= 3);
    assert.ok(report.relationships.length >= 1);
    assert.ok(report.roadmap.length >= 1);
    assert.ok(report.advisor.health.overall);
    assert.ok(report.confidenceAssessment.recreationDifficulty);
    assert.ok(report.summary.stats.techCount >= 1);
});
//# sourceMappingURL=orchestrator.test.js.map