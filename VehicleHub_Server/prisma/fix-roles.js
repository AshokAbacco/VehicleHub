// VehicleHub/VehicleHub_Server/prisma/fix-roles.js
// ============================================================
// Moves existing users onto the app's five login roles:
//   ADMIN, SELLER (individual — one vehicle), DEALER (shop — many vehicles), BUYER, INSPECTOR (Field Inspector)
//
// Run it, then push the schema, then run it once more:
//
//     node prisma/fix-roles.js
//     npx prisma db push
//     node prisma/fix-roles.js
//
// Step 1 (before the push — the push fails while users still have a removed role):
//   SUPER_ADMIN -> ADMIN
//   FINANCE     -> BUYER    (no special access — make them ADMIN yourself if they should have it)
//   SUPPORT     -> BUYER
// Step 2 (needs DEALER in the database enum, so it runs once the schema has it):
//   approved seller whose application type is DEALER -> DEALER
//   DEALER account whose application type is INDIVIDUAL -> SELLER
//   DEALER account without an approved application   -> BUYER (they must apply)
//
// Also: phone numbers saved as "9876543210" are rewritten to "+919876543210" (the format the phone
// sign-in uses). If a duplicate "+91…" account already exists for the same number, it is listed instead.
//
// Safe to run any number of times. Uses plain SQL, so it works before or after `prisma generate`.
// ============================================================
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const prisma = new PrismaClient();

const REMOVED = [
  { from: ["SUPER_ADMIN"], to: "ADMIN" },
  { from: ["FINANCE", "SUPPORT"], to: "BUYER" },
];

const countByRole = async () => {
  const rows = await prisma.$queryRawUnsafe(`SELECT role::text AS role, COUNT(*)::int AS count FROM "User" GROUP BY role ORDER BY role`);
  return rows.map((r) => `${r.role}=${r.count}`).join(", ") || "(no users)";
};

const roleEnumHas = async (value) => {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'Role' AND e.enumlabel = $1`,
    value,
  );
  return rows.length > 0;
};

async function main() {
  console.log("Users by role before:", await countByRole());
  let moved = 0;

  // Step 1 — roles that no longer exist
  for (const m of REMOVED) {
    const list = m.from.map((r) => `'${r}'`).join(", ");
    const n = await prisma.$executeRawUnsafe(`UPDATE "User" SET role = '${m.to}' WHERE role::text IN (${list})`);
    if (n) console.log(`  ${m.from.join("/")} -> ${m.to}: ${n}`);
    moved += n;
  }

  // Phone numbers in the sign-in format
  const fixedPhones = await prisma.$executeRawUnsafe(`
    UPDATE "User" u SET phone = '+91' || u.phone
    WHERE u.phone ~ '^[0-9]{10}$'
      AND NOT EXISTS (SELECT 1 FROM "User" o WHERE o.phone = '+91' || u.phone)`);
  if (fixedPhones) console.log(`  phone numbers changed to +91 format: ${fixedPhones}`);
  moved += fixedPhones;
  const clashes = await prisma.$queryRawUnsafe(`
    SELECT u.id, u.phone, u."fullName", u.role::text AS role, o.id AS "otherId", o.role::text AS "otherRole"
    FROM "User" u JOIN "User" o ON o.phone = '+91' || u.phone
    WHERE u.phone ~ '^[0-9]{10}$'`);
  for (const c of clashes) {
    console.log(`  ! ${c.phone} (${c.fullName || "no name"}, ${c.role}, id ${c.id}) has a duplicate +91 account (${c.otherRole}, id ${c.otherId}) — merge or delete one by hand`);
  }

  // Step 2 — Seller vs Dealer, from the approved application type
  if (await roleEnumHas("DEALER")) {
    const toDealer = await prisma.$executeRawUnsafe(`
      UPDATE "User" u SET role = 'DEALER'
      FROM "SellerProfile" p
      WHERE p."userId" = u.id AND u.role::text = 'SELLER'
        AND p."sellerType"::text = 'DEALER' AND p."verificationStatus"::text = 'APPROVED'`);
    const toSeller = await prisma.$executeRawUnsafe(`
      UPDATE "User" u SET role = 'SELLER'
      FROM "SellerProfile" p
      WHERE p."userId" = u.id AND u.role::text = 'DEALER'
        AND p."sellerType"::text = 'INDIVIDUAL' AND p."verificationStatus"::text = 'APPROVED'`);
    const toBuyer = await prisma.$executeRawUnsafe(`
      UPDATE "User" u SET role = 'BUYER'
      WHERE u.role::text = 'DEALER'
        AND NOT EXISTS (SELECT 1 FROM "SellerProfile" p WHERE p."userId" = u.id AND p."verificationStatus"::text = 'APPROVED')`);
    if (toDealer) console.log(`  approved dealer applications SELLER -> DEALER: ${toDealer}`);
    if (toSeller) console.log(`  individual applications DEALER -> SELLER: ${toSeller}`);
    if (toBuyer) console.log(`  DEALER without an approved application -> BUYER: ${toBuyer}`);
    moved += toDealer + toSeller + toBuyer;
    console.log("Users by role after: ", await countByRole());
    console.log(moved ? `Done — ${moved} user(s) updated.` : "Nothing to change — roles are up to date.");
  } else {
    console.log("Users by role after: ", await countByRole());
    console.log("Step 1 done. Now run `npx prisma db push`, then run this script again to set up Dealer accounts.");
  }
}

main()
  .catch((e) => {
    console.error("fix-roles failed:", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());