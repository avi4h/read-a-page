import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { type BookPage } from '../types';
import { Trash2Icon, LogoLargeIcon } from './Icons';
import { useBookshelfStore } from '../stores/useBookshelfStore';
import { createBookUrl } from '../lib/navigation';
import { LoadingSpinner } from './LoadingSpinners';

const ITEMS_PER_PAGE = 12;

const BookCard: React.FC<{ book: BookPage; onSelect: () => void; onRemove: () => void; index: number; isRemoving: boolean }> = ({ book, onSelect, onRemove, index, isRemoving }) => {
    const handleRemoveClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the onSelect click event on the parent div
        onRemove();
    };

    return (
        <div
            onClick={onSelect}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(); }}
            className={`group relative bg-white dark:bg-slate-800/50 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-brand-teal-500 animate-stagger-in ${isRemoving ? 'animate-book-remove' : ''}`}
            style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'both'
            }}
        >
            <img src={book.coverImageUrl} alt={`Cover of ${book.title}`} className="w-full h-auto object-cover aspect-[2/3] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 flex flex-col justify-end pointer-events-none">
                <h3 className="font-bold text-white text-lg">{book.title}</h3>
                <p className="text-sm text-slate-300">{book.author}</p>
            </div>
            <button
                onClick={handleRemoveClick}
                className="absolute top-2 right-2 z-10 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-300 hover:bg-red-500 hover:scale-110"
                aria-label="Remove from bookshelf"
            >
                <Trash2Icon className="w-5 h-5" />
            </button>
        </div>
    );
};

const BookshelfPage: React.FC = () => {
    const navigate = useNavigate();
    
    // Use Zustand bookshelf store
    const books = useBookshelfStore((state) => state.books);
    const status = useBookshelfStore((state) => state.status);
    const removeBookFromShelfOptimistic = useBookshelfStore((state) => state.removeBookFromShelfOptimistic);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [removingBooks, setRemovingBooks] = useState<Set<string>>(new Set());
    const isLoading = status === 'loading' || status === 'idle';

    const sortedBooks = useMemo(() =>
        [...books].sort((a, b) => a.title.localeCompare(b.title)),
        [books]
    );

    const totalPages = Math.ceil(sortedBooks.length / ITEMS_PER_PAGE);

    const currentBooks = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, sortedBooks]);

    // Effect to handle page changes with smooth transition
    useEffect(() => {
        if (currentPage > 1 && currentBooks.length === 0 && totalPages > 0) {
            setTimeout(() => setCurrentPage(currentPage - 1), 300); // Delay to allow for remove animation
        }
    }, [currentPage, currentBooks.length, totalPages]);

    const handleSelectBook = (bookId: string) => {
        const bookUrl = createBookUrl(bookId);
        navigate(bookUrl);
    };

    const handleRemove = (id: string) => {
        setRemovingBooks(prev => new Set(prev).add(id));
        
        // Delay the actual removal to allow for animation
        setTimeout(() => {
            removeBookFromShelfOptimistic(id);
            setRemovingBooks(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }, 400); // Match the animation duration
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
                <LoadingSpinner size="lg" text="Loading your bookshelf..." />
            </div>
        );
    }

    if (books.length === 0) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-10rem)] animate-fade-in">
                <div className="text-center p-8 max-w-lg mx-auto">
                    <div className="flex justify-center mb-6">
                        <LogoLargeIcon className="w-16 h-16 opacity-50" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Your Bookshelf is Empty</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Go back to the 'Read a Page' section, discover a book you like, and click "Add to Shelf" to save it here.
                    </p>
                </div>
            </div>
        );
    }

    const pageButtonClasses = "px-6 py-2 text-base font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-brand-teal-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105";
    const enabledClasses = "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600";
    const disabledClasses = "bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700";

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">My Bookshelf</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {currentBooks.map((book, index) => (
                    <BookCard 
                        key={book.id} 
                        book={book} 
                        onSelect={() => handleSelectBook(book.id)} 
                        onRemove={() => handleRemove(book.id)}
                        index={index}
                        isRemoving={removingBooks.has(book.id)}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-4 animate-fade-in-up">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className={`${pageButtonClasses} ${currentPage === 1 ? disabledClasses : enabledClasses}`}
                    >
                        Previous
                    </button>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className={`${pageButtonClasses} ${currentPage === totalPages ? disabledClasses : enabledClasses}`}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default BookshelfPage;
