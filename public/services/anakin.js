/**
 * Anakin Universal Scraper service.
 * Calls the Anakin URL Scraper API with auth, retries, and normalization.
 * Falls back to GitHub REST API for public repository metadata when needed.
 */
import { repoDisplayName, validateEngineeringUrl, validateGitHubUrl } from './validation.js';
import { pollUntilComplete } from './poll.js';
import { scrapeEngineeringResource } from './anakinScraper.js';
const ANAKIN_BASE_URL = process.env.ANAKIN_BASE_URL || 'https://api.anakin.io/v1';
const ANAKIN_API_KEY = process.env.ANAKIN_API_KEY || '';
const USE_HEURISTIC_FALLBACK = process.env.USE_HEURISTIC_FALLBACK === 'true';
/** Thrown when scraping fails after all retries. */
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
/**
 * Scrape an engineering resource URL using Anakin Universal Scraper.
 * Validates URL, handles auth, retries, and returns normalized content.
 */
export async function scrapeRepository(url) {
    const validation = validateEngineeringUrl(url);
    if (!validation.valid) {
        throw new AnakinScraperError(validation.error, 'INVALID_URL', 400);
    }
    const { normalized } = validation;
    const githubMeta = validation.github
        ? await fetchGitHubMetadata(validation.github.owner, validation.github.repo)
        : buildGenericMetadata(normalized, validation.sourceType);
    let scraped;
    if (ANAKIN_API_KEY) {
        const resourceResult = await scrapeEngineeringResource({ url: normalized, sourceType: validation.sourceType });
        scraped = {
            success: true,
            url: normalized,
            scrapedAt: new Date().toISOString(),
            metadata: {
                repoName: githubMeta.fullName,
                primaryLanguage: githubMeta.language || 'Unknown',
                folderStructure: resourceResult.resource.files.slice(0, 20),
                rawReadme: resourceResult.resource.readme,
            },
            markdown: resourceResult.resource.documentation,
            html: '',
            extractedJson: {
                scrapedResource: resourceResult.resource,
            },
            githubMeta,
        };
    }
    else if (USE_HEURISTIC_FALLBACK && validation.github) {
        console.warn('[Anakin] No ANAKIN_API_KEY — using GitHub metadata fallback because USE_HEURISTIC_FALLBACK=true.');
        scraped = buildFallbackScrape(normalized, githubMeta);
    }
    else {
        throw new AnakinScraperError('ANAKIN_API_KEY is required for Anakin Universal Scraper. Set USE_HEURISTIC_FALLBACK=true only for local GitHub-only offline testing.', 'ANAKIN_API_KEY_MISSING', 500);
    }
    return normalizeScrapedContent(scraped);
}
/** Submit async scrape job to Anakin and poll for results. */
async function scrapeViaAnakin(url, githubMeta) {
    const submitResponse = await anakinFetch('/url-scraper', {
        method: 'POST',
        body: JSON.stringify({
            url,
            useBrowser: true,
            generateJson: true,
        }),
    });
    const jobId = submitResponse.job_id || submitResponse.jobId || submitResponse.id;
    if (!jobId) {
        throw new AnakinScraperError('Anakin did not return a job ID.', 'NO_JOB_ID', 502);
    }
    const result = await pollUntilComplete(() => anakinFetch(`/url-scraper/${jobId}`), { intervalMs: 3000, timeoutMs: 90_000 });
    const payload = result.result || result.data || result;
    const markdown = payload.markdown || result.markdown || '';
    const html = payload.html || result.html;
    const extractedJson = payload.json || result.json;
    return {
        success: true,
        url,
        scrapedAt: new Date().toISOString(),
        metadata: {
            repoName: githubMeta.fullName,
            primaryLanguage: githubMeta.language || 'Unknown',
            folderStructure: inferFolderStructure(markdown, githubMeta.dependencyFiles),
            rawReadme: extractReadme(markdown),
        },
        markdown,
        html,
        extractedJson,
        githubMeta,
    };
}
/** Fetch public repository metadata and dependency files from GitHub API. */
async function fetchGitHubMetadata(owner, repo) {
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
            Accept: 'application/vnd.github+json',
            'User-Agent': 'BuildDNA-Engineering-Intelligence',
        },
    });
    if (!repoRes.ok) {
        throw new AnakinScraperError(`GitHub repository not found or inaccessible: ${owner}/${repo}`, 'GITHUB_NOT_FOUND', repoRes.status);
    }
    const repoData = (await repoRes.json());
    const dependencyFiles = {};
    const filesToFetch = [
        'package.json',
        'requirements.txt',
        'pyproject.toml',
        'go.mod',
        'Cargo.toml',
        'pom.xml',
        'Gemfile',
        'composer.json',
    ];
    await Promise.all(filesToFetch.map(async (file) => {
        try {
            const content = await fetchGitHubFile(owner, repo, file, repoData.default_branch);
            if (content)
                dependencyFiles[file] = content;
        }
        catch {
            // Optional files — ignore missing
        }
    }));
    return {
        fullName: repoData.full_name,
        description: repoData.description || '',
        language: repoData.language || 'Unknown',
        topics: repoData.topics || [],
        stars: repoData.stargazers_count,
        defaultBranch: repoData.default_branch,
        dependencyFiles,
    };
}
async function fetchGitHubFile(owner, repo, path, branch) {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
        headers: {
            Accept: 'application/vnd.github+json',
            'User-Agent': 'BuildDNA-Engineering-Intelligence',
        },
    });
    if (!res.ok)
        return null;
    const data = (await res.json());
    if (data.content && data.encoding === 'base64') {
        return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    return null;
}
function buildFallbackScrape(url, githubMeta) {
    const validation = validateGitHubUrl(url);
    if (!validation.valid)
        throw new AnakinScraperError(validation.error, 'INVALID_URL');
    const readme = githubMeta.dependencyFiles['README.md'] || '';
    const markdown = [
        `# ${githubMeta.fullName}`,
        githubMeta.description,
        `Primary language: ${githubMeta.language}`,
        `Topics: ${githubMeta.topics.join(', ')}`,
        '',
        '## Dependency Files',
        ...Object.entries(githubMeta.dependencyFiles).map(([name, content]) => `### ${name}\n\`\`\`\n${content.slice(0, 4000)}\n\`\`\``),
    ].join('\n');
    return {
        success: true,
        url,
        scrapedAt: new Date().toISOString(),
        metadata: {
            repoName: githubMeta.fullName,
            primaryLanguage: githubMeta.language,
            folderStructure: Object.keys(githubMeta.dependencyFiles),
            rawReadme: readme,
        },
        markdown,
        githubMeta,
    };
}
function buildGenericMetadata(url, sourceType) {
    const parsed = new URL(url);
    const pathName = parsed.pathname.split('/').filter(Boolean).slice(0, 2).join('/') || parsed.hostname;
    return {
        fullName: `${parsed.hostname}/${pathName}`,
        description: `${sourceType} resource scraped from ${parsed.hostname}`,
        language: 'Unknown',
        topics: [sourceType],
        stars: 0,
        defaultBranch: '',
        dependencyFiles: {},
    };
}
function normalizeScrapedContent(scraped) {
    const meta = scraped.githubMeta;
    return {
        url: scraped.url,
        scrapedAt: scraped.scrapedAt,
        repoName: scraped.metadata.repoName,
        primaryLanguage: scraped.metadata.primaryLanguage,
        readme: scraped.metadata.rawReadme,
        markdown: scraped.markdown,
        folderStructure: scraped.metadata.folderStructure,
        dependencyFiles: meta?.dependencyFiles || {},
        githubMeta: meta,
        rawPayload: {
            extractedJson: scraped.extractedJson,
            html: scraped.html,
        },
    };
}
function extractReadme(markdown) {
    const readmeMatch = markdown.match(/#\s*README[\s\S]{0,8000}/i);
    return readmeMatch ? readmeMatch[0] : markdown.slice(0, 8000);
}
function inferFolderStructure(markdown, dependencyFiles) {
    const paths = new Set(Object.keys(dependencyFiles));
    const pathPattern = /(?:^|\s)(\/[\w.-]+(?:\/[\w.-]+)*)/gm;
    let match;
    while ((match = pathPattern.exec(markdown)) !== null) {
        paths.add(match[1]);
    }
    return [...paths].slice(0, 20);
}
async function anakinFetch(path, init = {}) {
    const response = await fetch(`${ANAKIN_BASE_URL}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': ANAKIN_API_KEY,
            ...init.headers,
        },
    });
    if (!response.ok) {
        const body = await response.text();
        throw new AnakinScraperError(`Anakin API error (${response.status}): ${body}`, 'ANAKIN_API_ERROR', response.status);
    }
    return response.json();
}
export { validateGitHubUrl, repoDisplayName };
//# sourceMappingURL=anakin.js.map