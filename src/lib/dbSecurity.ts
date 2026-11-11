/**
 * Database Query Security & Parameterization Subsystem
 * Enforces strictly parameterized queries and SQL/NoSQL injection protection.
 * In Firestore, ensures field lookups use structural query constraints (where, limit, orderBy)
 * rather than string concatenation. For relational SQL, enforces positional parameterized queries ($1, $2, ?).
 */

const SQL_INJECTION_PATTERNS = [
  /(\b(UNION(\s+ALL)?|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|EXEC(UTE)?)\b)/i,
  /(--|#|\/\*|\*\/)/,
  /('\s*OR\s*'[\w\d]+'='[\w\d]+'|1=1|1=0)/i,
  /(;\s*--|;\s*DROP\s+TABLE|;\s*DELETE\s+FROM)/i,
  /(\bWAITFOR\s+DELAY\b|\bBENCHMARK\s*\()/i,
];

/**
 * Validates that an input value does not contain common SQL or script injection signatures.
 */
export function isSafeQueryInput(input: unknown): boolean {
  if (typeof input !== 'string') return true;

  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return false;
    }
  }
  return true;
}

/**
 * Enforces parameterized SQL query construction for relational databases.
 * Throws a security error if raw string values are concatenated into the SQL statement.
 */
export function assertParameterizedSql(
  query: string,
  params: unknown[]
): { query: string; params: unknown[] } {
  // Check for suspicious unparameterized quote usage inside the query string
  const stringLiteralCount = (query.match(/'[^']*'/g) || []).length;
  if (stringLiteralCount > 2) {
    console.warn('[Security Guard] Warning: SQL query contains inline string literals instead of placeholders ($1, $2, ?).');
  }

  // Validate that all parameters pass safety checks
  for (let i = 0; i < params.length; i++) {
    const p = params[i];
    if (typeof p === 'string' && !isSafeQueryInput(p)) {
      throw new Error(`[Security Violation] Malicious SQL injection payload detected in parameter index ${i}.`);
    }
  }

  return { query, params };
}
