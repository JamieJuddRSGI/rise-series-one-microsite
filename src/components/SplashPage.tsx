import React from 'react';
import { ArrowRight } from 'lucide-react';
import { reportMetadata, lawyers } from '../data/siteData';
import rankingsImage from '../assets/site/Rankings.png';
import profilesImage from '../assets/site/Profiles.png';
import insightsImage from '../assets/site/Insights.png';
import riseLogo from '../assets/site/RISE Logo.png';

interface SplashPageProps {
  onNavigate: (page: string) => void;
}

export const SplashPage: React.FC<SplashPageProps> = ({ onNavigate}) => {
  // Calculate total client reviews (sum of all numberOfReferences)
  const totalClientReviews = lawyers.reduce((sum, lawyer) => sum + lawyer.breakdown.numberOfReferences, 0);
  
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="bg-[#ef3c24]/10 border border-[#ef3c24]/20 rounded-full px-4 py-2" style={{ color: '#ef3c24' }}>
              {reportMetadata.publishDate}
            </div>
          </div>
          <div className="mb-6 flex justify-center items-center">
            <img src={riseLogo} alt="RISE Logo" className="h-auto mx-auto" style={{ width: '50%', maxWidth: '50%' }} />
          </div>
          <h1 className="mb-6 max-w-4xl mx-auto" style={{ color: '#000000' }}>
            {reportMetadata.title}
          </h1>
          <p className="text-xl max-w-3xl mx-auto mb-12" style={{ color: '#575757' }}>
            Comprehensive research and RISE analysis of India's top lawyers in private capital, 
            featuring in-depth profiles, comparative rankings, and actionable insights.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => onNavigate('table-of-contents')}
              className="px-8 py-3 rounded-lg transition-colors flex items-center space-x-2"
              style={{ backgroundColor: '#ef3c24', color: '#ffffff' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d23520'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef3c24'}
            >
              <span>View Rankings</span>
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => onNavigate('insights')}
              className="px-8 py-3 rounded-lg transition-colors flex items-center space-x-2 border"
              style={{ backgroundColor: '#ffffff', color: '#000000', borderColor: '#e2e8f0' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <span>Read Insights</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
              <img src={rankingsImage} alt="Rankings" className="w-full h-full object-cover rounded-lg" />
            </div>
            <h3 className="mb-3" style={{ color: '#000000' }}>
              Comprehensive Rankings
            </h3>
            <p className="mb-4" style={{ color: '#575757' }}>
              Detailed comparative scores across experience, client satisfaction, and innovation metrics for top legal professionals.
            </p>
            <button
              onClick={() => onNavigate('table-of-contents')}
              className="flex items-center space-x-1 transition-colors"
              style={{ color: '#ef3c24' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#d23520'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#ef3c24'}
            >
              <span>Explore rankings</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
              <img src={profilesImage} alt="Profiles" className="w-full h-full object-cover rounded-lg" />
            </div>
            <h3 className="mb-3" style={{ color: '#000000' }}>
              In-Depth Profiles
            </h3>
            <p className="mb-4" style={{ color: '#575757' }}>
              Complete professional profiles featuring achievements, recent cases, and detailed performance analysis.
            </p>
            <button
              onClick={() => onNavigate('profiles')}
              className="flex items-center space-x-1 transition-colors"
              style={{ color: '#ef3c24' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#d23520'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#ef3c24'}
            >
              <span>View profiles</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
              <img src={insightsImage} alt="Insights" className="w-full h-full object-cover rounded-lg" />
            </div>
            <h3 className="mb-3" style={{ color: '#000000' }}>
              Research & Insights
            </h3>
            <p className="mb-4" style={{ color: '#575757' }}>
              Expert analysis on industry trends, methodology deep-dives, and actionable insights for legal professionals.
            </p>
            <button
              onClick={() => onNavigate('insights')}
              className="flex items-center space-x-1 transition-colors"
              style={{ color: '#ef3c24' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#d23520'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#ef3c24'}
            >
              <span>Read insights</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-2" style={{ color: '#ef3c24' }}>{reportMetadata.totalLawyers}</div>
            <div style={{ color: '#575757' }}>Ranked Practitioners</div>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2" style={{ color: '#ef3c24' }}>29</div>
            <div style={{ color: '#575757' }}>Law Firms Surveyed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2" style={{ color: '#ef3c24' }}>18</div>
            <div style={{ color: '#575757' }}>Key Metrics</div>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2" style={{ color: '#ef3c24' }}>{totalClientReviews}</div>
            <div style={{ color: '#575757' }}>Client Reviews</div>
          </div>
        </div>
      </div>
    </div>
  );
};
