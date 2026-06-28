import { withRetry } from '../../services/retry.js';
import { runPlannerAgent } from './planner/index.js';
import { runTechnologyAgent } from './technology/index.js';
import { runArchitectureAgent } from './architecture/index.js';
import { runKnowledgeAgent } from './knowledge/index.js';
import { runRelationshipAgent } from './relationships/index.js';
import { runAdvisorAgent } from './advisor/index.js';
import { runRoadmapAgent } from './roadmap/index.js';
import { runConfidenceAgent } from './confidence/index.js';
import { runReportAgent } from './report/index.js';
export async function runModularWirePipeline(scraped, onProgress, options = {}) {
    const sessionId = `DNA-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
    const context = { scraped, sessionId };
    const { signal, timeoutMs = 180_000 } = options;
    const throwIfCancelled = () => {
        if (signal?.aborted) {
            throw new Error('Wire execution cancelled');
        }
    };
    const logStep = (name, stage, status) => {
        console.info(`[Wire][${stage}] ${name}: ${status}`);
    };
    const pipeline = [
        {
            name: 'Planner Agent',
            run: async (ctx) => {
                const output = await runPlannerAgent({ ...ctx, scraped: ctx.scraped });
                ctx.planner = output;
                return output;
            },
            stage: 1,
            pct: 10,
        },
        {
            name: 'Technology Discovery Agent',
            run: async (ctx) => {
                const output = await runTechnologyAgent(ctx);
                ctx.technologyDiscovery = output;
                return output;
            },
            stage: 2,
            pct: 25,
        },
        {
            name: 'Architecture Reconstruction Agent',
            run: async (ctx) => {
                const output = await runArchitectureAgent(ctx);
                ctx.architecture = output;
                return output;
            },
            stage: 3,
            pct: 40,
        },
        {
            name: 'Engineering Knowledge Agent',
            run: async (ctx) => {
                const output = await runKnowledgeAgent(ctx);
                ctx.knowledge = output;
                return output;
            },
            stage: 4,
            pct: 55,
        },
        {
            name: 'Relationship Intelligence Agent',
            run: async (ctx) => {
                const output = await runRelationshipAgent(ctx);
                ctx.relationships = output;
                return output;
            },
            stage: 5,
            pct: 70,
        },
        {
            name: 'Engineering Advisor Agent',
            run: async (ctx) => {
                const output = await runAdvisorAgent(ctx);
                ctx.advisor = output;
                return output;
            },
            stage: 6,
            pct: 82,
        },
        {
            name: 'Learning Roadmap Agent',
            run: async (ctx) => {
                const output = await runRoadmapAgent(ctx);
                ctx.roadmap = output;
                return output;
            },
            stage: 7,
            pct: 92,
        },
        {
            name: 'Build Confidence Agent',
            run: async (ctx) => {
                const output = await runConfidenceAgent(ctx);
                ctx.confidence = output;
                return output;
            },
            stage: 8,
            pct: 100,
        },
    ];
    const deadline = Date.now() + timeoutMs;
    for (const step of pipeline) {
        throwIfCancelled();
        const status = `${step.name}: Processing repository context...`;
        logStep(step.name, step.stage, status);
        await onProgress({ stage: step.stage, status, pct: step.pct });
        const startedAt = Date.now();
        try {
            await withRetry(() => step.run(context), { maxAttempts: 2 });
        }
        catch (error) {
            const elapsedMs = Date.now() - startedAt;
            console.error(`[Wire] ${step.name} failed after ${elapsedMs}ms`, error);
            throw error;
        }
        if (Date.now() > deadline) {
            throw new Error(`Wire execution timed out after ${timeoutMs}ms`);
        }
    }
    const report = await runReportAgent(context);
    return report.report;
}
//# sourceMappingURL=orchestrator.js.map