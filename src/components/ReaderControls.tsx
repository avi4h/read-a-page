import React from 'react';
import { FontIcon, SettingsIcon, ChevronLeftIcon, ChevronRightIcon, AlignLeftIcon, AlignJustifyIcon } from './Icons';
import { type ReadingSettings } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateReadingSettings } from '../store/settingsSlice';
import { setActivePopover } from '../store/uiSlice';
import { changeBook } from '../store/readingSlice';

interface ReaderControlsProps { }

const Popover: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div
        className="absolute bottom-full mb-4 w-80 origin-bottom bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 animate-popover-in"
        onClick={(e) => e.stopPropagation()}
    >
        {children}
    </div>
);

const ControlButton: React.FC<{
    onClick: (e: React.MouseEvent) => void;
    isActive?: boolean;
    children: React.ReactNode;
    className?: string;
}> = ({ onClick, isActive, children, className = '' }) => (
    <button
        onClick={onClick}
        className={`flex-1 whitespace-nowrap px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-150 transform active:scale-95 ${isActive
                ? 'bg-brand-teal-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
            } ${className}`}
    >
        {children}
    </button>
);


export const ReaderControls: React.FC<ReaderControlsProps> = () => {
    const dispatch = useAppDispatch();
    const settings = useAppSelector(state => state.settings.reading);
    const activePopover = useAppSelector(state => state.ui.activePopover);
    const { currentIndex, isLoading } = useAppSelector(state => ({
        currentIndex: state.reading.currentIndex,
        isLoading: state.reading.status === 'loading',
    }));

    const onUpdateSettings = (newSettings: Partial<ReadingSettings>) => dispatch(updateReadingSettings(newSettings));
    const onTogglePopover = (popover: 'font' | 'settings') => dispatch(setActivePopover(popover));
    const onNext = () => dispatch(changeBook(currentIndex + 1));
    const onPrevious = () => dispatch(changeBook(currentIndex - 1));

    const iconStyle = "w-6 h-6 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors";
    const activeIconStyle = "text-brand-teal-600 dark:text-brand-teal-400";
    const fontSizes: ReadingSettings['fontSize'][] = ['sm', 'base', 'lg', 'xl'];

    const handleToggle = (e: React.MouseEvent, popover: 'font' | 'settings') => {
        e.stopPropagation();
        onTogglePopover(popover);
    };

    const controlBarClasses = `relative flex items-center justify-center space-x-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full border border-slate-200 dark:border-slate-700 p-2 transition-shadow duration-300 ${activePopover ? 'shadow-2xl' : 'shadow-lg'}`;

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-controls-in" onClick={(e) => e.stopPropagation()}>
            <div className={controlBarClasses}>

                {activePopover === 'font' && (
                    <Popover>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 text-center">Font Family</h4>
                                <div className="flex gap-2">
                                    <ControlButton onClick={() => onUpdateSettings({ fontFamily: 'sans' })} isActive={settings.fontFamily === 'sans'}>Sans-Serif</ControlButton>
                                    <ControlButton onClick={() => onUpdateSettings({ fontFamily: 'serif' })} isActive={settings.fontFamily === 'serif'}>Serif</ControlButton>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 text-center">Font Size</h4>
                                <div className="flex gap-2">
                                    {fontSizes.map(size => (
                                        <ControlButton
                                            key={size}
                                            onClick={() => onUpdateSettings({ fontSize: size })}
                                            isActive={settings.fontSize === size}
                                            className="uppercase"
                                        >
                                            {size}
                                        </ControlButton>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Popover>
                )}

                {activePopover === 'settings' && (
                    <Popover>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 text-center">Text Align</h4>
                                <div className="flex gap-2">
                                    <ControlButton onClick={() => onUpdateSettings({ textAlign: 'left' })} isActive={settings.textAlign === 'left'}><AlignLeftIcon className="w-5 h-5 mx-auto" /></ControlButton>
                                    <ControlButton onClick={() => onUpdateSettings({ textAlign: 'justify' })} isActive={settings.textAlign === 'justify'}><AlignJustifyIcon className="w-5 h-5 mx-auto" /></ControlButton>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 text-center">Page Width</h4>
                                <div className="flex gap-2">
                                    <ControlButton onClick={() => onUpdateSettings({ maxWidth: '2xl' })} isActive={settings.maxWidth === '2xl'}>Narrow</ControlButton>
                                    <ControlButton onClick={() => onUpdateSettings({ maxWidth: '3xl' })} isActive={settings.maxWidth === '3xl'}>Medium</ControlButton>
                                    <ControlButton onClick={() => onUpdateSettings({ maxWidth: '4xl' })} isActive={settings.maxWidth === '4xl'}>Wide</ControlButton>
                                </div>
                            </div>
                        </div>
                    </Popover>
                )}

                <button
                    disabled={isLoading}
                    className={`p-3 rounded-full group transition-all duration-150 transform active:scale-90 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 ${activePopover === 'font' ? 'bg-slate-100 dark:bg-slate-700' : ''}`}
                    onClick={(e) => handleToggle(e, 'font')}
                    aria-label="Font settings">
                    <FontIcon className={`${iconStyle} ${activePopover === 'font' ? activeIconStyle : ''}`} />
                </button>
                <button
                    disabled={isLoading}
                    className={`p-3 rounded-full group transition-all duration-150 transform active:scale-90 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 ${activePopover === 'settings' ? 'bg-slate-100 dark:bg-slate-700' : ''}`}
                    onClick={(e) => handleToggle(e, 'settings')}
                    aria-label="Display settings">
                    <SettingsIcon className={`${iconStyle} ${activePopover === 'settings' ? activeIconStyle : ''}`} />
                </button>
                <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                <button disabled={isLoading} onClick={onPrevious} className="p-3 rounded-full group transition-all duration-150 transform active:scale-90 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50" title="Previous book" aria-label="Previous book">
                    <ChevronLeftIcon className={iconStyle} />
                </button>
                <button disabled={isLoading} onClick={onNext} className="p-3 rounded-full group transition-all duration-150 transform active:scale-90 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50" title="Next book" aria-label="Next book">
                    <ChevronRightIcon className={iconStyle} />
                </button>
            </div>
        </div>
    );
};