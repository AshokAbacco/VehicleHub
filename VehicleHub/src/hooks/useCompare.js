import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'vehiclehub.compare';
const MAX_COMPARE = 4;

const readStorage = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

/**
 * CarDekho/Cars24-style "Add to compare" tray.
 * Usage: const { compareList, isComparing, toggleCompare, clearCompare, isFull } = useCompare();
 */
export const useCompare = () => {
    const [compareList, setCompareList] = useState(readStorage);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList));
    }, [compareList]);

    const isComparing = useCallback((vehicleId) => compareList.includes(vehicleId), [compareList]);

    const toggleCompare = useCallback((vehicleId) => {
        setCompareList((prev) => {
            if (prev.includes(vehicleId)) return prev.filter((id) => id !== vehicleId);
            if (prev.length >= MAX_COMPARE) return prev; // cap like CarDekho (max 4)
            return [...prev, vehicleId];
        });
    }, []);

    const removeFromCompare = useCallback((vehicleId) => {
        setCompareList((prev) => prev.filter((id) => id !== vehicleId));
    }, []);

    const clearCompare = useCallback(() => setCompareList([]), []);

    return {
        compareList,
        isComparing,
        toggleCompare,
        removeFromCompare,
        clearCompare,
        isFull: compareList.length >= MAX_COMPARE,
    };
};