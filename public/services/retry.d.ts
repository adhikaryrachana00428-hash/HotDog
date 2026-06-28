/**
 * Shared retry utility with exponential backoff.
 */
export interface RetryOptions {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    /** Return true to retry on this error */
    shouldRetry?: (error: unknown, attempt: number) => boolean;
}
export declare function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;
export declare function sleep(ms: number): Promise<void>;
//# sourceMappingURL=retry.d.ts.map