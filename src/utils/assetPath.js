const normalizeBaseUrl = (base) => {
  if (!base) {
    return '/';
  }
  return base.endsWith('/') ? base : `${base}/`;
};

const BASE_URL = normalizeBaseUrl(import.meta.env?.BASE_URL ?? '/');

export const assetPath = (relativePath = '') => {
  if (!relativePath) {
    return BASE_URL;
  }

  const sanitizedPath = relativePath.replace(/^\/+/, '');
  return `${BASE_URL}${sanitizedPath}`;
};
