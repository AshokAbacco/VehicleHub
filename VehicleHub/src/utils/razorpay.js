// VehicleHub/VehicleHub/src/utils/razorpay.js
// Loads Razorpay Checkout (once) and resolves with window.Razorpay.
const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let loading = null;

export const loadRazorpay = () => {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => (window.Razorpay ? resolve(window.Razorpay) : reject(new Error("Razorpay unavailable")));
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error("Couldn't load Razorpay"));
    };
    document.body.appendChild(script);
  });
  return loading;
};