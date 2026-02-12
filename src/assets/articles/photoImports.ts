// Helper to expose bundled URLs for images under `src/assets/articles/**`
// Uses Vite's `import.meta.glob` with `{ query: '?url', import: 'default', eager: true }` so
// URLs are available synchronously at runtime in both dev and build.

type ImageMap = Record<string, string>;

const images: ImageMap = {};

// Safely attempt to build the map using Vite's import.meta.glob when available.
// We use `any` casts because TS does not know about import.meta.glob in all configs.
try {
  // @ts-ignore - import.meta.glob is provided by Vite at build time
  const _g = (import.meta as any).glob('/src/assets/articles/**', { query: '?url', import: 'default', eager: true }) as Record<string, string> | undefined;
  if (_g) {
    Object.assign(images, _g);
  }
} catch (e) {
  // If import.meta.glob is unavailable (non-Vite environment), images stays empty.
}

/**
 * Return the bundled URL for an article image, or undefined if not found.
 * Example key: `/src/assets/articles/article-2/Clients1.png`
 */
export const getArticleImage = (articleId: string, fileName?: string): string | undefined => {
  if (!fileName) return undefined;
  const key = `/src/assets/articles/${articleId}/${fileName}`;
  return images[key];
};

/**
 * List all bundled image URLs for a given article id.
 */
export const listArticleImages = (articleId: string): string[] => {
  const prefix = `/src/assets/articles/${articleId}/`;
  return Object.keys(images)
    .filter(k => k.startsWith(prefix))
    .map(k => images[k]);
};

export default images;

