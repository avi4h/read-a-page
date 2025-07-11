import React, { useState, useEffect } from 'react';
import { type BookPage } from '../types';
import { HeartIcon, FacebookIcon, TwitterIcon, LinkIcon, CheckIcon, CopyIcon, AmazonIcon } from './Icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { changeBook, revealBook, hideBookInfo } from '../store/readingSlice';
import { addBookToShelfOptimistic } from '../store/bookshelfSlice';

const LoadingSkeleton: React.FC = () => (
    <div className="w-full max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
    </div>
);

const BookInfoPanel: React.FC<{ bookPage: BookPage }> = ({ bookPage }) => {
    const dispatch = useAppDispatch();
    const [isCopied, setIsCopied] = useState(false);
    const { isSaved, isSaving } = useAppSelector(state => {
        const bookshelf = state.bookshelf;
        const savingStatus = state.bookshelf.status;
        return {
            isSaved: bookshelf.bookIds.includes(bookPage.id),
            isSaving: savingStatus === 'loading',
        };
    });

    const handleAddClick = () => {
        if (isSaved) return;
        dispatch(addBookToShelfOptimistic(bookPage));
    };

    const handleCopyLink = (e: React.MouseEvent) => {
        e.preventDefault();
        const baseUrl = window.location.origin;
        const url = `${baseUrl}/book/${bookPage.id}`;
        navigator.clipboard.writeText(url).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
        });
    };

    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/book/${bookPage.id}`;
    const shareText = `Check out this page from "${bookPage.title}"! Discover your next read on Read a Page.`;
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

    return (
        <div className="animate-fade-in">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{bookPage.title}</h2>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">by {bookPage.author}</p>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mt-8">
                <img
                    src={bookPage.coverImageUrl}
                    alt={`Cover of ${bookPage.title}`}
                    className="w-48 h-auto shadow-lg rounded-md object-cover"
                    width="300"
                    height="450"
                />
                <div className="flex flex-col items-center sm:items-start gap-4 text-left w-full max-w-xs">
                    <button
                        onClick={handleAddClick}
                        disabled={isSaved || isSaving}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold rounded-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-105 ${isSaved
                                ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/30'
                                : 'border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
                            }`}
                    >
                        {isSaved ? <CheckIcon className="w-5 h-5 animate-bounce-in" /> : <HeartIcon className="w-5 h-5" />}
                        <span>{isSaving ? 'Saving...' : isSaved ? 'Added to Shelf' : 'Add to Shelf'}</span>
                    </button>
                    <a href={bookPage.amazonBookUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-[#FF9900] text-white font-semibold rounded-md hover:bg-[#E47911] focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:ring-offset-2 transition-all duration-200 transform hover:scale-105">
                        <AmazonIcon className="w-4 h-4" />
                        <span>Buy on Amazon</span>
                    </a>
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">We may earn a commission from amazon.com at no cost to you.</p>
                    <div className="flex items-center justify-center sm:justify-start gap-4 pt-2">
                        <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" aria-label="Share on Facebook">
                            <FacebookIcon className="w-6 h-6" />
                        </a>
                        <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" aria-label="Share on Twitter">
                            <TwitterIcon className="w-6 h-6" />
                        </a>
                        <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" aria-label="Open link in a new tab">
                            <LinkIcon className="w-6 h-6" />
                        </a>
                        <div className="relative">
                            <button
                                onClick={handleCopyLink}
                                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center justify-center"
                                aria-label="Copy link"
                            >
                                {isCopied ? <CheckIcon className="w-6 h-6 text-green-500" /> : <CopyIcon className="w-6 h-6" />}
                            </button>
                            {isCopied && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs font-medium rounded-lg shadow-lg animate-popover-in pointer-events-none origin-bottom">
                                    Copied!
                                </div>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 pt-2 text-center sm:text-left">Submitted by {bookPage.submittedBy}</p>
                </div>
            </div>
        </div>
    );
};


export const ReadingPane: React.FC = () => {
    const dispatch = useAppDispatch();
    const { bookPage, isLoading, error, isRevealed, readingSettings, currentIndex } = useAppSelector(state => ({
        bookPage: state.reading.currentBook,
        isLoading: state.reading.status === 'loading',
        error: state.reading.error,
        isRevealed: state.reading.isRevealed,
        readingSettings: state.settings.reading,
        currentIndex: state.reading.currentIndex
    }));

    // Scroll to top whenever the book changes (from any navigation method)
    useEffect(() => {
        if (bookPage && !isLoading) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [bookPage?.id]);

    const onNextBook = () => {
        dispatch(changeBook(currentIndex + 1));
    };
    
    const onReveal = () => dispatch(revealBook());
    const onReadAgain = () => dispatch(hideBookInfo());

    const primaryButtonClasses = "px-9 py-3 text-base font-semibold rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-brand-teal-500 text-white hover:bg-brand-teal-600 dark:hover:bg-brand-teal-400 transform hover:scale-[1.02] active:scale-95";
    const secondaryButtonClasses = "px-9 py-3 text-base font-semibold rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transform hover:scale-[1.02] active:scale-95";

    const fontSizeClasses = { sm: 'text-sm sm:text-base', base: 'text-base sm:text-lg', lg: 'text-lg sm:text-xl', xl: 'text-xl sm:text-2xl' };
    const maxWidthClasses = { '2xl': 'max-w-2xl', '3xl': 'max-w-3xl', '4xl': 'max-w-4xl' };

    const hasContent = !error && bookPage;

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 pt-16 pb-48">
            <div className={`w-full ${maxWidthClasses[readingSettings.maxWidth]} mx-auto flex-grow flex flex-col justify-center transition-all duration-300 relative`}>

                {/* Loading State Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 animate-fade-in">
                        <LoadingSkeleton />
                    </div>
                )}

                {error && (
                    <div className="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20 p-4 rounded-lg">
                        <p className="font-semibold">Oops! Something went wrong.</p>
                        <p>{error}</p>
                    </div>
                )}

                {hasContent && (
                    <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                        {isRevealed ? (
                            <BookInfoPanel bookPage={bookPage} />
                        ) : (
                            <article>
                                <div className={`font-${readingSettings.fontFamily} ${fontSizeClasses[readingSettings.fontSize]} text-slate-700 dark:text-slate-300 leading-relaxed ${readingSettings.textAlign === 'justify' ? 'text-justify' : 'text-left'} transition-all duration-300 space-y-6`}>
                                    {bookPage.pageContent.map((paragraph, index) => (
                                        <p key={index} className="mb-3 last:mb-0 indent-8">
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </article>
                        )}
                    </div>
                )}
            </div>

            {/* Action Bar */}
            {hasContent && (
                <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-center gap-4">
                        {isRevealed ? (
                            <>
                                <button onClick={onReadAgain} disabled={isLoading} className={secondaryButtonClasses}>
                                    Read Page Again
                                </button>
                                <button onClick={onNextBook} disabled={isLoading} className={primaryButtonClasses}>
                                    Next Book
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={onNextBook} disabled={isLoading} className={secondaryButtonClasses}>
                                    Another Page
                                </button>
                                <button onClick={onReveal} disabled={isLoading} className={primaryButtonClasses}>
                                    Reveal Title & Author
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};