
export interface RetryConfig {
  maxRetries: number;
  backoffMs: number;
}

/**
 * Executes a function with exponential backoff retries.
 */
export async function withRetries<T>(
  fn: () => Promise<T>,
  config: RetryConfig = { maxRetries: 3, backoffMs: 1000 }
): Promise<T> {
  let attempt = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (e: any) {
      attempt++;
      if (attempt >= config.maxRetries) {
        throw e;
      }
      
      const delay = config.backoffMs * Math.pow(2, attempt);
      console.warn(`Gateway request failed (attempt ${attempt}/${config.maxRetries}). Retrying in ${delay}ms... Error: ${e.message}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Executes a function with secondary-fallback route switching.
 */
export async function withFallback<T>(
  primaryFn: () => Promise<T>,
  fallbackFn: () => Promise<T>
): Promise<T> {
  try {
    return await primaryFn();
  } catch (e) {
    console.warn('Primary Gateway route failed. Executing fallback route...', e);
    return await fallbackFn();
  }
}
