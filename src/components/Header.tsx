import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogoIcon, MenuIcon, SunIcon, MoonIcon } from './Icons';
import { type View } from '../types';
import { useUiStore } from '../stores/useUiStore';
import { 
    getNavigationUrl,
    getNewRandomBookUrl,
    navigateOptimized
} from '../lib/navigation';

const NavLink: React.FC<{ onClick: () => void; children: React.ReactNode, active?: boolean, disabled?: boolean }> = ({ onClick, children, active, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-3 py-2 rounded-md text-lg font-medium transition-colors whitespace-nowrap ${active ? 'text-brand-teal-500 dark:text-brand-teal-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        {children}
    </button>
);

export const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Use Zustand store
    const activeView = useUiStore((state) => state.view);
    const theme = useUiStore((state) => state.theme);
    const toggleTheme = useUiStore((state) => state.toggleTheme);
    const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);

    const handleNavigate = useCallback(async (view: View) => {
        try {
            const url = await getNavigationUrl(view);
            navigateOptimized(navigate, location.pathname, url);
        } catch (error) {
            console.error('Navigation failed:', error);
            // Fallback to covers if navigation fails
            navigate('/covers');
        }
    }, [navigate, location.pathname]);

    const handleLogoClick = useCallback(async () => {
        try {
            // Logo click always gets a new random book
            const randomBookUrl = await getNewRandomBookUrl();
            navigateOptimized(navigate, location.pathname, randomBookUrl);
        } catch (error) {
            console.error('Logo navigation failed:', error);
            // Fallback to covers if navigation fails
            navigate('/covers');
        }
    }, [navigate, location.pathname]);

    return (
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <button onClick={handleLogoClick} className="flex-shrink-0 flex items-center space-x-2">
                            <LogoIcon className="h-8 w-8 text-white" />
                        </button>
                        <nav className="hidden md:flex md:ml-6 md:space-x-1 lg:space-x-2">
                            <NavLink onClick={() => handleNavigate('reading')} active={activeView === 'reading'}>Read a Page</NavLink>
                            <NavLink onClick={() => handleNavigate('covers')} active={activeView === 'covers'}>Covers</NavLink>
                            <NavLink onClick={() => handleNavigate('bookshelf')} active={activeView === 'bookshelf'}>My Bookshelf</NavLink>
                            <NavLink onClick={() => handleNavigate('search')} active={activeView === 'search'}>Search</NavLink>
                            <NavLink onClick={() => handleNavigate('about')} active={activeView === 'about'}>About</NavLink>
                        </nav>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                            <span className="sr-only">Toggle theme</span>
                            {theme === 'light' ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
                        </button>
                        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 md:hidden">
                            <span className="sr-only">Open main menu</span>
                            <MenuIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};