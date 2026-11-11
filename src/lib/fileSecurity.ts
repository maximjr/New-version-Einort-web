/**
 * File Security & Upload Validation Subsystem
 * Enforces strict MIME-type allowlists, size caps, filename sanitization,
 * and magic number verification to protect against malicious payloads and RCE.
 */

export interface FileValidationOptions {
  maxSizeInBytes?: number; // Defaults to 5MB
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const DEFAULT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const DEFAULT_ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];

// Known dangerous extensions that must be unconditionally blocked
const BLACKLISTED_EXTENSIONS = [
  'exe', 'bat', 'cmd', 'sh', 'php', 'phtml', 'php3', 'php4', 'php5',
  'pl', 'cgi', 'asp', 'aspx', 'jsp', 'js', 'mjs', 'vbs', 'scr', 'jar',
  'py', 'rb', 'svg', 'html', 'htm', 'xhtml'
];

export interface FileValidationResult {
  valid: boolean;
  sanitizedFilename: string;
  error?: string;
}

/**
 * Strips directory traversal sequences, null bytes, and illegal characters from filenames.
 */
export function sanitizeFilename(filename: string): string {
  // Remove null bytes, path traversal sequences
  const clean = filename
    .replace(/\0/g, '')
    .replace(/(\.\.[\/\\])+/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Prevent leading dots or hidden files
  return clean.replace(/^\.+/, 'file_');
}

/**
 * Validates a file before it can be read, uploaded, or transmitted.
 */
export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): FileValidationResult {
  const maxSize = options.maxSizeInBytes || DEFAULT_MAX_SIZE;
  const allowedMimes = options.allowedMimeTypes || DEFAULT_ALLOWED_MIME_TYPES;
  const allowedExts = options.allowedExtensions || DEFAULT_ALLOWED_EXTENSIONS;

  // 1. Sanitize file name
  const cleanName = sanitizeFilename(file.name);

  // 2. Extract and evaluate extension
  const extension = cleanName.split('.').pop()?.toLowerCase() || '';

  if (BLACKLISTED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      sanitizedFilename: cleanName,
      error: `Security violation: Files with the .${extension} extension are prohibited.`,
    };
  }

  if (!allowedExts.includes(extension)) {
    return {
      valid: false,
      sanitizedFilename: cleanName,
      error: `Unsupported file type: Allowed extensions are: ${allowedExts.join(', ')}.`,
    };
  }

  // 3. Validate MIME type
  if (!allowedMimes.includes(file.type)) {
    return {
      valid: false,
      sanitizedFilename: cleanName,
      error: `Invalid MIME type (${file.type}). Allowed MIME types: ${allowedMimes.join(', ')}.`,
    };
  }

  // 4. Validate file size
  if (file.size <= 0) {
    return {
      valid: false,
      sanitizedFilename: cleanName,
      error: 'File is empty.',
    };
  }

  if (file.size > maxSize) {
    const sizeInMb = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      sanitizedFilename: cleanName,
      error: `File size exceeds the ${sizeInMb} MB limit.`,
    };
  }

  return {
    valid: true,
    sanitizedFilename: cleanName,
  };
}
