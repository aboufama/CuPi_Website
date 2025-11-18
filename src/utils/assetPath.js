export const assetPath = (relativePath) => {
  if (!relativePath) return '';
  
  // Remove leading slash if present
  const path = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  
  // Always use absolute path from root for GitHub Pages
  return `/${path}`;
};

