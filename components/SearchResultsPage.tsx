import React, { useState, useEffect, useMemo } from 'react';
import { type BookPage } from '../types';
import { HeartIcon, CheckIcon, SearchIcon, CopyIcon, CloseIcon } from './Icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addBookToShelf } from '../store/bookshelfSlice';
import { setSearchQuery, executeSearch } from '../store/searchSlice';
import { setView } from '../store/uiSlice';
import { setBookById } from '../store/readingSlice';

const SearchResultCard: React.FC<{ book: BookPage }> = ({ book }) => {
    const dispatch = useAppDispatch();
    const { isSaved, isSaving } = useAppSelector(state => ({
        isSaved: state.bookshelf.bookIds.includes(book.id),
        isSaving: state.bookshelf.status === 'loading',
    }));
    const [isCopied, setIsCopied] = useState(false);

    const handleSelectBook = () => {
        dispatch(setBookById(book.id));
        dispatch(setView('reading'));
    };

    const handleAddClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSaved) return;
        dispatch(addBookToShelf(book));
    };

    const handleCopyLink = (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${window.location.origin}/book/${book.id}`;
        navigator.clipboard.writeText(url).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
        });
    };

    return (
        <div
            className="group flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm transition-shadow duration-300 hover:shadow-lg"
        >
            <button
                onClick={handleSelectBook}
                className="flex-shrink-0 self-center sm:self-start rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800/50 focus:ring-brand-teal-500"
                aria-label={`Read ${book.title}`}
            >
                <img 
                    src={book.coverImageUrl} 
                    alt={`Cover of ${book.title}`}
                    className="w-24 h-36 object-cover rounded-md"
                    width="96"
                    height="144"
                />
            </button>
            <div className="flex-grow">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    <button 
                        onClick={handleSelectBook}
                        className="text-left hover:text-brand-teal-600 dark:hover:text-brand-teal-400 transition-colors focus:outline-none focus:underline"
                    >
                        {book.title}
                    </button>
                </h3>
                <p className="text-md text-slate-600 dark:text-slate-300">by {book.author}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                    {book.pageContent}
                </p>
            </div>
            <div className="flex-shrink-0 self-center sm:self-start flex flex-row items-center gap-4 sm:flex-col sm:items-end sm:gap-3">
                 <button 
                    onClick={handleAddClick}
                    disabled={isSaved || isSaving}
                    className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
                        isSaved
                        ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'
                        : 'border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
                    }`}
                >
                    {isSaved ? <CheckIcon className="w-4 h-4"/> : <HeartIcon className="w-4 h-4" />}
                    <span>{isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}</span>
                </button>
                <div className="relative">
                    <button
                        onClick={handleCopyLink}
                        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Copy link"
                    >
                        {isCopied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
                    </button>
                    {isCopied && (
                        <div className="absolute bottom-full sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 right-full -translate-x-[-40px] sm:translate-x-0 sm:mr-3 w-max px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs font-medium rounded-lg shadow-lg animate-popover-in pointer-events-none origin-bottom">
                            Copied!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const LoadingSkeleton: React.FC = () => (
     <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-6 p-4 bg-white dark:bg-slate-800/50 rounded-lg">
                <div className="w-24 h-36 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                <div className="flex-grow space-y-3 py-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/5"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/5"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-4/5"></div>
                </div>
            </div>
        ))}
    </div>
);


const SearchResultsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { query, results, status, error } = useAppSelector(state => ({
        query: state.search.query,
        results: state.search.results,
        status: state.search.status,
        error: state.search.error,
    }));

    const [localQuery, setLocalQuery] = useState(query);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        setLocalQuery(query);
    }, [query]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentPage]);

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmedQuery = localQuery.trim();
        if (trimmedQuery) {
            dispatch(setSearchQuery(trimmedQuery));
            dispatch(executeSearch(trimmedQuery));
            setCurrentPage(1);
        }
    };
    
    const totalPages = Math.ceil(results.length / itemsPerPage);
    const currentResults = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return results.slice(startIndex, startIndex + itemsPerPage);
    }, [currentPage, itemsPerPage, results]);

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };
    
    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const pageButtonClasses = "px-6 py-2 text-base font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-brand-teal-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    const enabledClasses = "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600";
    const disabledClasses = "bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700";
    
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Search the Library</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
                Find your next read by searching for a title or author.
            </p>

            <form onSubmit={handleSearchSubmit} className="mb-8">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="e.g., The Last Echo or Elara Vance"
                        value={localQuery}
                        onChange={(e) => setLocalQuery(e.target.value)}
                        className="block w-full text-base sm:text-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-3 sm:py-4 pl-12 pr-12 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-brand-teal-500 focus:border-brand-teal-500"
                    />
                    {localQuery && (
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                            <button
                                type="button"
                                onClick={() => setLocalQuery('')}
                                className="p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none"
                                aria-label="Clear search"
                            >
                                <CloseIcon className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>
            </form>

            {status === 'loading' && <LoadingSkeleton />}

            {status === 'failed' && error && (
                <div className="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20 p-4 rounded-lg">
                    <p className="font-semibold">Oops! Something went wrong.</p>
                    <p>{error}</p>
                </div>
            )}
            
            {status === 'succeeded' && (
                <div>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {results.length > 0 ? `Results for "` : `No results for "`}<span className="text-brand-teal-600 dark:text-brand-teal-400">{query}</span>"
                        </h2>
                        {results.length > 0 && (
                            <div className="flex items-center gap-2 self-end sm:self-center">
                                <label htmlFor="items-per-page" className="text-sm font-medium text-slate-600 dark:text-slate-400">Per Page:</label>
                                <select 
                                    id="items-per-page" 
                                    value={itemsPerPage} 
                                    onChange={handleItemsPerPageChange}
                                    className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm p-1.5 focus:ring-2 focus:ring-brand-teal-500 focus:border-brand-teal-500"
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                </select>
                            </div>
                        )}
                    </div>
                    
                    {results.length > 0 ? (
                        <>
                            <div className="space-y-4">
                                {currentResults.map(book => <SearchResultCard key={book.id} book={book} />)}
                            </div>
                            
                            {totalPages > 1 && (
                                <div className="mt-12 flex justify-center items-center gap-4">
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
                        </>
                    ) : (
                         <div className="text-center p-8 mt-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Matches Found</h2>
                            <p className="text-slate-600 dark:text-slate-400">
                                We couldn't find any books matching your search. Please try a different query.
                            </p>
                        </div>
                    )}
                </div>
            )}
            
            {status === 'idle' && (
                 <div className="text-center p-8 mt-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                    <SearchIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                    <h2 className="mt-4 text-xl font-bold text-slate-800 dark:text-white mb-2">Ready to Search</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Use the bar above to begin your search.
                    </p>
                </div>
            )}
        </div>
    );
};

export default SearchResultsPage;