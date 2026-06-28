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
import { useCallback, useRef, useState } from 'react';
const API_BASE = typeof window !== 'undefined'
    ? window.BUILDDNA_API_BASE || ''
    : process.env.BUILDDNA_API_BASE || 'http://localhost:3001';
const STORAGE_KEY = 'builddna_current_analysis';
export function useProjectAnalysis(options = {}) {
    const { apiBase = API_BASE, persist = true, onProgress } = options;
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(null);
    const [error, setError] = useState(null);
    const [report, setReport] = useState(null);
    const abortRef = useRef(null);
    const reset = useCallback(() => {
        abortRef.current?.abort();
        setLoading(false);
        setProgress(null);
        setError(null);
        setReport(null);
    }, []);
    const loadCached = useCallback(() => {
        if (typeof window === 'undefined')
            return null;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        }
        catch {
            return null;
        }
    }, []);
    const analyze = useCallback(async (url) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setLoading(true);
        setError(null);
        setProgress({ stage: 0, status: 'Starting analysis...', pct: 0 });
        setReport(null);
        try {
            const response = await fetch(`${apiBase}/api/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
                signal: controller.signal,
            });
            if (!response.ok) {
                const errBody = await response.json().catch(() => ({ error: response.statusText }));
                throw new Error(errBody.error || `Analysis request failed (${response.status})`);
            }
            if (!response.body) {
                throw new Error('No response stream received from analysis server.');
            }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let finalReport = null;
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (!line.startsWith('data: '))
                        continue;
                    try {
                        const event = JSON.parse(line.slice(6));
                        if (event.type === 'progress') {
                            const prog = event.payload;
                            setProgress(prog);
                            onProgress?.(prog);
                        }
                        else if (event.type === 'complete') {
                            finalReport = event.payload;
                        }
                        else if (event.type === 'error') {
                            const err = event.payload;
                            throw new Error(err.message);
                        }
                    }
                    catch (parseErr) {
                        if (parseErr instanceof Error && parseErr.message !== 'Unexpected end of JSON input') {
                            throw parseErr;
                        }
                    }
                }
            }
            if (!finalReport) {
                throw new Error('Analysis completed without a final report.');
            }
            setReport(finalReport);
            setProgress({ stage: 8, status: 'Analysis complete.', pct: 100 });
            if (persist && typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(finalReport));
            }
            return finalReport;
        }
        catch (err) {
            if (err.name === 'AbortError')
                return null;
            const message = err instanceof Error ? err.message : 'Analysis failed.';
            setError(message);
            return null;
        }
        finally {
            setLoading(false);
        }
    }, [apiBase, persist, onProgress]);
    return { analyze, loading, progress, error, report, reset, loadCached };
}
export default useProjectAnalysis;
//# sourceMappingURL=useProjectAnalysis.js.map