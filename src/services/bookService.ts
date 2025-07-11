
import { BOOKS_DATA } from '../lib/data';
import { type BookPage } from '../types';

// Simulates searching for books in a database/API
export async function searchBooks(query: string): Promise<BookPage[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  if (!query) {
    return [];
  }

  try {
    const lowercasedQuery = query.toLowerCase();
    const results = BOOKS_DATA.filter(book =>
      book.title.toLowerCase().includes(lowercasedQuery) ||
      book.author.toLowerCase().includes(lowercasedQuery)
    );
    return results;
  } catch (error) {
    console.error("Error searching books:", error);
    throw new Error("The search could not be completed.");
  }
}
