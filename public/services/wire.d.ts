/**
 * Wire API orchestration service.
 * Sends scraped content through Wire multi-agent pipeline and returns structured FinalReport JSON.
 */
import type { AnalysisProgress, FinalReport, NormalizedScrapedContent } from '../types/report.js';
import { type WireExecutionOptions } from '../src/agents/orchestrator.js';
import { runHeuristicPipeline as runLegacyHeuristicPipeline } from './wire/heuristicPipeline.js';
export declare class WireOrchestrationError extends Error {
    readonly code: string;
    readonly cause?: unknown | undefined;
    constructor(message: string, code: string, cause?: unknown | undefined);
}
export type WireProgressCallback = (progress: AnalysisProgress) => void | Promise<void>;
export type { WireExecutionOptions } from '../src/agents/orchestrator.js';
/**
 * Orchestrate Wire agents on scraped repository content.
 * Uses Wire Agentic Search or Wire Task API when configured; falls back to heuristic pipeline.
 */
export declare function orchestrateAnalysis(scraped: NormalizedScrapedContent, onProgress: WireProgressCallback, options?: WireExecutionOptions): Promise<FinalReport>;
export { runLegacyHeuristicPipeline as runHeuristicPipeline };
//# sourceMappingURL=wire.d.ts.map