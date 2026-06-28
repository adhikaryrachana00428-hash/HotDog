/**
 * Analysis API routes.
 * POST /api/analyze — SSE stream with progress + final report
 * GET  /api/analyze/:sessionId — retrieve cached report
 */
import { Router } from 'express';
import { scrapeRepository, AnakinScraperError } from '../../services/anakin.js';
import { validateEngineeringUrl } from '../../services/validation.js';
import { orchestrateAnalysis, WireOrchestrationError } from '../../services/wire.js';
import { validateFinalReport } from '../../types/report.js';
export const analyzeRouter = Router();
/** In-memory session cache (use Redis in production). */
const sessionCache = new Map();
/** SSE analysis endpoint — streams progress events then final report. */
analyzeRouter.post('/analyze', async (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
        res.status(400).json({ error: 'Missing required field: url' });
        return;
    }
    const validation = validateEngineeringUrl(url);
    if (!validation.valid) {
        res.status(400).json({ error: validation.error });
        return;
    }
    // Set up Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    const sendEvent = (type, payload) => {
        res.write(`data: ${JSON.stringify({ type, payload })}\n\n`);
    };
    try {
        sendEvent('progress', { stage: 0, status: 'Validating repository URL...', pct: 1 });
        // Step 1: Anakin Universal Scraper
        sendEvent('progress', { stage: 0, status: 'Universal Scraper: Ingesting repository...', pct: 3 });
        const scraped = await scrapeRepository(validation.normalized);
        const scraperResource = scraped.rawPayload?.extractedJson;
        if (scraperResource) {
            sendEvent('progress', { stage: 0, status: 'Universal Scraper: Collected engineering context from repository.', pct: 5 });
        }
        sendEvent('progress', {
            stage: 0,
            status: `Universal Scraper: Ingested ${scraped.repoName} (${scraped.primaryLanguage}).`,
            pct: 5,
        });
        // Step 2: Wire orchestration
        const report = validateFinalReport(await orchestrateAnalysis(scraped, async (progress) => {
            sendEvent('progress', progress);
        }));
        sessionCache.set(report.sessionId, report);
        sendEvent('complete', report);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown analysis error';
        const code = error instanceof AnakinScraperError ? error.code :
            error instanceof WireOrchestrationError ? error.code :
                'ANALYSIS_FAILED';
        sendEvent('error', { message, code });
    }
    finally {
        res.end();
    }
});
/** Retrieve a previously generated report by session ID. */
analyzeRouter.get('/analyze/:sessionId', (req, res) => {
    const report = sessionCache.get(req.params.sessionId);
    if (!report) {
        res.status(404).json({ error: 'Session not found or expired.' });
        return;
    }
    res.json(report);
});
/** Validate a URL without running analysis. */
analyzeRouter.post('/validate-url', (req, res) => {
    const { url } = req.body;
    if (!url) {
        res.status(400).json({ valid: false, error: 'URL is required.' });
        return;
    }
    res.json(validateEngineeringUrl(url));
});
//# sourceMappingURL=analyze.js.map