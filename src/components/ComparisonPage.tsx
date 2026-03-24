import React from 'react';
import { ArrowLeft, Scale, X, Search, ChevronDown, User, SquareArrowOutUpRight } from 'lucide-react';
import { lawyers, Lawyer, getLawyerPracticeAreas, getLawyerRanking } from '../data/siteData';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import { getLawyerPhoto } from '../assets/lawyers/photoImports';
import { calculateRankingsWithTies, formatOrdinal } from '../utils/rankings';
import { formatScoreToTwoDecimals, formatScore } from '../utils/scoreFormatting';
import { motion, AnimatePresence } from 'motion/react';

interface ComparisonPageProps {
  onNavigate: (page: string) => void;
  preSelectedLawyer1?: string;
  preSelectedLawyer2?: string;
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({
  onNavigate,
  preSelectedLawyer1,
  preSelectedLawyer2,
}) => {
  const [lawyer1Id, setLawyer1Id] = React.useState<string>(preSelectedLawyer1 || '');
  const [lawyer2Id, setLawyer2Id] = React.useState<string>(preSelectedLawyer2 || '');
  const [searchTerm1, setSearchTerm1] = React.useState('');
  const [searchTerm2, setSearchTerm2] = React.useState('');
  const [showDropdown1, setShowDropdown1] = React.useState(false);
  const [showDropdown2, setShowDropdown2] = React.useState(false);
  const dropdown1Ref = React.useRef<HTMLDivElement>(null);
  const dropdown2Ref = React.useRef<HTMLDivElement>(null);
  const [selectedPracticeArea, setSelectedPracticeArea] = React.useState<string>('');

  const lawyer1 = lawyers.find((l) => l.id === lawyer1Id);
  const lawyer2 = lawyers.find((l) => l.id === lawyer2Id);

  const sharedPracticeAreas = React.useMemo(() => {
    if (!lawyer1 || !lawyer2) return [];
    const pa1 = getLawyerPracticeAreas(lawyer1);
    const pa2 = getLawyerPracticeAreas(lawyer2);
    return pa1.filter((pa) => pa2.includes(pa));
  }, [lawyer1, lawyer2]);

  React.useEffect(() => {
    if (sharedPracticeAreas.length > 0 && !sharedPracticeAreas.includes(selectedPracticeArea)) {
      setSelectedPracticeArea(sharedPracticeAreas[0]);
    }
  }, [sharedPracticeAreas, selectedPracticeArea]);

  const practiceRankings = React.useMemo(() => {
    if (!selectedPracticeArea) return new Map<string, number>();
    const practiceAreaLawyers = lawyers.filter((l) =>
      getLawyerPracticeAreas(l).includes(selectedPracticeArea),
    );
    const result = calculateRankingsWithTies(
      practiceAreaLawyers,
      (l) => getLawyerRanking(l, selectedPracticeArea)?.totalScore ?? 0,
    );
    return result.rankings;
  }, [selectedPracticeArea]);

  React.useEffect(() => {
    if (preSelectedLawyer1) setLawyer1Id(preSelectedLawyer1);
    if (preSelectedLawyer2) setLawyer2Id(preSelectedLawyer2);
  }, [preSelectedLawyer1, preSelectedLawyer2]);

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

  const renderLawyerSelector = (
    currentId: string,
    onChange: (id: string) => void,
    otherLawyerId: string,
    label: string,
    searchTerm: string,
    setSearchTerm: (term: string) => void,
    showDropdown: boolean,
    setShowDropdown: (show: boolean) => void,
    dropdownRef: React.RefObject<HTMLDivElement>,
  ) => {
    const selectedLawyer = lawyers.find((l) => l.id === currentId);

    const otherLawyer = lawyers.find((l) => l.id === otherLawyerId);
    const otherPAs = otherLawyer ? getLawyerPracticeAreas(otherLawyer) : [];

    const availableLawyers = lawyers.filter((l) => {
      if (l.id === otherLawyerId) return false;
      if (!otherLawyerId) return true;
      return getLawyerPracticeAreas(l).some((pa) => otherPAs.includes(pa));
    });

    const filteredLawyers = availableLawyers
      .filter((lawyer) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          lawyer.name.toLowerCase().includes(searchLower) ||
          lawyer.firm.toLowerCase().includes(searchLower) ||
          (lawyer.specialty || []).some((s) => s.toLowerCase().includes(searchLower))
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));

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
          <div className="p-4 bg-slate-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-white text-sm">
                {selectedLawyer.name} &middot; {selectedLawyer.firm}
              </div>
              <button
                onClick={handleClear}
                className="text-slate-300 hover:text-white transition-colors ml-2"
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
                    {filteredLawyers.map((lawyer) => (
                      <button
                        key={lawyer.id}
                        onClick={() => handleSelect(lawyer.id)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                      >
                        <div className="text-slate-900">{lawyer.name}</div>
                        <div className="text-slate-600 text-sm">
                          {lawyer.jobTitle} · {lawyer.firm}
                        </div>
                        <div className="text-slate-500 text-sm">
                          {lawyer.location} · {getLawyerPracticeAreas(lawyer).join(', ')}
                        </div>
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

  const renderComparison = (l1: Lawyer, l2: Lawyer) => {
    const r1 = getLawyerRanking(l1, selectedPracticeArea);
    const r2 = getLawyerRanking(l2, selectedPracticeArea);

    const scoreData = [
      {
        label: 'Reputation',
        isExperience: false,
        bgColor: 'bg-red-50',
        getMainScore: (l: Lawyer) => (l === l1 ? r1 : r2)?.reputationScore ?? 0,
        breakdowns: [
          {
            label: 'Peers',
            getScore: (l: Lawyer) => (l === l1 ? r1 : r2)?.peers ?? 0,
          },
          {
            label: 'Directories',
            getScore: (l: Lawyer) => (l === l1 ? r1 : r2)?.directories ?? 0,
          },
          {
            label: 'News Media',
            getScore: (l: Lawyer) => (l === l1 ? r1 : r2)?.newsMedia ?? 0,
          },
          {
            label: 'Social Media',
            getScore: (l: Lawyer) => (l === l1 ? r1 : r2)?.socialMedia ?? 0,
          },
        ],
      },
      {
        label: 'Instruction',
        isExperience: false,
        bgColor: 'bg-green-50',
        getMainScore: (l: Lawyer) => (l === l1 ? r1 : r2)?.instructionScore ?? 0,
        breakdowns: [
          {
            label: 'Volume',
            getScore: (l: Lawyer) => (l === l1 ? r1 : r2)?.volume ?? 0,
          },
          {
            label: 'Value',
            getScore: (l: Lawyer) => (l === l1 ? r1 : r2)?.value ?? 0,
          },
          {
            label: 'Clients',
            getScore: (l: Lawyer) => (l === l1 ? r1 : r2)?.clients ?? 0,
          },
          {
            label: 'Complexity',
            getScore: (l: Lawyer) => (l === l1 ? r1 : r2)?.complexity ?? 0,
          },
        ],
      },
      {
        label: 'Sophistication',
        isExperience: false,
        bgColor: 'bg-yellow-50',
        getMainScore: (l: Lawyer) => l.sophisticationScore,
        breakdowns: [
          { label: 'Tech and Data', getScore: (l: Lawyer) => l.breakdown.techAndData },
          { label: 'Pricing', getScore: (l: Lawyer) => l.breakdown.pricing },
          { label: 'Talent Development', getScore: (l: Lawyer) => l.breakdown.talentDevelopment },
        ],
      },
      {
        label: 'Experience',
        isExperience: true,
        bgColor: 'bg-purple-50',
        getMainScore: (l: Lawyer) => l.experienceScore,
        breakdowns: [
          { label: 'Service', getScore: (l: Lawyer) => l.breakdown.service },
          { label: 'Expertise', getScore: (l: Lawyer) => l.breakdown.expertise },
          { label: 'Commerciality', getScore: (l: Lawyer) => l.breakdown.commerciality },
          { label: 'Communication', getScore: (l: Lawyer) => l.breakdown.communication },
          { label: 'EQ', getScore: (l: Lawyer) => l.breakdown.eq },
          { label: 'Strategy', getScore: (l: Lawyer) => l.breakdown.strategy },
          { label: 'Network', getScore: (l: Lawyer) => l.breakdown.network },
          { label: 'Leadership', getScore: (l: Lawyer) => l.breakdown.leadership },
        ],
      },
    ];

    const getWinner = (score1: number, score2: number) => {
      if (score1 > score2) return 'lawyer1';
      if (score2 > score1) return 'lawyer2';
      return 'tie';
    };

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
            <h2 className="text-slate-900">Scores Comparison</h2>
          </div>
          <Accordion type="multiple" className="w-full">
            {scoreData.map(({ label, isExperience, bgColor, getMainScore, breakdowns }) => {
              const score1 = getMainScore(l1);
              const score2 = getMainScore(l2);
              const winner = getWinner(score1, score2);

              const showDash1 = isExperience && l1.breakdown.numberOfReferences === 0;
              const showDash2 = isExperience && l2.breakdown.numberOfReferences === 0;

              return (
                <AccordionItem key={label} value={label} className="border-slate-200">
                  <AccordionTrigger className={`px-4 hover:no-underline ${bgColor}`}>
                    <div className="grid grid-cols-3 gap-4 flex-1">
                      <div className={`text-center relative ${winner === 'lawyer2' ? 'opacity-60' : 'opacity-100'}`}>
                        <motion.div
                          key={`${score1}-${selectedPracticeArea}`}
                          initial={{ opacity: 0.5 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-3xl text-black inline-block relative"
                        >
                          {showDash1 ? '–' : formatScoreToTwoDecimals(score1)}
                          {!showDash1 && winner === 'lawyer1' && (
                            <div className="text-emerald-600 text-sm absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap">
                              <span>★</span>
                              <span className="hidden md:inline"> Higher</span>
                            </div>
                          )}
                        </motion.div>
                      </div>

                      <div className="flex items-center justify-center text-slate-600">{label}</div>

                      <div className={`text-center relative ${winner === 'lawyer1' ? 'opacity-60' : 'opacity-100'}`}>
                        <motion.div
                          key={`${score2}-${selectedPracticeArea}`}
                          initial={{ opacity: 0.5 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-3xl text-black inline-block relative"
                        >
                          {showDash2 ? '–' : formatScoreToTwoDecimals(score2)}
                          {!showDash2 && winner === 'lawyer2' && (
                            <div className="text-emerald-600 text-sm absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap">
                              <span>★</span>
                              <span className="hidden md:inline"> Higher</span>
                            </div>
                          )}
                        </motion.div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="divide-y divide-slate-200 bg-slate-50/50 pr-8">
                      {breakdowns.map(({ label: breakdownLabel, getScore }) => {
                        const breakdownScore1 = getScore(l1);
                        const breakdownScore2 = getScore(l2);
                        const breakdownWinner = getWinner(breakdownScore1, breakdownScore2);

                        const isExperienceBreakdown = isExperience;
                        const showBreakdownDash1 = isExperienceBreakdown && l1.breakdown.numberOfReferences === 0;
                        const showBreakdownDash2 = isExperienceBreakdown && l2.breakdown.numberOfReferences === 0;

                        const displayScore1 = showBreakdownDash1 ? '–' : formatScore(breakdownScore1);
                        const displayScore2 = showBreakdownDash2 ? '–' : formatScore(breakdownScore2);

                        return (
                          <div key={breakdownLabel} className="grid grid-cols-3 gap-4 p-3">
                            <div
                              className={`text-center relative ${breakdownWinner === 'lawyer2' ? 'opacity-60' : 'opacity-100'}`}
                            >
                              <div className="text-xl text-black inline-block relative">
                                {displayScore1}
                                {!showBreakdownDash1 && breakdownWinner === 'lawyer1' && (
                                  <div className="text-emerald-600 text-sm absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap">
                                    ★
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-center text-slate-600">{breakdownLabel}</div>

                            <div
                              className={`text-center relative ${breakdownWinner === 'lawyer1' ? 'opacity-60' : 'opacity-100'}`}
                            >
                              <div className="text-xl text-black inline-block relative">
                                {displayScore2}
                                {!showBreakdownDash2 && breakdownWinner === 'lawyer2' && (
                                  <div className="text-emerald-600 text-sm absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap">
                                    ★
                                  </div>
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
            {[l1, l2].map((lawyer) => (
              <div key={lawyer.id} className="p-6 space-y-4">
                <div>
                  <div className="text-slate-500 mb-1">Name</div>
                  <div className="text-slate-900">{lawyer.name}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Firm</div>
                  <div className="text-slate-900">{lawyer.firm}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Specialty</div>
                  <div className="text-slate-900">{lawyer.specialty.join(', ')}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Bio</div>
                  <div className="text-slate-600">
                    {Array.isArray(lawyer.bio) ? (
                      lawyer.bio.map((paragraph, index) => (
                        <p key={index} className="mb-4 last:mb-0">
                          {paragraph}
                        </p>
                      ))
                    ) : (
                      <>{lawyer.bio}</>
                    )}
                  </div>
                </div>
                <a
                  href={`https://resightindia.com/people/list/${lawyer.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <SquareArrowOutUpRight size={18} />
                  <span>View Resight Profile</span>
                </a>
              </div>
            ))}
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
              dropdown1Ref,
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
              dropdown2Ref,
            )}
          </div>
        </div>

        {/* Comparison Results */}
        {lawyer1 && lawyer2 ? (
          <div>
            {/* Practice Area Selector */}
            {sharedPracticeAreas.length > 0 && (
              <div className="flex justify-center gap-2 mb-8">
                {sharedPracticeAreas.length === 1 ? (
                  <span
                    className="px-3 py-1.5 rounded-lg text-white text-sm cursor-default"
                    style={{ backgroundColor: '#ef3c24' }}
                  >
                    {sharedPracticeAreas[0]}
                  </span>
                ) : (
                  sharedPracticeAreas.map((pa) => (
                    <button
                      key={pa}
                      onClick={() => setSelectedPracticeArea(pa)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        selectedPracticeArea === pa
                          ? 'text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      style={selectedPracticeArea === pa ? { backgroundColor: '#ef3c24' } : undefined}
                    >
                      {pa}
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Lawyer Headers */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {[
                { lawyer: lawyer1, id: lawyer1Id },
                { lawyer: lawyer2, id: lawyer2Id },
              ].map(({ lawyer, id }) => (
                <div
                  key={id}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 cursor-pointer hover:border-slate-300 transition-colors"
                  onClick={() => onNavigate(id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      {getLawyerPhoto(id) ? (
                        <img
                          src={getLawyerPhoto(id)}
                          alt={lawyer.name}
                          className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                          <User size={24} className="text-slate-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-slate-900 mb-1">{lawyer.name}</h3>
                        <div className="text-slate-600 text-sm">{lawyer.jobTitle} &middot; {lawyer.firm}</div>
                        <div className="text-slate-500 text-sm">{lawyer.location}</div>
                        <div className="text-blue-600 text-sm">{getLawyerPracticeAreas(lawyer).join(', ')}</div>
                      </div>
                    </div>
                    <div className="px-4 py-2 rounded-lg border bg-slate-50 border-slate-200 text-center">
                      <div className="text-2xl text-black">{formatScoreToTwoDecimals(getLawyerRanking(lawyer, selectedPracticeArea)?.totalScore ?? 0)}</div>
                      <div className="text-xs text-slate-500">Total Score</div>
                    </div>
                  </div>
                </div>
              ))}
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
