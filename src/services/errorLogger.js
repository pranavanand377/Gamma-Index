import { supabase } from './supabase';

const MAX_MESSAGE_LENGTH = 2000;
const MAX_STACK_LENGTH = 4000;
const THROTTLE_MS = 2000;

// Prevent duplicate logs for the same error in quick succession
const recentErrors = new Map();

const truncate = (str, max) => {
  if (!str) return null;
  return str.length > max ? str.slice(0, max) + '…' : str;
};

const isDuplicate = (message) => {
  const now = Date.now();
  const lastSeen = recentErrors.get(message);
  if (lastSeen && now - lastSeen < THROTTLE_MS) return true;
  recentErrors.set(message, now);

  // Keep map from growing unbounded
  if (recentErrors.size > 50) {
    const oldest = [...recentErrors.entries()]
      .sort((a, b) => a[1] - b[1])
      .slice(0, 25)
      .map(([k]) => k);
    oldest.forEach((k) => recentErrors.delete(k));
  }

  return false;
};

/**
 * Log an error to the error_logs table.
 *
 * @param {Object} opts
 * @param {'runtime'|'api'|'promise-rejection'|'render'|'validation'} opts.errorType
 * @param {string} opts.message - The error message
 * @param {string} [opts.stack] - Stack trace
 * @param {string} [opts.source] - Component or module name (e.g. 'AddRecordModal', 'useMediaStore')
 * @param {Object} [opts.metadata] - Additional context (status code, request info, etc.)
 */
export const logError = async ({
  errorType = 'runtime',
  message,
  stack,
  source,
  metadata,
}) => {
  try {
    if (!message || isDuplicate(message)) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return; // Can't log without auth

    const row = {
      user_id: session.user.id,
      user_email: session.user.email,
      error_type: errorType,
      error_message: truncate(message, MAX_MESSAGE_LENGTH),
      error_stack: truncate(stack, MAX_STACK_LENGTH),
      error_source: source || null,
      page_url: typeof window !== 'undefined' ? window.location.href : null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      metadata: metadata || {},
    };

    await supabase.from('error_logs').insert([row]);
  } catch {
    // Silently fail — don't let error logging cause more errors
  }
};

/**
 * Extract a loggable error from any thrown value.
 */
export const extractError = (err) => {
  if (err instanceof Error) {
    return { message: err.message, stack: err.stack };
  }
  if (typeof err === 'string') {
    return { message: err, stack: null };
  }
  return { message: String(err), stack: null };
};

/**
 * Install global error handlers for uncaught errors and unhandled rejections.
 */
export const installGlobalErrorHandlers = () => {
  // Synchronous runtime errors
  window.addEventListener('error', (event) => {
    logError({
      errorType: 'runtime',
      message: event.message || 'Unknown runtime error',
      stack: event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`,
      source: 'window.onerror',
    });
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const { message, stack } = extractError(event.reason);
    logError({
      errorType: 'promise-rejection',
      message: message || 'Unhandled promise rejection',
      stack,
      source: 'window.onunhandledrejection',
    });
  });
};

/**
 * Fetch error logs (admin only).
 *
 * @param {Object} opts
 * @param {number} [opts.limit=50]
 * @param {number} [opts.offset=0]
 * @param {string} [opts.errorType] - Filter by type
 * @returns {Promise<{ data: Array, count: number }>}
 */
export const fetchErrorLogs = async ({ limit = 50, offset = 0, errorType } = {}) => {
  let query = supabase
    .from('error_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (errorType) {
    query = query.eq('error_type', errorType);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data || [], count: count || 0 };
};

/**
 * Delete all error logs (admin only).
 */
export const clearAllErrorLogs = async () => {
  const { error } = await supabase
    .from('error_logs')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

  if (error) throw error;
};

/**
 * Delete error logs older than given days (admin only).
 */
export const clearOldErrorLogs = async (days = 30) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const { error } = await supabase
    .from('error_logs')
    .delete()
    .lt('created_at', cutoff.toISOString());

  if (error) throw error;
};
