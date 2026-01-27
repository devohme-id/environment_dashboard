import { useEffect, useRef } from 'react';
import { useAlarmContext } from '../context/AlarmContext';

export const useAlarm = (shouldPlay) => {
    const audioRef = useRef(null);
    const { isMuted } = useAlarmContext();

    useEffect(() => {
        // Initialize audio object if not clean
        if (!audioRef.current) {
            audioRef.current = new Audio('/alarm.wav');
            audioRef.current.loop = true;
        }

        const audio = audioRef.current;

        if (shouldPlay && !isMuted) {
            // Attempt to play
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.warn("Audio play failed (autoplay blocked?)", err);
                });
            }
        } else {
            audio.pause();
            audio.currentTime = 0;
        }

        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, [shouldPlay, isMuted]);
};
