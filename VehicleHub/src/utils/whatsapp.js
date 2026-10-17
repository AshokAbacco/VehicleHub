// VehicleHub/VehicleHub/src/utils/whatsapp.js
// WhatsApp helpers: number checks, the purchase-request message, and the link that opens
// WhatsApp (the app on phones, WhatsApp Web on computers) with the message filled in.
// Nothing is ever sent automatically — the buyer reviews the message and taps Send.
import { formatCurrency } from './formatters.js';

/** "+91 98765 43210" / "9876543210" -> "919876543210" (digits for WhatsApp), or null if not a valid mobile number. */
export const toWhatsAppDigits = (value) => {
    let digits = String(value ?? '').replace(/\D/g, '');
    if (!digits) return null;
    if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1); // 09876543210
    if (digits.length === 10) digits = `91${digits}`; // plain Indian mobile number
    if (digits.startsWith('91')) return /^91[6-9]\d{9}$/.test(digits) ? digits : null;
    return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
};

/** True for a number WhatsApp can use (empty is not valid). */
export const isValidWhatsApp = (value) => Boolean(toWhatsAppDigits(value));

/** Make, model and variant, e.g. "Maruti Suzuki Ertiga ZXi CNG" (falls back to the listing title). */
export const vehicleDisplayName = (vehicle = {}) => {
    const brand = typeof vehicle.brand === 'object' ? vehicle.brand?.name : vehicle.brand;
    const name = [brand, vehicle.model, vehicle.variant].map((p) => String(p || '').trim()).filter(Boolean);
    // Don't repeat words (e.g. model "Ertiga ZXi" + variant "ZXi")
    const words = [];
    name.join(' ').split(/\s+/).forEach((w) => {
        if (!words.some((x) => x.toLowerCase() === w.toLowerCase())) words.push(w);
    });
    return words.join(' ') || vehicle.title || 'your vehicle';
};

/** The prefilled message for a purchase request. */
export const buildPurchaseRequestMessage = ({ vehicle, offerPrice, buyerName, buyerPhone, buyerEmail, message }) => {
    const lines = [
        'Hello, I am interested in purchasing your vehicle.',
        '',
        `*Vehicle:* ${vehicleDisplayName(vehicle)}`,
        vehicle?.price ? `*Listed Price:* ${formatCurrency(vehicle.price)}` : null,
        `*My Offer:* ${formatCurrency(Number(String(offerPrice).replace(/[^\d.]/g, '')) || 0)}`,
        '',
        '*Buyer Details:*',
        `Name: ${String(buyerName || '').trim()}`,
        `Phone: ${String(buyerPhone || '').trim()}`,
        String(buyerEmail || '').trim() ? `Email: ${String(buyerEmail).trim()}` : null,
    ];
    if (String(message || '').trim()) lines.push('', `*Message:* ${String(message).trim()}`);
    lines.push('', 'Please let me know the next steps. Thank you.');
    return lines.filter((l) => l !== null).join('\n');
};

const isMobileDevice = () =>
    typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(navigator.userAgent || '');

/** Link that opens a chat with `number` and `text` filled in, or null if the number isn't valid. */
export const whatsappChatUrl = (number, text = '') => {
    const digits = toWhatsAppDigits(number);
    if (!digits) return null;
    const q = encodeURIComponent(text);
    return isMobileDevice()
        ? `https://wa.me/${digits}?text=${q}` // opens the WhatsApp app
        : `https://web.whatsapp.com/send?phone=${digits}&text=${q}`; // WhatsApp Web on desktop
};

/** Opens the chat in a new tab. Returns false if the browser blocked it (show a button instead). */
export const openWhatsAppChat = (url) => {
    if (!url) return false;
    const win = window.open(url, '_blank');
    if (!win) return false;
    try { win.opener = null; } catch { /* ignore */ }
    return true;
};