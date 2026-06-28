/**
 * React hook for BuildDNA project analysis.
 * Accepts a repository URL, orchestrates Anakin scraper + Wire agents,
 * and exposes loading state, progress, errors, and the final report.
 *
 * @example
 * ```tsx
 * function AnalysisPage() {
 *   const { analyze, loading, progress, report, error } = useProjectAnalysis();
 *
 *   return (
 *     <button onClick={() => analyze('https://github.com/vercel/next.js')} disabled={loading}>
 *       {loading ? progress?.status : 'Analyze'}
 *     </button>
 *   );
 * }
 * ```
 */
import type { AnalysisProgress, FinalReport } from '../types/report.js';
export interface UseProjectAnalysisOptions {
    /** Override API base URL (defaults to same origin or localhost:3001) */
    apiBase?: string;
    /** Persist report to localStorage on completion */
    persist?: boolean;
    /** Callback fired on each progress update */
    onProgress?: (progress: AnalysisProgress) => void;
}
export interface UseProjectAnalysisReturn {
    /** Trigger analysis for a GitHub repository URL */
    analyze: (url: string) => Promise<FinalReport | null>;
    /** Whether analysis is currently running */
    loading: boolean;
    /** Latest progress event from Wire pipeline */
    progress: AnalysisProgress | null;
    /** Error message if analysis failed */
    error: string | null;
    /** Final structured report after successful analysis */
    report: FinalReport | null;
    /** Reset hook state */
    reset: () => void;
    /** Load report from localStorage */
    loadCached: () => FinalReport | null;
}
export declare function useProjectAnalysis(options?: UseProjectAnalysisOptions): UseProjectAnalysisReturn;
export default useProjectAnalysis;
//# sourceMappingURL=useProjectAnalysis.d.ts.map