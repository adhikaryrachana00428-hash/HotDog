import { sleep } from './retry.js';

/** Generic Anakin async job status. */
export type JobStatus = 'pending' | 'queued' | 'processing' | 'completed' | 'failed';

export interface PollOptions {
  intervalMs?: number;
  timeoutMs?: number;
  onPoll?: (status: JobStatus, attempt: number) => void;
}

const DEFAULT_POLL: Required<Omit<PollOptions, 'onPoll'>> = {
  intervalMs: 3000,
  timeoutMs: 120_000,
};

/**
 * Poll an Anakin async job until completed or failed.
 */
export async function pollUntilComplete<T extends { status: JobStatus }>(
  fetchStatus: () => Promise<T>,
  options: PollOptions = {}
): Promise<T> {
  const { intervalMs, timeoutMs } = { ...DEFAULT_POLL, ...options };
  const start = Date.now();
  let attempt = 0;

  while (Date.now() - start < timeoutMs) {
    attempt++;
    const result = await fetchStatus();
    options.onPoll?.(result.status, attempt);

    if (result.status === 'completed') return result;
    if (result.status === 'failed') {
      throw new Error(`Job failed: ${JSON.stringify(result)}`);
    }

    await sleep(intervalMs);
  }

  throw new Error(`Job polling timed out after ${timeoutMs}ms`);
}
