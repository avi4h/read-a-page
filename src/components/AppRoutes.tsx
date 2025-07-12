import React from 'react';
import { Routes, Route, Navigate, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useUiStore } from '../stores/useUiStore';
import { useReadingStore } from '../stores/useReadingStore';
import { useSearchStore } from '../stores/useSearchStore';
import { getBookIdFromHash } from '../lib/hash';
import { ALL_BOOK_IDS, BOOKS_DATA } from '../lib/data';
import { getRootRouteUrl, setCachedBookIds } from '../lib/navigation';
import { addBookToHistory } from '../lib/userPreferences';

// Set cached book IDs for navigation optimization
setCachedBookIds(ALL_BOOK_IDS);

interface RouteHandlerProps {
    children: React.ReactNode;
}

// Error boundary for route components
class RouteErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error?: Error }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Route error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
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

        return this.props.children;
    }
}

interface RouteHandlerProps {
    children: React.ReactNode;
}

// Component to handle root route - redirect based on history
const RandomBookRedirect: React.FC = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        const targetUrl = getRootRouteUrl(ALL_BOOK_IDS);
        navigate(targetUrl, { replace: true });
    }, [navigate]);

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

    React.useEffect(() => {
        if (!hashedId) {
            navigate('/covers', { replace: true });
            return;
        }

        const originalId = getBookIdFromHash(hashedId, ALL_BOOK_IDS);
        if (!originalId) {
            // Invalid hash, redirect to covers page
            console.warn(`Invalid book hash: ${hashedId}`);
            navigate('/covers', { replace: true });
            return;
        }

        // Find book data for validation
        const book = BOOKS_DATA.find(b => b.id === originalId);
        if (!book) {
            console.warn(`Book not found for ID: ${originalId}`);
            navigate('/covers', { replace: true });
            return;
        }

        setView('reading');
        setBookById(originalId);

        // Save this book to history with revealed status based on route
        const isRevealed = Boolean(isReveal);
        addBookToHistory(originalId, hashedId, book.title, isRevealed);

        // If it's a reveal route, show the book information
        if (isReveal) {
            revealBook();
        } else {
            // Make sure book info is hidden for non-reveal routes
            // This handles cases where user goes from reveal back to normal view
            setBookById(originalId); // This resets isRevealed to false
        }
    }, [hashedId, isReveal, navigate, setView, setBookById, revealBook]);

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

                {/* Default route - redirect to random book */}
                <Route path="/" element={<RandomBookRedirect />} />
                <Route path="*" element={<Navigate to="/covers" replace />} />
            </Routes>
            {children}
        </RouteErrorBoundary>
    );
};
