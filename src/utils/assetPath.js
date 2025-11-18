const getNormalizedBase = () => {
  const base = import.meta.env.BASE_URL ?? '/';
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

const normalizeRelativePath = (relativePath) => {
  if (!relativePath) return '';
  return relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
};

export const assetPath = (relativePath) => {
  const base = getNormalizedBase();
  const path = normalizeRelativePath(relativePath);
  if (!base) {
    return `/${path}`;
  }
  return `${base}/${path}`;
};

