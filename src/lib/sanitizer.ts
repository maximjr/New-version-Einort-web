/**
 * Cross-Site Scripting (XSS) Prevention & Input Sanitization
 * Provides defense-in-depth HTML sanitization, entity encoding,
 * and malicious payload neutralization.
 */

const DANGEROUS_TAGS_REGEX = /<\s*(script|iframe|object|embed|applet|form|svg|math|style|link|meta|base)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>|<\s*(script|iframe|object|embed|applet|form|svg|math|style|link|meta|base)\b[^>]*\/?>/gi;
const EVENT_HANDLER_REGEX = /\son\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi;
const JAVASCRIPT_URI_REGEX = /(?:href|src|action)\s*=\s*['"]?\s*(?:javascript|data|vbscript):[^'"]*['"]?/gi;

/**
 * Encodes special characters to HTML entities, completely neutralizing HTML injection.
 */
export function escapeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitizes an HTML string by stripping script tags, executable event handlers,
 * and dangerous protocols while preserving safe formatting tags.
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';

  return html
    .replace(DANGEROUS_TAGS_REGEX, '')
    .replace(EVENT_HANDLER_REGEX, '')
    .replace(JAVASCRIPT_URI_REGEX, '');
}

/**
 * Sanitizes form text inputs: trims whitespace, removes control characters, and truncates length.
 */
export function sanitizeInputText(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') return '';
  // Remove null bytes and non-printable control characters (except newline and tab)
  const cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return cleaned.trim().slice(0, maxLength);
}
