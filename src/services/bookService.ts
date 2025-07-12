
import { BOOKS_DATA } from '../lib/data';
import { supabase } from '../lib/supabase';
import { type BookPage } from '../types';

// Helper function to convert database row to BookPage type
function dbRowToBookPage(row: any): BookPage {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    pageContent: row.page_content,
    coverImageUrl: row.cover_image_url || '',
    amazonBookUrl: row.amazon_book_url || '',
    submittedBy: row.submitted_by
  };
}

// Configuration to toggle between static data and Supabase
const USE_SUPABASE = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

// Simulates searching for books in a database/API
export async function searchBooks(query: string): Promise<BookPage[]> {
  if (!query) {
    return [];
  }

  // Use Supabase if configured, otherwise fall back to static data
  if (USE_SUPABASE) {
    return searchBooksFromSupabase(query);
  } else {
    return searchBooksFromStaticData(query);
  }
}

// Search using static data (original implementation)
async function searchBooksFromStaticData(query: string): Promise<BookPage[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

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

// Search using Supabase database
async function searchBooksFromSupabase(query: string): Promise<BookPage[]> {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
      .order('title');

    if (error) {
      console.error('Supabase search error:', error);
      throw new Error('Search failed');
    }

    return (data || []).map(dbRowToBookPage);
  } catch (error) {
    console.error('Error searching books in Supabase:', error);
    throw new Error('The search could not be completed.');
  }
}

// Get all books
export async function getAllBooks(): Promise<BookPage[]> {
  if (USE_SUPABASE) {
    return getAllBooksFromSupabase();
  } else {
    return getAllBooksFromStaticData();
  }
}

// Get all books from static data
async function getAllBooksFromStaticData(): Promise<BookPage[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return BOOKS_DATA;
}

// Get all books from Supabase
async function getAllBooksFromSupabase(): Promise<BookPage[]> {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('title');

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to fetch books');
    }

    return (data || []).map(dbRowToBookPage);
  } catch (error) {
    console.error('Error fetching books from Supabase:', error);
    throw new Error('Could not load books.');
  }
}

// Get single book by ID
export async function getBookById(id: string): Promise<BookPage | null> {
  if (USE_SUPABASE) {
    return getBookByIdFromSupabase(id);
  } else {
    return getBookByIdFromStaticData(id);
  }
}

// Get book from static data
async function getBookByIdFromStaticData(id: string): Promise<BookPage | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const book = BOOKS_DATA.find(book => book.id === id);
  return book || null;
}

// Get book from Supabase
async function getBookByIdFromSupabase(id: string): Promise<BookPage | null> {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Supabase error:', error);
      throw new Error('Failed to fetch book');
    }

    return data ? dbRowToBookPage(data) : null;
  } catch (error) {
    console.error('Error fetching book from Supabase:', error);
    throw new Error('Could not load book.');
  }
}

// Add new book (Supabase only)
export async function addBook(book: Omit<BookPage, 'submittedBy'>): Promise<BookPage> {
  if (!USE_SUPABASE) {
    throw new Error('Adding books requires Supabase configuration');
  }

  try {
    const { data, error } = await supabase
      .from('books')
      .insert({
        id: book.id,
        title: book.title,
        author: book.author,
        page_content: book.pageContent,
        cover_image_url: book.coverImageUrl,
        amazon_book_url: book.amazonBookUrl,
        submitted_by: 'User'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to add book');
    }

    return dbRowToBookPage(data);
  } catch (error) {
    console.error('Error adding book to Supabase:', error);
    throw new Error('Could not add book.');
  }
}

// Delete book (Supabase only)
export async function deleteBook(id: string): Promise<void> {
  if (!USE_SUPABASE) {
    throw new Error('Deleting books requires Supabase configuration');
  }

  try {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to delete book');
    }
  } catch (error) {
    console.error('Error deleting book from Supabase:', error);
    throw new Error('Could not delete book.');
  }
}

// Check if using Supabase
export function isUsingSupabase(): boolean {
  return USE_SUPABASE;
}
