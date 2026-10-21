// VehicleHub/VehicleHub/src/components/layout/ScrollToTop.jsx
// Every page opens at the top: whenever the page (path) changes, scroll the window to the top.
// Links to a section (#anchor) and the browser Back button keep their own position.
import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export const ScrollToTop = () => {
    const { pathname, hash } = useLocation();
    const navigationType = useNavigationType(); // 'POP' = Back / Forward

    useEffect(() => {
        if (hash || navigationType === 'POP') return;
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [pathname, hash, navigationType]);

    return null;
};