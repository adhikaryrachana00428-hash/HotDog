/**
 * Wire API orchestration service.
 * Sends scraped content through Wire multi-agent pipeline and returns structured FinalReport JSON.
 */
import { FinalReportSchema, validateFinalReport } from '../types/report.js';
import { pollUntilComplete } from './poll.js';
import { withRetry } from './retry.js';
import { runModularWirePipeline } from '../src/agents/orchestrator.js';
import { runHeuristicPipeline as runLegacyHeuristicPipeline } from './wire/heuristicPipeline.js';
const WIRE_BASE_URL = process.env.WIRE_BASE_URL || process.env.ANAKIN_BASE_URL || 'https://api.anakin.io/v1';
const WIRE_API_KEY = process.env.WIRE_API_KEY || '';
const WIRE_ACTION_ID = process.env.WIRE_ACTION_ID || '';
const USE_HEURISTIC_FALLBACK = process.env.USE_HEURISTIC_FALLBACK === 'true';
export class WireOrchestrationError extends Error {
    code;
    cause;
    constructor(message, code, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = 'WireOrchestrationError';
    }
}
/** Wire agent stage definitions for progress reporting. */
const AGENT_STAGES = [
    { stage: 1, name: 'Planner Agent', pct: 10 },
    { stage: 2, name: 'Tech Detector', pct: 25 },
    { stage: 3, name: 'Architecture Agent', pct: 40 },
    { stage: 4, name: 'Documentation Agent', pct: 55 },
    { stage: 5, name: 'Engineering Advisor', pct: 70 },
    { stage: 6, name: 'Roadmap Agent', pct: 82 },
    { stage: 7, name: 'Confidence Agent', pct: 92 },
    { stage: 8, name: 'Report Agent', pct: 100 },
];
/**
 * Orchestrate Wire agents on scraped repository content.
 * Uses Wire Agentic Search or Wire Task API when configured; falls back to heuristic pipeline.
 */
export async function orchestrateAnalysis(scraped, onProgress, options = {}) {
    await onProgress({
        stage: 0,
        status: 'Universal Scraper: Repository content normalized and ready for Wire.',
        pct: 5,
    });
    if (WIRE_API_KEY) {
        try {
            return validateFinalReport(await runLiveWirePipeline(scraped, onProgress, options));
        }
        catch (error) {
            console.error('[Wire] Live pipeline failed:', error);
            if (!USE_HEURISTIC_FALLBACK) {
                throw new WireOrchestrationError('Wire orchestration failed and heuristic fallback is disabled.', 'WIRE_PIPELINE_FAILED', error);
            }
            console.warn('[Wire] Falling back to modular agent pipeline because USE_HEURISTIC_FALLBACK=true.');
        }
    }
    else if (!USE_HEURISTIC_FALLBACK) {
        throw new WireOrchestrationError('WIRE_API_KEY is required for Wire orchestration. Set USE_HEURISTIC_FALLBACK=true only for local offline testing.', 'WIRE_API_KEY_MISSING');
    }
    return validateFinalReport(await runModularWirePipeline(scraped, onProgress, options));
}
/** Live Wire pipeline using Agentic Search or Wire Task API. */
async function runLiveWirePipeline(scraped, onProgress, options = {}) {
    for (const agent of AGENT_STAGES.slice(0, 3)) {
        await onProgress({
            stage: agent.stage,
            status: `${agent.name}: Processing scraped repository content...`,
            pct: agent.pct,
        });
    }
    let wireResult;
    if (WIRE_ACTION_ID) {
        wireResult = await executeWireTask(scraped, options);
    }
    else {
        throw new WireOrchestrationError('WIRE_ACTION_ID is required. Use /wire/catalog or /wire/search to choose a Wire action for the EngineeringReport workflow.', 'WIRE_ACTION_ID_MISSING');
    }
    for (const agent of AGENT_STAGES.slice(3)) {
        await onProgress({
            stage: agent.stage,
            status: `${agent.name}: Parsing and validating agent output...`,
            pct: agent.pct,
        });
    }
    const report = parseWireOutput(wireResult, scraped);
    const validated = FinalReportSchema.safeParse(report);
    if (!validated.success) {
        console.warn('[Wire] Live output validation failed, merging with heuristic pipeline.');
        if (!USE_HEURISTIC_FALLBACK) {
            throw new WireOrchestrationError('Wire returned data that does not match EngineeringReport schema.', 'WIRE_SCHEMA_INVALID', validated.error);
        }
        console.warn('[Wire] Live output validation failed, merging with heuristic pipeline because USE_HEURISTIC_FALLBACK=true.');
        const heuristic = await runModularWirePipeline(scraped, onProgress, options);
        return validateFinalReport(mergeReports(heuristic, report));
    }
    await onProgress({
        stage: 8,
        status: 'Report Agent: Structured JSON validated and finalized.',
        pct: 100,
    });
    return validateFinalReport(validated.data);
}
/** Execute a pre-built Wire action with scraped content as parameters. */
async function executeWireTask(scraped, options = {}) {
    const submit = await wireFetch('/wire/task', {
        method: 'POST',
        body: JSON.stringify({
            action_id: WIRE_ACTION_ID,
            params: {
                url: scraped.url,
                repo_name: scraped.repoName,
                markdown: scraped.markdown.slice(0, 50_000),
                primary_language: scraped.primaryLanguage,
                dependency_files: scraped.dependencyFiles,
            },
        }),
    }, options);
    const jobId = submit.job_id || submit.jobId || submit.id;
    if (!jobId) {
        throw new WireOrchestrationError('Wire task did not return a job ID.', 'NO_JOB_ID');
    }
    const result = await pollUntilComplete(() => wireFetch(`/wire/jobs/${jobId}`, undefined, options), { intervalMs: 3000, timeoutMs: 180_000 });
    return (result.result || result.data || result);
}
/** Use Wire Agentic Search for multi-stage engineering analysis. */
async function executeAgenticSearch(scraped, options = {}) {
    const prompt = buildAgenticSearchPrompt(scraped);
    const submit = await withRetry(() => wireFetch('/agentic-search', {
        method: 'POST',
        body: JSON.stringify({ prompt, max_sources: 8 }),
    }, options), { maxAttempts: 2 });
    const jobId = submit.job_id || submit.jobId || submit.id;
    if (!jobId)
        throw new WireOrchestrationError('Agentic search did not return a job ID.', 'NO_JOB_ID');
    const result = await pollUntilComplete(() => wireFetch(`/agentic-search/${jobId}`), { intervalMs: 5000, timeoutMs: 300_000 });
    return {
        report: result.report,
        ...(result.result || result.data || {}),
    };
}
function buildAgenticSearchPrompt(scraped) {
    return `Analyze the GitHub repository "${scraped.repoName}" (${scraped.url}) as a senior engineering auditor.

Primary language: ${scraped.primaryLanguage}
Description: ${scraped.githubMeta?.description || 'N/A'}

Return a JSON object matching this engineering intelligence schema with fields:
sessionId, url, repoName, primaryLanguage, metrics, summary, health, blueprint, technologies, relationships, decisions, recommendations, tools, roadmap, advisor, confidenceAssessment.

Repository content:
${scraped.markdown.slice(0, 30_000)}

Dependency files:
${Object.entries(scraped.dependencyFiles).map(([k, v]) => `--- ${k} ---\n${v.slice(0, 3000)}`).join('\n\n')}`;
}
/** Parse Wire/agentic output into FinalReport, extracting JSON from text if needed. */
function parseWireOutput(wireResult, scraped) {
    // Direct JSON object in result
    if (wireResult.technologies && wireResult.summary) {
        return wireResult;
    }
    // JSON embedded in report string
    const reportText = typeof wireResult.report === 'string' ? wireResult.report : JSON.stringify(wireResult);
    const jsonMatch = reportText.match(/\{[\s\S]*"technologies"[\s\S]*\}/);
    if (jsonMatch) {
        try {
            const parsed = JSON.parse(jsonMatch[0]);
            parsed.url = parsed.url || scraped.url;
            parsed.repoName = parsed.repoName || scraped.repoName;
            parsed.timestamp = parsed.timestamp || new Date().toISOString();
            parsed.sessionId = parsed.sessionId || generateSessionId();
            return parsed;
        }
        catch { /* continue to heuristic merge */ }
    }
    throw new WireOrchestrationError('Could not parse structured JSON from Wire response.', 'PARSE_FAILED');
}
function mergeReports(base, partial) {
    return {
        ...base,
        ...partial,
        summary: { ...base.summary, ...partial.summary },
        metrics: { ...base.metrics, ...partial.metrics },
        technologies: partial.technologies?.length ? partial.technologies : base.technologies,
        blueprint: partial.blueprint?.layers?.length ? partial.blueprint : base.blueprint,
        advisor: { ...base.advisor, ...partial.advisor },
    };
}
function generateSessionId() {
    return 'DNA-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Date.now().toString(36).slice(-4).toUpperCase();
}
async function wireFetch(path, init = {}, options = {}) {
    const controller = new AbortController();
    const timeoutMs = options.timeoutMs ?? 60_000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const onAbort = () => controller.abort();
    options.signal?.addEventListener('abort', onAbort, { once: true });
    try {
        const response = await fetch(`${WIRE_BASE_URL}${path}`, {
            ...init,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': WIRE_API_KEY,
                ...init.headers,
            },
        });
        if (!response.ok) {
            const body = await response.text();
            throw new WireOrchestrationError(`Wire API error (${response.status}): ${body}`, 'WIRE_API_ERROR');
        }
        return response.json();
    }
    catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new WireOrchestrationError('Wire request timed out or was cancelled.', 'WIRE_ABORTED', error);
        }
        throw error;
    }
    finally {
        clearTimeout(timeoutId);
        options.signal?.removeEventListener('abort', onAbort);
    }
}
export { runLegacyHeuristicPipeline as runHeuristicPipeline };
//# sourceMappingURL=wire.js.map