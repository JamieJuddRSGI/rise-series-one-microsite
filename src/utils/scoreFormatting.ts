/**
 * Formats a score to 2 significant figures for display.
 * Examples: 3.5999999999999996 -> 3.6, 6.0 -> 6.0, 0.36 -> 0.36
 * 
 * @param score The score to format
 * @returns Formatted score string with 2 significant figures
 */
export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return '–';
  
  // Round to 2 decimal places first to handle floating point errors
  const rounded = Math.round(score * 100) / 100;
  
  // Format to 2 significant figures
  if (rounded === 0) return '0';
  
  const magnitude = Math.floor(Math.log10(Math.abs(rounded)));
  const factor = Math.pow(10, 1 - magnitude);
  const twoSigFigs = Math.round(rounded * factor) / factor;
  
  // Format to remove unnecessary trailing zeros (only after decimal point)
  return twoSigFigs.toString().replace(/\.0+$/, '');
}

/**
 * Formats a score to always show 2 decimal places.
 * This is simpler and more consistent for score displays.
 * 
 * @param score The score to format
 * @returns Formatted score string with 2 decimal places
 */
export function formatScoreToTwoDecimals(score: number | null | undefined): string {
  if (score === null || score === undefined) return '–';
  
  // Round to 2 decimal places to handle floating point errors
  const rounded = Math.round(score * 100) / 100;
  
  // Format to 2 decimal places, removing trailing zeros if it's a whole number
  if (rounded % 1 === 0) {
    return rounded.toString();
  }
  
  // Format to 2 decimal places and remove trailing zeros
  const formatted = rounded.toFixed(2);
  // Remove trailing zeros after decimal point (e.g., "4.50" -> "4.5", "5.60" -> "5.6")
  // Match decimal point followed by one or more zeros at the end
  // Use a more explicit pattern to ensure it works correctly
  if (formatted.endsWith('.00')) {
    return formatted.slice(0, -3);
  }
  if (formatted.endsWith('0') && formatted.includes('.')) {
    return formatted.slice(0, -1);
  }
  return formatted;
}

