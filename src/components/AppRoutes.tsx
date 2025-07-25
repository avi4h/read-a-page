import React from 'react';
import { Routes, Route, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useUiStore } from '../stores/useUiStore';
import { useReadingStore } from '../stores/useReadingStore';
import { useSearchStore } from '../stores/useSearchStore';
import { getBookIdFromHash } from '../lib/hash';
import { getRootRouteUrl } from '../lib/navigation';
import { addBookToHistory } from '../lib/userPreferences';
import { AdminPage } from './AdminPage';
import { NotFoundPage } from './NotFoundPage';

interface RouteHandlerProps {
    children: React.ReactNode;
}

// Error boundary for route components
const RouteErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <React.Suspense
            fallback={
                <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
                    <div className="text-center p-8 max-w-lg mx-auto">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal-500 mx-auto mb-4"></div>
                        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
                    </div>
                </div>
            }
        >
            <ErrorFallback>
                {children}
            </ErrorFallback>
        </React.Suspense>
    );
};

// Error fallback component
const ErrorFallback: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
        const handleError = (error: ErrorEvent) => {
            console.error('Route error:', error);
            setHasError(true);
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    if (hasError) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
                <div className="text-center p-8 max-w-lg mx-auto">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        We encountered an error loading this page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-brand-teal-500 text-white rounded-md hover:bg-brand-teal-600 transition-colors"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

interface RouteHandlerProps {
    children: React.ReactNode;
}

// Component to handle root route - redirect to "Read a Page" functionality
const ReadAPageRedirect: React.FC = () => {
    const navigate = useNavigate();
    const setView = useUiStore((state) => state.setView);

    React.useEffect(() => {
        // Set the view to 'reading' to show "Read a Page" as active in header
        setView('reading');
        
        // Get the root route URL and navigate
        getRootRouteUrl().then(targetUrl => {
            navigate(targetUrl, { replace: true });
        }).catch(error => {
            console.error('Failed to get root route URL:', error);
            navigate('/covers', { replace: true });
        });
    }, [navigate, setView]);

    return null;
};

// Component to handle reading routes with improved error handling
const ReadingRoute: React.FC<{ isReveal?: boolean }> = ({ isReveal }) => {
    const { hashedId } = useParams<{ hashedId: string }>();
    const navigate = useNavigate();
    
    // Use Zustand stores
    const setView = useUiStore((state) => state.setView);
    const setBookById = useReadingStore((state) => state.setBookById);
    const revealBook = useReadingStore((state) => state.revealBook);
    const allBookIds = useReadingStore((state) => state.allBookIds);

    React.useEffect(() => {
        if (!hashedId) {
            navigate('/covers', { replace: true });
            return;
        }

        // Wait for book IDs to load if they're not available yet
        if (allBookIds.length === 0) {
            // Book IDs not loaded yet, will retry when they're available
            return;
        }

        const originalId = getBookIdFromHash(hashedId, allBookIds);
        if (!originalId) {
            // Invalid hash, redirect to covers page
            console.warn(`Invalid book hash: ${hashedId}`);
            navigate('/covers', { replace: true });
            return;
        }

        setView('reading');
        setBookById(originalId);

        // Save this book to history with revealed status based on route
        const isRevealed = Boolean(isReveal);
        addBookToHistory(originalId, isRevealed);

        // If it's a reveal route, show the book information
        if (isReveal) {
            revealBook();
        } else {
            // Make sure book info is hidden for non-reveal routes
            // This handles cases where user goes from reveal back to normal view
            setBookById(originalId); // This resets isRevealed to false
        }
    }, [hashedId, isReveal, navigate, setView, setBookById, revealBook, allBookIds]);

    return null;
};

// Component to handle search routes with validation
const SearchRoute: React.FC = () => {
    const [searchParams] = useSearchParams();
    
    // Use Zustand stores
    const setView = useUiStore((state) => state.setView);
    const setSearchQuery = useSearchStore((state) => state.setSearchQuery);
    const executeSearch = useSearchStore((state) => state.executeSearch);

    React.useEffect(() => {
        setView('search');
        const query = searchParams.get('query');
        if (query && query.trim()) {
            const trimmedQuery = query.trim();
            setSearchQuery(trimmedQuery);
            executeSearch(trimmedQuery);
        } else {
            // Clear search if no valid query parameter
            setSearchQuery('');
        }
    }, [searchParams, setView, setSearchQuery, executeSearch]);

    return null;
};

// Component to handle other view routes
const ViewRoute: React.FC<{ view: string }> = ({ view }) => {
    // Use Zustand store
    const setView = useUiStore((state) => state.setView);

    React.useEffect(() => {
        let targetView: any = 'covers'; // default fallback

        switch (view) {
            case 'covers':
                targetView = 'covers';
                break;
            case 'mybookshelf':
                targetView = 'bookshelf';
                break;
            case 'about':
                targetView = 'about';
                break;
            case 'search':
                targetView = 'search';
                break;
            default:
                targetView = 'covers';
        }

        setView(targetView);
    }, [view, setView]);

    return null;
};

export const AppRoutes: React.FC<RouteHandlerProps> = ({ children }) => {
    return (
        <RouteErrorBoundary>
            <Routes>
                {/* Book reading routes */}
                <Route
                    path="/book/:hashedId"
                    element={<ReadingRoute />}
                />
                <Route
                    path="/book/:hashedId/reveal"
                    element={<ReadingRoute isReveal={true} />}
                />

                {/* Other view routes */}
                <Route path="/covers" element={<ViewRoute view="covers" />} />
                <Route path="/mybookshelf" element={<ViewRoute view="mybookshelf" />} />
                <Route path="/about" element={<ViewRoute view="about" />} />
                <Route path="/search" element={<SearchRoute />} />
                
                {/* Admin route for Supabase management */}
                <Route path="/admin" element={<AdminPage />} />

                {/* Default route - redirect to "Read a Page" functionality */}
                <Route path="/" element={<ReadAPageRedirect />} />
                
                {/* 404 Not Found route for all other paths */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
            {children}
        </RouteErrorBoundary>
    );
};
