import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'vehiclehub.wishlist';

const readStorage = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

/**
 * Amazon/Flipkart-style "Save for later" wishlist.
 * Usage: const { isWishlisted, toggleWishlist, wishlist } = useWishlist();
 */
export const useWishlist = () => {
    const [wishlist, setWishlist] = useState(readStorage);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    }, [wishlist]);

    const isWishlisted = useCallback((vehicleId) => wishlist.includes(vehicleId), [wishlist]);

    const toggleWishlist = useCallback((vehicleId) => {
        setWishlist((prev) => (
            prev.includes(vehicleId) ? prev.filter((id) => id !== vehicleId) : [...prev, vehicleId]
        ));
    }, []);

    return { wishlist, isWishlisted, toggleWishlist };
};