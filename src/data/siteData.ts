// Data layer for the site. Merges per-lawyer constant data (lawyerData.ts)
// with per-practice-area scores (rawPracticeData.ts) to produce enriched
// Lawyer objects consumed by all components.

import { lawyers as baseLawyers } from './lawyerData';
import { rawPracticeData } from './rawPracticeData';

// --- Type Definitions ---

export interface ScoreBreakdown {
  // Sophistication sub-scores (3)
  techAndData: number;
  pricing: number;
  talentDevelopment: number;

  // Experience sub-scores (9)
  numberOfReferences: number;
  service: number;
  expertise: number;
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

export interface BaseLawyer {
  id: string;
  name: string;
  firm: string;
  specialty: string[];
  location: string;
  jobTitle: string;
  sophisticationScore: number;
  experienceScore: number;
  breakdown: ScoreBreakdown;
  bio: string | string[];
  recentCases?: RecentCase[];
}

export interface PracticeAreaScores {
  practiceArea: string;
  totalScore: number;
  reputationScore: number;
  instructionScore: number;
  peers: number;
  directories: number;
  newsMedia: number;
  socialMedia: number;
  volume: number;
  value: number;
  clients: number;
  complexity: number;
}

export interface LawyerPracticeScore {
  id: string;
  totalScore: number;
  reputationScore: number;
  instructionScore: number;
  peers: number;
  directories: number;
  newsMedia: number;
  socialMedia: number;
  volume: number;
  value: number;
  clients: number;
  complexity: number;
}

export interface PracticeData {
  practiceArea: string;
  data: LawyerPracticeScore[];
}

export interface Lawyer extends BaseLawyer {
  rankings: PracticeAreaScores[];
  totalScore: number;
  reputationScore: number;
  instructionScore: number;
}

export interface Article {
  id: string;
  title: string;
  category: 'methodology' | 'insights';
  author: string;
  date: string;
  markdownContent?: string;
}

// --- Practice Area Constants ---

export const PRACTICE_AREAS = [
  'Private Capital',
  'Arbitration',
  'Equity Capital Markets',
  'Debt Capital Markets',
  'Competition',
  'Cyber',
  'Infrastructure',
  'International Trade',
] as const;

export type PracticeArea = (typeof PRACTICE_AREAS)[number];

// --- Helper Functions ---

export const getLawyerRanking = (
  lawyer: Lawyer,
  practiceArea: string,
): PracticeAreaScores | undefined => {
  return lawyer.rankings.find((r) => r.practiceArea === practiceArea);
};

export const getLawyerPracticeAreas = (lawyer: Lawyer): string[] => {
  return lawyer.rankings.map((r) => r.practiceArea);
};

export const getHighestScores = (
  lawyer: Lawyer,
): { totalScore: number; reputationScore: number; instructionScore: number } => {
  if (lawyer.rankings.length === 0) {
    return { totalScore: 0, reputationScore: 0, instructionScore: 0 };
  }
  const best = lawyer.rankings.reduce((highest, current) =>
    current.totalScore > highest.totalScore ? current : highest,
  );
  return {
    totalScore: best.totalScore,
    reputationScore: best.reputationScore,
    instructionScore: best.instructionScore,
  };
};

export const getScoreForPracticeArea = (
  lawyer: Lawyer,
  practiceArea: string | null,
): { totalScore: number; reputationScore: number; instructionScore: number } => {
  if (!practiceArea) {
    return getHighestScores(lawyer);
  }
  const ranking = getLawyerRanking(lawyer, practiceArea);
  if (!ranking) {
    return getHighestScores(lawyer);
  }
  return {
    totalScore: ranking.totalScore,
    reputationScore: ranking.reputationScore,
    instructionScore: ranking.instructionScore,
  };
};

// --- Merge Logic ---

const mergeLawyersWithPracticeData = (
  base: BaseLawyer[],
  practiceData: PracticeData[],
): Lawyer[] => {
  return base.map((baseLawyer) => {
    const rankings: PracticeAreaScores[] = [];
    practiceData.forEach((practice) => {
      const score = practice.data.find((d) => d.id === baseLawyer.id);
      if (score) {
        rankings.push({
          practiceArea: practice.practiceArea,
          totalScore: score.totalScore,
          reputationScore: score.reputationScore,
          instructionScore: score.instructionScore,
          peers: score.peers,
          directories: score.directories,
          newsMedia: score.newsMedia,
          socialMedia: score.socialMedia,
          volume: score.volume,
          value: score.value,
          clients: score.clients,
          complexity: score.complexity,
        });
      }
    });

    const highest =
      rankings.length > 0
        ? rankings.reduce((h, c) => (c.totalScore > h.totalScore ? c : h))
        : null;

    return {
      ...baseLawyer,
      rankings,
      totalScore: highest?.totalScore ?? 0,
      reputationScore: highest?.reputationScore ?? 0,
      instructionScore: highest?.instructionScore ?? 0,
    };
  });
};

// --- Exported Data ---

export const lawyers: Lawyer[] = mergeLawyersWithPracticeData(
  baseLawyers as BaseLawyer[],
  rawPracticeData as PracticeData[],
);

export { articles } from './articleData';

export const reportMetadata = {
  title: 'Resight India: RISE Lawyers in Private Capital',
  publishDate: 'November 2025',
  year: '2025',
  totalLawyers: lawyers.length,
};
