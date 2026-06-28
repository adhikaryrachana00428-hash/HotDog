/**
 * Engineering resource URL validation utilities.
 */
const GITHUB_HOSTS = new Set(['github.com', 'www.github.com']);
/**
 * Validates and normalizes a GitHub repository URL.
 * Accepts https://github.com/owner/repo with optional trailing segments.
 */
export function validateGitHubUrl(input) {
    const trimmed = input.trim();
    if (!trimmed) {
        return { valid: false, error: 'Repository URL is required.' };
    }
    let parsed;
    try {
        parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    }
    catch {
        return { valid: false, error: 'Invalid URL format. Provide a valid GitHub repository URL.' };
    }
    if (!GITHUB_HOSTS.has(parsed.hostname)) {
        return {
            valid: false,
            error: 'Only GitHub repository URLs are supported (github.com/owner/repo).',
        };
    }
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length < 2) {
        return {
            valid: false,
            error: 'URL must include owner and repository name (e.g. github.com/vercel/next.js).',
        };
    }
    const [owner, repo] = segments;
    if (['tree', 'blob', 'pull', 'issues', 'actions'].includes(repo)) {
        return { valid: false, error: 'Provide the repository root URL, not a sub-page.' };
    }
    const cleanRepo = repo.replace(/\.git$/, '');
    const normalized = `https://github.com/${owner}/${cleanRepo}`;
    return {
        valid: true,
        normalized,
        owner,
        repo: cleanRepo,
        host: parsed.hostname,
    };
}
/** Extract owner/repo display name from a validated URL. */
export function repoDisplayName(owner, repo) {
    return `${owner}/${repo}`;
}
/** Validates any public engineering resource URL supported by Anakin URL Scraper. */
export function validateEngineeringUrl(input) {
    const trimmed = input.trim();
    if (!trimmed) {
        return { valid: false, error: 'URL is required.' };
    }
    let parsed;
    try {
        parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    }
    catch {
        return { valid: false, error: 'Invalid URL format. Provide a public engineering resource URL.' };
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { valid: false, error: 'Only http and https URLs are supported.' };
    }
    const github = validateGitHubUrl(trimmed);
    if (github.valid) {
        return { valid: true, normalized: github.normalized, sourceType: 'github', github };
    }
    const hostname = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();
    const sourceType = hostname.includes('docs.') || path.includes('/docs') || path.includes('/documentation')
        ? 'documentation'
        : path.includes('/blog') || hostname.includes('blog.')
            ? 'blog'
            : 'resource';
    return { valid: true, normalized: parsed.toString(), sourceType };
}
//# sourceMappingURL=validation.js.map