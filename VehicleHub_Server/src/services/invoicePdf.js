// VehicleHub/VehicleHub_Server/src/services/invoicePdf.js
// Builds the MotorDesk PDF invoice for a verified plan payment (SubscriptionPayment row).
// Uses pdfkit's built-in Helvetica, so amounts are written as "INR 1,500.00" (the built-in
// fonts have no ₹ glyph). Returns a Buffer.
import PDFDocument from "pdfkit";

export const COMPANY = {
  name: "MotorDesk",
  tagline: "Vehicle marketplace for dealers and sellers",
  address: ["No. 12, 13 & 12/A, Kirthan Arcade, 3rd Floor,", "Aditya Nagar, Bangalore – 560097"],
  phone: "+91 99724 52044",
  email: "support@themotordesk.com",
  website: "www.themotordesk.com",
};

const NAVY = "#001f3f";
const SLATE = "#475569";
const LIGHT = "#94a3b8";
const LINE = "#e2e8f0";
const SOFT = "#f1f5f9";
const GREEN = "#047857";

export const money = (n) =>
  `INR ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const dateIN = (d) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" }).format(new Date(d));
const dateTimeIN = (d) =>
  `${new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date(d))} IST`;

export const durationText = (m) => (Number(m) === 12 ? "12 months (Yearly)" : Number(m) === 1 ? "1 month" : `${m} months`);
export const locationText = (l) => (l === "RURAL" ? "Rural" : "Urban");
export const planText = (p) => (String(p || "").toUpperCase() === "PREMIUM" ? "Premium" : String(p || "Plan"));

/** Service period: payment date -> same date + N months (minus a day). */
const servicePeriod = (start, months) => {
  const from = new Date(start);
  const to = new Date(from);
  to.setMonth(to.getMonth() + Number(months));
  to.setDate(to.getDate() - 1);
  return `${dateIN(from)} – ${dateIN(to)}`;
};

/**
 * @param {object} p  SubscriptionPayment row (needs invoiceNumber, invoiceDate or paidAt)
 * @returns {Promise<Buffer>}
 */
export const buildInvoicePdf = (p) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48, info: { Title: `Invoice ${p.invoiceNumber}`, Author: COMPANY.name } });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = doc.page.width;
    const L = 48;
    const R = W - 48;
    const CW = R - L;

    const subtotal = Number(p.amount);
    const tax = 0; // prices are final — no additional tax charged
    const total = subtotal + tax;
    const invoiceDate = p.invoiceDate || p.paidAt || new Date();

    // ---------- header band ----------
    doc.rect(0, 0, W, 118).fill(NAVY);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(26).text(COMPANY.name, L, 34);
    doc.font("Helvetica").fontSize(9.5).fillColor("#bfdbfe").text(COMPANY.tagline, L, 66);
    doc.font("Helvetica-Bold").fontSize(20).fillColor("#ffffff").text("INVOICE", L, 34, { width: CW, align: "right" });
    doc.font("Helvetica").fontSize(9.5).fillColor("#bfdbfe").text(p.invoiceNumber, L, 62, { width: CW, align: "right" });

    // ---------- company + invoice meta ----------
    let y = 140;
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10).text("FROM", L, y);
    doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(11).text(COMPANY.name, L, y + 15);
    doc.font("Helvetica").fontSize(9).fillColor(SLATE);
    let cy = y + 31;
    [...COMPANY.address, `Phone: ${COMPANY.phone}`, `Email: ${COMPANY.email}`, COMPANY.website].forEach((line) => {
      doc.text(line, L, cy, { width: 250 });
      cy += 13;
    });

    const metaX = 340;
    const meta = [
      ["Invoice number", p.invoiceNumber],
      ["Invoice date", dateIN(invoiceDate)],
      ["Payment date", dateIN(p.paidAt)],
      ["Payment status", "PAID"],
    ];
    let my = y;
    meta.forEach(([k, v]) => {
      doc.font("Helvetica").fontSize(9).fillColor(LIGHT).text(k, metaX, my, { width: 100 });
      doc.font("Helvetica-Bold").fontSize(9.5).fillColor(k === "Payment status" ? GREEN : "#0f172a").text(v, metaX + 100, my, { width: R - metaX - 100, align: "right" });
      my += 17;
    });

    // ---------- bill to (box grows with long names / emails) ----------
    y = Math.max(cy, my) + 16;
    const colW = CW / 2 - 28;
    const rx = L + CW / 2 + 4;
    doc.font("Helvetica-Bold").fontSize(12);
    const shopH = doc.heightOfString(p.shopName, { width: colW });
    doc.font("Helvetica").fontSize(9.5);
    const nameH = doc.heightOfString(p.fullName, { width: colW });
    doc.font("Helvetica-Bold").fontSize(9.5);
    const emailH = doc.heightOfString(p.email, { width: colW });
    const leftH = 16 + shopH + 4 + nameH;
    const rightH = 12 + emailH + 8 + 12 + 12;
    const boxH = 30 + Math.max(leftH, rightH) + 14;

    doc.roundedRect(L, y, CW, boxH, 8).fill(SOFT);
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10).text("BILL TO", L + 16, y + 14);
    doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(12).text(p.shopName, L + 16, y + 30, { width: colW });
    doc.font("Helvetica").fontSize(9.5).fillColor(SLATE).text(p.fullName, L + 16, y + 34 + shopH, { width: colW });

    let ry = y + 30;
    doc.font("Helvetica").fontSize(8.5).fillColor(LIGHT).text("Email", rx, ry);
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor("#0f172a").text(p.email, rx, ry + 12, { width: colW });
    ry += 12 + emailH + 8;
    doc.font("Helvetica").fontSize(8.5).fillColor(LIGHT).text("Phone", rx, ry);
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor("#0f172a").text(p.phone, rx, ry + 12, { width: colW });

    y += boxH + 24;
    // ---------- line items ----------
    const cols = [
      { label: "DESCRIPTION", x: L + 12, w: 230, align: "left" },
      { label: "LOCATION", x: L + 250, w: 70, align: "left" },
      { label: "DURATION", x: L + 322, w: 90, align: "left" },
      { label: "AMOUNT", x: L + 412, w: CW - 424, align: "right" },
    ];
    doc.rect(L, y, CW, 26).fill(NAVY);
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#ffffff");
    cols.forEach((c) => doc.text(c.label, c.x, y + 9, { width: c.w, align: c.align }));
    y += 26;

    const desc = `${planText(p.plan)} Plan subscription`;
    const period = `Service period: ${servicePeriod(p.paidAt, p.durationMonths)}`;
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#0f172a").text(desc, cols[0].x, y + 12, { width: cols[0].w });
    doc.font("Helvetica").fontSize(8.5).fillColor(LIGHT).text(period, cols[0].x, y + 27, { width: cols[0].w });
    doc.font("Helvetica").fontSize(9.5).fillColor(SLATE);
    doc.text(locationText(p.locationCategory), cols[1].x, y + 12, { width: cols[1].w });
    doc.text(durationText(p.durationMonths), cols[2].x, y + 12, { width: cols[2].w });
    doc.font("Helvetica-Bold").fillColor("#0f172a").text(money(subtotal), cols[3].x, y + 12, { width: cols[3].w, align: "right" });
    y += 48;
    doc.moveTo(L, y).lineTo(R, y).lineWidth(1).strokeColor(LINE).stroke();

    // ---------- totals ----------
    y += 14;
    const tx = L + 270;
    const tw = R - tx;
    const totalRow = (label, value, bold = false) => {
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(bold ? 11 : 9.5).fillColor(bold ? "#0f172a" : SLATE).text(label, tx, y, { width: tw / 2 });
      doc.font("Helvetica-Bold").fontSize(bold ? 11 : 9.5).fillColor("#0f172a").text(value, tx + tw / 2, y, { width: tw / 2, align: "right" });
      y += bold ? 20 : 17;
    };
    totalRow("Subscription amount", money(subtotal));
    totalRow("Taxes", tax ? money(tax) : `${money(0)}`);
    doc.moveTo(tx, y).lineTo(R, y).strokeColor(LINE).stroke();
    y += 8;
    doc.roundedRect(tx - 8, y - 4, tw + 8, 30, 6).fill("#ecfdf5");
    y += 4;
    totalRow("Total amount paid", money(total), true);
    doc.font("Helvetica").fontSize(8).fillColor(LIGHT).text("No additional taxes have been charged on this plan.", tx, y + 2, { width: tw, align: "right" });

    // ---------- payment details ----------
    y += 34;
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10).text("PAYMENT DETAILS", L, y);
    y += 16;
    const pay = [
      ["Payment status", "Successful (verified)"],
      ["Payment method", "Razorpay"],
      ["Razorpay Order ID", p.razorpayOrderId],
      ["Razorpay Payment ID", p.razorpayPaymentId],
      ["Payment date", dateTimeIN(p.paidAt)],
      ["Currency", p.currency || "INR"],
    ];
    doc.rect(L, y, CW, pay.length * 20 + 8).lineWidth(1).strokeColor(LINE).stroke();
    y += 6;
    pay.forEach(([k, v], i) => {
      if (i % 2 === 0) doc.rect(L + 1, y - 2, CW - 2, 20).fill("#f8fafc");
      doc.font("Helvetica").fontSize(9).fillColor(SLATE).text(k, L + 14, y + 3, { width: 160 });
      doc.font("Helvetica-Bold").fontSize(9).fillColor(k === "Payment status" ? GREEN : "#0f172a").text(v, L + 180, y + 3, { width: CW - 194 });
      y += 20;
    });

    // ---------- footer ----------
    const fy = doc.page.height - 110;
    doc.moveTo(L, fy).lineTo(R, fy).strokeColor(LINE).stroke();
    doc.font("Helvetica-Bold").fontSize(11).fillColor(NAVY).text(`Thank you for choosing ${COMPANY.name}!`, L, fy + 14, { width: CW, align: "center" });
    doc.font("Helvetica").fontSize(8.5).fillColor(LIGHT)
      .text(`Questions about this invoice? Write to ${COMPANY.email} or call ${COMPANY.phone}.`, L, fy + 32, { width: CW, align: "center" })
      .text("This is a computer-generated invoice and does not require a signature.", L, fy + 46, { width: CW, align: "center" });

    doc.end();
  });