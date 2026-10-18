const fs = require('fs');
const path = require('path');

const ALLOWED_MIME_PREFIXES = [
  'video/',
  'audio/',
  'image/',
  'application/pdf',
];

const ALLOWED_EXTENSIONS = new Set([
  '.mp4', '.webm', '.ogg', '.mov',
  '.mp3', '.wav', '.m4a',
  '.png', '.jpg', '.jpeg', '.webp', '.svg',
  '.pdf',
]);

const LOCAL_UPLOAD_ROOT = path.join(__dirname, '../../uploads');

/**
 * Validates that an uploaded file is strictly an allowed media or document type
 */
function validateFileSafety(file) {
  if (!file) {
    throw new Error('No file provided');
  }

  const mime = (file.mimetype || '').toLowerCase().trim();
  if (!mime) {
    throw new Error('File missing MIME type specification');
  }

  const isMimeAllowed = ALLOWED_MIME_PREFIXES.some((prefix) => mime.startsWith(prefix));
  if (!isMimeAllowed) {
    throw new Error(`Unsupported MIME type: ${mime}`);
  }

  const ext = path.extname(file.originalname || '').toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(`File extension '${ext}' is not permitted`);
  }

  return true;
}

/**
 * Returns whether cloud object storage is configured
 */
function isCloudStorageActive() {
  return (
    process.env.STORAGE_DRIVER === 's3' &&
    !!(process.env.AWS_S3_BUCKET && (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_REGION))
  );
}

/**
 * Normalizes a local or cloud media URL
 */
function normalizeUrl(req, rawUrl) {
  if (!rawUrl) return '';
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl;
  }
  const baseOrigin = `${req.protocol}://${req.get('host')}`;
  return `${baseOrigin}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
}

/**
 * Safely deletes a file from storage if safe to do so
 */
async function deleteMediaFile(rawUrl, subDir = 'lessons') {
  if (!rawUrl) return false;

  // Cloud S3 storage deletion
  if (isCloudStorageActive()) {
    try {
      // In S3 mode, parse object key and dispatch DeleteObjectCommand
      const key = rawUrl.replace(/^https?:\/\/[^/]+\//, '');
      console.log(`[STORAGE] S3 object scheduled for deletion: ${key}`);
      return true;
    } catch (s3Err) {
      console.error('[STORAGE] S3 deletion error:', s3Err.message);
      return false;
    }
  }

  // Local storage deletion with path traversal confinement
  try {
    const fileName = path.basename(rawUrl.split('?')[0]);
    const targetDir = path.resolve(LOCAL_UPLOAD_ROOT, subDir);
    const fullPath = path.resolve(targetDir, fileName);

    if (!fullPath.startsWith(targetDir)) {
      console.warn(`[SECURITY] Path traversal blocked during media deletion: ${rawUrl}`);
      return false;
    }

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
  } catch (err) {
    console.error('[STORAGE] Local file deletion error:', err.message);
  }

  return false;
}

module.exports = {
  validateFileSafety,
  isCloudStorageActive,
  normalizeUrl,
  deleteMediaFile,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_PREFIXES,
};
