import React from 'react';
import { ArrowRight, TrendingUp, Star, Briefcase, Target, ChevronUp, ChevronDown, MapPin, Scale, TrendingDown, Shield, Network, Globe, Handshake, BrainCog, HandHeart } from 'lucide-react';
import { lawyers } from '../data/siteData';
import { motion, AnimatePresence } from 'motion/react';

interface TableOfContentsProps {
  onNavigate: (page: string) => void;
}

type SortField = 'totalScore' | 'reputationScore' | 'instructionScore' | 'sophisticationScore' | 'experienceScore';
type SortDirection = 'asc' | 'desc';

interface RankingCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  filter: (lawyers: typeof lawyers) => typeof lawyers;
  sortBy: SortField;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ onNavigate }) => {
  const [expandedRanking, setExpandedRanking] = React.useState<string | null>(null);
  const [sortField, setSortField] = React.useState<SortField>('totalScore');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');

  const rankingCategories: RankingCategory[] = [
    {
      id: 'private-capital',
      title: 'Private Capital',
      description: 'Leading practitioners in private equity and venture capital',
      icon: <Briefcase className="w-5 h-5" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      filter: (lawyers) => lawyers.filter(l =>
        l.specialty.some(s => s.toLowerCase().includes('private equity') ||
                             s.toLowerCase().includes('venture capital') ||
                             s.toLowerCase().includes('private capital'))
      ),
      sortBy: 'totalScore'
    },
    {
      id: 'arbitration',
      title: 'Arbitration',
      description: 'Experts in dispute resolution and arbitration proceedings',
      icon: <Scale className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      filter: (lawyers) => lawyers.filter(l =>
        l.specialty.some(s => s.toLowerCase().includes('arbitration') ||
                             s.toLowerCase().includes('dispute'))
      ),
      sortBy: 'totalScore'
    },
    {
      id: 'equity-capital-markets',
      title: 'Equity Capital Markets',
      description: 'Specialists in IPOs and equity financing transactions',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      filter: (lawyers) => lawyers.filter(l =>
        l.specialty.some(s => s.toLowerCase().includes('equity capital') ||
                             s.toLowerCase().includes('ecm') ||
                             s.toLowerCase().includes('ipo'))
      ),
      sortBy: 'totalScore'
    },
    {
      id: 'debt-capital-markets',
      title: 'Debt Capital Markets',
      description: 'Leaders in debt financing and bond issuances',
      icon: <TrendingDown className="w-5 h-5" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      filter: (lawyers) => lawyers.filter(l =>
        l.specialty.some(s => s.toLowerCase().includes('debt capital') ||
                             s.toLowerCase().includes('dcm') ||
                             s.toLowerCase().includes('private credit'))
      ),
      sortBy: 'totalScore'
    },
    {
      id: 'competition',
      title: 'Competition',
      description: 'Authorities in antitrust and competition law',
      icon: <Target className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      filter: (lawyers) => lawyers.filter(l =>
        l.specialty.some(s => s.toLowerCase().includes('competition') ||
                             s.toLowerCase().includes('antitrust'))
      ),
      sortBy: 'totalScore'
    },
    {
      id: 'cyber',
      title: 'Cyber',
      description: 'Cybersecurity, data privacy, and technology law experts',
      icon: <Shield className="w-5 h-5" />,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      filter: (lawyers) => lawyers.filter(l =>
        l.specialty.some(s => s.toLowerCase().includes('cyber') ||
                             s.toLowerCase().includes('data privacy') ||
                             s.toLowerCase().includes('technology'))
      ),
      sortBy: 'totalScore'
    },
    {
      id: 'infrastructure',
      title: 'Infrastructure',
      description: 'Infrastructure development and project finance specialists',
      icon: <Network className="w-5 h-5" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      filter: (lawyers) => lawyers.filter(l =>
        l.specialty.some(s => s.toLowerCase().includes('infrastructure') ||
                             s.toLowerCase().includes('project finance'))
      ),
      sortBy: 'totalScore'
    },
    {
      id: 'international-trade',
      title: 'International Trade',
      description: 'Cross-border trade and regulatory compliance leaders',
      icon: <Globe className="w-5 h-5" />,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      filter: (lawyers) => lawyers.filter(l =>
        l.specialty.some(s => s.toLowerCase().includes('international trade') ||
                             s.toLowerCase().includes('trade') ||
                             s.toLowerCase().includes('cross-border'))
      ),
      sortBy: 'totalScore'
    }
  ];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleRanking = (rankingId: string) => {
    if (expandedRanking === rankingId) {
      setExpandedRanking(null);
    } else {
      setExpandedRanking(rankingId);
      setSortField(rankingCategories.find(c => c.id === rankingId)?.sortBy || 'totalScore');
      setSortDirection('desc');
    }
  };

  const rankByTotalScore = new Map<string, number>();
  [...lawyers]
    .sort((a, b) => b.totalScore - a.totalScore)
    .forEach((lawyer, index) => {
      rankByTotalScore.set(lawyer.id, index + 1);
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

  const getRankedLawyers = (category: RankingCategory) => {
    const filtered = category.filter(lawyers);
    const sortFieldToUse = expandedRanking === category.id ? sortField : category.sortBy;
    const sortDirToUse = expandedRanking === category.id ? sortDirection : 'desc';

    return [...filtered].sort((a, b) => {
      const aValue = a[sortFieldToUse];
      const bValue = b[sortFieldToUse];

      if (sortDirToUse === 'desc') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });
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
          <p className="text-slate-600 text-xl mb-4">
            Explore {lawyers.length} top legal professionals across eight distinct practice area rankings
          </p>
          <p className="text-slate-500">
            Click on any category card to expand and view the complete rankings with sortable columns
          </p>
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

        {/* Ranking Categories Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {rankingCategories.map((category) => {
            const rankedLawyers = getRankedLawyers(category);
            const topLawyers = rankedLawyers.slice(0, 3);
            const avgScore = rankedLawyers.length > 0
              ? rankedLawyers.reduce((sum, l) => sum + l[category.sortBy], 0) / rankedLawyers.length
              : 0;
            const isExpanded = expandedRanking === category.id;

            return (
              <motion.div
                key={category.id}
                layout
                className={`bg-white rounded-lg shadow-sm border-2 ${category.borderColor} overflow-hidden transition-all ${
                  isExpanded ? 'md:col-span-2' : ''
                }`}
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleRanking(category.id)}
                  className={`w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors ${category.bgColor} border-b ${category.borderColor}`}
                >
                  <div className="text-left">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-slate-900">{category.title}</h3>
                      <div className={`w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center ${category.color} flex-shrink-0`}>
                        {category.icon}
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm">{category.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span className="text-slate-500">
                        {rankedLawyers.length} ranked
                      </span>
                      {!isExpanded && rankedLawyers.length > 0 && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className={category.color}>
                            Top: {topLawyers[0]?.[category.sortBy].toFixed(1)}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">
                            Avg: {avgScore.toFixed(1)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="text-slate-400" size={24} />
                  </motion.div>
                </button>

                {/* Collapsed Preview - Top 3 */}
                <AnimatePresence>
                  {!isExpanded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 space-y-3"
                    >
                      {rankedLawyers.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          No lawyers currently ranked in this category
                        </div>
                      ) : (
                        <>
                          {topLawyers.map((lawyer, index) => {
                            const overallRank = rankByTotalScore.get(lawyer.id) || 0;
                            return (
                              <div
                                key={lawyer.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigate(lawyer.id);
                                }}
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                <div className={`w-8 h-8 rounded-lg ${getRankBg(overallRank)} border flex items-center justify-center flex-shrink-0`}>
                                  <span className={`${getRankColor(overallRank)} text-sm`}>{index + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-slate-900 text-sm truncate">{lawyer.name}</div>
                                  <div className="text-slate-500 text-xs truncate">{lawyer.firm}</div>
                                </div>
                                <div className={`px-2 py-1 rounded text-sm ${category.bgColor} ${category.color}`}>
                                  {lawyer[category.sortBy].toFixed(1)}
                                </div>
                              </div>
                            );
                          })}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRanking(category.id);
                            }}
                            className={`w-full py-2 rounded-lg ${category.bgColor} ${category.color} text-center text-sm hover:opacity-80 transition-opacity`}
                          >
                            View All {rankedLawyers.length} Rankings →
                          </button>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expanded Full Table */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Desktop Table */}
                      <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-6 py-4 text-left text-slate-600">Rank</th>
                              <th className="px-6 py-4 text-left text-slate-600">Name</th>
                              <th className="px-6 py-4 text-left text-slate-600">Firm</th>
                              <th
                                className="px-6 py-4 text-center text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors group"
                                onClick={() => handleSort('totalScore')}
                              >
                                <div className="flex items-center justify-center space-x-1">
                                  <span>Total</span>
                                  <SortIcon field="totalScore" />
                                </div>
                              </th>
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
                            {rankedLawyers.map((lawyer, index) => {
                              const rank = rankByTotalScore.get(lawyer.id) || 0;
                              return (
                                <tr
                                  key={lawyer.id}
                                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                                  onClick={() => onNavigate(lawyer.id)}
                                >
                                  <td className="px-6 py-4">
                                    <div className={`w-10 h-10 rounded-lg ${getRankBg(rank)} border flex items-center justify-center`}>
                                      <span className={getRankColor(rank)}>{index + 1}</span>
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
                                  <td className="px-6 py-4">
                                    <div className="text-center">
                                      <div className={`${getRankColor(rank)} inline-block`}>{lawyer.totalScore.toFixed(1)}</div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-center text-slate-600">{lawyer.reputationScore.toFixed(1)}</td>
                                  <td className="px-6 py-4 text-center text-slate-600">{lawyer.instructionScore.toFixed(1)}</td>
                                  <td className="px-6 py-4 text-center text-slate-600">{lawyer.sophisticationScore.toFixed(1)}</td>
                                  <td className="px-6 py-4 text-center text-slate-600">
                                    {lawyer.breakdown.numberOfReferences === 0 ? '–' : lawyer.experienceScore.toFixed(1)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards */}
                      <div className="lg:hidden divide-y divide-slate-200">
                        {rankedLawyers.map((lawyer, index) => {
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
                                    <span className={getRankColor(rank)}>{index + 1}</span>
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
                                  <div className="text-slate-600 mb-1">{lawyer.reputationScore.toFixed(1)}</div>
                                  <div className="text-slate-500">Rep.</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-slate-600 mb-1">{lawyer.instructionScore.toFixed(1)}</div>
                                  <div className="text-slate-500">Inst.</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-slate-600 mb-1">{lawyer.sophisticationScore.toFixed(1)}</div>
                                  <div className="text-slate-500">Soph.</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-slate-600 mb-1">
                                    {lawyer.breakdown.numberOfReferences === 0 ? '–' : lawyer.experienceScore.toFixed(1)}
                                  </div>
                                  <div className="text-slate-500">Exp.</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-8 text-white">
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
