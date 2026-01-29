import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { IconMenu2, IconVolume, IconVolumeOff, IconClock, IconCalendar, IconPlayerPlay, IconPlayerPause, IconMoon, IconSun } from '@tabler/icons-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

import { useAutoCycle } from '../hooks/useAutoCycle';
import { useAlarmContext } from '../context/AlarmContext';

const TITLE_MAP = {
    '/monitor-smt': 'SMT LINES MONITORING',
    '/monitor-area': 'AREA & STORAGE MONITORING',
    '/monitor-facility': 'FACILITY MONITORING',
    '/monitor-grounding': 'GROUNDING CHECKER MONITORING'
};

const CYCLE_ROUTES = ['/monitor-smt', '/monitor-area', '/monitor-facility', '/monitor-grounding'];

export default function Layout({ children }) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isMuted, toggleMute } = useAlarmContext();

    // Auto Cycle Logic (Lifted from pages)
    const { isPaused, togglePause } = useAutoCycle(CYCLE_ROUTES);

    // Dark Mode Logic
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            return saved === 'dark';
        }
        return false;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const location = useLocation();
    const currentTitle = TITLE_MAP[location.pathname] || "ENVIRONMENT MONITORING";

    // Clock effect
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Helper for classes
    const cn = (...inputs) => twMerge(clsx(inputs));

    const formattedTime = currentTime.toLocaleTimeString('id-ID', { hour12: false });
    const formattedDate = currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Menu logic
    const navItems = [
        { label: 'SMT Lines', path: '/monitor-smt' },
        { label: 'Area & Storage', path: '/monitor-area' },
        { label: 'Facility', path: '/monitor-facility' },
        { label: 'Grounding Monitor', path: '/monitor-grounding' },
    ];

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
            {/* Header */}
            <header className="flex-none bg-white dark:bg-slate-800 shadow-sm border-b-4 border-primary z-20 relative transition-all duration-300">
                <div className="w-full flex md:grid md:grid-cols-[1fr_auto_1fr] flex-col md:flex-row items-center p-2 md:px-6 gap-2 md:gap-0">

                    {/* Left Spacer (Desktop) / Hidden (Mobile) */}
                    <div className="hidden md:block"></div>

                    {/* Center Title */}
                    <div className="flex flex-col items-center justify-center text-center w-full order-1 md:order-none">
                        <h1 className="text-lg md:text-3xl font-bold tracking-tight text-primary uppercase">
                            ENVIRONMENT MONITORING
                        </h1>
                        <p className="text-[10px] md:text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5 md:mt-1">
                            {currentTitle}
                        </p>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center justify-center md:justify-end gap-2 md:gap-4 w-full md:w-auto order-2 md:order-none pb-2 md:pb-0">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className={cn(
                                "p-1.5 md:p-2 rounded border transition-all shadow-sm",
                                isDarkMode ? "bg-slate-800 text-yellow-400 border-slate-700 hover:bg-slate-700" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                            )}
                            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {isDarkMode ? <IconSun size={20} /> : <IconMoon size={20} />}
                        </button>

                        {/* Navigation */}
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded border border-primary text-primary hover:bg-pink-50 transition-colors font-bold uppercase text-xs md:text-sm tracking-wider"
                            >
                                <IconMenu2 size={18} />
                                <span>MENU</span>
                            </button>

                            {isMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-20 flex flex-col overflow-hidden animate-scale-in origin-top-right">
                                        {navItems.map((item) => (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => setIsMenuOpen(false)}
                                                className={cn(
                                                    "px-4 py-3 text-sm font-medium hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-600 dark:hover:text-pink-400 transition-colors flex items-center gap-2",
                                                    location.pathname + location.search === item.path || location.pathname === item.path ? "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 border-l-4 border-pink-600" : "text-slate-600 dark:text-slate-300 border-l-4 border-transparent"
                                                )}
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                                        <button
                                            onClick={() => { onTogglePause && onTogglePause(); setIsMenuOpen(false); }}
                                            className="px-4 py-3 text-sm font-medium w-full text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 flex items-center gap-2"
                                        >
                                            {isPaused ? <><IconPlayerPlay size={16} /> Resume Auto-Cycle</> : <><IconPlayerPause size={16} /> Pause Auto-Cycle</>}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Sound Toggle */}
                        <button
                            onClick={toggleMute}
                            className={cn(
                                "p-1.5 md:p-2 rounded border transition-all shadow-sm",
                                isMuted ? "bg-slate-200 text-slate-500 border-slate-300" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                            )}
                            title={isMuted ? "Unmute Alarm" : "Mute Alarm"}
                        >
                            {isMuted ? <IconVolumeOff size={20} /> : <IconVolume size={20} />}
                        </button>

                        {/* Clock */}
                        <div className="flex flex-col items-end leading-tight min-w-[80px] md:min-w-[140px]">
                            <div className="text-lg md:text-2xl font-bold font-mono text-slate-700 dark:text-slate-200 tabular-nums tracking-wide">
                                {formattedTime}
                            </div>
                            <div className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden md:block">
                                {formattedDate}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content - Improved scrolling context */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-2 md:p-4 relative bg-brand-bg w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="h-full w-full"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>

                {isPaused && (
                    <div className="fixed bottom-4 right-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm opacity-80 pointer-events-none z-50">
                        AUTO-CYCLE PAUSED
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="flex-none bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex flex-col justify-center px-4 md:px-6 py-2 text-xs text-slate-600 font-medium gap-1 z-10 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] text-center md:text-left">
                {/* Row 1: Legends */}
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 md:gap-6">
                    {location.pathname === '/monitor-grounding' ? (
                        <>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 md:w-3 md:h-3 bg-status-safe rounded-sm"></span> <span className="font-bold uppercase text-[10px] md:text-xs">Ground path is normal</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 md:w-3 md:h-3 bg-status-danger rounded-sm"></span> <span className="font-bold uppercase text-[10px] md:text-xs">Ground path has a fault</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 md:w-3 md:h-3 bg-status-anomaly rounded-sm"></span> <span className="font-bold uppercase text-[10px] md:text-xs">Anomaly Sensor</span>
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 md:w-3 md:h-3 bg-status-safe rounded-sm"></span> <span className="font-bold text-[10px] md:text-xs">SAFE</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 md:w-3 md:h-3 bg-status-warning rounded-sm"></span> <span className="font-bold text-[10px] md:text-xs">WARNING</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 md:w-3 md:h-3 bg-status-danger rounded-sm"></span> <span className="font-bold text-[10px] md:text-xs">DANGER</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 md:w-3 md:h-3 bg-status-anomaly rounded-sm"></span> <span className="font-bold text-[10px] md:text-xs">ANOMALY SENSOR</span>
                            </span>
                        </>
                    )}
                </div>

                {/* Row 2: Info & Disclaimer */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0 border-t border-slate-100 dark:border-slate-700 pt-1 mt-1 hidden md:flex">
                    <div className="flex flex-wrap gap-1 md:gap-4 text-[11px] md:text-xs text-slate-500">
                        {location.pathname === '/monitor-grounding' ? (
                            <span>Grounding Resistance Monitoring System with Real-Time Alert</span>
                        ) : (
                            <>
                                <span>Temperature: 22 ~ 28°C</span>
                                <span className="hidden md:inline text-slate-300">|</span>
                                <span>Humidity: 30 ~ 60%</span>
                                <span className="hidden md:inline text-slate-300">|</span>
                                <span>Air Pressure: 5.5 ~ 7.5 KGF/CM²</span>
                            </>
                        )}
                    </div>
                    <div className="italic text-slate-400 text-[10px] md:text-xs md:text-right">
                        Status is updated automatically. Alarm and blinking animation are active only during a limit breach
                    </div>
                </div>
            </footer>

        </div>
    );
}
