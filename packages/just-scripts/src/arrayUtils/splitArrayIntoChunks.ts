/**
 * Breaks apart a large array into an array of smaller arrays.
 * @param array The array to break apart
 * @param chunkSize The maximum number of elements in each chunk
 */
export function splitArrayIntoChunks<T>(array: T[], chunkSize: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }

  return result;
}
