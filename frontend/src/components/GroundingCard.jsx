import React from 'react';
import { formatDistance } from 'date-fns';
import { IconPrinter, IconServer } from '@tabler/icons-react';
import clsx from 'clsx';

export default function GroundingCard({ location, description, item }) {
    let rawStatus = item ? item.ground_status : 'UNKNOWN';

    // Map Status to Visuals
    let visualStatus = 'unknown';
    let displayStatus = 'UNKNOWN';

    if (rawStatus === 'OK') {
        visualStatus = 'connected';
        displayStatus = 'CONNECTED';
    } else if (rawStatus === 'DISCONNECTED') {
        visualStatus = 'disconnected';
        displayStatus = 'DISCONNECTED';
    }

    const styles = {
        connected: {
            border: 'border-status-safe border-l-status-safe animate-pulse-subtle',
            bg: 'bg-white dark:bg-slate-800',
            text: 'text-status-safe',
            iconColor: 'text-status-safe',
            dashColor: 'text-status-safe',
            dashAnim: 'animate-flow'
        },
        disconnected: {
            border: 'border-status-danger border-l-status-danger shadow-glow-danger animate-flash-danger',
            bg: 'bg-white dark:bg-slate-800',
            text: 'text-status-danger animate-shake',
            iconColor: 'text-status-danger',
            dashColor: 'text-status-danger',
            dashAnim: ''
        },
        unknown: {
            border: 'border-slate-300 border-l-slate-300 dark:border-slate-600 dark:border-l-slate-600',
            bg: 'bg-slate-50 dark:bg-slate-800',
            text: 'text-slate-400 dark:text-slate-400',
            iconColor: 'text-slate-400 dark:text-slate-400',
            dashColor: 'text-slate-300 dark:text-slate-500',
            dashAnim: ''
        }
    };

    const currentStyle = styles[visualStatus];

    // Helper to format relative time
    const getRelativeTime = (timestamp) => {
        if (!timestamp) return 'No Data';
        try {
            return formatDistance(new Date(timestamp), new Date(), { addSuffix: true, includeSeconds: false });
        } catch (e) {
            return timestamp;
        }
    };

    return (
        <div className={clsx(
            "relative min-h-[250px] h-full rounded-2xl shadow-sm flex flex-col items-center p-6 transition-all border overflow-hidden",
            "border-l-[12px]", // Thicker Left Border
            currentStyle.border,
            currentStyle.bg
        )}>
            {/* Header */}
            <div className="text-center w-full mt-2">
                <h3 className="font-bold text-xl md:text-3xl text-slate-800 dark:text-slate-100 font-headline tracking-tight">{location}</h3>
                <p className="text-[10px] md:text-sm text-slate-500 font-bold mt-1 uppercase tracking-widest">{description}</p>
            </div>

            {/* Center Visual */}
            <div className="flex-1 flex flex-col justify-center w-full py-4 md:py-6">
                <div className="flex items-center justify-center gap-4 md:gap-6 w-full">
                    {/* SMT Machine Icon (Left) */}
                    <div className="relative">
                        <IconPrinter className={clsx("w-10 h-10 md:w-20 md:h-20", currentStyle.iconColor)} stroke={1.2} />
                    </div>

                    {/* Flowing Line */}
                    <div className="flex gap-1.5 md:gap-2 items-center">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className={clsx("w-2 h-2 md:w-3 md:h-3 rounded-full", currentStyle.dashColor.replace('text-', 'bg-'), currentStyle.dashAnim)} style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                    </div>

                    {/* Panel Icon (Right) */}
                    <div className="relative">
                        <IconServer className={clsx("w-10 h-10 md:w-20 md:h-20", currentStyle.iconColor)} stroke={1.2} />
                    </div>
                </div>
            </div>

            {/* Footer Status */}
            <div className="text-center space-y-2 mb-2 w-full">
                <div className={clsx("text-xl md:text-2xl font-black tracking-widest uppercase", currentStyle.text)}>
                    {displayStatus}
                </div>
                <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 rounded-full py-1 px-3 w-fit mx-auto">
                    <span>Last Update:</span>
                    <span>{item && (item.updated_at || item.timestamp) ? getRelativeTime(item.updated_at || item.timestamp) : 'No Data'}</span>
                </div>
            </div>
        </div>
    );
}
