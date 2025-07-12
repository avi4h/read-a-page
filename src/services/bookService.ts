
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

// Check if Supabase is properly configured
function checkSupabaseConfig(): void {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('Supabase configuration is missing. Please check your environment variables.');
  }
}

// Search for books in Supabase database
export async function searchBooks(query: string): Promise<BookPage[]> {
  if (!query) {
    return [];
  }

  checkSupabaseConfig();
  return searchBooksFromSupabase(query);
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

// Get all books from Supabase
export async function getAllBooks(): Promise<BookPage[]> {
  checkSupabaseConfig();
  return getAllBooksFromSupabase();
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

// Get all book IDs from Supabase
export async function getAllBookIds(): Promise<string[]> {
  checkSupabaseConfig();
  
  try {
    const { data, error } = await supabase
      .from('books')
      .select('id')
      .order('title');

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to fetch book IDs');
    }

    return (data || []).map(row => row.id);
  } catch (error) {
    console.error('Error fetching book IDs from Supabase:', error);
    throw new Error('Could not load book IDs.');
  }
}

// Get single book by ID from Supabase
export async function getBookById(id: string): Promise<BookPage | null> {
  checkSupabaseConfig();
  return getBookByIdFromSupabase(id);
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
  checkSupabaseConfig();

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
  checkSupabaseConfig();

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

// Check if Supabase is properly configured
export function isUsingSupabase(): boolean {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}
