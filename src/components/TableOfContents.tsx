import React from 'react';
import { ArrowRight, TrendingUp, Star, Briefcase, Target, ChevronUp, ChevronDown, MapPin, Scale, TrendingDown, Shield, Network, Globe, Handshake, BrainCog, HandHeart, X } from 'lucide-react';
import { lawyers, getLawyerPracticeAreas, getLawyerRanking, Lawyer } from '../data/siteData';
import { motion, AnimatePresence } from 'motion/react';

interface TableOfContentsProps {
  onNavigate: (page: string) => void;
}

type SortField = 'totalScore' | 'reputationScore' | 'instructionScore' | 'sophisticationScore' | 'experienceScore';
type SortDirection = 'asc' | 'desc';

interface RankingCategory {
  id: string;
  title: string;
  practiceArea: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

const INDICATORS = [
  {
    key: 'reputation',
    label: 'Reputation',
    sublabel: 'Market Profile',
    Icon: Star,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-50',
    activeBg: 'bg-red-50',
    activeBorder: 'border-red-200',
    hoverBorder: 'hover:border-red-200',
    panelBg: 'bg-red-50/50',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    key: 'instruction',
    label: 'Instruction',
    sublabel: 'Clients & Work',
    Icon: Handshake,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    activeBg: 'bg-emerald-50',
    activeBorder: 'border-emerald-200',
    hoverBorder: 'hover:border-emerald-200',
    panelBg: 'bg-emerald-50/50',
    description:
      'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper.',
  },
  {
    key: 'sophistication',
    label: 'Sophistication',
    sublabel: 'of Practice',
    Icon: BrainCog,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    activeBg: 'bg-amber-50',
    activeBorder: 'border-amber-200',
    hoverBorder: 'hover:border-amber-200',
    panelBg: 'bg-amber-50/50',
    description:
      'Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Donec sed odio dui. Aenean eu leo quam. Pellentesque ornare sem lacinia quam.',
  },
  {
    key: 'experience',
    label: 'Experience',
    sublabel: 'User Reviews',
    Icon: HandHeart,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
    activeBg: 'bg-purple-50',
    activeBorder: 'border-purple-200',
    hoverBorder: 'hover:border-purple-200',
    panelBg: 'bg-purple-50/50',
    description:
      'Cras mattis consectetur purus sit amet fermentum. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Maecenas sed diam eget risus varius blandit sit amet non magna.',
  },
];

export const TableOfContents: React.FC<TableOfContentsProps> = ({ onNavigate }) => {
  const [expandedRanking, setExpandedRanking] = React.useState<string | null>(null);
  const [expandedIndicator, setExpandedIndicator] = React.useState<string | null>(null);
  const [sortField, setSortField] = React.useState<SortField>('totalScore');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');

  React.useEffect(() => {
    if (expandedRanking) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [expandedRanking]);

  React.useEffect(() => {
    if (!expandedRanking) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpandedRanking(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [expandedRanking]);

  const rankingCategories: RankingCategory[] = [
    {
      id: 'private-capital',
      title: 'Private Capital',
      practiceArea: 'Private Capital',
      description: 'Leading practitioners in private equity and venture capital',
      icon: <Briefcase className="w-5 h-5" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    {
      id: 'arbitration',
      title: 'Arbitration',
      practiceArea: 'Arbitration',
      description: 'Experts in dispute resolution and arbitration proceedings',
      icon: <Scale className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      id: 'equity-capital-markets',
      title: 'Equity Capital Markets',
      practiceArea: 'Equity Capital Markets',
      description: 'Specialists in IPOs and equity financing transactions',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      id: 'debt-capital-markets',
      title: 'Debt Capital Markets',
      practiceArea: 'Debt Capital Markets',
      description: 'Leaders in debt financing and bond issuances',
      icon: <TrendingDown className="w-5 h-5" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
    },
    {
      id: 'competition',
      title: 'Competition',
      practiceArea: 'Competition',
      description: 'Authorities in antitrust and competition law',
      icon: <Target className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      id: 'cyber',
      title: 'Cyber',
      practiceArea: 'Cyber',
      description: 'Cybersecurity, data privacy, and technology law experts',
      icon: <Shield className="w-5 h-5" />,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
    },
    {
      id: 'infrastructure',
      title: 'Infrastructure',
      practiceArea: 'Infrastructure',
      description: 'Infrastructure development and project finance specialists',
      icon: <Network className="w-5 h-5" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      id: 'international-trade',
      title: 'International Trade',
      practiceArea: 'International Trade',
      description: 'Cross-border trade and regulatory compliance leaders',
      icon: <Globe className="w-5 h-5" />,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
    },
  ];

  const getCategoryScore = (lawyer: Lawyer, field: SortField, practiceArea: string): number => {
    if (field === 'sophisticationScore') return lawyer.sophisticationScore;
    if (field === 'experienceScore') return lawyer.experienceScore;
    const ranking = getLawyerRanking(lawyer, practiceArea);
    if (!ranking) return 0;
    if (field === 'totalScore') return ranking.totalScore;
    if (field === 'reputationScore') return ranking.reputationScore;
    if (field === 'instructionScore') return ranking.instructionScore;
    return 0;
  };

  const getLawyersForCategory = (category: RankingCategory) => {
    return lawyers.filter((l) => getLawyerPracticeAreas(l).includes(category.practiceArea));
  };

  const getSortedLawyers = (category: RankingCategory, field: SortField, direction: SortDirection) => {
    const filtered = getLawyersForCategory(category);
    return [...filtered].sort((a, b) => {
      const aVal = getCategoryScore(a, field, category.practiceArea);
      const bVal = getCategoryScore(b, field, category.practiceArea);
      return direction === 'desc' ? bVal - aVal : aVal - bVal;
    });
  };

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
      setSortField('totalScore');
      setSortDirection('desc');
    }
  };

  const handleLightboxRowClick = (lawyerId: string) => {
    setExpandedRanking(null);
    onNavigate(lawyerId);
  };

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
    return sortDirection === 'desc' ? (
      <ChevronDown size={16} className="text-slate-600" />
    ) : (
      <ChevronUp size={16} className="text-slate-600" />
    );
  };

  const activeCategory = rankingCategories.find((c) => c.id === expandedRanking);
  const activeIndicator = INDICATORS.find((i) => i.key === expandedIndicator);
  const lightboxLawyers = activeCategory ? getSortedLawyers(activeCategory, sortField, sortDirection) : [];

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

        {/* Score Legend - Interactive Accordion */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
          <h3 className="text-slate-900 mb-4">Understanding the Scores</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {INDICATORS.map((indicator) => {
              const isActive = expandedIndicator === indicator.key;
              return (
                <button
                  key={indicator.key}
                  onClick={() => setExpandedIndicator(isActive ? null : indicator.key)}
                  className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all text-left ${
                    isActive
                      ? `${indicator.activeBg} ${indicator.activeBorder}`
                      : `bg-white border-transparent ${indicator.hoverBorder}`
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-lg ${indicator.iconBg} flex items-center justify-center flex-shrink-0`}
                  >
                    <indicator.Icon className={indicator.iconColor} size={20} />
                  </div>
                  <div>
                    <div className="text-slate-900">{indicator.label}</div>
                    <div className="text-slate-500 text-sm">{indicator.sublabel}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <AnimatePresence mode="wait">
            {activeIndicator && (
              <motion.div
                key={activeIndicator.key}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className={`mt-4 p-4 rounded-lg ${activeIndicator.panelBg}`}>
                  <p className="text-slate-600 text-sm leading-relaxed">{activeIndicator.description}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Ranking Categories Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {rankingCategories.map((category) => {
            const categoryLawyers = getLawyersForCategory(category);
            const sorted = [...categoryLawyers].sort((a, b) => {
              const aTotal = getCategoryScore(a, 'totalScore', category.practiceArea);
              const bTotal = getCategoryScore(b, 'totalScore', category.practiceArea);
              return bTotal - aTotal;
            });
            const topLawyers = sorted.slice(0, 3);
            const avgScore =
              sorted.length > 0
                ? sorted.reduce((sum, l) => sum + getCategoryScore(l, 'totalScore', category.practiceArea), 0) /
                  sorted.length
                : 0;

            return (
              <div key={category.id} className={`bg-white rounded-lg shadow-sm border-2 ${category.borderColor} overflow-hidden`}>
                <button
                  onClick={() => toggleRanking(category.id)}
                  className={`w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors ${category.bgColor} border-b ${category.borderColor}`}
                >
                  <div className="text-left">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-slate-900">{category.title}</h3>
                      <div
                        className={`w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center ${category.color} flex-shrink-0`}
                      >
                        {category.icon}
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm">{category.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span className="text-slate-500">{sorted.length} ranked</span>
                      {sorted.length > 0 && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className={category.color}>
                            Top: {getCategoryScore(topLawyers[0], 'totalScore', category.practiceArea).toFixed(1)}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">Avg: {avgScore.toFixed(1)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="text-slate-400" size={24} />
                </button>

                <div className="p-4 space-y-3">
                  {sorted.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">No lawyers currently ranked in this category</div>
                  ) : (
                    <>
                      {topLawyers.map((lawyer, index) => (
                        <div
                          key={lawyer.id}
                          onClick={() => onNavigate(lawyer.id)}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <div
                            className={`w-8 h-8 rounded-lg ${getRankBg(index + 1)} border flex items-center justify-center flex-shrink-0`}
                          >
                            <span className={`${getRankColor(index + 1)} text-sm`}>{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-slate-900 text-sm truncate">{lawyer.name}</div>
                            <div className="text-slate-500 text-xs truncate">{lawyer.firm}</div>
                          </div>
                          <div className={`px-2 py-1 rounded text-sm ${category.bgColor} ${category.color}`}>
                            {getCategoryScore(lawyer, 'totalScore', category.practiceArea).toFixed(1)}
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRanking(category.id);
                        }}
                        className={`w-full py-2 rounded-lg ${category.bgColor} ${category.color} text-center text-sm hover:opacity-80 transition-opacity`}
                      >
                        View All {sorted.length} Rankings →
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {expandedRanking && activeCategory && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-x-0 bottom-0 top-16 bg-black/60 z-40"
                onClick={() => setExpandedRanking(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-x-0 bottom-0 top-16 z-50 flex items-center justify-center p-4 pointer-events-none"
              >
                <div
                  className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[85vh] overflow-hidden flex flex-col pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div
                    className={`flex items-center justify-between p-6 border-b ${activeCategory.borderColor} ${activeCategory.bgColor}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center ${activeCategory.color}`}
                      >
                        {activeCategory.icon}
                      </div>
                      <div>
                        <h2 className="text-slate-900 text-lg font-semibold">{activeCategory.title} Rankings</h2>
                        <p className="text-slate-500 text-sm">{lightboxLawyers.length} lawyers ranked</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedRanking(null)}
                      className="w-10 h-10 rounded-lg hover:bg-white/80 flex items-center justify-center transition-colors"
                    >
                      <X className="text-slate-500" size={20} />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="overflow-auto flex-1">
                    {/* Desktop Table */}
                    <div className="hidden lg:block">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
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
                          {lightboxLawyers.map((lawyer, index) => {
                            const rank = index + 1;
                            return (
                              <tr
                                key={lawyer.id}
                                className="hover:bg-slate-50 transition-colors cursor-pointer"
                                onClick={() => handleLightboxRowClick(lawyer.id)}
                              >
                                <td className="px-6 py-4">
                                  <div
                                    className={`w-10 h-10 rounded-lg ${getRankBg(rank)} border flex items-center justify-center`}
                                  >
                                    <span className={getRankColor(rank)}>{rank}</span>
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
                                    <div className={`${getRankColor(rank)} inline-block`}>
                                      {getCategoryScore(lawyer, 'totalScore', activeCategory.practiceArea).toFixed(1)}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center text-slate-600">
                                  {getCategoryScore(lawyer, 'reputationScore', activeCategory.practiceArea).toFixed(1)}
                                </td>
                                <td className="px-6 py-4 text-center text-slate-600">
                                  {getCategoryScore(lawyer, 'instructionScore', activeCategory.practiceArea).toFixed(1)}
                                </td>
                                <td className="px-6 py-4 text-center text-slate-600">
                                  {lawyer.sophisticationScore.toFixed(1)}
                                </td>
                                <td className="px-6 py-4 text-center text-slate-600">
                                  {lawyer.breakdown.numberOfReferences === 0
                                    ? '–'
                                    : lawyer.experienceScore.toFixed(1)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden divide-y divide-slate-200">
                      {lightboxLawyers.map((lawyer, index) => {
                        const rank = index + 1;
                        return (
                          <div
                            key={lawyer.id}
                            className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => handleLightboxRowClick(lawyer.id)}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start space-x-3">
                                <div
                                  className={`w-10 h-10 rounded-lg ${getRankBg(rank)} border flex items-center justify-center flex-shrink-0`}
                                >
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
                                  <div className="text-slate-500">{getLawyerPracticeAreas(lawyer).join(', ')}</div>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              <div className="text-center">
                                <div className="text-slate-600 mb-1">
                                  {getCategoryScore(lawyer, 'reputationScore', activeCategory.practiceArea).toFixed(1)}
                                </div>
                                <div className="text-slate-500">Rep.</div>
                              </div>
                              <div className="text-center">
                                <div className="text-slate-600 mb-1">
                                  {getCategoryScore(lawyer, 'instructionScore', activeCategory.practiceArea).toFixed(1)}
                                </div>
                                <div className="text-slate-500">Inst.</div>
                              </div>
                              <div className="text-center">
                                <div className="text-slate-600 mb-1">{lawyer.sophisticationScore.toFixed(1)}</div>
                                <div className="text-slate-500">Soph.</div>
                              </div>
                              <div className="text-center">
                                <div className="text-slate-600 mb-1">
                                  {lawyer.breakdown.numberOfReferences === 0
                                    ? '–'
                                    : lawyer.experienceScore.toFixed(1)}
                                </div>
                                <div className="text-slate-500">Exp.</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

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
