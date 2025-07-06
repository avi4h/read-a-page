import React from 'react';
import {
    CloseIcon, HeartIcon, BookOpenIcon, LibraryIcon, SearchIcon, InfoIcon
} from './Icons';
import { type View } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSidebarOpen, setView } from '../store/uiSlice';

interface SidebarProps {}

const SidebarLink: React.FC<{ icon: React.ReactNode; children: React.ReactNode; active?: boolean, onClick: () => void, disabled?: boolean }> = ({ icon, children, active, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} className={`w-full flex items-center p-3 rounded-lg text-base font-medium transition-colors text-left ${active ? 'bg-brand-teal-50 dark:bg-brand-teal-500/10 text-brand-teal-600 dark:text-brand-teal-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div className={active ? 'text-brand-teal-500 dark:text-brand-teal-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700'}>{icon}</div>
        <span className="ml-4">{children}</span>
    </button>
);

export const Sidebar: React.FC<SidebarProps> = () => {
    const dispatch = useAppDispatch();
    const { isOpen, activeView } = useAppSelector(state => ({
        isOpen: state.ui.isSidebarOpen,
        activeView: state.ui.view,
    }));
    
    const handleNavigate = (view: View) => {
        dispatch(setView(view));
    };

    const onClose = () => dispatch(setSidebarOpen(false));
    
    return (
        <>
            <div
                className={`fixed inset-0 bg-black/30 dark:bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            ></div>
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-slate-900 z-50 shadow-xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    <div className="p-4 flex justify-end items-center border-b border-slate-200 dark:border-slate-800">
                         <button
                            onClick={onClose}
                            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                        >
                            <CloseIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <nav className="flex-grow p-4 space-y-2">
                        <SidebarLink icon={<BookOpenIcon className="w-6 h-6"/>} onClick={() => handleNavigate('reading')} active={activeView === 'reading'}>Read a Page</SidebarLink>
                        <SidebarLink icon={<LibraryIcon className="w-6 h-6"/>} onClick={() => handleNavigate('covers')} active={activeView === 'covers'}>Covers</SidebarLink>
                        <SidebarLink icon={<HeartIcon className="w-6 h-6"/>} onClick={() => handleNavigate('bookshelf')} active={activeView === 'bookshelf'}>My Bookshelf</SidebarLink>
                        <SidebarLink icon={<SearchIcon className="w-6 h-6"/>} onClick={() => handleNavigate('search')} active={activeView === 'search'}>Search</SidebarLink>
                        <SidebarLink icon={<InfoIcon className="w-6 h-6"/>} onClick={() => handleNavigate('about')} active={activeView === 'about'}>About</SidebarLink>
                    </nav>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                        <a href="#" className="block w-full text-center px-4 py-2 text-sm font-semibold text-brand-teal-600 dark:text-brand-teal-400 border border-brand-teal-600 dark:border-brand-teal-400 rounded-md hover:bg-brand-teal-50 dark:hover:bg-brand-teal-400/10 transition-colors">Sign In</a>
                        <a href="#" className="block w-full text-center px-4 py-2 text-sm font-semibold text-white bg-brand-teal-600 rounded-md hover:bg-brand-teal-700 dark:bg-brand-teal-500 dark:hover:bg-brand-teal-600 transition-colors">Sign Up</a>
                    </div>
                </div>
            </div>
        </>
    );
};