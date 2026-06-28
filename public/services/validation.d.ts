/**
 * Engineering resource URL validation utilities.
 */
export interface ValidatedRepoUrl {
    valid: true;
    normalized: string;
    owner: string;
    repo: string;
    host: string;
}
export interface InvalidRepoUrl {
    valid: false;
    error: string;
}
export type UrlValidationResult = ValidatedRepoUrl | InvalidRepoUrl;
export interface ValidatedEngineeringUrl {
    valid: true;
    normalized: string;
    sourceType: 'github' | 'documentation' | 'blog' | 'resource' | 'unknown';
    github?: ValidatedRepoUrl;
}
export type EngineeringUrlValidationResult = ValidatedEngineeringUrl | InvalidRepoUrl;
/**
 * Validates and normalizes a GitHub repository URL.
 * Accepts https://github.com/owner/repo with optional trailing segments.
 */
export declare function validateGitHubUrl(input: string): UrlValidationResult;
/** Extract owner/repo display name from a validated URL. */
export declare function repoDisplayName(owner: string, repo: string): string;
/** Validates any public engineering resource URL supported by Anakin URL Scraper. */
export declare function validateEngineeringUrl(input: string): EngineeringUrlValidationResult;
//# sourceMappingURL=validation.d.ts.map