import { sleep } from './retry.js';
const DEFAULT_POLL = {
    intervalMs: 3000,
    timeoutMs: 120_000,
};
/**
 * Poll an Anakin async job until completed or failed.
 */
export async function pollUntilComplete(fetchStatus, options = {}) {
    const { intervalMs, timeoutMs } = { ...DEFAULT_POLL, ...options };
    const start = Date.now();
    let attempt = 0;
    while (Date.now() - start < timeoutMs) {
        attempt++;
        const result = await fetchStatus();
        options.onPoll?.(result.status, attempt);
        if (result.status === 'completed')
            return result;
        if (result.status === 'failed') {
            throw new Error(`Job failed: ${JSON.stringify(result)}`);
        }
        await sleep(intervalMs);
    }
    throw new Error(`Job polling timed out after ${timeoutMs}ms`);
}
//# sourceMappingURL=poll.js.map