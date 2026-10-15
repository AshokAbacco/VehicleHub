// VehicleHub/VehicleHub/src/utils/sellerFormat.js
// Small date helper shared by the seller listing / payments / invoices pages.
export const shortDate = (value) =>
    value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';