import React from 'react';
import { ArrowLeft, Briefcase, Award, TrendingUp, Scale, Star, Handshake, BrainCog, HandHeart, ChevronDown, ChevronUp, MapPin, User, SquareArrowOutUpRight } from 'lucide-react';
import { Lawyer, lawyers, getLawyerPracticeAreas, getLawyerRanking, PracticeAreaScores } from '../data/siteData';
import { getLawyerPhoto } from '../assets/lawyers/photoImports';
import { calculateRankingsWithTies, getRankingText as getRankingTextUtil, formatOrdinal } from '../utils/rankings';
import { formatScoreToTwoDecimals, formatScore } from '../utils/scoreFormatting';

interface LawyerProfileProps {
  lawyer: Lawyer;
  onNavigate: (page: string) => void;
}

export const LawyerProfile: React.FC<LawyerProfileProps> = ({ lawyer, onNavigate }) => {
  const [expandedSection, setExpandedSection] = React.useState<string | null>(null);

  const lawyerPracticeAreas = getLawyerPracticeAreas(lawyer);
  const [selectedPracticeArea, setSelectedPracticeArea] = React.useState<string>(
    lawyerPracticeAreas[0] ?? '',
  );

  const currentRanking = getLawyerRanking(lawyer, selectedPracticeArea);

  const currentScores = {
    totalScore: currentRanking?.totalScore ?? 0,
    reputationScore: currentRanking?.reputationScore ?? 0,
    instructionScore: currentRanking?.instructionScore ?? 0,
  };

  const averages = React.useMemo(() => {
    const practiceAreaLawyers = lawyers.filter((l) =>
      getLawyerPracticeAreas(l).includes(selectedPracticeArea),
    );

    const paAvg = (getter: (r: PracticeAreaScores) => number) => {
      const scores = practiceAreaLawyers
        .map((l) => getLawyerRanking(l, selectedPracticeArea))
        .filter((r): r is PracticeAreaScores => r !== undefined)
        .map(getter);
      return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    };

    const allAvg = (getter: (l: Lawyer) => number) => {
      return lawyers.length > 0 ? lawyers.reduce((sum, l) => sum + getter(l), 0) / lawyers.length : 0;
    };

    return {
      reputationScore: paAvg((r) => r.reputationScore),
      instructionScore: paAvg((r) => r.instructionScore),
      sophisticationScore: allAvg((l) => l.sophisticationScore),
      experienceScore: allAvg((l) => l.experienceScore),
      breakdown: {
        peerRecommendations: paAvg((r) => r.peerRecommendations),
        directoryRankings: paAvg((r) => r.directoryRankings),
        mediaProfile: paAvg((r) => r.mediaProfile),
        dealVolume: paAvg((r) => r.dealVolume),
        dealValue: paAvg((r) => r.dealValue),
        clients: paAvg((r) => r.clients),
        aiAndTechnology: allAvg((l) => l.breakdown.aiAndTechnology),
        dataDrivenPractice: allAvg((l) => l.breakdown.dataDrivenPractice),
        pricingModels: allAvg((l) => l.breakdown.pricingModels),
        valueAdds: allAvg((l) => l.breakdown.valueAdds),
        expertise: allAvg((l) => l.breakdown.expertise),
        service: allAvg((l) => l.breakdown.service),
        commerciality: allAvg((l) => l.breakdown.commerciality),
        communication: allAvg((l) => l.breakdown.communication),
        eq: allAvg((l) => l.breakdown.eq),
        strategy: allAvg((l) => l.breakdown.strategy),
        network: allAvg((l) => l.breakdown.network),
        leadership: allAvg((l) => l.breakdown.leadership),
      },
    };
  }, [selectedPracticeArea]);

  const { rankings, tiedRanks } = React.useMemo(() => {
    const practiceAreaLawyers = lawyers.filter((l) =>
      getLawyerPracticeAreas(l).includes(selectedPracticeArea),
    );

    const totalResult = calculateRankingsWithTies(
      practiceAreaLawyers,
      (l) => getLawyerRanking(l, selectedPracticeArea)?.totalScore ?? 0,
    );
    const reputationResult = calculateRankingsWithTies(
      practiceAreaLawyers,
      (l) => getLawyerRanking(l, selectedPracticeArea)?.reputationScore ?? 0,
    );
    const instructionResult = calculateRankingsWithTies(
      practiceAreaLawyers,
      (l) => getLawyerRanking(l, selectedPracticeArea)?.instructionScore ?? 0,
    );
    const sophisticationResult = calculateRankingsWithTies(lawyers, (l) => l.sophisticationScore);
    const experienceResult = calculateRankingsWithTies(lawyers, (l) => l.experienceScore);

    return {
      rankings: {
        totalScore: totalResult.rankings.get(lawyer.id) || 0,
        reputationScore: reputationResult.rankings.get(lawyer.id) || 0,
        instructionScore: instructionResult.rankings.get(lawyer.id) || 0,
        sophisticationScore: sophisticationResult.rankings.get(lawyer.id) || 0,
        experienceScore: experienceResult.rankings.get(lawyer.id) || 0,
      },
      tiedRanks: {
        totalScore: totalResult.tiedRanks,
        reputationScore: reputationResult.tiedRanks,
        instructionScore: instructionResult.tiedRanks,
        sophisticationScore: sophisticationResult.tiedRanks,
        experienceScore: experienceResult.tiedRanks,
      },
    };
  }, [lawyer.id, selectedPracticeArea]);

  const scoreMetrics = [
    { label: 'Rank', value: rankings.totalScore, icon: Award, color: 'slate' },
    { label: 'Reputation', value: currentScores.reputationScore, icon: Star, color: 'red' },
    { label: 'Instruction', value: currentScores.instructionScore, icon: Handshake, color: 'emerald' },
    { label: 'Sophistication', value: lawyer.sophisticationScore, icon: BrainCog, color: 'amber' },
    { label: 'Experience', value: lawyer.experienceScore, icon: HandHeart, color: 'purple' },
  ];

  const breakdownSections = [
    {
      id: 'reputation',
      title: 'Reputation Breakdown',
      score: currentScores.reputationScore,
      color: 'red',
      items: [
        { label: 'Peer and Client Recommendations', value: currentRanking?.peerRecommendations ?? 0 },
        { label: 'Directory Rankings', value: currentRanking?.directoryRankings ?? 0 },
        { label: 'Media Profile', value: currentRanking?.mediaProfile ?? 0 },
      ],
    },
    {
      id: 'instruction',
      title: 'Instruction Breakdown',
      score: currentScores.instructionScore,
      color: 'green',
      items: [
        { label: 'Deal Volume', value: currentRanking?.dealVolume ?? 0 },
        { label: 'Deal Value', value: currentRanking?.dealValue ?? 0 },
        { label: 'Clients', value: currentRanking?.clients ?? 0 },
      ],
    },
    {
      id: 'sophistication',
      title: 'Sophistication Breakdown',
      score: lawyer.sophisticationScore,
      color: 'yellow',
      items: [
        { label: 'AI and Technology', value: lawyer.breakdown.aiAndTechnology },
        { label: 'Data-driven Practice', value: lawyer.breakdown.dataDrivenPractice },
        { label: 'Pricing Models', value: lawyer.breakdown.pricingModels },
        { label: 'Value Added Services', value: lawyer.breakdown.valueAdds },
      ],
    },
    {
      id: 'experience',
      title: 'Experience Breakdown',
      score: lawyer.experienceScore,
      color: 'purple',
      items: [
        { label: 'Expertise', value: lawyer.breakdown.expertise },
        { label: 'Service', value: lawyer.breakdown.service },
        { label: 'Commerciality', value: lawyer.breakdown.commerciality },
        { label: 'Communication', value: lawyer.breakdown.communication },
        { label: 'EQ', value: lawyer.breakdown.eq },
        { label: 'Strategy', value: lawyer.breakdown.strategy },
        { label: 'Network', value: lawyer.breakdown.network },
        { label: 'Leadership', value: lawyer.breakdown.leadership },
      ],
    },
  ];

  const getRankingText = (rank: number, isTied: boolean) => {
    return getRankingTextUtil(rank, isTied);
  };

  const getRankingPillClasses = (rank: number) => {
    if (rank <= 10) return 'bg-emerald-100 text-emerald-700';
    if (rank <= 25) return 'bg-blue-100 text-blue-700';
    return null;
  };

  const shouldShowRankingPill = (rank: number) => {
    return rank <= 25;
  };

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; border: string; text: string; icon: string } } = {
      slate: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', icon: 'text-slate-600' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', icon: 'text-purple-600' },
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', icon: 'text-blue-600' },
      emerald: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-600',
        icon: 'text-emerald-600',
      },
      green: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-600',
        icon: 'text-emerald-600',
      },
      amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', icon: 'text-amber-600' },
      yellow: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', icon: 'text-amber-600' },
      red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', icon: 'text-red-600' },
    };
    return colorMap[color] || colorMap.slate;
  };

  const hasRecentCases = Array.isArray(lawyer.recentCases) && lawyer.recentCases.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('table-of-contents')}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Rankings</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-shrink-0 mr-6">
              {getLawyerPhoto(lawyer.id) ? (
                <img
                  src={getLawyerPhoto(lawyer.id)}
                  alt={lawyer.name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-slate-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center border-2 border-slate-300">
                  <User size={40} className="text-slate-400" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-slate-900 mb-2">{lawyer.name}</h1>
              <div className="flex flex-wrap gap-3 text-slate-600 mb-3">
                <div className="flex items-center space-x-2">
                  <User size={18} />
                  <span>{lawyer.jobTitle}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Briefcase size={18} />
                  <span>{lawyer.firm}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={18} />
                  <span>{lawyer.location}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-slate-600">
                <div className="flex items-center space-x-2">
                  <Scale size={18} />
                  <span>{lawyer.specialty.join(', ')}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onNavigate(`comparison-${lawyer.id}`)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Scale size={18} />
                <span className="hidden sm:inline">Compare this lawyer</span>
                <span className="sm:hidden">Compare</span>
              </button>
              <a
                href={`https://resightindia.com/people/list/${lawyer.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <SquareArrowOutUpRight size={18} />
                <span className="hidden sm:inline">Visit Resight Profile</span>
                <span className="sm:hidden">Visit Profile</span>
              </a>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-6 mb-6">
            {Array.isArray(lawyer.bio) ? (
              lawyer.bio.map((paragraph, index) => (
                <p key={index} className="text-slate-700 mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-slate-700">{lawyer.bio}</p>
            )}
          </div>
        </div>

        {/* Main Score Metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {scoreMetrics.map((metric, index) => {
            const Icon = metric.icon;
            const colors = getColorClasses(metric.color);

            let avgScore = 0;
            if (metric.label === 'Reputation') avgScore = averages.reputationScore;
            else if (metric.label === 'Instruction') avgScore = averages.instructionScore;
            else if (metric.label === 'Sophistication') avgScore = averages.sophisticationScore;
            else if (metric.label === 'Experience') avgScore = averages.experienceScore;

            if (index === 0) {
              return (
                <div
                  key={metric.label}
                  className={`rounded-lg border p-6 ${colors.bg} ${colors.border} flex flex-col items-center justify-center`}
                >
                  <div className="text-slate-600 mb-2 text-lg">{metric.label}</div>
                  <div className="text-4xl text-black">{formatOrdinal(metric.value)}</div>
                </div>
              );
            }

            const circumference = 2 * Math.PI * 30;
            const displayValue =
              metric.label === 'Experience' && lawyer.breakdown.numberOfReferences === 0 ? 0 : metric.value;
            const strokeDashoffset = circumference - (displayValue / 10) * circumference;
            const avgStrokeDashoffset = circumference - (avgScore / 10) * circumference;

            let metricRanking = 0;
            let isMetricTied = false;
            if (metric.label === 'Reputation') {
              metricRanking = rankings.reputationScore;
              isMetricTied = tiedRanks.reputationScore.has(rankings.reputationScore);
            } else if (metric.label === 'Instruction') {
              metricRanking = rankings.instructionScore;
              isMetricTied = tiedRanks.instructionScore.has(rankings.instructionScore);
            } else if (metric.label === 'Sophistication') {
              metricRanking = rankings.sophisticationScore;
              isMetricTied = tiedRanks.sophisticationScore.has(rankings.sophisticationScore);
            } else if (metric.label === 'Experience') {
              metricRanking = rankings.experienceScore;
              isMetricTied = tiedRanks.experienceScore.has(rankings.experienceScore);
            }

            const circleColorClass = displayValue > avgScore ? 'text-emerald-600' : 'text-black';

            return (
              <div key={metric.label} className={`rounded-lg border p-6 ${colors.bg} ${colors.border}`}>
                <div className="flex flex-col items-center">
                  <div className="relative w-20 h-20 mb-3">
                    <svg className="transform -rotate-90 w-20 h-20">
                      <circle
                        cx="40"
                        cy="40"
                        r="30"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        className="text-white"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="30"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray="2 4"
                        className="text-slate-400 opacity-50"
                        style={{
                          strokeDasharray: `${circumference}`,
                          strokeDashoffset: avgStrokeDashoffset,
                          transition: 'stroke-dashoffset 1s ease-out',
                        }}
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="30"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        className={circleColorClass}
                        style={{
                          strokeDasharray: `${circumference}`,
                          strokeDashoffset: strokeDashoffset,
                          transition: 'stroke-dashoffset 1s ease-out',
                        }}
                      />
                      {metric.value > avgScore &&
                        (() => {
                          const avgAngle = (avgScore / 10) * 2 * Math.PI;
                          const innerRadius = 27;
                          const outerRadius = 33;
                          const x1 = 40 + innerRadius * Math.cos(avgAngle);
                          const y1 = 40 + innerRadius * Math.sin(avgAngle);
                          const x2 = 40 + outerRadius * Math.cos(avgAngle);
                          const y2 = 40 + outerRadius * Math.sin(avgAngle);
                          return (
                            <line
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke="currentColor"
                              strokeWidth="2"
                              className="text-slate-900 opacity-70"
                            />
                          );
                        })()}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-2xl text-black">
                        {metric.label === 'Experience' && lawyer.breakdown.numberOfReferences === 0
                          ? '–'
                          : formatScoreToTwoDecimals(metric.value)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 mb-1">
                    <Icon className={colors.icon} size={18} />
                    <div className="text-slate-600">{metric.label}</div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs flex-wrap">
                    <span className="text-slate-500 whitespace-nowrap">Avg: {avgScore.toFixed(1)}</span>
                    {shouldShowRankingPill(metricRanking) && (
                      <div
                        className={`px-2 py-0.5 rounded-full flex items-center justify-center whitespace-nowrap ${getRankingPillClasses(metricRanking)}`}
                      >
                        {getRankingText(metricRanking, isMetricTied)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Score Breakdowns */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-slate-900">Detailed Score Breakdowns</h2>
            <div className="flex gap-2">
              {lawyerPracticeAreas.length <= 1 ? (
                <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-sm cursor-default">
                  {lawyerPracticeAreas[0] ?? 'No Practice Area'}
                </span>
              ) : (
                lawyerPracticeAreas.map((pa) => (
                  <button
                    key={pa}
                    onClick={() => setSelectedPracticeArea(pa)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      selectedPracticeArea === pa
                        ? 'bg-amber-500 text-slate-900'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {pa}
                  </button>
                ))
              )}
            </div>
          </div>

          {breakdownSections.map((section) => {
            const isExpanded = expandedSection === section.id;
            const colors = getColorClasses(section.color);

            let sectionAvg = 0;
            if (section.id === 'reputation') sectionAvg = averages.reputationScore;
            else if (section.id === 'instruction') sectionAvg = averages.instructionScore;
            else if (section.id === 'sophistication') sectionAvg = averages.sophisticationScore;
            else if (section.id === 'experience') sectionAvg = averages.experienceScore;

            return (
              <div key={section.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-lg ${colors.bg} ${colors.border} border flex items-center justify-center relative`}
                    >
                      <span className={`text-xl ${colors.text}`}>
                        {section.id === 'experience' && lawyer.breakdown.numberOfReferences === 0
                          ? '–'
                          : formatScoreToTwoDecimals(section.score)}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="text-slate-900 flex items-center space-x-2">
                        <span>{section.title}</span>
                      </div>
                      <div className="text-slate-500">Click to view sub-scores</div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="text-slate-400" size={20} />
                  ) : (
                    <ChevronDown className="text-slate-400" size={20} />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-200 p-6 bg-slate-50">
                    {section.id === 'experience' && (
                      <div className="mb-6 pb-6 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-slate-600 mb-1">Client References</div>
                            <div className="text-slate-500">Total number of verified client references</div>
                          </div>
                          <div className="text-4xl text-slate-900">{lawyer.breakdown.numberOfReferences}</div>
                        </div>
                      </div>
                    )}
                    <div
                      className={section.id === 'experience' ? 'grid md:grid-cols-2 gap-x-6 gap-y-4' : 'space-y-4'}
                    >
                      {section.items.map((item, idx) => {
                        let itemAvg = 0;
                        if (section.id === 'reputation') {
                          if (idx === 0) itemAvg = averages.breakdown.peerRecommendations;
                          else if (idx === 1) itemAvg = averages.breakdown.directoryRankings;
                          else if (idx === 2) itemAvg = averages.breakdown.mediaProfile;
                        } else if (section.id === 'instruction') {
                          if (idx === 0) itemAvg = averages.breakdown.dealVolume;
                          else if (idx === 1) itemAvg = averages.breakdown.dealValue;
                          else if (idx === 2) itemAvg = averages.breakdown.clients;
                        } else if (section.id === 'sophistication') {
                          if (idx === 0) itemAvg = averages.breakdown.aiAndTechnology;
                          else if (idx === 1) itemAvg = averages.breakdown.dataDrivenPractice;
                          else if (idx === 2) itemAvg = averages.breakdown.pricingModels;
                          else if (idx === 3) itemAvg = averages.breakdown.valueAdds;
                        } else if (section.id === 'experience') {
                          if (idx === 0) itemAvg = averages.breakdown.expertise;
                          else if (idx === 1) itemAvg = averages.breakdown.service;
                          else if (idx === 2) itemAvg = averages.breakdown.commerciality;
                          else if (idx === 3) itemAvg = averages.breakdown.communication;
                          else if (idx === 4) itemAvg = averages.breakdown.eq;
                          else if (idx === 5) itemAvg = averages.breakdown.strategy;
                          else if (idx === 6) itemAvg = averages.breakdown.network;
                          else if (idx === 7) itemAvg = averages.breakdown.leadership;
                        }

                        const isExperienceItem =
                          section.id === 'experience' && item.label !== 'Number of References';
                        const shouldShowDash = isExperienceItem && lawyer.breakdown.numberOfReferences === 0;

                        return (
                          <div key={idx}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-slate-700">{item.label}</span>
                              <span className="text-slate-900">{shouldShowDash ? '–' : formatScore(item.value)}</span>
                            </div>
                            <div className="w-full bg-white rounded-full h-2 relative">
                              {shouldShowDash ? (
                                <div className="h-2 rounded-full bg-slate-200" />
                              ) : (
                                <>
                                  <div
                                    className={`${item.value > itemAvg ? 'bg-emerald-600' : 'bg-blue-600'} h-2 rounded-full transition-all duration-700 ease-out`}
                                    style={{ width: `${item.value * 10}%` }}
                                  />
                                  <div
                                    className="absolute top-0 w-0.5 h-2 bg-slate-900 opacity-50"
                                    style={{ left: `${itemAvg * 10}%` }}
                                  />
                                </>
                              )}
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                              <span>Score: {shouldShowDash ? '–' : formatScore(item.value)}</span>
                              <span>Avg: {itemAvg.toFixed(1)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Recent Cases */}
        {hasRecentCases && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 mb-8">
            <h2 className="text-slate-900 mb-6">Recent Notable Cases</h2>
            <div className="flex flex-wrap gap-3">
              {lawyer.recentCases?.map((case_, index) => (
                <a
                  key={index}
                  href={case_.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-slate-700 hover:bg-amber-100 hover:border-amber-300 transition-colors"
                >
                  <span>{case_.title}</span>
                  <svg
                    className="ml-2 w-4 h-4 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => onNavigate('table-of-contents')}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft size={20} />
            <span>View All Rankings</span>
          </button>
          <button
            onClick={() => onNavigate('insights')}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span>Read Insights</span>
            <TrendingUp size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
