import React from 'react';
import { Users, ArrowRight, Search, Filter, Scale, MapPin } from 'lucide-react';
import { lawyers } from '../data/siteData';
import { getLawyerPhoto } from '../assets/lawyers/photoImports';
import { calculateRankingsWithTies, formatOrdinal } from '../utils/rankings';

interface ProfilesPageProps {
  onNavigate: (page: string) => void;
}

export const ProfilesPage: React.FC<ProfilesPageProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedSpecialty, setSelectedSpecialty] = React.useState<string>('all');
  const [selectedLocation, setSelectedLocation] = React.useState<string>('all');

  const specialties = ['all', ...Array.from(new Set(lawyers.flatMap(l => l.specialty)))];
  const locations = ['all', ...Array.from(new Set(lawyers.map(l => l.location))).sort()];

  // Create ranking maps for each score type (with ties handled)
  const { rankings: rankByTotalScore } = calculateRankingsWithTies(lawyers, l => l.totalScore);
  const { rankings: rankByReputation } = calculateRankingsWithTies(lawyers, l => l.reputationScore);
  const { rankings: rankByInstruction } = calculateRankingsWithTies(lawyers, l => l.instructionScore);
  const { rankings: rankBySophistication } = calculateRankingsWithTies(lawyers, l => l.sophisticationScore);
  const { rankings: rankByExperience } = calculateRankingsWithTies(lawyers, l => l.experienceScore);

  const filteredLawyers = lawyers.filter(lawyer => {
    const matchesSearch = lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lawyer.firm.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || lawyer.specialty.includes(selectedSpecialty);
    const matchesLocation = selectedLocation === 'all' || lawyer.location === selectedLocation;
    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  const getRankColor = (rank: number) => {
    if (rank <= 10) return 'text-emerald-600';
    if (rank <= 25) return 'text-blue-600';
    return 'text-black';
  };

  const getProgressBg = (rank: number) => {
    if (rank <= 10) return 'bg-emerald-600';
    if (rank <= 25) return 'bg-blue-600';
    return 'bg-slate-400';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-2 text-slate-600 mb-4">
            <Users size={20} />
            <span>Lawyer Profiles</span>
          </div>
          <p className="text-slate-600 text-xl max-w-3xl">
            Browse the profiles of India's Private Capital RISE Lawyers.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Search size={18} />
                  <span>Search</span>
                </div>
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or firm..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Filter size={18} />
                  <span>Specialty</span>
                </div>
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>
                    {specialty === 'all' ? 'All Specialties' : specialty}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 mb-2">
                <div className="flex items-center space-x-2">
                  <MapPin size={18} />
                  <span>Location</span>
                </div>
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                {locations.map(location => (
                  <option key={location} value={location}>
                    {location === 'all' ? 'All Locations' : location}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-slate-600 mb-6">
          Showing {filteredLawyers.length} of {lawyers.length} profiles
        </div>

        {/* Profiles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLawyers.map((lawyer) => {
            const rank = rankByTotalScore.get(lawyer.id) || 0;
            const repRank = rankByReputation.get(lawyer.id) || 0;
            const instRank = rankByInstruction.get(lawyer.id) || 0;
            const sophRank = rankBySophistication.get(lawyer.id) || 0;
            const expRank = rankByExperience.get(lawyer.id) || 0;
            return (
            <div
              key={lawyer.id}
              className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-slate-900 mb-1">{lawyer.name}</h3>
                    <p className="text-slate-600 text-sm mb-1">{lawyer.jobTitle} · {lawyer.firm}</p>
                    <div className="flex items-center space-x-1 text-slate-500 text-sm mb-1">
                      <MapPin size={14} />
                      <span>{lawyer.location}</span>
                    </div>
                    <p className="text-slate-500 text-sm">{lawyer.specialty.join(', ')}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mb-2 overflow-hidden">
                      {getLawyerPhoto(lawyer.id) ? (
                        <img 
                          src={getLawyerPhoto(lawyer.id)} 
                          alt={lawyer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-slate-600 text-xl">
                          {lawyer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      )}
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl ${getRankColor(rank)}`}>
                        {formatOrdinal(rank)}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 mb-4 line-clamp-3">
                  {Array.isArray(lawyer.bio) ? lawyer.bio.join(' ') : lawyer.bio}
                </p>

                <div className="grid grid-cols-4 gap-2 mb-4 mt-auto">
                  <div className="text-center">
                    <div className="h-1 bg-slate-300 rounded mb-1 overflow-hidden">
                      <div 
                        className="h-full bg-red-600 rounded transition-all duration-300"
                        style={{ width: `${(lawyer.reputationScore / 10) * 100}%` }}
                      />
                    </div>
                    <div className="text-slate-500">Rep.</div>
                  </div>
                  <div className="text-center">
                    <div className="h-1 bg-slate-300 rounded mb-1 overflow-hidden">
                      <div 
                        className="h-full bg-green-600 rounded transition-all duration-300"
                        style={{ width: `${(lawyer.instructionScore / 10) * 100}%` }}
                      />
                    </div>
                    <div className="text-slate-500">Inst.</div>
                  </div>
                  <div className="text-center">
                    <div className="h-1 bg-slate-300 rounded mb-1 overflow-hidden">
                      <div 
                        className="h-full bg-yellow-600 rounded transition-all duration-300"
                        style={{ width: `${(lawyer.sophisticationScore / 10) * 100}%` }}
                      />
                    </div>
                    <div className="text-slate-500">Soph.</div>
                  </div>
                  <div className="text-center">
                    <div className="h-1 bg-slate-300 rounded mb-1 overflow-hidden">
                      <div 
                        className="h-full bg-purple-600 rounded transition-all duration-300"
                        style={{ width: `${(lawyer.experienceScore / 10) * 100}%` }}
                      />
                    </div>
                    <div className="text-slate-500">Exp.</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 border-t border-slate-200">
                <button
                  onClick={() => onNavigate(`comparison-${lawyer.id}`)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-900 px-6 py-3 border-r border-slate-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Scale size={16} />
                  <span>Compare</span>
                </button>
                <button
                  onClick={() => onNavigate(lawyer.id)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-900 px-6 py-3 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>View Profile</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredLawyers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto text-slate-400 mb-4" size={48} />
            <h3 className="text-slate-900 mb-2">No profiles found</h3>
            <p className="text-slate-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};
