/**
 * Webhook Cryptographic Verification Subsystem
 * Implements constant-time HMAC-SHA256 signature verification and
 * anti-replay timestamp validation using the native Web Crypto API.
 */

export interface WebhookVerificationOptions {
  secret: string;
  payload: string; // Raw request body as string
  signatureHeader: string; // Signature from header (e.g. "t=12345,v1=abcdef...")
  toleranceSeconds?: number; // Anti-replay window (defaults to 300s / 5min)
}

export interface WebhookVerificationResult {
  verified: boolean;
  timestamp?: number;
  error?: string;
}

/**
 * Constant-time comparison of two strings to prevent timing side-channel attacks.
 */
export function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Computes an HMAC-SHA256 hex digest for a given message and secret key using SubtleCrypto.
 */
async function computeHmacSha256Hex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(message);

  const cryptoSubtle = (typeof window !== 'undefined' ? window.crypto : globalThis.crypto)?.subtle;
  if (!cryptoSubtle) {
    throw new Error('SubtleCrypto is not available in the current runtime environment.');
  }

  const cryptoKey = await cryptoSubtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await cryptoSubtle.sign('HMAC', cryptoKey, msgData);
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifies standard webhook payloads (Stripe, GitHub, Mobile Money, or custom HMAC webhooks).
 */
export async function verifyWebhookSignature(
  options: WebhookVerificationOptions
): Promise<WebhookVerificationResult> {
  const { secret, payload, signatureHeader, toleranceSeconds = 300 } = options;

  if (!secret || !payload || !signatureHeader) {
    return {
      verified: false,
      error: 'Missing required webhook verification arguments.',
    };
  }

  // Parse header: handles both raw hex signatures and timestamped formats ("t=123,v1=hex")
  let timestamp: number | undefined;
  let expectedSignature: string = signatureHeader;

  if (signatureHeader.includes('t=') && signatureHeader.includes('v1=')) {
    const parts = signatureHeader.split(',');
    for (const part of parts) {
      const [k, v] = part.trim().split('=');
      if (k === 't') timestamp = parseInt(v, 10);
      if (k === 'v1') expectedSignature = v;
    }
  }

  // Verify anti-replay timestamp window if timestamp is provided
  if (timestamp) {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const diff = Math.abs(nowSeconds - timestamp);
    if (diff > toleranceSeconds) {
      return {
        verified: false,
        timestamp,
        error: `Webhook timestamp expired: difference of ${diff}s exceeds tolerance of ${toleranceSeconds}s.`,
      };
    }
  }

  try {
    const messageToSign = timestamp ? `${timestamp}.${payload}` : payload;
    const computedSignature = await computeHmacSha256Hex(secret, messageToSign);

    const isMatch = timingSafeEqualString(computedSignature.toLowerCase(), expectedSignature.toLowerCase());

    if (!isMatch) {
      return {
        verified: false,
        timestamp,
        error: 'Invalid cryptographic signature.',
      };
    }

    return {
      verified: true,
      timestamp,
    };
  } catch (err) {
    return {
      verified: false,
      timestamp,
      error: `Signature computation failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
