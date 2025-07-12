import { hashBookId } from './hash';
import { getLastOpenedBook, hasBookHistory } from './userPreferences';
import { getAllBookIds } from '../services/bookService';

// Cache for book IDs to avoid repeated Supabase calls
let cachedBookIds: string[] | null = null;

// Get book IDs (with caching)
async function getBookIds(): Promise<string[]> {
  if (cachedBookIds) {
    return cachedBookIds;
  }
  
  try {
    cachedBookIds = await getAllBookIds();
    return cachedBookIds;
  } catch (error) {
    console.error('Failed to get book IDs for navigation:', error);
    return [];
  }
}

// Clear the cache (useful when books are added/removed)
export function clearBookIdsCache(): void {
  cachedBookIds = null;
}

/**
 * Navigation utility functions for proper URL routing
 */

export const createBookUrl = (bookId: string): string => {
  const hashedId = hashBookId(bookId);
  return `/book/${hashedId}`;
};

export const createBookRevealUrl = (bookId: string): string => {
  const hashedId = hashBookId(bookId);
  return `/book/${hashedId}/reveal`;
};

export const createSearchUrl = (query?: string): string => {
  if (query) {
    return `/search?query=${encodeURIComponent(query)}`;
  }
  return '/search';
};

export const getCoversUrl = (): string => '/covers';

export const getBookshelfUrl = (): string => '/mybookshelf';

export const getAboutUrl = (): string => '/about';

/**
 * Get a random book URL for "Read a Page" functionality
 */
export const getRandomBookUrl = async (bookIds?: string[]): Promise<string> => {
  const ids = bookIds || await getBookIds();
  if (ids.length === 0) {
    return getCoversUrl(); // Fallback to covers if no books available
  }
  const randomIndex = Math.floor(Math.random() * ids.length);
  const randomBookId = ids[randomIndex];
  return createBookUrl(randomBookId);
};

/**
 * Get URL for "Read a Page" functionality with history consideration
 * - If there's a last opened book, return that (always show content, not reveal page)
 * - Otherwise, return a random book
 */
export const getReadAPageUrl = async (bookIds?: string[]): Promise<string> => {
  const lastBook = getLastOpenedBook();
  if (lastBook) {
    // Always return the content page, not the reveal page
    // Use createBookUrl to properly hash the book ID
    return createBookUrl(lastBook.id);
  }
  const ids = bookIds || await getBookIds();
  return getRandomBookUrl(ids);
};

/**
 * Get URL for root route with history consideration
 * - If there's history, return last opened book
 * - Otherwise, return a random book
 */
export const getRootRouteUrl = async (bookIds?: string[]): Promise<string> => {
  if (hasBookHistory()) {
    return await getReadAPageUrl(bookIds);
  }
  return await getRandomBookUrl(bookIds);
};

/**
 * Always get a new random book URL (for logo clicks)
 */
export const getNewRandomBookUrl = async (bookIds?: string[]): Promise<string> => {
  return await getRandomBookUrl(bookIds);
};

/**
 * Get navigation URL for different views
 */
export const getNavigationUrl = async (view: string): Promise<string> => {
  switch (view) {
    case 'covers':
      return getCoversUrl();
    case 'bookshelf':
      return getBookshelfUrl();
    case 'search':
      return createSearchUrl();
    case 'about':
      return getAboutUrl();
    case 'reading':
      return await getReadAPageUrl();
    default:
      return getCoversUrl();
  }
};

/**
 * Simple navigation helper that replaces history for book-to-book navigation
 */
export const navigateOptimized = (
  navigate: (to: string, options?: { replace?: boolean }) => void,
  currentPath: string,
  targetUrl: string
): void => {
  // Replace history for same-type navigation (e.g., book to book)
  const shouldReplace = currentPath.startsWith('/book/') && targetUrl.startsWith('/book/');
  navigate(targetUrl, { replace: shouldReplace });
};
