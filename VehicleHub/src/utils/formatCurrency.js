// Formats a number into Indian currency shorthand: ₹1.48Cr, ₹14.8L, ₹85K
export const formatINR = (value) => {
  if (!value && value !== 0) return "₹0";
  const num = Number(value);
  if (num >= 10000000)
    return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, "")}Cr`;
  if (num >= 100000)
    return `₹${(num / 100000).toFixed(2).replace(/\.00$/, "")}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `₹${num.toLocaleString("en-IN")}`;
};
