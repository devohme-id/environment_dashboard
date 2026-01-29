import { useEffect, useRef } from 'react';
import { useAlarmContext } from '../context/AlarmContext';

export const useAlarm = (shouldPlay) => {
    const { playAlarm, pauseAlarm, isMuted } = useAlarmContext();

    useEffect(() => {
        if (shouldPlay && !isMuted) {
            playAlarm();
        } else {
            pauseAlarm();
        }

        // Cleanup: pause on unmount or when condition changes
        return () => {
            // We only pause if we were the one playing? 
            // For now, simple logic: if this hook unmounts or stops requesting alarm, pause.
            if (shouldPlay) {
                pauseAlarm();
            }
        };
    }, [shouldPlay, isMuted, playAlarm, pauseAlarm]);
};
