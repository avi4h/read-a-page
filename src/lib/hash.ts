/**
 * Simple hash function to generate a consistent 7-character hash from a string
 * This ensures that the same book ID always produces the same hash
 */
export function hashBookId(bookId: string): string {
  let hash = 0;
  
  // Generate a hash from the string
  for (let i = 0; i < bookId.length; i++) {
    const char = bookId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive number and create a 7-character string
  const positiveHash = Math.abs(hash);
  const hashString = positiveHash.toString(36).padStart(7, '0').slice(0, 7);
  
  return hashString;
}

/**
 * Create a reverse mapping from hash to original book ID for lookup
 */
export function createHashToIdMap(bookIds: string[]): Map<string, string> {
  const map = new Map<string, string>();
  
  for (const bookId of bookIds) {
    const hash = hashBookId(bookId);
    map.set(hash, bookId);
  }
  
  return map;
}

/**
 * Find original book ID from hash
 */
export function getBookIdFromHash(hash: string, bookIds: string[]): string | null {
  const map = createHashToIdMap(bookIds);
  return map.get(hash) || null;
}
