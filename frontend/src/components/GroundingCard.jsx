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
            border: 'border-l-status-safe animate-pulse-subtle',
            bg: 'bg-white',
            text: 'text-status-safe',
            iconColor: 'text-status-safe',
            dashColor: 'text-status-safe',
            dashAnim: 'animate-flow'
        },
        disconnected: {
            border: 'border-l-status-danger shadow-glow-danger animate-flash-danger',
            bg: 'bg-white',
            text: 'text-status-danger animate-shake',
            iconColor: 'text-status-danger',
            dashColor: 'text-status-danger',
            dashAnim: ''
        },
        unknown: {
            border: 'border-l-slate-300',
            bg: 'bg-slate-50',
            text: 'text-slate-400',
            iconColor: 'text-slate-400',
            dashColor: 'text-slate-300',
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
            "relative aspect-[4/3] rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] flex flex-col items-center justify-between p-6 transition-all border border-slate-100",
            "border-l-[8px]",
            currentStyle.border,
            currentStyle.bg
        )}>
            <div className="text-center w-full">
                <h3 className="font-bold text-2xl text-slate-800 dark:text-slate-700">{location}</h3>
                <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">{description}</p>
            </div>

            <div className="flex items-center justify-center gap-2 w-full my-4">
                {/* SMT Machine Icon (Left) */}
                <IconPrinter size={48} stroke={1.5} className={currentStyle.iconColor} />

                {/* Flowing Line */}
                <div className="flex gap-1.5 items-center">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={clsx("w-2 h-1 rounded-full", currentStyle.dashColor.replace('text-', 'bg-'), currentStyle.dashAnim)} style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                </div>

                {/* Panel Icon (Right) */}
                <IconServer size={48} stroke={1.5} className={currentStyle.iconColor} />
            </div>

            <div className="text-center space-y-1 mt-auto">
                <div className={clsx("text-xl font-black tracking-widest uppercase", currentStyle.text)}>
                    {displayStatus}
                </div>
                <div className="text-[10px] text-slate-400 font-medium italic">
                    {item && (item.updated_at || item.timestamp) ? getRelativeTime(item.updated_at || item.timestamp) : 'No Data'}
                </div>
            </div>
        </div>
    );
}
