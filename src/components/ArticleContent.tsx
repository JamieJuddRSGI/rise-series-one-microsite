import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getArticleImage } from '../assets/articles/photoImports';

interface ArticleContentProps {
  markdownContent?: string;
  articleId: string;
}

export const ArticleContent: React.FC<ArticleContentProps> = ({ 
  markdownContent, 
  articleId 
}) => {
  if (!markdownContent) {
    return (
      <div className="prose prose-slate max-w-none">
        <p className="text-slate-700">Content not available.</p>
      </div>
    );
  }

  // Render markdown content
  return (
    <>
        <style>{`
          .article-content ul {
            list-style-type: disc !important;
            list-style-position: outside !important;
          }
          .article-content ol {
            list-style-type: decimal !important;
            list-style-position: outside !important;
          }
          .article-content li {
            display: list-item !important;
          }
        `}</style>
        <div className="article-content max-w-none text-base">
          <ReactMarkdown
          remarkPlugins={[remarkGfm]}  // CRITICAL: Enables tables
          components={{
            // Custom heading styles
            h1: ({ node, ...props }) => (
              <h1 className="text-slate-900 mb-6 mt-8" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-slate-900 mb-4 mt-6" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-slate-800 mb-3 mt-5" {...props} />
            ),
            h4: ({ node, ...props }) => (
              <h4 className="text-slate-800 mb-2 mt-4" {...props} />
            ),
            
            // Custom paragraph styles
            p: ({ node, ...props }) => (
              <p className="text-slate-700 mb-6 leading-relaxed" {...props} />
            ),
            
            // Custom list styles - using inline styles to override CSS reset
            ul: ({ node, ...props }) => (
              <ul 
                className="text-slate-700 mb-6 ml-6 space-y-2" 
                style={{ 
                  listStyleType: 'disc', 
                  listStylePosition: 'outside',
                  paddingLeft: '1.5rem'
                }} 
                {...props} 
              />
            ),
            ol: ({ node, ...props }) => (
              <ol 
                className="text-slate-700 mb-6 ml-6 space-y-2" 
                style={{ 
                  listStyleType: 'decimal', 
                  listStylePosition: 'outside',
                  paddingLeft: '1.5rem'
                }} 
                {...props} 
              />
            ),
            li: ({ node, ...props }) => (
              <li 
                className="text-slate-700" 
                style={{ 
                  display: 'list-item',
                  paddingLeft: '0.5rem',
                  marginLeft: '0'
                }} 
                {...props} 
              />
            ),
            
            // Custom blockquote styles
            blockquote: ({ node, ...props }) => (
              <blockquote 
                className="border-l-4 border-slate-300 pl-4 py-2 my-6 italic text-slate-600 bg-slate-50 rounded-r" 
                {...props} 
              />
            ),
            
            // Custom code styles
            code: ({ node, className, children, ...props }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code 
                    className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm" 
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <code 
                  className="block bg-slate-800 text-slate-100 p-4 rounded-lg my-4 overflow-x-auto text-sm" 
                  {...props}
                >
                  {children}
                </code>
              );
            },
            
            // Custom link styles
            a: ({ node, ...props }) => (
              <a 
                className="text-blue-600 hover:text-blue-700 underline transition-colors" 
                target="_blank"
                rel="noopener noreferrer"
                {...props} 
              />
            ),
            
            // Custom image handler - supports article-specific images
            img: ({ node, src, alt, ...props }) => {
              // If src starts with http/https, use it directly (external image)
              // Otherwise, treat as article-specific image and resolve using getArticleImage
              let imageSrc: string | undefined;
              
              if (src?.startsWith('http://') || src?.startsWith('https://')) {
                imageSrc = src;
              } else if (src) {
                // Remove leading './' if present, then resolve using getArticleImage
                const fileName = src.replace(/^\.\//, '');
                imageSrc = getArticleImage(articleId, fileName);
                // If getArticleImage returns undefined, try using the src as-is (for debugging)
                if (!imageSrc) {
                  console.warn(`Image not found for article ${articleId}: ${fileName}`);
                }
              }
              
              // Only render if we have a valid src
              if (!imageSrc) {
                return null;
              }
              
              return (
                <div className="my-8">
                  <ImageWithFallback
                    src={imageSrc}
                    alt={alt || 'Article image'}
                    className="w-full rounded-lg border border-slate-200 shadow-sm"
                    {...props}
                  />
                  {alt && (
                    <p className="text-sm text-slate-500 text-center mt-2 italic">
                      {alt}
                    </p>
                  )}
                </div>
              );
            },
            
            // Custom table styles
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full divide-y divide-slate-200 border border-slate-200" {...props} />
              </div>
            ),
            thead: ({ node, ...props }) => (
              <thead className="bg-slate-50" {...props} />
            ),
            tbody: ({ node, ...props }) => (
              <tbody className="divide-y divide-slate-200 bg-white" {...props} />
            ),
            tr: ({ node, ...props }) => (
              <tr {...props} />
            ),
            th: ({ node, ...props }) => (
              <th className="px-4 py-3 text-left text-slate-900 border-r border-slate-200 last:border-r-0" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="px-4 py-3 text-slate-700 border-r border-slate-200 last:border-r-0" {...props} />
            ),
            
            // Custom horizontal rule
            hr: ({ node, ...props }) => (
              <hr className="my-8 border-slate-200" {...props} />
            ),
            
            // Strong/bold text
            strong: ({ node, ...props }) => (
              <strong className="font-semibold text-slate-900" {...props} />
            ),
            
            // Emphasis/italic text
            em: ({ node, ...props }) => (
              <em className="italic" {...props} />
            ),
          }}
        >
          {markdownContent}
        </ReactMarkdown>
      </div>
      </>
  );
};

