import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function useAutoCycle(routes, interval = 15000) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isPaused, setIsPaused] = useState(false);
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (isPaused) {
            clearTimeout(timeoutRef.current);
            return;
        }

        const currentIndex = routes.findIndex(route => route === location.pathname + location.search) !== -1
            ? routes.findIndex(route => route === location.pathname + location.search)
            : routes.findIndex(route => route === location.pathname);

        // If current route is not in the cycle list (e.g. root '/'), start at 0
        const nextIndex = (currentIndex + 1) % routes.length;
        const nextRoute = routes[currentIndex === -1 ? 0 : nextIndex];

        timeoutRef.current = setTimeout(() => {
            navigate(nextRoute);
        }, interval);

        return () => clearTimeout(timeoutRef.current);
    }, [location, isPaused, routes, navigate, interval]);

    const togglePause = () => setIsPaused(prev => !prev);

    return { isPaused, togglePause };
}
