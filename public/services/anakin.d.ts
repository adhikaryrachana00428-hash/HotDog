/**
 * Anakin Universal Scraper service.
 * Calls the Anakin URL Scraper API with auth, retries, and normalization.
 * Falls back to GitHub REST API for public repository metadata when needed.
 */
import type { NormalizedScrapedContent } from '../types/report.js';
import { repoDisplayName, validateGitHubUrl } from './validation.js';
/** Thrown when scraping fails after all retries. */
export declare class AnakinScraperError extends Error {
    readonly code: string;
    readonly statusCode?: number | undefined;
    constructor(message: string, code: string, statusCode?: number | undefined);
}
/**
 * Scrape an engineering resource URL using Anakin Universal Scraper.
 * Validates URL, handles auth, retries, and returns normalized content.
 */
export declare function scrapeRepository(url: string): Promise<NormalizedScrapedContent>;
export { validateGitHubUrl, repoDisplayName };
//# sourceMappingURL=anakin.d.ts.map