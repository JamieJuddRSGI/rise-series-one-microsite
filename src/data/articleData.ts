import { Article } from './siteData';
import { getMarkdownWithFrontmatter, listArticleIds } from './articles/markdownImports';

/**
 * Validate that frontmatter metadata matches Article interface requirements
 */
const validateArticleMetadata = (metadata: Record<string, any>, articleId: string): Partial<Article> | null => {
  // Required fields
  if (!metadata.title || typeof metadata.title !== 'string') {
    console.warn(`Article ${articleId}: Missing or invalid 'title' field`);
    return null;
  }
  
  if (!metadata.category || (metadata.category !== 'methodology' && metadata.category !== 'insights')) {
    console.warn(`Article ${articleId}: Missing or invalid 'category' field (must be 'methodology' or 'insights')`);
    return null;
  }
  
  if (!metadata.author || typeof metadata.author !== 'string') {
    console.warn(`Article ${articleId}: Missing or invalid 'author' field`);
    return null;
  }
  
  if (!metadata.date || typeof metadata.date !== 'string') {
    console.warn(`Article ${articleId}: Missing or invalid 'date' field`);
    return null;
  }
  
  return {
    id: metadata.id || articleId, // Use frontmatter id if provided, otherwise use filename
    title: metadata.title,
    category: metadata.category as 'methodology' | 'insights',
    author: metadata.author,
    date: metadata.date
  };
};

/**
 * Dynamically load articles from markdown files with YAML frontmatter
 */
export const articles: Article[] = listArticleIds()
  .map(articleId => {
    const parsed = getMarkdownWithFrontmatter(articleId);
    if (!parsed) {
      console.warn(`Article ${articleId}: Could not load markdown content`);
      return null;
    }
    
    const metadata = validateArticleMetadata(parsed.metadata, articleId);
    if (!metadata) {
      return null;
    }
    
    return {
      ...metadata,
      markdownContent: parsed.content
    } as Article;
  })
  .filter((article): article is Article => article !== null);

