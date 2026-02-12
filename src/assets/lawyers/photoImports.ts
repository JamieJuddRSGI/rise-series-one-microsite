// Helper to expose bundled URLs for images under `src/assets/lawyers/**`
// Uses Vite's `import.meta.glob` with `{ as: 'url', eager: true }` so
// URLs are available synchronously at runtime in both dev and build.

type ImageMap = Record<string, string>;

const images: ImageMap = {};

// Safely attempt to build the map using Vite's import.meta.glob when available.
// We use `any` casts because TS does not know about import.meta.glob in all configs.
try {
  // @ts-ignore - import.meta.glob is provided by Vite at build time
  const _g = (import.meta as any).glob('/src/assets/lawyers/**', { as: 'url', eager: true }) as Record<string, string> | undefined;
  if (_g) {
    Object.assign(images, _g);
  }
} catch (e) {
  // If import.meta.glob is unavailable (non-Vite environment), images stays empty.
}

/**
 * Map of lawyer IDs to their photo URLs.
 * Extracted from globbed image paths by removing the directory prefix and file extension.
 */
export const lawyerPhotos: Record<string, string> = {};

// Build the lawyerPhotos map from the globbed images
Object.keys(images).forEach((path) => {
  // Extract filename from path like '/src/assets/lawyers/IND00092.jpg'
  const match = path.match(/\/src\/assets\/lawyers\/([^/]+)$/);
  if (match) {
    const filename = match[1];
    // Remove extension to get lawyer ID (e.g., 'IND00092.jpg' -> 'IND00092')
    const lawyerId = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    lawyerPhotos[lawyerId] = images[path];
  }
});

/**
 * Return the bundled URL for a lawyer's photo, or undefined if not found.
 * @param lawyerId - The lawyer ID (e.g., 'IND00092')
 */
export const getLawyerPhoto = (lawyerId: string): string | undefined => {
  return lawyerPhotos[lawyerId];
};

export default images;
