import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '../stores/useUiStore';
import { getNewRandomBookUrl } from '../lib/navigation';
import { ALL_BOOK_IDS } from '../lib/data';

export const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();
    const setView = useUiStore((state) => state.setView);

    // Set view to a special 'notfound' state so header can be hidden
    React.useEffect(() => {
        setView('notfound' as any);
    }, [setView]);

    const handleReadAPage = () => {
        const randomBookUrl = getNewRandomBookUrl(ALL_BOOK_IDS);
        navigate(randomBookUrl, { replace: true });
    };

    const handleGoToCovers = () => {
        navigate('/covers', { replace: true });
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 flex justify-center items-center">
            <div className="text-center p-8 max-w-lg mx-auto">
                <div className="mb-8">
                    <h1 className="text-6xl font-bold text-slate-300 dark:text-slate-600 mb-4">
                        404
                    </h1>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
                        Page Not Found
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                        Looks like you've wandered off the beaten path. The page you're looking for doesn't exist, 
                        but there are plenty of amazing books waiting to be discovered!
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleReadAPage}
                        className="w-full px-6 py-3 bg-brand-teal-500 text-white rounded-lg hover:bg-brand-teal-600 transition-colors font-medium text-lg"
                    >
                        📖 Read a Page
                    </button>
                    
                    <button
                        onClick={handleGoToCovers}
                        className="w-full px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
                    >
                        Browse Book Covers
                    </button>
                </div>

                <div className="mt-8 text-sm text-slate-500 dark:text-slate-400">
                    <p>
                        Lost? Try going back to the{' '}
                        <button 
                            onClick={() => navigate('/', { replace: true })}
                            className="text-brand-teal-500 hover:text-brand-teal-600 underline"
                        >
                            home page
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
