// File containing all data for the site. Designed to be the only file that needs updating in order to update data on the site.
// Should also be the site of most changes should we decide to duplicate the site to cover a different field.
// In here is:
// - TS interface definitions (All setting up readability for other pages):
//   - ScoreBreakdown (Which of the more detailed subscores are relevant.)
//   - RecentCases (Matched title and link per RI Deal)
//   - Lawyer (Defined string containing all info needed for a lawyer's profile. No calculations are done in this object currently, all raw numbers should be imported from Excel)
//   - Article (At the moment just has two basic types, for metadata and insights. Will maybe need to change this if we host insights on the main site instead).
// - Consts (Here is where to change the full data for the site)
//   - lawyers (This is where most of the data lives. An array containing Profiles based off of the Lawyer objects. Note that these contain ScoreBreakdown (breakdown) and RecentCase (recentCases) as their own arrays defined by the other interfaces).
//   - articles (Here are the contents for some very simple (text only!) insights articles. Can change if we want to do fancier things in future.)
//   - reportMetadata (one last object, containing any little bits we want to pepper around the site. This is mainly for the splash page.)

export interface ScoreBreakdown {
  // Reputation sub-scores (3)
  peerRecommendations: number;
  directoryRankings: number;
  mediaProfile: number;
  
  // Instruction sub-scores (3)
  dealVolume: number;
  dealValue: number;
  clients: number;
  
  // Sophistication sub-scores (4)
  aiAndTechnology: number;
  dataDrivenPractice: number;
  pricingModels: number;
  valueAdds: number;
  
  // Experience sub-scores (9)
  numberOfReferences: number;
  expertise: number;
  service: number;
  commerciality: number;
  communication: number;
  eq: number;
  strategy: number;
  network: number;
  leadership: number;
}

export interface RecentCase {
  title: string;
  url: string;
}

export interface Lawyer {
  id: string;
  name: string;
  firm: string;
  specialty: string[];
  location: string;
  jobTitle: string;
  
  // Main scores
  totalScore: number;
  reputationScore: number;
  instructionScore: number;
  sophisticationScore: number;
  experienceScore: number;
  
  // Detailed breakdowns
  breakdown: ScoreBreakdown;
  
  // Profile information
  bio: string | string[]; // Can be a single string or array of paragraphs
  recentCases?: RecentCase[]; // Optional to allow lawyers without highlightable cases
}

export interface Article {
  id: string;
  title: string;
  category: 'methodology' | 'insights';
  author: string;
  date: string;
  markdownContent?: string; // Markdown/HTML formatted content - images are embedded directly in markdown
}

export interface AverageScores {
  totalScore: number;
  reputationScore: number;
  instructionScore: number;
  sophisticationScore: number;
  experienceScore: number;
  breakdown: ScoreBreakdown;
}

// Import and re-export lawyers from lawyerData
import { lawyers } from './lawyerData';
export { lawyers };

// Average scores across all lawyers (hard-coded)
export const averageScores: AverageScores = {
  totalScore: 6.83,
  reputationScore: 5.6,
  instructionScore: 6.3,
  sophisticationScore: 8.4,
  experienceScore: 5.5,
  breakdown: {
    peerRecommendations: 1.9,
    directoryRankings: 3.0,
    mediaProfile: 3.9,
    dealVolume: 3.8,
    dealValue: 4.0,
    clients: 5.0,
    aiAndTechnology: 8.1,
    dataDrivenPractice: 9.0,
    pricingModels: 7.9,
    valueAdds: 6.9,
    numberOfReferences: 2.4,
    expertise: 7.7,
    service: 7.7,
    commerciality: 7.6,
    communication: 7.7,
    eq: 7.5,
    strategy: 7.5,
    network: 7.4,
    leadership: 7.6
  }
};

// Import and re-export articles from articleData
export { articles } from './articleData';
export const reportMetadata = {
  title: 'Resight India: RISE Lawyers in Private Capital',
  publishDate: 'November 2025',
  year: '2025',
  totalLawyers: lawyers.length
};
