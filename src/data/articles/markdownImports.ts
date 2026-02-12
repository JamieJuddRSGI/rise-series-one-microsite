// Helper to expose raw markdown content for articles under `src/data/articles/**`
// Uses Vite's `import.meta.glob` with `{ as: 'raw', eager: true }` so
// content is available synchronously at runtime in both dev and build.

import matter from 'gray-matter';

type MarkdownMap = Record<string, string>;

const markdownFiles: MarkdownMap = {};

// Safely attempt to build the map using Vite's import.meta.glob when available.
// We use `any` casts because TS does not know about import.meta.glob in all configs.
try {
  // @ts-ignore - import.meta.glob is provided by Vite at build time
  const _g = (import.meta as any).glob('/src/data/articles/*.md', { as: 'raw', eager: true }) as Record<string, string> | undefined;
  if (_g) {
    Object.assign(markdownFiles, _g);
  }
} catch (e) {
  // If import.meta.glob is unavailable (non-Vite environment), markdownFiles stays empty.
}

/**
 * Return the raw markdown content for an article, or undefined if not found.
 * @param articleId - The article ID (e.g., 'article-1')
 * @returns The markdown content as a string, or undefined if not found
 */
export const getMarkdownContent = (articleId: string): string | undefined => {
  const filePath = `/src/data/articles/${articleId}.md`;
  return markdownFiles[filePath];
};

/**
 * List all available article IDs that have markdown content.
 * @returns Array of article IDs (e.g., ['article-1', 'article-2'])
 */
export const listArticleIds = (): string[] => {
  return Object.keys(markdownFiles)
    .map(key => {
      // Extract article ID from path like '/src/data/articles/article-1.md'
      const match = key.match(/\/src\/data\/articles\/(.+)\.md$/);
      return match ? match[1] : null;
    })
    .filter((id): id is string => id !== null);
};

/**
 * Parse markdown content with YAML frontmatter.
 * @param articleId - The article ID (e.g., 'article-1')
 * @returns Object with metadata and content, or null if not found
 */
export const getMarkdownWithFrontmatter = (articleId: string): { metadata: Record<string, any>; content: string } | null => {
  const rawContent = getMarkdownContent(articleId);
  if (!rawContent) {
    return null;
  }
  
  const parsed = matter(rawContent);
  return {
    metadata: parsed.data,
    content: parsed.content
  };
};

export default markdownFiles;

