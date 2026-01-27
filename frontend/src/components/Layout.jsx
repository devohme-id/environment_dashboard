import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { IconMenu2, IconVolume, IconVolumeOff, IconClock, IconCalendar, IconPlayerPlay, IconPlayerPause } from '@tabler/icons-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

import { useAlarmContext } from '../context/AlarmContext';

export default function Layout({ title, subtitle, onTogglePause, isPaused, children }) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isMuted, toggleMute } = useAlarmContext();
    const location = useLocation();

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
            <header className="flex-none h-20 bg-white dark:bg-slate-800 shadow-sm border-b-4 border-primary relative z-20">
                {/* Top Right Controls (Absolute) */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
                    {/* Navigation */}
                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-2 px-4 py-2 rounded border border-primary text-primary hover:bg-pink-50 transition-colors font-bold uppercase text-sm tracking-wider"
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
                            "p-2 rounded border transition-all shadow-sm",
                            isMuted ? "bg-slate-200 text-slate-500 border-slate-300" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                        )}
                        title={isMuted ? "Unmute Alarm" : "Mute Alarm"}
                    >
                        {isMuted ? <IconVolumeOff size={20} /> : <IconVolume size={20} />}
                    </button>

                    {/* Clock */}
                    <div className="flex flex-col items-end leading-tight min-w-[140px]">
                        <div className="text-2xl font-bold font-mono text-slate-700 dark:text-slate-200 tabular-nums tracking-wide">
                            {formattedTime}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            {formattedDate}
                        </div>
                    </div>
                </div>

                {/* Centered Title */}
                <div className="flex flex-col justify-center items-center h-full w-full pointer-events-none">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">
                        ENVIRONMENT MONITORING
                    </h1>
                    {title && (
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                            {title}
                        </p>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 relative bg-brand-bg">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="h-full"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>

                {isPaused && (
                    <div className="absolute bottom-4 right-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm opacity-80 pointer-events-none z-10">
                        AUTO-CYCLE PAUSED
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="flex-none h-10 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-status-safe rounded-sm"></span> <span className="font-bold">SAFE</span>
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-status-warning rounded-sm"></span> <span className="font-bold">WARNING</span>
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-status-danger rounded-sm"></span> <span className="font-bold">DANGER</span>
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-status-anomaly rounded-sm"></span> <span className="font-bold">ANOMALY SENSOR</span>
                    </span>
                </div>
                <div className="flex gap-4">
                    <span>Temperature: 22 ~ 28°C</span> | <span>Humidity: 30 ~ 60%</span> | <span>Air Pressure: 5.5 ~ 7.5 KGF/CM²</span>
                </div>
                <div className="italic text-slate-400">
                    Status is updated automatically. Alarm and blinking animation are active only during a limit breach
                </div>
            </footer>

        </div>
    );
}
