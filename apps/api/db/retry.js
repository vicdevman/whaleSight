// Database retry utility for handling transient connection errors
// Especially useful in serverless environments like Vercel

/**
 * Executes a database query with automatic retry logic
 * @param {Function} queryFn - Function that returns a promise (the db query)
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} baseDelay - Base delay in ms for exponential backoff (default: 300ms)
 * @returns {Promise} - Result of the query
 */
export async function retryQuery(queryFn, maxRetries = 3, baseDelay = 300) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error) {
      lastError = error;
      
      // Check if it's a connection error that we should retry
      const isConnectionError = 
        error.message?.includes('fetch failed') ||
        error.message?.includes('socket') ||
        error.message?.includes('ECONNRESET') ||
        error.message?.includes('ETIMEDOUT') ||
        error.sourceError?.code === 'UND_ERR_SOCKET';
      
      // If it's not a connection error or we've exhausted retries, throw
      if (!isConnectionError || attempt === maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 100;
      
      console.log(`⚠️ Database connection failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${Math.round(delay)}ms...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Wraps a database pool to automatically retry queries
 * @param {Object} pool - The neon database pool
 * @returns {Proxy} - Proxied pool with retry logic
 */
export function createRetryPool(pool) {
  return new Proxy(pool, {
    get(target, prop) {
      // Return a function that wraps the query with retry logic
      if (typeof target[prop] === 'function') {
        return function(...args) {
          return retryQuery(() => target[prop](...args));
        };
      }
      return target[prop];
    }
  });
}
