import { useState } from 'react';
import { migrateExistingData, testSupabaseConnection } from '../utils/migrateData';
import { getAllBooks, isUsingSupabase } from '../services/bookService';

export function AdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [bookCount, setBookCount] = useState<number | null>(null);

  const handleTestConnection = async () => {
    setIsLoading(true);
    setMessage('Testing connection...');
    
    try {
      const success = await testSupabaseConnection();
      if (success) {
        setMessage('✅ Supabase connection successful!');
      } else {
        setMessage('❌ Supabase connection failed. Check your environment variables.');
      }
    } catch (error) {
      setMessage('💥 Connection test failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMigration = async () => {
    setIsLoading(true);
    setMessage('Starting migration...');
    
    try {
      await migrateExistingData();
      setMessage('🎉 Migration completed! Check console for details.');
      // Refresh book count
      const books = await getAllBooks();
      setBookCount(books.length);
    } catch (error) {
      setMessage('💥 Migration failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetBookCount = async () => {
    setIsLoading(true);
    setMessage('Fetching books...');
    
    try {
      const books = await getAllBooks();
      setBookCount(books.length);
      setMessage(`📚 Found ${books.length} books in ${isUsingSupabase() ? 'Supabase' : 'static data'}`);
    } catch (error) {
      setMessage('💥 Failed to fetch books: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Configuration</h2>
        <div className="space-y-2">
          <p><strong>Data Source:</strong> {isUsingSupabase() ? '🗄️ Supabase Database' : '📄 Static Files'}</p>
          <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
          <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}</p>
          <p><strong>Supabase Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}</p>
          {bookCount !== null && (
            <p><strong>Book Count:</strong> {bookCount} books</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleTestConnection}
          disabled={isLoading || !isUsingSupabase()}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          🔌 Test Supabase Connection
        </button>

        <button
          onClick={handleGetBookCount}
          disabled={isLoading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          📚 Get Book Count
        </button>

        <button
          onClick={handleMigration}
          disabled={isLoading || !isUsingSupabase()}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          🚀 Migrate Static Data
        </button>

        <button
          onClick={() => window.location.reload()}
          disabled={isLoading}
          className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          🔄 Refresh Page
        </button>
      </div>

      {message && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">Status:</h3>
          <pre className="whitespace-pre-wrap text-sm">{message}</pre>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
          <li>First, create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></li>
          <li>Create the database schema (see console logs for SQL)</li>
          <li>Update your <code>.env.local</code> file with your Supabase credentials</li>
          <li>Restart your dev server</li>
          <li>Test the connection first</li>
          <li>Run the migration to transfer your static data</li>
        </ol>
      </div>
    </div>
  );
}
