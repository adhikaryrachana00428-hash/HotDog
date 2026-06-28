/** Generic Anakin async job status. */
export type JobStatus = 'pending' | 'queued' | 'processing' | 'completed' | 'failed';
export interface PollOptions {
    intervalMs?: number;
    timeoutMs?: number;
    onPoll?: (status: JobStatus, attempt: number) => void;
}
/**
 * Poll an Anakin async job until completed or failed.
 */
export declare function pollUntilComplete<T extends {
    status: JobStatus;
}>(fetchStatus: () => Promise<T>, options?: PollOptions): Promise<T>;
//# sourceMappingURL=poll.d.ts.map