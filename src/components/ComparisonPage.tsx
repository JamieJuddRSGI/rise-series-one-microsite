import React from 'react';
import { ArrowLeft, Scale, X, Search, ChevronDown, User, SquareArrowOutUpRight } from 'lucide-react';
import { lawyers, Lawyer } from '../data/siteData';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import { getLawyerPhoto } from '../assets/lawyers/photoImports';
import { calculateRankingsWithTies, formatOrdinal } from '../utils/rankings';
import { formatScoreToTwoDecimals, formatScore } from '../utils/scoreFormatting';

interface ComparisonPageProps {
  onNavigate: (page: string) => void;
  preSelectedLawyer1?: string;
  preSelectedLawyer2?: string;
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({ 
  onNavigate, 
  preSelectedLawyer1,
  preSelectedLawyer2 
}) => {
  const [lawyer1Id, setLawyer1Id] = React.useState<string>(preSelectedLawyer1 || '');
  const [lawyer2Id, setLawyer2Id] = React.useState<string>(preSelectedLawyer2 || '');
  const [searchTerm1, setSearchTerm1] = React.useState('');
  const [searchTerm2, setSearchTerm2] = React.useState('');
  const [showDropdown1, setShowDropdown1] = React.useState(false);
  const [showDropdown2, setShowDropdown2] = React.useState(false);
  const dropdown1Ref = React.useRef<HTMLDivElement>(null);
  const dropdown2Ref = React.useRef<HTMLDivElement>(null);

  const lawyer1 = lawyers.find(l => l.id === lawyer1Id);
  const lawyer2 = lawyers.find(l => l.id === lawyer2Id);

  // Create a map of lawyer ID to their total score rank (with ties handled)
  const { rankings: rankByTotalScore } = calculateRankingsWithTies(lawyers, l => l.totalScore);

  // Update state when pre-selected lawyers change
  React.useEffect(() => {
    if (preSelectedLawyer1) {
      setLawyer1Id(preSelectedLawyer1);
    }
    if (preSelectedLawyer2) {
      setLawyer2Id(preSelectedLawyer2);
    }
  }, [preSelectedLawyer1, preSelectedLawyer2]);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdown1Ref.current && !dropdown1Ref.current.contains(event.target as Node)) {
        setShowDropdown1(false);
      }
      if (dropdown2Ref.current && !dropdown2Ref.current.contains(event.target as Node)) {
        setShowDropdown2(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 9.0) return 'text-emerald-600';
    if (score >= 8.5) return 'text-blue-600';
    if (score >= 8.0) return 'text-amber-600';
    return 'text-slate-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 9.0) return 'bg-emerald-50 border-emerald-200';
    if (score >= 8.5) return 'bg-blue-50 border-blue-200';
    if (score >= 8.0) return 'bg-amber-50 border-amber-200';
    return 'bg-slate-50 border-slate-200';
  };

  const getProgressColor = (score: number) => {
    if (score >= 9.0) return 'bg-emerald-500';
    if (score >= 8.5) return 'bg-blue-500';
    if (score >= 8.0) return 'bg-amber-500';
    return 'bg-slate-500';
  };

  const renderLawyerSelector = (
    currentId: string,
    onChange: (id: string) => void,
    otherLawyerId: string,
    label: string,
    searchTerm: string,
    setSearchTerm: (term: string) => void,
    showDropdown: boolean,
    setShowDropdown: (show: boolean) => void,
    dropdownRef: React.RefObject<HTMLDivElement>
  ) => {
    const selectedLawyer = lawyers.find(l => l.id === currentId);
    const availableLawyers = lawyers.filter(l => l.id !== otherLawyerId);
    
    // Filter lawyers based on search term
    const filteredLawyers = availableLawyers.filter(lawyer => {
      const searchLower = searchTerm.toLowerCase();
      return (
        lawyer.name.toLowerCase().includes(searchLower) ||
        lawyer.firm.toLowerCase().includes(searchLower) ||
        lawyer.specialty.some(s => s.toLowerCase().includes(searchLower))
      );
    });

    const handleSelect = (lawyerId: string) => {
      onChange(lawyerId);
      setSearchTerm('');
      setShowDropdown(false);
    };

    const handleClear = () => {
      onChange('');
      setSearchTerm('');
    };

    return (
      <div className="flex-1" ref={dropdownRef}>        
        {selectedLawyer ? (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-slate-900 mb-1">{selectedLawyer.name}</div>
                <div className="text-slate-600 text-sm">{selectedLawyer.jobTitle} · {selectedLawyer.firm}</div>
                <div className="text-slate-500 text-sm">{selectedLawyer.location}</div>
                <div className="text-slate-500 text-sm">{selectedLawyer.specialty.join(', ')}</div>
              </div>
              <button
                onClick={handleClear}
                className="text-slate-400 hover:text-slate-600 transition-colors ml-2"
                title="Clear selection"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search by name, firm, or specialty..."
                className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
              />
              <ChevronDown 
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
                size={20} 
              />
            </div>

            {showDropdown && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-slate-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {filteredLawyers.length > 0 ? (
                  <div className="py-2">
                    {filteredLawyers.map(lawyer => (
                      <button
                        key={lawyer.id}
                        onClick={() => handleSelect(lawyer.id)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                      >
                        <div className="text-slate-900">{lawyer.name}</div>
                        <div className="text-slate-600 text-sm">{lawyer.jobTitle} · {lawyer.firm}</div>
                        <div className="text-slate-500 text-sm">{lawyer.location} · {lawyer.specialty.join(', ')}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-slate-500">
                    No lawyers found matching "{searchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderComparison = (lawyer1: Lawyer, lawyer2: Lawyer) => {
    const scoreData = [
      { 
        label: 'Reputation', 
        key: 'reputationScore' as const,
        breakdowns: [
          { label: 'Peer and Client Recommendations', key: 'peerRecommendations' as const },
          { label: 'Directory Rankings', key: 'directoryRankings' as const },
          { label: 'Media Profile', key: 'mediaProfile' as const },
        ]
      },
      {
        label: 'Instruction', 
        key: 'instructionScore' as const,
        breakdowns: [
          { label: 'Deal Volume', key: 'dealVolume' as const },
          { label: 'Deal Value', key: 'dealValue' as const },
          { label: 'Clients', key: 'clients' as const },
        ]
      },
      {
        label: 'Sophistication', 
        key: 'sophisticationScore' as const,
        breakdowns: [
          { label: 'AI and Technology', key: 'aiAndTechnology' as const },
          { label: 'Data-driven Practice', key: 'dataDrivenPractice' as const },
          { label: 'Pricing Models', key: 'pricingModels' as const },
          { label: 'Value Adds', key: 'valueAdds' as const },
        ]
      },
      {
        label: 'Experience', 
        key: 'experienceScore' as const,
        breakdowns: [
          { label: 'Expertise', key: 'expertise' as const },
          { label: 'Service', key: 'service' as const },
          { label: 'Commerciality', key: 'commerciality' as const },
          { label: 'Communication', key: 'communication' as const },
          { label: 'EQ', key: 'eq' as const },
          { label: 'Strategy', key: 'strategy' as const },
          { label: 'Network', key: 'network' as const },
          { label: 'Leadership', key: 'leadership' as const },
        ]
      }
    ];

    const getWinner = (score1: number, score2: number) => {
      if (score1 > score2) return 'lawyer1';
      if (score2 > score1) return 'lawyer2';
      return 'tie';
    };

    return (
      <div className="space-y-8">
        {/* Scores Comparison with Accordions */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
            <h2 className="text-slate-900">Scores Comparison</h2>
          </div>
          <Accordion type="multiple" className="w-full">
            {scoreData.map(({ label, key, breakdowns }) => {
              const score1 = lawyer1[key];
              const score2 = lawyer2[key];
              const winner = getWinner(score1, score2);
              
              // For Experience scores, show "–" if numberOfReferences is 0
              const isExperience = key === 'experienceScore';
              const showDash1 = isExperience && lawyer1.breakdown.numberOfReferences === 0;
              const showDash2 = isExperience && lawyer2.breakdown.numberOfReferences === 0;
              
              // Get background color based on indicator type
              const getBgColor = () => {
                if (key === 'reputationScore') return 'bg-red-50';
                if (key === 'instructionScore') return 'bg-green-50';
                if (key === 'sophisticationScore') return 'bg-yellow-50';
                if (key === 'experienceScore') return 'bg-purple-50';
                return '';
              };

              return (
                <AccordionItem key={key} value={key} className="border-slate-200">
                  <AccordionTrigger className={`px-4 hover:no-underline ${getBgColor()}`}>
                    <div className="grid grid-cols-3 gap-4 flex-1">
                      {/* Lawyer 1 Score */}
                      <div className={`text-center relative ${winner === 'lawyer2' ? 'opacity-60' : 'opacity-100'}`}>
                        <div className="text-3xl text-black inline-block relative">
                          {showDash1 ? '–' : formatScoreToTwoDecimals(score1)}
                          {!showDash1 && winner === 'lawyer1' && (
                            <div className="text-emerald-600 text-sm absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap">
                              <span>★</span>
                              <span className="hidden md:inline"> Higher</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Label */}
                      <div className="flex items-center justify-center text-slate-600">
                        {label}
                      </div>

                      {/* Lawyer 2 Score */}
                      <div className={`text-center relative ${winner === 'lawyer1' ? 'opacity-60' : 'opacity-100'}`}>
                        <div className="text-3xl text-black inline-block relative">
                          {showDash2 ? '–' : formatScoreToTwoDecimals(score2)}
                          {!showDash2 && winner === 'lawyer2' && (
                            <div className="text-emerald-600 text-sm absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap">
                              <span>★</span>
                              <span className="hidden md:inline"> Higher</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="divide-y divide-slate-200 bg-slate-50/50 pr-8">
                      {breakdowns.map(({ label: breakdownLabel, key: breakdownKey }) => {
                        const breakdownScore1 = lawyer1.breakdown[breakdownKey];
                        const breakdownScore2 = lawyer2.breakdown[breakdownKey];
                        const breakdownWinner = getWinner(breakdownScore1, breakdownScore2);
                        
                        // Special handling for "Number of references" - display as raw number
                        const isNumberOfReferences = breakdownKey === 'numberOfReferences';
                        // For Experience breakdown items (but NOT numberOfReferences), show "–" if numberOfReferences is 0
                        const isExperienceBreakdown = isExperience && !isNumberOfReferences;
                        const showBreakdownDash1 = isExperienceBreakdown && lawyer1.breakdown.numberOfReferences === 0;
                        const showBreakdownDash2 = isExperienceBreakdown && lawyer2.breakdown.numberOfReferences === 0;
                        
                        const displayScore1 = showBreakdownDash1 
                          ? '–' 
                          : (isNumberOfReferences ? Math.round(breakdownScore1) : formatScore(breakdownScore1));
                        const displayScore2 = showBreakdownDash2 
                          ? '–' 
                          : (isNumberOfReferences ? Math.round(breakdownScore2) : formatScore(breakdownScore2));

                        return (
                          <div key={breakdownKey} className="grid grid-cols-3 gap-4 p-3">
                            {/* Lawyer 1 Breakdown Score */}
                            <div className={`text-center relative ${breakdownWinner === 'lawyer2' ? 'opacity-60' : 'opacity-100'}`}>
                              <div className="text-xl text-black inline-block relative">
                                {displayScore1}
                                {!showBreakdownDash1 && breakdownWinner === 'lawyer1' && (
                                  <div className="text-emerald-600 text-sm absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap">★</div>
                                )}
                              </div>
                            </div>

                            {/* Breakdown Label */}
                            <div className="flex items-center justify-center text-slate-600">
                              {breakdownLabel}
                            </div>

                            {/* Lawyer 2 Breakdown Score */}
                            <div className={`text-center relative ${breakdownWinner === 'lawyer1' ? 'opacity-60' : 'opacity-100'}`}>
                              <div className="text-xl text-black inline-block relative">
                                {displayScore2}
                                {!showBreakdownDash2 && breakdownWinner === 'lawyer2' && (
                                  <div className="text-emerald-600 text-sm absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap">★</div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Profile Information Comparison */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
            <h3 className="text-slate-900">Profile Information</h3>
          </div>
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* Lawyer 1 */}
            <div className="p-6 space-y-4">
              <div>
                <div className="text-slate-500 mb-1">Name</div>
                <div className="text-slate-900">{lawyer1.name}</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">Firm</div>
                <div className="text-slate-900">{lawyer1.firm}</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">Specialty</div>
                <div className="text-slate-900">{lawyer1.specialty.join(', ')}</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">Bio</div>
                <div className="text-slate-600">
                  {Array.isArray(lawyer1.bio) ? (
                    lawyer1.bio.map((paragraph, index) => (
                      <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
                    ))
                  ) : (
                    lawyer1.bio
                  )}
                </div>
              </div>
              <a
                href={`https://resightindia.com/people/list/${lawyer1.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <SquareArrowOutUpRight size={18} />
                <span>View Resight Profile</span>
              </a>
            </div>

            {/* Lawyer 2 */}
            <div className="p-6 space-y-4">
              <div>
                <div className="text-slate-500 mb-1">Name</div>
                <div className="text-slate-900">{lawyer2.name}</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">Firm</div>
                <div className="text-slate-900">{lawyer2.firm}</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">Specialty</div>
                <div className="text-slate-900">{lawyer2.specialty.join(', ')}</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">Bio</div>
                <div className="text-slate-600">
                  {Array.isArray(lawyer2.bio) ? (
                    lawyer2.bio.map((paragraph, index) => (
                      <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
                    ))
                  ) : (
                    lawyer2.bio
                  )}
                </div>
              </div>
              <a
                href={`https://resightindia.com/people/list/${lawyer2.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <SquareArrowOutUpRight size={18} />
                <span>View Resight Profile</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-2 text-slate-600 mb-4">
            <Scale size={20} />
            <span>Lawyer Comparison</span>
          </div>
          <p className="text-slate-600 text-xl max-w-3xl">
            Select two lawyers to compare their RISE profiles and scores side-by-side.
          </p>
        </div>
        {/* Back Button */}
        <button
          onClick={() => onNavigate('profiles')}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Profiles</span>
        </button>

        {/* Lawyer Selectors */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {renderLawyerSelector(
              lawyer1Id, 
              setLawyer1Id, 
              lawyer2Id, 
              'Lawyer 1',
              searchTerm1,
              setSearchTerm1,
              showDropdown1,
              setShowDropdown1,
              dropdown1Ref
            )}
            {renderLawyerSelector(
              lawyer2Id, 
              setLawyer2Id, 
              lawyer1Id, 
              'Lawyer 2',
              searchTerm2,
              setSearchTerm2,
              showDropdown2,
              setShowDropdown2,
              dropdown2Ref
            )}
          </div>
        </div>

        {/* Comparison Results */}
        {lawyer1 && lawyer2 ? (
          <div>
            {/* Lawyer Headers */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    {getLawyerPhoto(lawyer1.id) ? (
                      <img
                        src={getLawyerPhoto(lawyer1.id)}
                        alt={lawyer1.name}
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <User size={24} className="text-slate-400" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-slate-900 mb-1">{lawyer1.name}</h2>
                      <div className="text-slate-600">{lawyer1.firm}</div>
                      <div className="text-slate-500">{lawyer1.specialty.join(', ')}</div>
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-lg border bg-slate-50 border-slate-200">
                    <div className="text-2xl text-black">
                      {formatOrdinal(rankByTotalScore.get(lawyer1.id) || 0)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    {getLawyerPhoto(lawyer2.id) ? (
                      <img
                        src={getLawyerPhoto(lawyer2.id)}
                        alt={lawyer2.name}
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <User size={24} className="text-slate-400" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-slate-900 mb-1">{lawyer2.name}</h2>
                      <div className="text-slate-600">{lawyer2.firm}</div>
                      <div className="text-slate-500">{lawyer2.specialty.join(', ')}</div>
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-lg border bg-slate-50 border-slate-200">
                    <div className="text-2xl text-black">
                      {formatOrdinal(rankByTotalScore.get(lawyer2.id) || 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {renderComparison(lawyer1, lawyer2)}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <Scale className="mx-auto text-slate-400 mb-4" size={48} />
            <h3 className="text-slate-900 mb-2">Select Two Lawyers to Compare</h3>
            <p className="text-slate-600">
              Choose lawyers from the dropdowns above to see a detailed side-by-side comparison.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
