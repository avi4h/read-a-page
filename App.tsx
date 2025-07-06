import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ReadingPane } from './components/ReadingPane';
import { ReaderControls } from './components/ReaderControls';
import BookshelfPage from './components/BookshelfPage';
import SearchResultsPage from './components/SearchResultsPage';
import CoversPage from './components/CoversPage';
import AboutPage from './components/AboutPage';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { closeAllPopovers, setView } from './store/uiSlice';
import { fetchBookshelf } from './store/bookshelfSlice';
import { loadInitialBook, setBookById } from './store/readingSlice';

const App: React.FC = () => {
    const dispatch = useAppDispatch();
    
    const view = useAppSelector((state) => state.ui.view);
    const theme = useAppSelector((state) => state.ui.theme);
    const currentBook = useAppSelector((state) => state.reading.currentBook);

    // Initial data loading for the bookshelf
    useEffect(() => {
        dispatch(fetchBookshelf());
    }, [dispatch]);

    // One-time effect to handle routing from a shared URL
    useEffect(() => {
        const path = window.location.pathname;
        const match = path.match(/^\/book\/([a-zA-Z0-9]{12})$/);
        if (match && match[1]) {
            const bookId = match[1];
            dispatch(setView('reading'));
            dispatch(setBookById(bookId));
        }
    }, [dispatch]);

    // Load initial book when entering reading view, if not loaded via URL
    useEffect(() => {
        if (view === 'reading') {
            dispatch(loadInitialBook());
        }
    }, [view, dispatch]);

    // Theme side-effect to update DOM and localStorage
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <div className="relative min-h-screen" onClick={() => dispatch(closeAllPopovers())}>
            <Header />
            <Sidebar />
            <main key={view} className="animate-fade-in">
                {view === 'reading' && <ReadingPane />}
                {view === 'bookshelf' && <BookshelfPage />}
                {view === 'search' && <SearchResultsPage />}
                {view === 'covers' && <CoversPage />}
                {view === 'about' && <AboutPage />}
            </main>
            {view === 'reading' && currentBook && <ReaderControls />}
        </div>
    );
};

export default App;