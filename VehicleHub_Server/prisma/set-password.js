// VehicleHub/VehicleHub_Server/prisma/set-password.js
// ============================================================
// Set (or reset) a user's password. Accounts created with the old OTP sign-in have no password,
// so set one here before they can sign in with email / mobile number + password.
//
//   node prisma/set-password.js <email-or-mobile> <new-password>
//   node prisma/set-password.js 9506536127 MyStrongPass123
//   node prisma/set-password.js rajesh@example.com MyStrongPass123
//
//   node prisma/set-password.js --list-without-password    # who still needs one
// ============================================================
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const prisma = new PrismaClient();

const normalizePhone = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.length === 10 ? `+91${digits}` : `+${digits}`;
};

async function main() {
  const [identifier, password] = process.argv.slice(2);

  if (identifier === "--list-without-password") {
    const users = await prisma.user.findMany({
      where: { password: null },
      select: { fullName: true, email: true, phone: true, role: true },
      orderBy: { createdAt: "asc" },
    });
    if (!users.length) return console.log("Every account has a password.");
    console.log(`${users.length} account(s) without a password:`);
    users.forEach((u) => console.log(`  ${u.role.padEnd(9)} ${u.phone || "-"}  ${u.email}  ${u.fullName || ""}`));
    return;
  }

  if (!identifier || !password) {
    console.log("Usage: node prisma/set-password.js <email-or-mobile> <new-password>");
    console.log("       node prisma/set-password.js --list-without-password");
    process.exitCode = 1;
    return;
  }
  if (password.length < 8) {
    console.log("Password must be at least 8 characters.");
    process.exitCode = 1;
    return;
  }

  const where = identifier.includes("@")
    ? { email: { equals: identifier.trim().toLowerCase(), mode: "insensitive" } }
    : { phone: normalizePhone(identifier) };
  const user = await prisma.user.findFirst({ where, select: { id: true, fullName: true, email: true, phone: true, role: true } });
  if (!user) {
    console.log(`No account found for ${identifier}.`);
    process.exitCode = 1;
    return;
  }
  await prisma.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(password, 10) } });
  console.log(`Password set for ${user.fullName || user.email} (${user.role}, ${user.phone || user.email}).`);
}

main()
  .catch((e) => {
    console.error("set-password failed:", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());