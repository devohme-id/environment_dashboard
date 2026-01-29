import React, { createContext, useState, useContext } from 'react';

const AlarmContext = createContext();

import alarmSound from '../assets/alarm.wav';

export const AlarmProvider = ({ children }) => {
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = React.useRef(null);

    // Initialize Audio once
    React.useEffect(() => {
        const audio = new Audio(alarmSound);
        audio.loop = true;
        audio.preload = 'auto'; // Optimize loading
        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.src = '';
        };
    }, []);

    const toggleMute = () => setIsMuted(prev => !prev);

    const playAlarm = () => {
        if (audioRef.current && !isMuted) {
            audioRef.current.play().catch(e => console.warn("Autoplay blocked", e));
        }
    };

    const pauseAlarm = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    // React to mute changes
    React.useEffect(() => {
        if (audioRef.current) {
            if (isMuted) {
                audioRef.current.pause();
            } else if (audioRef.current.paused === false) {
                // If it was playing but we just unmuted, it might need to resume? 
                // Actually, simpler: let the hook decide when to play.
                // Just expose the control methods.
            }
        }
    }, [isMuted]);

    return (
        <AlarmContext.Provider value={{ isMuted, toggleMute, playAlarm, pauseAlarm, isReady: !!audioRef.current }}>
            {children}
        </AlarmContext.Provider>
    );
};

export const useAlarmContext = () => useContext(AlarmContext);
