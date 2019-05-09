/**
 * Removes duplicate numbers from an array
 * @param array - The array possibly containing duplicate values
 */
export function uniqueValues<T>(array: T[]): T[] {
  return Array.from(new Set<T>(array));
}
