import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '../stores/useUiStore';
import { useBookshelfStore } from '../stores/useBookshelfStore';
import { migrateExistingData, testSupabaseConnection } from '../utils/migrateData';
import { getAllBooks, isUsingSupabase } from '../services/bookService';
import { 
  getBookHistory, 
  loadUserPreferences, 
  exportUserPreferences, 
  importUserPreferences
} from '../lib/userPreferences';

interface SystemStats {
  totalBooks: number;
  userBooksInShelf: number;
  booksInHistory: number;
  lastAccessTime: string;
  storageUsed: string;
  appVersion: string;
}

export function AdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [selectedTab, setSelectedTab] = useState<'database' | 'users' | 'system' | 'analytics'>('database');
  const [bookCount, setBookCount] = useState<number | null>(null);
  const navigate = useNavigate();
  
  const setView = useUiStore((state) => state.setView);
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const bookshelfBooks = useBookshelfStore((state) => state.books);

  // Set view to 'admin' so header/sidebar can be hidden
  useEffect(() => {
    setView('admin' as any);
    loadSystemStats();
  }, [setView]);

  const loadSystemStats = () => {
    try {
      const history = getBookHistory();
      const preferences = loadUserPreferences();
      const storageSize = JSON.stringify(preferences).length;
      
      setSystemStats({
        totalBooks: bookCount || 0,
        userBooksInShelf: bookshelfBooks.length,
        booksInHistory: history.length,
        lastAccessTime: new Date().toISOString(),
        storageUsed: `${(storageSize / 1024).toFixed(2)} KB`,
        appVersion: '1.0.0'
      });
    } catch (error) {
      console.error('Failed to load system stats:', error);
    }
  };

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
      loadSystemStats();
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
      loadSystemStats();
    } catch (error) {
      setMessage('💥 Failed to fetch books: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    try {
      const exportData = exportUserPreferences();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `read-a-page-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage('✅ User data exported successfully!');
    } catch (error) {
      setMessage('❌ Failed to export data: ' + (error as Error).message);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        importUserPreferences(jsonString);
        setMessage('✅ User data imported successfully! Please refresh the page.');
        loadSystemStats();
      } catch (error) {
        setMessage('❌ Failed to import data: ' + (error as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const handleClearUserData = () => {
    if (window.confirm('Are you sure you want to clear all user data? This action cannot be undone.')) {
      try {
        localStorage.removeItem('userData');
        setMessage('✅ User data cleared successfully! Please refresh the page.');
        loadSystemStats();
      } catch (error) {
        setMessage('❌ Failed to clear user data: ' + (error as Error).message);
      }
    }
  };

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  const TabButton: React.FC<{ id: typeof selectedTab; children: React.ReactNode }> = ({ id, children }) => (
    <button
      onClick={() => setSelectedTab(id)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        selectedTab === id
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button
              onClick={handleGoHome}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              🏠 Back to App
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8">
          <TabButton id="database">🗄️ Database</TabButton>
          <TabButton id="users">👥 User Data</TabButton>
          <TabButton id="system">⚙️ System</TabButton>
          <TabButton id="analytics">📊 Analytics</TabButton>
        </div>

        {/* Tab Content */}
        {selectedTab === 'database' && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Database Configuration</h2>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>Data Source:</strong> {isUsingSupabase() ? '🗄️ Supabase Database' : '📄 Static Files'}</p>
                <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
                <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}</p>
                <p><strong>Supabase Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}</p>
                {bookCount !== null && (
                  <p><strong>Book Count:</strong> {bookCount} books</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleTestConnection}
                disabled={isLoading || !isUsingSupabase()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                🔌 Test Connection
              </button>

              <button
                onClick={handleGetBookCount}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                📚 Refresh Book Count
              </button>

              <button
                onClick={handleMigration}
                disabled={isLoading || !isUsingSupabase()}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                🚀 Migrate Data
              </button>

              <button
                onClick={() => window.location.reload()}
                disabled={isLoading}
                className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                🔄 Refresh Page
              </button>
            </div>
          </div>
        )}

        {selectedTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">User Data Management</h2>
              {systemStats && (
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p><strong>Books in Shelf:</strong> {systemStats.userBooksInShelf}</p>
                  <p><strong>Reading History:</strong> {systemStats.booksInHistory} books</p>
                  <p><strong>Storage Used:</strong> {systemStats.storageUsed}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleExportData}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                📤 Export Data
              </button>

              <label className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer text-center">
                📥 Import Data
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleClearUserData}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                🗑️ Clear All Data
              </button>
            </div>
          </div>
        )}

        {selectedTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">System Information</h2>
              {systemStats && (
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p><strong>App Version:</strong> {systemStats.appVersion}</p>
                  <p><strong>Last Access:</strong> {new Date(systemStats.lastAccessTime).toLocaleString()}</p>
                  <p><strong>Theme:</strong> {theme === 'light' ? '☀️ Light' : '🌙 Dark'}</p>
                  <p><strong>Browser:</strong> {navigator.userAgent.split(' ').slice(-2).join(' ')}</p>
                  <p><strong>Viewport:</strong> {window.innerWidth} x {window.innerHeight}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Usage Analytics</h2>
              {systemStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-blue-500">{systemStats.totalBooks}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Books</div>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-500">{systemStats.userBooksInShelf}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">In Bookshelf</div>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-purple-500">{systemStats.booksInHistory}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Books Read</div>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-orange-500">{systemStats.storageUsed}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Storage</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Messages */}
        {message && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-6">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Status:</h3>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{message}</pre>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Setup Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
            <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></li>
            <li>Create the database schema (check console for SQL commands)</li>
            <li>Update your <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">.env.local</code> file with credentials</li>
            <li>Restart your development server</li>
            <li>Test the connection and migrate your data</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
