import type { AnalysisProgress, FinalReport, NormalizedScrapedContent } from '../../types/report.js';
export type WireProgressCallback = (progress: AnalysisProgress) => void | Promise<void>;
export interface WireExecutionOptions {
    signal?: AbortSignal;
    timeoutMs?: number;
}
export declare function runModularWirePipeline(scraped: NormalizedScrapedContent, onProgress: WireProgressCallback, options?: WireExecutionOptions): Promise<FinalReport>;
//# sourceMappingURL=orchestrator.d.ts.map