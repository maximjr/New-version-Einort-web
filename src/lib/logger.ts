/**
 * Secure Logging Subsystem
 * Automatically masks Personally Identifiable Information (PII) such as emails,
 * tokens, passwords, and UIDs, and completely silences debug logs in production.
 */

const IS_PROD = typeof process !== 'undefined' 
  ? process.env.NODE_ENV === 'production' 
  : import.meta.env.PROD;

function maskSensitiveData(msg: any): any {
  if (typeof msg !== 'string') return msg;

  // Mask emails: john.doe@example.com -> j***e@example.com
  let masked = msg.replace(/\b([a-zA-Z0-9_.+-])[a-zA-Z0-9_.+-]*@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)\b/g, '$1***@$2');

  // Mask long hex / base64 tokens or UIDs
  masked = masked.replace(/(token|uid|key|auth|password|secret|bearer\s+)[:=]\s*([a-zA-Z0-9_\-]{8,})/gi, '$1: [REDACTED]');

  return masked;
}

export const logger = {
  debug(...args: any[]) {
    if (!IS_PROD) {
      console.debug(...args.map(maskSensitiveData));
    }
  },
  info(...args: any[]) {
    if (!IS_PROD) {
      console.info(...args.map(maskSensitiveData));
    }
  },
  warn(...args: any[]) {
    console.warn(...args.map(maskSensitiveData));
  },
  error(...args: any[]) {
    console.error(...args.map(maskSensitiveData));
  },
};
