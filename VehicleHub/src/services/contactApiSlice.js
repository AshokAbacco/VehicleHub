// VehicleHub/VehicleHub/src/services/contactApiSlice.js
// Contact Us page + footer "Raise a Ticket". The backend sends the emails — no email
// settings or secrets live in the frontend.
import { apiSlice } from "./apiSlice.js";

// Company contact details shown in the footer and on the Contact Us page
export const COMPANY_CONTACT = {
  email: "support@themotordesk.com",
  phone: "+91 99724 52044",
  phoneHref: "tel:+919972452044",
  address: "No. 12, 13 & 12/A, Kirthan Arcade, 3rd Floor, Aditya Nagar, Bangalore – 560097",
};

export const contactApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // -> support@themotordesk.com + acknowledgement email to the customer
    sendContactEnquiry: builder.mutation({
      query: (body) => ({ url: "/contact-us", method: "POST", body }),
    }),
    // -> info@abaccotech.com
    raiseSupportTicket: builder.mutation({
      query: (body) => ({ url: "/contact-us/ticket", method: "POST", body }),
    }),
  }),
});

export const { useSendContactEnquiryMutation, useRaiseSupportTicketMutation } = contactApiSlice;

/** Same rules as the backend, so people see mistakes before sending. Returns { field: message }. */
export const validateContactForm = ({ name = "", email = "", message = "" }) => {
  const errors = {};
  const n = name.trim();
  const e = email.trim();
  const m = message.trim();
  if (!n) errors.name = "Please enter your name.";
  else if (n.length < 2 || n.length > 100) errors.name = "Name must be between 2 and 100 characters.";
  if (!e) errors.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) errors.email = "Please enter a valid email address.";
  if (!m) errors.message = "Please enter your message.";
  else if (m.length < 10) errors.message = "Please write at least 10 characters.";
  else if (m.length > 5000) errors.message = "Message is too long (maximum 5000 characters).";
  return errors;
};

/** A readable error from a failed request. */
export const contactErrorMessage = (err) => {
  if (err?.status === "FETCH_ERROR") return "Can't reach the server. Please check your connection and try again.";
  if (err?.status === "TIMEOUT_ERROR") return "The server took too long to answer. Please try again.";
  if (err?.data?.message) return err.data.message;
  // Not a reply from the contact-us API (e.g. an HTML error page) — show the HTTP code to help find it
  const code = err?.originalStatus || err?.status;
  return `We couldn't send your message${code ? ` (error ${code})` : ""}. Please try again.`;
};