import React, { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setBookById } from '../store/readingSlice';
import { setView } from '../store/uiSlice';
import { type BookPage } from '../types';

const ITEMS_PER_PAGE = 24;

const CoverCard: React.FC<{ book: BookPage; onSelect: () => void; index: number }> = ({ book, onSelect, index }) => (
    <button 
        onClick={onSelect}
        className="group relative block bg-slate-800/50 rounded-lg shadow-md hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-brand-teal-500 transition-all duration-300 overflow-hidden transform hover:-translate-y-1 animate-stagger-in"
        style={{
            animationDelay: `${index * 50}ms`,
            animationFillMode: 'both'
        }}
        aria-label={`Read ${book.title}`}
    >
        <img src={book.coverImageUrl} alt={`Cover of ${book.title}`} className="w-full h-auto object-cover aspect-[2/3]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300">
            <h3 className="font-bold text-white text-lg">{book.title}</h3>
            <p className="text-sm text-slate-300">{book.author}</p>
        </div>
    </button>
);

const CoversPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const allBooks = useAppSelector(state => state.reading.allBooks);
    const [currentPage, setCurrentPage] = useState(1);

    const handleSelectBook = (bookId: string) => {
        dispatch(setBookById(bookId));
        dispatch(setView('reading'));
    };

    const sortedBooks = useMemo(() =>
        [...allBooks].sort((a, b) => a.title.localeCompare(b.title)),
        [allBooks]
    );

    const totalPages = Math.ceil(sortedBooks.length / ITEMS_PER_PAGE);

    const currentBooks = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return sortedBooks.slice(startIndex, endIndex);
    }, [currentPage, sortedBooks]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentPage]);

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const pageButtonClasses = "px-6 py-2 text-base font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-brand-teal-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    const enabledClasses = "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600";
    const disabledClasses = "bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700";

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Discover by Cover</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {currentBooks.map((book, index) => (
                    <CoverCard key={book.id} book={book} onSelect={() => handleSelectBook(book.id)} index={index} />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-4">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className={`${pageButtonClasses} ${currentPage === 1 ? disabledClasses : enabledClasses}`}
                    >
                        Previous Page
                    </button>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className={`${pageButtonClasses} ${currentPage === totalPages ? disabledClasses : enabledClasses}`}
                    >
                        Next Page
                    </button>
                </div>
            )}
        </div>
    );
};

export default CoversPage;