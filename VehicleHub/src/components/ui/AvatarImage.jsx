// VehicleHub/VehicleHub/src/components/ui/AvatarImage.jsx
import { useEffect, useState } from 'react';

// Only real image sources are rendered as <img>. Values like "AM" (mock data) or "" are not.
const isImageSource = (src) =>
    typeof src === 'string' && /^(https?:\/\/|data:image\/|blob:|\/)/i.test(src.trim());

const firstLetter = (name) => String(name || '').trim().charAt(0).toUpperCase() || 'U';

/**
 * Profile picture content: the user's uploaded photo, or the first letter of their name
 * when there is no photo, the value isn't an image URL, or the image fails to load.
 * Put it inside your own sized / rounded / coloured circle (with overflow-hidden).
 */
export const AvatarImage = ({ src, name, imgClassName = 'h-full w-full object-cover', letterClassName = '' }) => {
    const [failed, setFailed] = useState(false);

    // A new photo (e.g. after upload) gets a fresh chance to load
    useEffect(() => { setFailed(false); }, [src]);

    if (isImageSource(src) && !failed) {
        return <img src={src} alt={name || 'Profile'} className={imgClassName} onError={() => setFailed(true)} />;
    }
    return <span className={letterClassName} aria-label={name || 'Profile'}>{firstLetter(name)}</span>;
};