import { hashBookId } from './hash';
import { getLastOpenedBook, hasBookHistory } from './userPreferences';

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
export const getRandomBookUrl = (bookIds: string[]): string => {
  if (bookIds.length === 0) {
    return getCoversUrl(); // Fallback to covers if no books available
  }
  const randomIndex = Math.floor(Math.random() * bookIds.length);
  const randomBookId = bookIds[randomIndex];
  return createBookUrl(randomBookId);
};

/**
 * Get URL for "Read a Page" functionality with history consideration
 * - If there's a last opened book, return that (always show content, not reveal page)
 * - Otherwise, return a random book
 */
export const getReadAPageUrl = (bookIds: string[]): string => {
  const lastBook = getLastOpenedBook();
  if (lastBook) {
    // Always return the content page, not the reveal page
    // Use createBookUrl to properly hash the book ID
    return createBookUrl(lastBook.id);
  }
  return getRandomBookUrl(bookIds);
};

/**
 * Get URL for root route with history consideration
 * - If there's history, return last opened book
 * - Otherwise, return a random book
 */
export const getRootRouteUrl = (bookIds: string[]): string => {
  if (hasBookHistory()) {
    return getReadAPageUrl(bookIds);
  }
  return getRandomBookUrl(bookIds);
};

/**
 * Always get a new random book URL (for logo clicks)
 */
export const getNewRandomBookUrl = (bookIds: string[]): string => {
  return getRandomBookUrl(bookIds);
};

/**
 * Navigate to a specific URL
 */
export const navigateToUrl = (url: string): void => {
  window.history.pushState({}, '', url);
  // Trigger a custom event to let the app know about navigation
  window.dispatchEvent(new PopStateEvent('popstate'));
};

/**
 * Navigation utility hook for consistent navigation handling
 */
export const getNavigationUrl = (view: string): string => {
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
      return getReadAPageUrl(getAvailableBookIds());
    default:
      return getCoversUrl();
  }
};

/**
 * Get available book IDs (can be optimized to be cached)
 */
let cachedBookIds: string[] | null = null;
export const getAvailableBookIds = (): string[] => {
  if (!cachedBookIds) {
    // This would typically come from a dynamic import or API call
    // For now, we'll use a placeholder that can be replaced with actual data
    cachedBookIds = [];
  }
  return cachedBookIds;
};

/**
 * Set cached book IDs (called once when data is loaded)
 */
export const setCachedBookIds = (bookIds: string[]): void => {
  cachedBookIds = bookIds;
};

/**
 * Navigation history utilities for better back/forward behavior
 */
export const shouldReplaceHistory = (currentPath: string, newPath: string): boolean => {
  // Replace history for same-type navigation (e.g., book to book)
  const currentIsBook = currentPath.startsWith('/book/');
  const newIsBook = newPath.startsWith('/book/');
  return currentIsBook && newIsBook;
};

/**
 * Optimized navigation with history consideration
 */
export const navigateOptimized = (
  navigate: (to: string, options?: { replace?: boolean }) => void,
  currentPath: string,
  targetUrl: string
): void => {
  const shouldReplace = shouldReplaceHistory(currentPath, targetUrl);
  navigate(targetUrl, { replace: shouldReplace });
};
