import React from 'react';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';
import { Article } from '../data/siteData';
import { ArticleContent } from './ArticleContent';

interface ArticlePageProps {
  article: Article;
  onNavigate: (page: string) => void;
}

export const ArticlePage: React.FC<ArticlePageProps> = ({ article, onNavigate }) => {
  const categoryConfig = {
    methodology: {
      label: 'Methodology',
      color: 'bg-blue-100 text-blue-700',
      borderColor: 'border-blue-200'
    },
    insights: {
      label: 'Insights',
      color: 'bg-amber-100 text-amber-700',
      borderColor: 'border-amber-200'
    }
  };

  const config = categoryConfig[article.category];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('insights')}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Insights</span>
        </button>

        {/* Article Header */}
        <article className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-8 border-b border-slate-200">
            <div className="flex items-center space-x-3 mb-4">
              <span className={`px-3 py-1 rounded-full ${config.color}`}>
                {config.label}
              </span>
            </div>
            
            <h1 className="text-slate-900 mb-6">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-6">
              <div className="flex items-center space-x-2">
                <User size={18} />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={18} />
                <span>{new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="p-8">
            <ArticleContent
              articleId={article.id}
              markdownContent={article.markdownContent}
            />
          </div>

          {/* Article Footer */}
          <div className="p-8 bg-slate-50 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-2 text-slate-600">
                <Share2 size={18} />
                <span>Share this article</span>
              </div>
              <button
                onClick={() => onNavigate('insights')}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>Read More Articles</span>
                <ArrowLeft size={16} className="rotate-180" />
              </button>
            </div>
          </div>
        </article>

        {/* Related Content CTA */}
        <div className="mt-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-8 text-white">
          <h2 className="text-white mb-4">Explore Lawyer Profiles</h2>
          <p className="mb-6 text-amber-50">
            See how our research methodology is applied to evaluate top legal professionals.
          </p>
          <button
            onClick={() => onNavigate('table-of-contents')}
            className="bg-white text-amber-600 hover:bg-amber-50 px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
          >
            <span>View Rankings</span>
            <ArrowLeft size={20} className="rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
