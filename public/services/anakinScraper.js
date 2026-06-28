import { withRetry } from './retry.js';
import { validateGitHubUrl } from './validation.js';
export class AnakinScraperError extends Error {
    code;
    statusCode;
    constructor(message, code, statusCode) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'AnakinScraperError';
    }
}
const ANAKIN_BASE_URL = process.env.ANAKIN_BASE_URL || 'https://api.anakin.io/v1';
const ANAKIN_API_KEY = process.env.ANAKIN_API_KEY || '';
export async function scrapeEngineeringResource(request) {
    const validation = validateScrapeUrl(request.url);
    if (!validation.valid) {
        throw new AnakinScraperError(validation.error, 'INVALID_URL', 400);
    }
    const normalizedUrl = validation.normalized;
    const sourceType = request.sourceType || inferSourceType(normalizedUrl);
    const logContext = { url: normalizedUrl, sourceType };
    console.info('[AnakinScraper] Starting scrape', logContext);
    try {
        const raw = await withRetry(() => fetchFromAnakin(normalizedUrl), {
            maxAttempts: 3,
            shouldRetry: (error, attempt) => {
                if (error instanceof AnakinScraperError) {
                    return ['429', '502', '503', '504', 'RATE_LIMIT'].includes(error.code) || (error.statusCode ? error.statusCode >= 500 : false);
                }
                return attempt < 3;
            },
        });
        const resource = normalizeScrapeResult(raw, normalizedUrl, sourceType);
        console.info('[AnakinScraper] Scrape completed', { url: normalizedUrl, title: resource.title });
        return { resource, warnings: [] };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown scrape error';
        const code = error instanceof AnakinScraperError ? error.code : 'SCRAPE_FAILED';
        const statusCode = error instanceof AnakinScraperError ? error.statusCode : undefined;
        console.error('[AnakinScraper] Scrape failed', { ...logContext, message, code, statusCode });
        throw new AnakinScraperError(message, code, statusCode);
    }
}
function validateScrapeUrl(input) {
    const trimmed = input.trim();
    if (!trimmed) {
        return { valid: false, error: 'URL is required.' };
    }
    let parsed;
    try {
        parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    }
    catch {
        return { valid: false, error: 'Invalid URL format.' };
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { valid: false, error: 'Only http and https URLs are supported.' };
    }
    if (!parsed.hostname) {
        return { valid: false, error: 'URL hostname is required.' };
    }
    const githubValidation = validateGitHubUrl(trimmed);
    if (githubValidation.valid) {
        return { valid: true, normalized: githubValidation.normalized };
    }
    return { valid: true, normalized: parsed.toString() };
}
async function fetchFromAnakin(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
        const submitResponse = await fetch(`${ANAKIN_BASE_URL}/url-scraper`, {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...(ANAKIN_API_KEY ? { 'X-API-Key': ANAKIN_API_KEY } : {}),
            },
            body: JSON.stringify({ url, useBrowser: true, generateJson: true }),
        });
        if (!submitResponse.ok) {
            const body = await submitResponse.text();
            const code = submitResponse.status === 429 ? 'RATE_LIMIT' : submitResponse.status >= 500 ? 'UPSTREAM_FAILURE' : 'SCRAPE_FAILED';
            throw new AnakinScraperError(`Anakin request failed (${submitResponse.status}): ${body}`, code, submitResponse.status);
        }
        const submit = (await submitResponse.json());
        const jobId = submit.job_id || submit.jobId || submit.id;
        if (!jobId) {
            throw new AnakinScraperError('Anakin did not return a job ID.', 'NO_JOB_ID', 502);
        }
        const result = await pollAnakinJob(jobId);
        return result;
    }
    catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new AnakinScraperError('Anakin request timed out.', 'TIMEOUT', 504);
        }
        throw error;
    }
    finally {
        clearTimeout(timeout);
    }
}
async function pollAnakinJob(jobId) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    try {
        const response = await fetch(`${ANAKIN_BASE_URL}/url-scraper/${jobId}`, {
            signal: controller.signal,
            headers: {
                ...(ANAKIN_API_KEY ? { 'X-API-Key': ANAKIN_API_KEY } : {}),
            },
        });
        if (!response.ok) {
            const body = await response.text();
            throw new AnakinScraperError(`Anakin polling failed (${response.status}): ${body}`, 'POLL_FAILED', response.status);
        }
        return (await response.json());
    }
    finally {
        clearTimeout(timeout);
    }
}
function normalizeScrapeResult(raw, url, sourceType) {
    const payload = raw.result || raw.data || raw;
    const extractedText = [payload.text, payload.markdown, payload.html]
        .filter(Boolean)
        .join('\n\n')
        .trim();
    const markdown = payload.markdown || '';
    const html = payload.html || '';
    const text = payload.text || '';
    const title = extractTitle(markdown, html, text, url);
    const dependencies = extractDependencies(markdown, html, text);
    const files = extractFiles(markdown, html, text);
    const technologies = extractTechnologies(markdown, html, text);
    return {
        source: sourceType,
        title,
        url,
        metadata: {
            origin: 'anakin-universal-scraper',
            fetchedAt: new Date().toISOString(),
            sourceType,
        },
        readme: markdown.slice(0, 8000),
        documentation: [markdown, html, text].filter(Boolean).join('\n\n').slice(0, 20000),
        dependencies,
        files,
        technologies,
        extractedText: extractedText.slice(0, 40000),
    };
}
function extractTitle(markdown, html, text, fallbackUrl) {
    const fromMarkdown = markdown.match(/^#\s+(.+)$/m);
    if (fromMarkdown?.[1])
        return fromMarkdown[1].trim();
    const fromHtml = html.match(/<title>([^<]+)<\/title>/i);
    if (fromHtml?.[1])
        return fromHtml[1].trim();
    const fromText = text.match(/^.{1,120}/m);
    if (fromText?.[0])
        return fromText[0].trim();
    return fallbackUrl;
}
function extractDependencies(markdown, html, text) {
    const content = [markdown, html, text].join('\n');
    const matches = Array.from(content.matchAll(/(?:npm|pnpm|yarn|pip|cargo|go|composer|maven|gradle|docker|kubernetes)[^\s\n]*/gi));
    return [...new Set(matches.map(match => match[0].toLowerCase()))].slice(0, 20);
}
function extractFiles(markdown, html, text) {
    const content = [markdown, html, text].join('\n');
    const matches = Array.from(content.matchAll(/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-\/]+|[A-Za-z0-9_.-]+\.[A-Za-z0-9_.-]+)/g));
    return [...new Set(matches.map(match => match[1]))].slice(0, 30);
}
function extractTechnologies(markdown, html, text) {
    const content = [markdown, html, text].join('\n').toLowerCase();
    const detected = new Set();
    const candidates = ['react', 'next.js', 'typescript', 'javascript', 'python', 'django', 'express', 'prisma', 'postgres', 'redis', 'tailwind', 'docker', 'kubernetes', 'graphql', 'rest', 'auth0', 'clerk'];
    for (const candidate of candidates) {
        if (content.includes(candidate))
            detected.add(candidate);
    }
    return [...detected];
}
function inferSourceType(url) {
    const lower = url.toLowerCase();
    if (lower.includes('github.com'))
        return 'github';
    if (lower.includes('blog') || lower.includes('medium') || lower.includes('dev.to'))
        return 'blog';
    if (lower.includes('docs') || lower.includes('documentation'))
        return 'documentation';
    return 'resource';
}
export async function scrapeRepository(resourceUrl) {
    return scrapeEngineeringResource({ url: resourceUrl, sourceType: 'github' });
}
export async function scrapeDocumentation(resourceUrl) {
    return scrapeEngineeringResource({ url: resourceUrl, sourceType: 'documentation' });
}
export async function scrapeBlog(resourceUrl) {
    return scrapeEngineeringResource({ url: resourceUrl, sourceType: 'blog' });
}
//# sourceMappingURL=anakinScraper.js.map