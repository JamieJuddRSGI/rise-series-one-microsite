import React from 'react';
import { FileText, Calendar, User, ArrowRight, BookOpen, Lightbulb } from 'lucide-react';
import { articles } from '../data/siteData';

interface InsightsPageProps {
  onNavigate: (page: string) => void;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ onNavigate }) => {
  const methodologyArticles = articles.filter(a => a.category === 'methodology');
  const insightArticles = articles.filter(a => a.category === 'insights');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-2 text-slate-600 mb-4">
            <FileText size={20} />
            <span>Insights & Methodology</span>
          </div>
          <p className="text-slate-600 text-xl">
            Explore our research methodology, industry analysis, and actionable insights for private capital practices.
          </p>
        </div>

        {/* Methodology Section */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="text-blue-600" size={20} />
            </div>
            <h2 className="text-slate-900">Methodology</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {methodologyArticles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-slate-900 mb-2">{article.title}</h3>
                  </div>
                </div>
                <div className="flex items-center justify-between text-slate-500 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User size={14} />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{new Date(article.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate(article.id)}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Read Article</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Insights Section */}
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="text-amber-600" size={20} />
            </div>
            <h2 className="text-slate-900">Industry Insights</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {insightArticles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-slate-900 mb-2">{article.title}</h3>
                  </div>
                </div>
                <div className="flex items-center justify-between text-slate-500 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User size={14} />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{new Date(article.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate(article.id)}
                  className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Read Article</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-8 text-white">
          <h2 className="text-white mb-4">Explore Lawyer Rankings</h2>
          <p className="mb-6 text-slate-300">
            View detailed profiles and comparative scores for the top legal professionals in the industry.
          </p>
          <button
            onClick={() => onNavigate('table-of-contents')}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
          >
            <span>View Rankings</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
