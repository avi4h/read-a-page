import React, { useEffect, Suspense } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ReadingPane } from './components/ReadingPane';
import { ReaderControls } from './components/ReaderControls';
import { AppRoutes } from './components/AppRoutes';
import { useUiStore } from './stores/useUiStore';
import { useReadingStore } from './stores/useReadingStore';
import { useSearchStore } from './stores/useSearchStore';
import { useBookshelfStore } from './stores/useBookshelfStore';
import { useUserPreferences } from './hooks/useUserPreferences';
import { useRoutePreloader } from './hooks/useRoutePreloader';
import { PageLoadingSpinner } from './components/LoadingSpinners';

// Lazy load page components for better performance
const BookshelfPage = React.lazy(() => import('./components/BookshelfPage'));
const SearchResultsPage = React.lazy(() => import('./components/SearchResultsPage'));
const CoversPage = React.lazy(() => import('./components/CoversPage'));
const AboutPage = React.lazy(() => import('./components/AboutPage'));

const App: React.FC = () => {
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Load user preferences on app startup
    useUserPreferences();
    
    // Preload route components for better performance
    useRoutePreloader();

    // Use Zustand stores
    const view = useUiStore((state) => state.view);
    const theme = useUiStore((state) => state.theme);
    const closeAllPopovers = useUiStore((state) => state.closeAllPopovers);
    const currentBook = useReadingStore((state) => state.currentBook);
    const initializeStore = useReadingStore((state) => state.initializeStore);
    const setSearchQuery = useSearchStore((state) => state.setSearchQuery);
    const fetchBookshelf = useBookshelfStore((state) => state.fetchBookshelf);
    const initializeFromLocalStorage = useBookshelfStore((state) => state.initializeFromLocalStorage);

    // Initialize reading store and bookshelf data loading
    useEffect(() => {
        // Initialize reading store with books from Supabase
        initializeStore();
        
        // Initialize bookshelf from localStorage then fetch from database
        initializeFromLocalStorage();
        fetchBookshelf();
    }, [initializeStore, fetchBookshelf, initializeFromLocalStorage]);

    // Handle search query from URL params
    useEffect(() => {
        if (location.pathname === '/search') {
            const query = searchParams.get('query');
            if (query) {
                setSearchQuery(query);
            }
        }
    }, [location.pathname, searchParams, setSearchQuery]);

    // Theme side-effect to update DOM (localStorage handled by Redux)
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    return (
        <div className="relative min-h-screen" onClick={closeAllPopovers}>
            <AppRoutes>
                {view !== 'notfound' && view !== 'admin' && <Header />}
                {view !== 'notfound' && view !== 'admin' && <Sidebar />}
                <main className="animate-fade-in">
                    <div className="transition-all duration-300 ease-in-out">
                        {view === 'reading' && <ReadingPane />}
                        {view === 'bookshelf' && (
                            <Suspense fallback={<PageLoadingSpinner />}>
                                <BookshelfPage />
                            </Suspense>
                        )}
                        {view === 'search' && (
                            <Suspense fallback={<PageLoadingSpinner />}>
                                <SearchResultsPage />
                            </Suspense>
                        )}
                        {view === 'covers' && (
                            <Suspense fallback={<PageLoadingSpinner />}>
                                <CoversPage />
                            </Suspense>
                        )}
                        {view === 'about' && (
                            <Suspense fallback={<PageLoadingSpinner />}>
                                <AboutPage />
                            </Suspense>
                        )}
                    </div>
                </main>
                {view === 'reading' && currentBook && <ReaderControls />}
            </AppRoutes>
        </div>
    );
};

export default App;
