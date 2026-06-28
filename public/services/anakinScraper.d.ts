export interface ScrapedResource {
    source: 'github' | 'documentation' | 'blog' | 'resource' | 'unknown';
    title: string;
    url: string;
    metadata: Record<string, unknown>;
    readme: string;
    documentation: string;
    dependencies: string[];
    files: string[];
    technologies: string[];
    extractedText: string;
}
export interface ScrapeRequest {
    url: string;
    sourceType?: ScrapedResource['source'];
}
export interface ScrapeResult {
    resource: ScrapedResource;
    warnings: string[];
}
export declare class AnakinScraperError extends Error {
    readonly code: string;
    readonly statusCode?: number | undefined;
    constructor(message: string, code: string, statusCode?: number | undefined);
}
export declare function scrapeEngineeringResource(request: ScrapeRequest): Promise<ScrapeResult>;
export declare function scrapeRepository(resourceUrl: string): Promise<ScrapeResult>;
export declare function scrapeDocumentation(resourceUrl: string): Promise<ScrapeResult>;
export declare function scrapeBlog(resourceUrl: string): Promise<ScrapeResult>;
//# sourceMappingURL=anakinScraper.d.ts.map