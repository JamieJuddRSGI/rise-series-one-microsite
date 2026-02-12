import React from 'react';
import { ArrowRight, TrendingUp, Users, Award, Star, Briefcase, Target, ChevronUp, ChevronDown, MapPin, Handshake, BrainCog, HandHeart } from 'lucide-react';
import { lawyers } from '../data/siteData';
import { calculateRankingsWithTies } from '../utils/rankings';
import { formatScoreToTwoDecimals } from '../utils/scoreFormatting';

interface TableOfContentsProps {
  onNavigate: (page: string) => void;
}

type SortField = 'rank' | 'reputationScore' | 'instructionScore' | 'sophisticationScore' | 'experienceScore';
type SortDirection = 'asc' | 'desc';

export const TableOfContents: React.FC<TableOfContentsProps> = ({ onNavigate }) => {
  const [sortField, setSortField] = React.useState<SortField>('rank');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      // New field: rank defaults to ascending, others to descending
      setSortField(field);
      setSortDirection(field === 'rank' ? 'asc' : 'desc');
    }
  };

  // Create a map of lawyer ID to their total score rank (with ties handled)
  const { rankings: rankByTotalScore } = calculateRankingsWithTies(lawyers, l => l.totalScore);

  const sortedLawyers = [...lawyers].sort((a, b) => {
    let aValue: number;
    let bValue: number;
    
    if (sortField === 'rank') {
      // For rank sorting, look up ranks from the Map
      aValue = rankByTotalScore.get(a.id) || 0;
      bValue = rankByTotalScore.get(b.id) || 0;
    } else {
      // For score fields, use the score directly
      aValue = a[sortField];
      bValue = b[sortField];
    }
    
    if (sortDirection === 'desc') {
      return bValue - aValue;
    } else {
      return aValue - bValue;
    }
  });

  const getRankColor = (rank: number) => {
    if (rank <= 10) return 'text-emerald-600';
    if (rank <= 25) return 'text-blue-600';
    return 'text-slate-600';
  };

  const getRankBg = (rank: number) => {
    if (rank <= 10) return 'bg-emerald-500/10 border-emerald-500/20';
    if (rank <= 25) return 'bg-blue-500/10 border-blue-500/20';
    return 'bg-slate-500/10 border-slate-500/20';
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) {
      return <ChevronDown size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === 'desc' 
      ? <ChevronDown size={16} className="text-slate-600" />
      : <ChevronUp size={16} className="text-slate-600" />;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-2 text-slate-600 mb-4">
            <TrendingUp size={20} />
            <span>Comparative Rankings</span>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
          <h3 className="text-slate-900 mb-4">Understanding the Scores</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
                <Star className="text-red-600" size={20} />
              </div>
              <div>
                <div className="text-slate-900">Reputation</div>
                <div className="text-slate-500">Market Profile</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Handshake className="text-emerald-600" size={20} />
              </div>
              <div>
                <div className="text-slate-900">Instruction</div>
                <div className="text-slate-500">Clients & Work</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
                <BrainCog className="text-amber-600" size={20} />
              </div>
              <div>
                <div className="text-slate-900">Sophistication</div>
                <div className="text-slate-500">of Practice</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                <HandHeart className="text-purple-600" size={20} />
              </div>
              <div>
                <div className="text-slate-900">Experience</div>
                <div className="text-slate-500">User Reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Rankings Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th 
                    className="px-6 py-4 text-center text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors group"
                    onClick={() => handleSort('rank')}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>Rank</span>
                      <SortIcon field="rank" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-slate-600">Name</th>
                  <th className="px-6 py-4 text-left text-slate-600">Firm</th>
                  <th 
                    className="px-6 py-4 text-center text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors group"
                    onClick={() => handleSort('reputationScore')}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>Reputation</span>
                      <SortIcon field="reputationScore" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors group"
                    onClick={() => handleSort('instructionScore')}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>Instruction</span>
                      <SortIcon field="instructionScore" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors group"
                    onClick={() => handleSort('sophisticationScore')}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>Sophistication</span>
                      <SortIcon field="sophisticationScore" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors group"
                    onClick={() => handleSort('experienceScore')}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>Experience</span>
                      <SortIcon field="experienceScore" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedLawyers.map((lawyer) => {
                  const rank = rankByTotalScore.get(lawyer.id) || 0;
                  return (
                    <tr 
                      key={lawyer.id} 
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => onNavigate(lawyer.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="text-center">
                          <div className={`w-10 h-10 rounded-lg ${getRankBg(rank)} border flex items-center justify-center mx-auto`}>
                            <span className={getRankColor(rank)}>{rank}</span>
                          </div>
                        </div>
                      </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900">{lawyer.name}</div>
                      <div className="text-slate-500 text-sm">{lawyer.jobTitle}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600">{lawyer.firm}</div>
                      <div className="text-slate-500 text-sm flex items-center">
                        <MapPin size={12} className="mr-1" />
                        {lawyer.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600">{formatScoreToTwoDecimals(lawyer.reputationScore)}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{formatScoreToTwoDecimals(lawyer.instructionScore)}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{formatScoreToTwoDecimals(lawyer.sophisticationScore)}</td>
                    <td className="px-6 py-4 text-center text-slate-600">
                      {lawyer.breakdown.numberOfReferences === 0 ? '–' : formatScoreToTwoDecimals(lawyer.experienceScore)}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-slate-200">
            {sortedLawyers.map((lawyer) => {
              const rank = rankByTotalScore.get(lawyer.id) || 0;
              return (
                <div 
                  key={lawyer.id} 
                  className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => onNavigate(lawyer.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-lg ${getRankBg(rank)} border flex items-center justify-center flex-shrink-0`}>
                        <span className={getRankColor(rank)}>{rank}</span>
                      </div>
                    <div>
                      <div className="text-slate-900">{lawyer.name}</div>
                      <div className="text-slate-600 text-sm">{lawyer.jobTitle}</div>
                      <div className="text-slate-600">{lawyer.firm}</div>
                      <div className="text-slate-500 text-sm flex items-center">
                        <MapPin size={12} className="mr-1" />
                        {lawyer.location}
                      </div>
                      <div className="text-slate-500">{lawyer.specialty.join(', ')}</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    <div className="text-center">
                    <div className="text-slate-600 mb-1">{formatScoreToTwoDecimals(lawyer.reputationScore)}</div>
                    <div className="text-slate-500">Rep.</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-600 mb-1">{formatScoreToTwoDecimals(lawyer.instructionScore)}</div>
                    <div className="text-slate-500">Inst.</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-600 mb-1">{formatScoreToTwoDecimals(lawyer.sophisticationScore)}</div>
                    <div className="text-slate-500">Soph.</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-600 mb-1">
                      {lawyer.breakdown.numberOfReferences === 0 ? '–' : formatScoreToTwoDecimals(lawyer.experienceScore)}
                    </div>
                    <div className="text-slate-500">Exp.</div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-8 text-white">
          <h2 className="text-white mb-4">Learn About Our Methodology</h2>
          <p className="mb-6 text-slate-300">
            Understand how we evaluate and score legal professionals across multiple dimensions of excellence.
          </p>
          <button
            onClick={() => onNavigate('article-1')}
            className="bg-white text-slate-900 px-6 py-3 rounded-lg hover:bg-slate-100 transition-colors inline-flex items-center space-x-2"
          >
            <span>Read Methodology</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
