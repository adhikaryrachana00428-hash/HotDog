/**
 * Heuristic Wire agent pipeline.
 * Derives structured FinalReport from scraped repository content without hardcoded tech lists.
 * Used when Wire API is unavailable or as a structured fallback parser.
 */
import type { AnalysisProgress, FinalReport, NormalizedScrapedContent } from '../../types/report.js';
type ProgressCallback = (progress: AnalysisProgress) => void | Promise<void>;
export declare function runHeuristicPipeline(scraped: NormalizedScrapedContent, onProgress: ProgressCallback): Promise<FinalReport>;
export {};
//# sourceMappingURL=heuristicPipeline.d.ts.map