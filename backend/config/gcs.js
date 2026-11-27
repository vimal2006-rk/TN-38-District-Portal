const { Storage } = require('@google-cloud/storage');

let cachedStorage = null;
let cachedBucket = null;
let cachedSignature = '';

const isRealValue = (val) => {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  return Boolean(trimmed) && !trimmed.startsWith('your_');
};

const parseServiceAccountJson = (raw) => {
  if (!isRealValue(raw)) return null;
  const trimmed = raw.trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed?.client_email && parsed?.private_key) return parsed;
  } catch {
    // Retry as base64-encoded JSON (common in CI/Render env configs)
    try {
      const decoded = Buffer.from(trimmed, 'base64').toString('utf8');
      const parsed = JSON.parse(decoded);
      if (parsed?.client_email && parsed?.private_key) return parsed;
    } catch {
      return null;
    }
  }
  return null;
};

const resolveGcsConfig = () => {
  const bucketName = isRealValue(process.env.GCS_BUCKET_NAME)
    ? process.env.GCS_BUCKET_NAME.trim()
    : '';
  if (!bucketName) return null;

  const projectId = isRealValue(process.env.GCS_PROJECT_ID)
    ? process.env.GCS_PROJECT_ID.trim()
    : undefined;

  const saJson = parseServiceAccountJson(process.env.GCS_SERVICE_ACCOUNT_JSON);
  if (saJson) {
    return {
      bucketName,
      projectId: projectId || saJson.project_id,
      credentials: {
        client_email: saJson.client_email,
        private_key: String(saJson.private_key).replace(/\\n/g, '\n'),
      },
    };
  }

  const clientEmail = process.env.GCS_CLIENT_EMAIL;
  const privateKey = process.env.GCS_PRIVATE_KEY;
  if (isRealValue(clientEmail) && isRealValue(privateKey)) {
    return {
      bucketName,
      projectId,
      credentials: {
        client_email: clientEmail.trim(),
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
    };
  }

  if (isRealValue(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    return {
      bucketName,
      projectId,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS.trim(),
    };
  }

  return null;
};

const isGcsConfigured = () => Boolean(resolveGcsConfig());

const getPublicBaseUrl = (bucketName) => {
  if (isRealValue(process.env.GCS_PUBLIC_BASE_URL)) {
    return process.env.GCS_PUBLIC_BASE_URL.trim().replace(/\/+$/, '');
  }
  return `https://storage.googleapis.com/${bucketName}`;
};

const getGcsBucket = () => {
  const cfg = resolveGcsConfig();
  if (!cfg) return null;

  const sig = `${cfg.bucketName}:${cfg.projectId || ''}:${cfg.credentials?.client_email || cfg.keyFilename || ''}`;
  if (!cachedBucket || sig !== cachedSignature) {
    const opts = {};
    if (cfg.projectId) opts.projectId = cfg.projectId;
    if (cfg.credentials) opts.credentials = cfg.credentials;
    if (cfg.keyFilename) opts.keyFilename = cfg.keyFilename;
    cachedStorage = new Storage(opts);
    cachedBucket = cachedStorage.bucket(cfg.bucketName);
    cachedSignature = sig;
  }

  return { bucket: cachedBucket, bucketName: cfg.bucketName };
};

/**
 * Uploads an in-memory Buffer to Google Cloud Storage with immutable 1-year Edge CDN caching.
 */
const uploadBufferToGcs = async ({ buffer, objectPath, mimeType }) => {
  const ctx = getGcsBucket();
  if (!ctx) {
    throw new Error('Google Cloud Storage is not configured.');
  }

  const cleanPath = String(objectPath || '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '');

  await ctx.bucket.file(cleanPath).save(buffer, {
    resumable: false,
    contentType: mimeType || 'application/octet-stream',
    metadata: {
      cacheControl: 'public, max-age=31536000, immutable',
    },
  });

  const baseUrl = getPublicBaseUrl(ctx.bucketName);
  const encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/');
  return `${baseUrl}/${encodedPath}`;
};

const extractGcsObjectPath = (url) => {
  if (!url || typeof url !== 'string') return null;
  const cfg = resolveGcsConfig();
  if (!cfg) return null;

  const cleanUrl = url.split('?')[0].split('#')[0];
  const prefixes = [
    `${getPublicBaseUrl(cfg.bucketName)}/`,
    `https://storage.googleapis.com/${cfg.bucketName}/`,
  ];

  for (const prefix of prefixes) {
    if (cleanUrl.startsWith(prefix)) {
      return decodeURIComponent(cleanUrl.slice(prefix.length));
    }
  }
  return null;
};

const deleteGcsObjectByUrl = async (url) => {
  const ctx = getGcsBucket();
  if (!ctx || !url) return;
  const objectPath = extractGcsObjectPath(url);
  if (!objectPath) return;

  try {
    await ctx.bucket.file(objectPath).delete({ ignoreNotFound: true });
  } catch (err) {
    console.warn('GCS delete warning:', err.message);
  }
};

module.exports = {
  isGcsConfigured,
  getGcsBucket,
  uploadBufferToGcs,
  deleteGcsObjectByUrl,
  extractGcsObjectPath,
};
