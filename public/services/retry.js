/**
 * Shared retry utility with exponential backoff.
 */
const DEFAULT_OPTIONS = {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 8000,
};
export async function withRetry(fn, options = {}) {
    const { maxAttempts, baseDelayMs, maxDelayMs } = { ...DEFAULT_OPTIONS, ...options };
    const shouldRetry = options.shouldRetry ?? isTransientError;
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt === maxAttempts || !shouldRetry(error, attempt)) {
                throw error;
            }
            const delay = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
            await sleep(delay);
        }
    }
    throw lastError;
}
function isTransientError(error) {
    if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        return (msg.includes('timeout') ||
            msg.includes('network') ||
            msg.includes('econnreset') ||
            msg.includes('429') ||
            msg.includes('502') ||
            msg.includes('503') ||
            msg.includes('504'));
    }
    return false;
}
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//# sourceMappingURL=retry.js.map