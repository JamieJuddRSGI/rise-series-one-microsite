import React from 'react';
import { Lawyer } from '../data/siteData';

export interface RankingResult {
  rankings: Map<string, number>;
  tiedRanks: Set<number>; // Set of ranks that have ties
}

/**
 * Calculates rankings with ties properly handled.
 * Lawyers with the same score receive the same rank (joint ranking).
 * 
 * @param lawyers Array of lawyers to rank
 * @param scoreGetter Function to extract the score to rank by
 * @returns RankingResult with rankings map and set of tied ranks
 */
export function calculateRankingsWithTies(
  lawyers: Lawyer[],
  scoreGetter: (lawyer: Lawyer) => number
): RankingResult {
  // Sort lawyers by score (descending)
  const sorted = [...lawyers].sort((a, b) => scoreGetter(b) - scoreGetter(a));
  
  const rankings = new Map<string, number>();
  const tiedRanks = new Set<number>();
  let currentRank = 1;
  let i = 0;
  
  while (i < sorted.length) {
    const currentScore = scoreGetter(sorted[i]);
    
    // Find all lawyers with the same score (ties)
    const tiedLawyers: Lawyer[] = [];
    while (i < sorted.length && scoreGetter(sorted[i]) === currentScore) {
      tiedLawyers.push(sorted[i]);
      i++;
    }
    
    // Assign the same rank to all tied lawyers
    tiedLawyers.forEach(lawyer => {
      rankings.set(lawyer.id, currentRank);
    });
    
    // Mark this rank as tied if there are multiple lawyers with this score
    if (tiedLawyers.length > 1) {
      tiedRanks.add(currentRank);
    }
    
    // Move to next rank, skipping positions equal to number of tied lawyers
    currentRank += tiedLawyers.length;
  }
  
  return { rankings, tiedRanks };
}

/**
 * Gets the display text for a rank.
 * No visual distinction is made between tied and non-tied ranks.
 * 
 * @param rank The rank number
 * @param isTied Whether this rank has ties (unused, kept for API compatibility)
 * @returns Formatted ranking text
 */
export function getRankingText(rank: number, isTied: boolean = false): string {
  if (rank === 1) return 'Ranked 1st';
  if (rank === 2) return 'Ranked 2nd';
  if (rank === 3) return 'Ranked 3rd';
  if (rank === 4) return 'Ranked 4th';
  if (rank === 5) return 'Ranked 5th';
  if (rank <= 10) return 'Top 10';
  if (rank <= 25) return 'Top 25';
  return `Ranked ${rank}th`;
}

/**
 * Converts a number to an ordinal with superscript suffix.
 * Examples: 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 14 -> "14th", 21 -> "21st"
 * 
 * @param num The number to convert
 * @returns JSX element with the number and superscript ordinal suffix
 */
export function formatOrdinal(num: number): JSX.Element {
  const getSuffix = (n: number): string => {
    const lastDigit = n % 10;
    const lastTwoDigits = n % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return 'th';
    }
    
    if (lastDigit === 1) return 'st';
    if (lastDigit === 2) return 'nd';
    if (lastDigit === 3) return 'rd';
    return 'th';
  };
  
  const suffix = getSuffix(num);
  
  return React.createElement(
    React.Fragment,
    null,
    num,
    React.createElement('sup', null, suffix)
  );
}

