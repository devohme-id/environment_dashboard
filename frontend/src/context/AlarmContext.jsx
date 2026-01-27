import React, { createContext, useState, useContext } from 'react';

const AlarmContext = createContext();

export const AlarmProvider = ({ children }) => {
    const [isMuted, setIsMuted] = useState(false);

    const toggleMute = () => setIsMuted(prev => !prev);

    return (
        <AlarmContext.Provider value={{ isMuted, toggleMute }}>
            {children}
        </AlarmContext.Provider>
    );
};

export const useAlarmContext = () => useContext(AlarmContext);
