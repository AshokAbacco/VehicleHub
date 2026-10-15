// VehicleHub/VehicleHub_Server/prisma/seed.js
// ============================================================
// VehicleHub — database seed
//
// Run:  npx prisma db seed      (uses "prisma.seed" in package.json)
//   or: node prisma/seed.js
//
// Safe to run many times:
//   - Only rows created by this file are removed and re-created
//     (users with an @seed.vehiclehub.in email, vehicles whose slug
//     starts with "seed-", and notifications/logs tagged { seed: true }).
//   - Your own users, vehicles and sellers are never touched.
//   - Brands, categories and revenue snapshots are upserted.
//
// The app has exactly four login roles: Admin, Seller, Buyer, Field Inspector.
// Login after seeding (phone OTP, code = DummyOTP in .env, default 1234):
//   Admin             9506536127
//   Sellers           9000000011 (dealer) · 9000000012 (individual) · 9000000013 (dealer)  — approved
//   Seller applicants 9000000014 (application PENDING admin review) · 9000000015 (REJECTED)
//                     — these two are still Buyers until an admin approves them
//   Buyers            9000000021 … 9000000026
//   Field Inspectors  9000000031 · 9000000032
// Email + password login (POST /api/auth/login): any seed email / Password@123
// ============================================================

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SEED_EMAIL_DOMAIN = "@seed.vehiclehub.in";
const SEED_SLUG_PREFIX = "seed-";
const DEFAULT_PASSWORD = "Password@123";
const ADMIN_PHONE = "+919506536127"; // OTPController treats this number as ADMIN

// ------------------------------------------------------------
// helpers
// ------------------------------------------------------------
const slugify = (text) =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);
const img = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

// Photos already used by the frontend (src/data, HomePage)
const CAR_PHOTOS = [
  "1568605117036-5fe5e7bab0b7",
  "1553440569-bcc63803a83d",
  "1552519507-da3b142c6e3d",
  "1541348263662-e068662d82af",
  "1533473359331-0135ef1b58bf",
  "1519641471654-76ce0107ad1b",
  "1511919884226-fd3cad34687c",
  "1503376780353-7e6692767b70",
  "1492144534655-ae79c964c9d7",
];
const BIKE_PHOTOS = ["1558981806-ec527fa84c39", "1558981806-ec527fa0c238"];

const photosFor = (categoryName, index) => {
  const pool = ["Bike", "Scooter"].includes(categoryName) ? BIKE_PHOTOS : CAR_PHOTOS;
  return [0, 1, 2].map((k) => img(pool[(index + k) % pool.length]));
};

// ------------------------------------------------------------
// static data
// ------------------------------------------------------------
const CATEGORIES = [
  { name: "Car", icon: "car", description: "Hatchbacks, sedans, SUVs and MUVs" },
  { name: "Bike", icon: "bike", description: "Motorcycles of every segment" },
  { name: "Scooter", icon: "scooter", description: "Petrol and electric scooters" },
  { name: "Truck", icon: "truck", description: "Light and heavy goods vehicles" },
  { name: "Bus", icon: "bus", description: "Mini buses and coaches" },
  { name: "Auto", icon: "auto", description: "Three-wheeler autos" },
  { name: "Tractor", icon: "tractor", description: "Farm tractors" },
  { name: "Commercial Vehicle", icon: "van", description: "Vans, pickups and LCVs" },
];

const BRANDS = [
  "Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Honda", "Toyota", "Kia",
  "MG", "Skoda", "Volkswagen", "Royal Enfield", "Bajaj", "TVS", "Hero",
  "Ather", "Ola Electric", "Ashok Leyland", "Eicher", "Piaggio", "Sonalika",
];

// [title, category, brand, model, variant, year, price, fuel, transmission, km, owner, color, body]
const VEHICLES = [
  ["Hyundai Creta SX(O) 1.5 Diesel", "Car", "Hyundai", "Creta", "SX(O)", 2022, 1650000, "Diesel", "Automatic", 28000, 1, "Polar White", "SUV"],
  ["Maruti Suzuki Swift ZXi Plus", "Car", "Maruti Suzuki", "Swift", "ZXi Plus", 2021, 685000, "Petrol", "Manual", 34000, 1, "Solid Fire Red", "Hatchback"],
  ["Tata Nexon EV Max XZ+ Lux", "Car", "Tata", "Nexon EV", "Max XZ+ Lux", 2023, 1725000, "Electric", "Automatic", 12000, 1, "Intensi-Teal", "SUV"],
  ["Mahindra XUV700 AX7 L", "Car", "Mahindra", "XUV700", "AX7 L", 2022, 2290000, "Diesel", "Automatic", 41000, 1, "Midnight Black", "SUV"],
  ["Honda City ZX CVT", "Car", "Honda", "City", "ZX CVT", 2020, 1095000, "Petrol", "Automatic", 52000, 2, "Platinum White Pearl", "Sedan"],
  ["Toyota Innova Crysta 2.4 VX", "Car", "Toyota", "Innova Crysta", "2.4 VX 7 STR", 2019, 1850000, "Diesel", "Manual", 88000, 2, "Silver Metallic", "MUV"],
  ["Kia Seltos HTX Plus", "Car", "Kia", "Seltos", "HTX Plus", 2021, 1420000, "Petrol", "Manual", 39000, 1, "Gravity Grey", "SUV"],
  ["MG Hector Sharp Pro", "Car", "MG", "Hector", "Sharp Pro", 2023, 1890000, "Petrol", "Automatic", 15000, 1, "Starry Black", "SUV"],
  ["Skoda Slavia Style 1.5 TSI", "Car", "Skoda", "Slavia", "Style 1.5 TSI DSG", 2022, 1575000, "Petrol", "Automatic", 21000, 1, "Tornado Red", "Sedan"],
  ["Volkswagen Polo GT TSI", "Car", "Volkswagen", "Polo", "GT TSI", 2019, 745000, "Petrol", "Automatic", 61000, 2, "Flash Red", "Hatchback"],
  ["Maruti Suzuki Ertiga ZXi CNG", "Car", "Maruti Suzuki", "Ertiga", "ZXi CNG", 2022, 1080000, "CNG", "Manual", 47000, 1, "Pearl Arctic White", "MUV"],
  ["Toyota Urban Cruiser Hyryder V Hybrid", "Car", "Toyota", "Hyryder", "V Hybrid", 2023, 1890000, "Hybrid", "Automatic", 9000, 1, "Cave Black", "SUV"],
  ["Royal Enfield Classic 350 Signals", "Bike", "Royal Enfield", "Classic 350", "Signals", 2022, 189000, "Petrol", "Manual", 11000, 1, "Marsh Grey", "Cruiser"],
  ["Bajaj Pulsar NS200", "Bike", "Bajaj", "Pulsar NS200", "ABS", 2021, 112000, "Petrol", "Manual", 18000, 1, "Metallic Pearl White", "Naked"],
  ["Royal Enfield Himalayan 450", "Bike", "Royal Enfield", "Himalayan 450", "Summit", 2024, 285000, "Petrol", "Manual", 4000, 1, "Kamet White", "Adventure"],
  ["TVS Apache RTR 160 4V", "Bike", "TVS", "Apache RTR 160 4V", "Dual Channel ABS", 2022, 104000, "Petrol", "Manual", 14500, 1, "Racing Red", "Naked"],
  ["Ather 450X Gen 3", "Scooter", "Ather", "450X", "Gen 3 Pro Pack", 2023, 128000, "Electric", "Automatic", 8000, 1, "Space Grey", "Scooter"],
  ["Ola S1 Pro Gen 2", "Scooter", "Ola Electric", "S1 Pro", "Gen 2", 2023, 112000, "Electric", "Automatic", 6500, 1, "Jet Black", "Scooter"],
  ["Honda Activa 6G DLX", "Scooter", "Honda", "Activa 6G", "DLX", 2021, 62000, "Petrol", "Automatic", 21000, 1, "Pearl Siren Blue", "Scooter"],
  ["Tata Ace Gold Petrol CX", "Commercial Vehicle", "Tata", "Ace Gold", "Petrol CX", 2021, 420000, "Petrol", "Manual", 54000, 1, "White", "Pickup"],
  ["Mahindra Bolero Pik-Up 1.7T", "Commercial Vehicle", "Mahindra", "Bolero Pik-Up", "1.7T", 2020, 690000, "Diesel", "Manual", 98000, 1, "Diamond White", "Pickup"],
  ["Ashok Leyland Dost Strong", "Truck", "Ashok Leyland", "Dost", "Strong LS", 2020, 560000, "Diesel", "Manual", 112000, 2, "White", "Truck"],
  ["Eicher Pro 2049 CBC", "Truck", "Eicher", "Pro 2049", "CBC", 2019, 1150000, "Diesel", "Manual", 145000, 1, "White", "Truck"],
  ["Piaggio Ape City Plus CNG", "Auto", "Piaggio", "Ape City Plus", "CNG", 2022, 245000, "CNG", "Manual", 36000, 1, "Green & Yellow", "Auto"],
  ["Sonalika DI 745 III Sikander", "Tractor", "Sonalika", "DI 745 III", "Sikander", 2020, 520000, "Diesel", "Manual", 3200, 1, "Red", "Tractor"],
  ["Tata Starbus 32 Seater", "Bus", "Tata", "Starbus", "32 Seater", 2018, 1650000, "Diesel", "Manual", 210000, 2, "White", "Bus"],
];

// status, isApproved, isFeatured for each vehicle (by index); default = live listing
const STATUS_PLAN = {
  2: { isFeatured: true },
  3: { isFeatured: true },
  7: { isFeatured: true },
  14: { isFeatured: true },
  16: { isFeatured: true },
  4: { status: "SOLD" },
  9: { status: "SOLD" },
  15: { status: "SOLD" },
  11: { status: "PENDING", isApproved: false },
  18: { status: "PENDING", isApproved: false },
  23: { status: "PENDING", isApproved: false },
  21: { status: "REJECTED", isApproved: false, rejectReason: "RC copy is unclear — please upload a clearer RC front image." },
  25: { status: "DRAFT", isApproved: false },
};

const CITIES = [
  { city: "Bengaluru", state: "Karnataka", pincode: "560001", lat: 12.9716, lng: 77.5946, reg: "KA" },
  { city: "Mumbai", state: "Maharashtra", pincode: "400001", lat: 19.076, lng: 72.8777, reg: "MH" },
  { city: "New Delhi", state: "Delhi", pincode: "110001", lat: 28.6139, lng: 77.209, reg: "DL" },
  { city: "Hyderabad", state: "Telangana", pincode: "500001", lat: 17.385, lng: 78.4867, reg: "TS" },
  { city: "Chennai", state: "Tamil Nadu", pincode: "600001", lat: 13.0827, lng: 80.2707, reg: "TN" },
  { city: "Pune", state: "Maharashtra", pincode: "411001", lat: 18.5204, lng: 73.8567, reg: "MH" },
];

const CAR_FEATURES = [
  "Air Conditioner", "Power Steering", "Power Windows", "ABS", "Airbags",
  "Alloy Wheels", "Reverse Camera", "Bluetooth", "Touch Screen",
];

// ------------------------------------------------------------
// 1. cleanup — remove only rows that belong to the seed
// ------------------------------------------------------------
async function cleanup() {
  const seedUsers = await prisma.user.findMany({
    where: { email: { endsWith: SEED_EMAIL_DOMAIN } },
    select: { id: true },
  });
  const U = seedUsers.map((u) => u.id);

  const seedVehicles = await prisma.vehicle.findMany({
    where: {
      OR: [{ slug: { startsWith: SEED_SLUG_PREFIX } }, { sellerId: { in: U } }],
    },
    select: { id: true },
  });
  const V = seedVehicles.map((v) => v.id);

  const seedTag = { path: ["seed"], equals: true };

  await prisma.payment.deleteMany({
    where: {
      OR: [
        { userId: { in: U } },
        { vehicleId: { in: V } },
        { order: { OR: [{ buyerId: { in: U } }, { sellerId: { in: U } }, { vehicleId: { in: V } }] } },
      ],
    },
  });
  await prisma.purchaseRequest.deleteMany({
    where: { OR: [{ buyerId: { in: U } }, { sellerId: { in: U } }, { vehicleId: { in: V } }] },
  });
  await prisma.order.deleteMany({
    where: { OR: [{ buyerId: { in: U } }, { sellerId: { in: U } }, { vehicleId: { in: V } }] },
  });
  await prisma.review.deleteMany({
    where: { OR: [{ authorId: { in: U } }, { targetId: { in: U } }, { vehicleId: { in: V } }] },
  });
  await prisma.inspection.deleteMany({ where: { vehicleId: { in: V } } });
  // keep inspections on your own vehicles — just unassign the seed inspector
  await prisma.inspection.updateMany({
    where: { inspectorId: { in: U } },
    data: { inspectorId: null },
  });
  await prisma.loan.deleteMany({ where: { OR: [{ userId: { in: U } }, { vehicleId: { in: V } }] } });
  await prisma.inquiry.deleteMany({ where: { OR: [{ buyerId: { in: U } }, { vehicleId: { in: V } }] } });
  await prisma.wishlist.deleteMany({ where: { OR: [{ userId: { in: U } }, { vehicleId: { in: V } }] } });
  await prisma.cartItem.deleteMany({ where: { OR: [{ userId: { in: U } }, { vehicleId: { in: V } }] } });
  await prisma.vehicleStatusHistory.deleteMany({ where: { vehicleId: { in: V } } });
  await prisma.vehicleStatusHistory.updateMany({
    where: { changedById: { in: U } },
    data: { changedById: null },
  });

  // Conversations a seed user took part in (participants + messages cascade)
  await prisma.conversation.deleteMany({
    where: { participants: { some: { userId: { in: U } } } },
  });
  await prisma.message.deleteMany({ where: { senderId: { in: U } } });
  await prisma.conversationParticipant.deleteMany({ where: { userId: { in: U } } });

  await prisma.savedSearch.deleteMany({ where: { userId: { in: U } } });
  await prisma.notification.deleteMany({
    where: { OR: [{ userId: { in: U } }, { metadata: seedTag }] },
  });
  await prisma.subscription.deleteMany({ where: { userId: { in: U } } });
  await prisma.report.deleteMany({
    where: { OR: [{ userId: { in: U } }, { generatedBy: "seed" }] },
  });
  await prisma.activityLog.deleteMany({
    where: { OR: [{ userId: { in: U } }, { metadata: seedTag }] },
  });
  await prisma.teamMember.deleteMany({
    where: { OR: [{ userId: { in: U } }, { sellerProfile: { userId: { in: U } } }] },
  });
  await prisma.authSession.deleteMany({ where: { userId: { in: U } } });

  await prisma.vehicle.deleteMany({ where: { id: { in: V } } });
  await prisma.user.deleteMany({ where: { id: { in: U } } }); // SellerProfile + documents cascade

  console.log(`  cleaned ${U.length} seed users, ${V.length} seed vehicles`);
}

// ------------------------------------------------------------
// 2. catalog
// ------------------------------------------------------------
async function seedCatalog() {
  const categories = {};
  for (const c of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { name: c.name },
      update: { slug: slugify(c.name), icon: c.icon, description: c.description, isActive: true },
      create: { name: c.name, slug: slugify(c.name), icon: c.icon, description: c.description },
    });
    categories[c.name] = row;
  }

  const brands = {};
  for (const name of BRANDS) {
    const row = await prisma.brand.upsert({
      where: { name },
      update: { slug: slugify(name), isActive: true },
      create: { name, slug: slugify(name), description: `${name} vehicles` },
    });
    brands[name] = row;
  }

  console.log(`  ${CATEGORIES.length} categories, ${BRANDS.length} brands`);
  return { categories, brands };
}

// ------------------------------------------------------------
// 3. users
// ------------------------------------------------------------
async function seedUsers() {
  const password = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const make = (key, role, fullName, phone, extra = {}) => ({
    key,
    data: {
      email: `${key}${SEED_EMAIL_DOMAIN}`,
      username: `seed_${key}`,
      password,
      role,
      fullName,
      lastName: fullName.split(" ").slice(-1)[0],
      phone,
      isVerified: true,
      isActive: true,
      ...extra,
    },
  });

  const defs = [
    // Dealers (shops, many vehicles) and an individual Seller (one vehicle at a time)
    make("seller1", "DEALER", "Rajesh Kumar", "+919000000011"), // Kumar Auto World
    make("seller2", "SELLER", "Priya Sharma", "+919000000012"), // individual
    make("seller3", "DEALER", "Arjun Reddy", "+919000000013"), // Reddy Wheels & Commercial
    // Applicants stay BUYER until an admin approves (seller4 applied as a dealer, seller5 as an individual)
    make("seller4", "BUYER", "Mohammed Irfan", "+919000000014"),
    make("seller5", "BUYER", "Kavita Joshi", "+919000000015"),
    make("buyer1", "BUYER", "Ananya Iyer", "+919000000021"),
    make("buyer2", "BUYER", "Rohan Mehta", "+919000000022"),
    make("buyer3", "BUYER", "Sneha Patil", "+919000000023"),
    make("buyer4", "BUYER", "Vikram Singh", "+919000000024"),
    make("buyer5", "BUYER", "Neha Gupta", "+919000000025"),
    make("buyer6", "BUYER", "Karthik Nair", "+919000000026"),
    make("inspector1", "INSPECTOR", "Suresh Babu", "+919000000031"),
    make("inspector2", "INSPECTOR", "Deepak Yadav", "+919000000032"),
  ];

  // Free up seed phone numbers if a non-seed account somehow holds one (phone is @unique)
  const phones = defs.map((d) => d.data.phone);
  const clash = await prisma.user.findMany({
    where: { phone: { in: phones }, NOT: { email: { endsWith: SEED_EMAIL_DOMAIN } } },
    select: { id: true, phone: true },
  });
  for (const c of clash) {
    console.warn(`  ! phone ${c.phone} used by a non-seed user — that seed user gets no phone`);
    defs.find((d) => d.data.phone === c.phone).data.phone = null;
  }

  const users = {};
  for (const d of defs) {
    users[d.key] = await prisma.user.create({ data: d.data });
  }

  // Admin: keep the existing record if you already logged in with the admin phone
  users.admin = await prisma.user.upsert({
    where: { phone: ADMIN_PHONE },
    update: { role: "ADMIN", fullName: "Auro Admin", isActive: true, isBlocked: false, isVerified: true },
    create: {
      email: "919506536127@vehiclehub.local", // same as OTPController.createUserRecord
      password,
      role: "ADMIN",
      fullName: "Auro Admin",
      lastName: "Admin",
      phone: ADMIN_PHONE,
      isVerified: true,
      isActive: true,
    },
  });

  console.log(`  ${defs.length + 1} users`);
  return users;
}

// ------------------------------------------------------------
// 4. seller profiles + documents + team
// ------------------------------------------------------------
async function seedSellers(users) {
  const profiles = [
    {
      user: users.seller1, sellerType: "DEALER", ownerName: "Rajesh Kumar",
      businessName: "Kumar Auto World", city: CITIES[0], gst: "29ABCDE1234F1Z5", pan: "ABCDE1234F",
      years: 12, website: "https://kumarautoworld.example.com", status: "APPROVED",
      isElite: true, rating: 4.7, totalReviews: 3, bank: ["HDFC Bank", "HDFC0001234"],
      description: "Trusted pre-owned car dealer in Bengaluru with 12 years of experience.",
    },
    {
      user: users.seller2, sellerType: "INDIVIDUAL", ownerName: "Priya Sharma",
      businessName: null, city: CITIES[1], gst: null, pan: "BCDEF2345G",
      years: null, website: null, status: "APPROVED",
      isElite: false, rating: 4.3, totalReviews: 2, bank: ["ICICI Bank", "ICIC0002345"],
      description: "Selling well-maintained personal vehicles.",
    },
    {
      user: users.seller3, sellerType: "DEALER", ownerName: "Arjun Reddy",
      businessName: "Reddy Wheels & Commercial", city: CITIES[3], gst: "36CDEFG3456H1Z2", pan: "CDEFG3456H",
      years: 8, website: "https://reddywheels.example.com", status: "APPROVED",
      isElite: false, rating: 4.5, totalReviews: 1, bank: ["State Bank of India", "SBIN0003456"],
      description: "Two-wheelers, commercial vehicles and tractors across Telangana.",
    },
    {
      user: users.seller4, sellerType: "DEALER", ownerName: "Mohammed Irfan",
      businessName: "Irfan Car Bazaar", city: CITIES[4], gst: "33DEFGH4567J1Z9", pan: "DEFGH4567J",
      years: 5, website: null, status: "PENDING",
      isElite: false, rating: 0, totalReviews: 0, bank: ["Axis Bank", "UTIB0004567"],
      description: "New dealer awaiting verification.",
    },
    {
      user: users.seller5, sellerType: "INDIVIDUAL", ownerName: "Kavita Joshi",
      businessName: null, city: CITIES[5], gst: null, pan: "EFGHI5678K",
      years: null, website: null, status: "REJECTED",
      rejectReason: "PAN card image does not match the owner name.",
      isElite: false, rating: 0, totalReviews: 0, bank: ["Kotak Mahindra Bank", "KKBK0005678"],
      description: "Individual seller.",
    },
  ];

  const result = {};
  for (const p of profiles) {
    const reviewed = p.status !== "PENDING";
    const profile = await prisma.sellerProfile.create({
      data: {
        userId: p.user.id,
        sellerType: p.sellerType,
        ownerName: p.ownerName,
        businessName: p.businessName,
        description: p.description,
        address: `${10 + Object.keys(result).length * 7}, MG Road`,
        city: p.city.city,
        state: p.city.state,
        pincode: p.city.pincode,
        gstNumber: p.gst,
        panNumber: p.pan,
        yearsInBusiness: p.years,
        website: p.website,
        bankAccountHolder: p.businessName || p.ownerName,
        bankAccountNumber: `50100${String(Math.abs(hash(p.ownerName))).padStart(9, "0").slice(0, 9)}`,
        bankIFSC: p.bank[1],
        bankName: p.bank[0],
        profilePhoto: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.ownerName)}&background=001f3f&color=fff`,
        shopLogo: p.businessName
          ? `https://ui-avatars.com/api/?name=${encodeURIComponent(p.businessName)}&background=f59e0b&color=fff`
          : null,
        isRegistered: true,
        isApproved: p.status === "APPROVED",
        verificationStatus: p.status,
        rejectReason: p.rejectReason || null,
        submittedAt: daysAgo(p.status === "PENDING" ? 2 : 60),
        reviewedAt: reviewed ? daysAgo(55) : null,
        reviewedBy: reviewed ? users.admin.id : null,
        isElite: p.isElite,
        rating: p.rating,
        totalReviews: p.totalReviews,
        documents: {
          create: [
            {
              type: "PAN_CARD",
              fileUrl: "https://placehold.co/800x500/png?text=PAN+Card",
              status: p.status === "APPROVED" ? "VERIFIED" : p.status === "REJECTED" ? "REJECTED" : "PENDING",
              verifiedAt: p.status === "APPROVED" ? daysAgo(55) : null,
            },
            ...(p.gst
              ? [{
                  type: "GST_CERTIFICATE",
                  fileUrl: "https://placehold.co/800x1100/png?text=GST+Certificate",
                  status: p.status === "APPROVED" ? "VERIFIED" : "PENDING",
                  verifiedAt: p.status === "APPROVED" ? daysAgo(55) : null,
                }]
              : []),
          ],
        },
      },
    });
    result[p.user.id] = profile;
  }

  console.log(`  ${profiles.length} seller profiles`);
  return result;
}

function hash(str) {
  let h = 0;
  for (const ch of String(str)) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return h;
}

// ------------------------------------------------------------
// 5. vehicles
// ------------------------------------------------------------
async function seedVehicles(users, catalog) {
  // which seller lists which vehicle
  // seller2 is an individual Seller: one open listing (plus past sales); everything else goes to the dealers
  let individualOpen = 0;
  const sellerFor = (i, category) => {
    if (["Truck", "Commercial Vehicle", "Tractor", "Auto", "Bus"].includes(category)) return users.seller3;
    const dealer = ["Bike", "Scooter"].includes(category) ? users.seller3 : users.seller1;
    const wantsIndividual = ["Bike", "Scooter"].includes(category) ? i % 2 === 0 : i % 3 === 0;
    if (!wantsIndividual) return dealer;
    if ((STATUS_PLAN[i]?.status || "AVAILABLE") === "SOLD") return users.seller2;
    if (individualOpen === 0) { individualOpen += 1; return users.seller2; }
    return dealer;
  };

  const vehicles = [];
  for (let i = 0; i < VEHICLES.length; i++) {
    const [title, category, brand, model, variant, year, price, fuelType, transmission, km, ownership, color, bodyType] = VEHICLES[i];
    const plan = { status: "AVAILABLE", isApproved: true, isFeatured: false, ...STATUS_PLAN[i] };
    const seller = sellerFor(i, category);
    const loc = CITIES[i % CITIES.length];
    const isFourWheeler = ["Car", "Commercial Vehicle", "Truck", "Bus"].includes(category);
    const features = isFourWheeler ? CAR_FEATURES.slice(0, 5 + (i % 5)) : ["ABS", "Bluetooth"].slice(0, 1 + (i % 2));
    const images = photosFor(category, i);
    const createdAt = daysAgo(90 - i * 3);

    const vehicle = await prisma.vehicle.create({
      data: {
        title,
        slug: `${SEED_SLUG_PREFIX}${slugify(title)}-${i + 1}`,
        description: `${year} ${title} in ${color}. ${ownership === 1 ? "Single" : "Second"} owner, ${km.toLocaleString("en-IN")} km driven, full service history. Located in ${loc.city}.`,
        brand,
        model,
        variant,
        categoryId: catalog.categories[category].id,
        brandId: catalog.brands[brand].id,
        sellerId: seller.id,
        vehicleType: category,

        price,
        expectedPrice: Math.round(price * 0.95),
        negotiable: i % 2 === 0,
        emiAvailable: price > 300000,

        year,
        registrationYear: year,
        mileage: km,
        fuelType,
        transmission,
        bodyType,
        ownership,
        color,
        engineCapacity: fuelType === "Electric" ? null : isFourWheeler ? "1497 cc" : "199 cc",
        seatingCapacity: category === "Bus" ? 32 : ["Bike", "Scooter"].includes(category) ? 2 : bodyType === "MUV" ? 7 : category === "Auto" ? 3 : 5,
        registrationNumber: `${loc.reg}${String(1 + (i % 50)).padStart(2, "0")}AB${String(1000 + i * 37).slice(-4)}`,
        registrationState: loc.state,
        location: `${loc.city} Central`,
        city: loc.city,
        state: loc.state,
        pincode: loc.pincode,
        latitude: loc.lat,
        longitude: loc.lng,

        insuranceCompany: ["ICICI Lombard", "HDFC Ergo", "Bajaj Allianz", "Tata AIG"][i % 4],
        insuranceExpiry: daysFromNow(60 + i * 10),
        insuranceType: i % 3 === 0 ? "Third Party" : "Comprehensive",
        fitnessValidTill: daysFromNow(365 * 5),
        pollutionValidTill: daysFromNow(120),

        images,
        thumbnail: images[0],
        exteriorImages: images.slice(0, 2),
        interiorImages: images.slice(2),
        documentImages: ["https://placehold.co/800x500/png?text=RC+Front"],
        rcFront: "https://placehold.co/800x500/png?text=RC+Front",

        features,
        airbags: isFourWheeler ? 2 + (i % 5) : null,
        abs: features.includes("ABS"),
        alloyWheels: features.includes("Alloy Wheels"),
        bluetooth: features.includes("Bluetooth"),
        touchscreen: features.includes("Touch Screen"),
        reverseCamera: features.includes("Reverse Camera"),
        powerSteering: features.includes("Power Steering"),
        powerWindows: features.includes("Power Windows"),
        ac: features.includes("Air Conditioner"),
        sunroof: i % 4 === 0 && category === "Car",

        status: plan.status,
        isApproved: plan.isApproved,
        isVerified: plan.isApproved,
        isFeatured: plan.isFeatured,
        rejectReason: plan.rejectReason || null,
        publishedAt: plan.isApproved ? daysAgo(85 - i * 3) : null,
        soldAt: plan.status === "SOLD" ? daysAgo(10 + i) : null,
        soldPrice: plan.status === "SOLD" ? Math.round(price * 0.97) : null,
        views: 40 + ((i * 53) % 900),
        favorites: (i * 7) % 60,

        ownerName: seller.fullName,
        ownerPhone: seller.phone,
        ownerEmail: seller.email,
        sellerType: seller === users.seller2 ? "Individual" : "Dealer",
        condition: ["Excellent", "Good", "Good", "Fair"][i % 4],
        engineCondition: "Good",
        tyreCondition: i % 3 === 0 ? "Excellent" : "Good",
        batteryCondition: "Good",
        accidental: false,
        floodDamage: false,
        serviceHistory: true,
        lastServiceDate: daysAgo(30 + i),
        serviceCenter: `${brand} Authorised Service, ${loc.city}`,
        loanRunning: i % 7 === 0,
        nocAvailable: true,
        numberOfKeys: 2,
        reasonForSelling: "Upgrading to a new vehicle",
        metaTitle: `${title} for sale in ${loc.city} | VehicleHub`,
        metaDescription: `Buy used ${title} (${year}) in ${loc.city} for ₹${price.toLocaleString("en-IN")}.`,
        createdAt,

        statusHistory: {
          create: [
            { fromStatus: null, toStatus: "PENDING", reason: "Listing submitted", changedById: seller.id, createdAt },
            ...(plan.status !== "PENDING" && plan.status !== "DRAFT"
              ? [{
                  fromStatus: "PENDING",
                  toStatus: plan.status === "REJECTED" ? "REJECTED" : "AVAILABLE",
                  reason: plan.status === "REJECTED" ? plan.rejectReason : "Approved by admin",
                  changedById: users.admin.id,
                  createdAt: daysAgo(85 - i * 3),
                }]
              : []),
            ...(plan.status === "SOLD"
              ? [{ fromStatus: "AVAILABLE", toStatus: "SOLD", reason: "Marked sold", changedById: seller.id, createdAt: daysAgo(10 + i) }]
              : []),
          ],
        },
      },
    });
    vehicles.push(vehicle);
  }

  const live = vehicles.filter((v) => v.status === "AVAILABLE" && v.isApproved).length;
  console.log(`  ${vehicles.length} vehicles (${live} live on the site)`);
  return vehicles;
}

// ------------------------------------------------------------
// 6. buyer activity, orders, payments, inspections, loans
// ------------------------------------------------------------
async function seedActivity(users, vehicles) {
  const buyers = ["buyer1", "buyer2", "buyer3", "buyer4", "buyer5", "buyer6"].map((k) => users[k]);
  const live = vehicles.filter((v) => v.status === "AVAILABLE" && v.isApproved);
  const sold = vehicles.filter((v) => v.status === "SOLD");
  const pending = vehicles.filter((v) => v.status === "PENDING");

  // Inquiries
  const inquiryMessages = [
    "Is the price negotiable? I can visit this weekend.",
    "Can you share the service records?",
    "Is a test drive possible tomorrow evening?",
    "Any accident history? Please confirm.",
    "Can you arrange finance for this vehicle?",
  ];
  const inquiryStatuses = ["PENDING", "ACCEPTED", "PENDING", "CLOSED", "REJECTED"];
  let inquiries = 0;
  for (let i = 0; i < live.length; i++) {
    for (let j = 0; j < 1 + (i % 3); j++) {
      await prisma.inquiry.create({
        data: {
          vehicleId: live[i].id,
          buyerId: buyers[(i + j) % buyers.length].id,
          message: inquiryMessages[(i + j) % inquiryMessages.length],
          status: inquiryStatuses[(i + j) % inquiryStatuses.length],
          createdAt: daysAgo(20 - (i % 20)),
        },
      });
      inquiries++;
    }
  }

  // Wishlist + cart
  const wish = [];
  const cart = [];
  buyers.forEach((b, bi) => {
    for (let k = 0; k < 3; k++) {
      wish.push({ userId: b.id, vehicleId: live[(bi * 2 + k) % live.length].id });
      cart.push({ userId: b.id, vehicleId: live[(bi * 2 + k) % live.length].id, type: "WISHLIST" });
    }
    cart.push({ userId: b.id, vehicleId: live[(bi + 5) % live.length].id, type: "CART" });
  });
  await prisma.wishlist.createMany({ data: wish, skipDuplicates: true });
  await prisma.cartItem.createMany({ data: cart, skipDuplicates: true });

  // Saved searches
  await prisma.savedSearch.createMany({
    data: [
      { userId: users.buyer1.id, name: "SUVs under 20L", filters: { category: "Car", bodyType: "SUV", priceMax: 2000000 }, alertsOn: true },
      { userId: users.buyer2.id, name: "Electric scooters", filters: { category: "Scooter", fuelType: "Electric" }, alertsOn: true },
      { userId: users.buyer3.id, name: "Automatic sedans", filters: { category: "Car", transmission: "Automatic", bodyType: "Sedan" }, alertsOn: false },
    ],
  });

  // Orders + payments for sold vehicles, plus a couple of open orders
  const orders = [];
  for (let i = 0; i < sold.length; i++) {
    const v = sold[i];
    const amount = v.soldPrice || v.price;
    const order = await prisma.order.create({
      data: {
        vehicleId: v.id,
        buyerId: buyers[i % buyers.length].id,
        sellerId: v.sellerId,
        amount,
        commission: Math.round(amount * 0.02),
        status: "COMPLETED",
        completedAt: v.soldAt,
        createdAt: daysAgo(15 + i),
      },
    });
    orders.push(order);
    await prisma.payment.createMany({
      data: [
        {
          userId: order.buyerId, vehicleId: v.id, orderId: order.id,
          amount: Math.round(amount * 0.1), status: "SUCCESS",
          reference: `pay_seed_tok_${i}`, createdAt: daysAgo(14 + i),
        },
        {
          userId: order.buyerId, vehicleId: v.id, orderId: order.id,
          amount: amount - Math.round(amount * 0.1), status: "SUCCESS",
          reference: `pay_seed_bal_${i}`, createdAt: daysAgo(10 + i),
        },
      ],
    });
  }
  for (let i = 0; i < 3; i++) {
    const v = live[i * 3];
    const status = ["PENDING", "CONFIRMED", "CANCELLED"][i];
    const order = await prisma.order.create({
      data: {
        vehicleId: v.id,
        buyerId: buyers[(i + 2) % buyers.length].id,
        sellerId: v.sellerId,
        amount: v.price,
        commission: Math.round(v.price * 0.02),
        status,
        createdAt: daysAgo(3 + i),
      },
    });
    orders.push(order);
    await prisma.payment.create({
      data: {
        userId: order.buyerId, vehicleId: v.id, orderId: order.id,
        amount: 10000, // token amount
        status: status === "CANCELLED" ? "REFUNDED" : status === "PENDING" ? "PENDING" : "SUCCESS",
        reference: `pay_seed_token_open_${i}`,
      },
    });
  }
  await prisma.payment.create({
    data: {
      userId: users.buyer6.id, amount: 4999, status: "FAILED",
      reference: "pay_seed_failed_1", provider: "Razorpay",
    },
  });

  // Purchase requests (buyer "Send Request" → seller Purchase Requests page)
  const prPlan = [
    { buyer: users.buyer1, v: live[1], status: "PENDING", offer: 0.97, msg: "Can I see it this Saturday?" },
    { buyer: users.buyer2, v: live[1], status: "PENDING", offer: 0.93, msg: "Is the price negotiable?" },
    { buyer: users.buyer3, v: live[4], status: "ACCEPTED", offer: 0.98, msg: "Ready to pay the token amount." },
    { buyer: users.buyer4, v: live[5], status: "REJECTED", offer: 0.8, msg: null, reason: "Offer too low" },
    { buyer: users.buyer5, v: live[7], status: "CANCELLED", offer: 0.95, msg: "Found another vehicle, sorry." },
    { buyer: users.buyer6, v: live[10], status: "PENDING", offer: 1, msg: "I'd like to schedule an inspection this weekend." },
  ].filter((p) => p.v);
  for (const [i, p] of prPlan.entries()) {
    await prisma.purchaseRequest.create({
      data: {
        vehicleId: p.v.id,
        buyerId: p.buyer.id,
        sellerId: p.v.sellerId,
        offerPrice: Math.round(p.v.price * p.offer),
        buyerName: p.buyer.fullName,
        buyerPhone: p.buyer.phone || "+919000000000",
        buyerEmail: p.buyer.email,
        message: p.msg,
        status: p.status,
        rejectReason: p.reason || null,
        respondedAt: p.status === "PENDING" ? null : daysAgo(1),
        createdAt: daysAgo(6 - i),
      },
    });
  }

  // Reviews (seller ratings)
  const soldOrders = orders.filter((o) => o.status === "COMPLETED");
  const comments = ["Smooth deal, car exactly as described.", "Very transparent seller.", "Quick paperwork and delivery."];
  for (let i = 0; i < soldOrders.length; i++) {
    await prisma.review.create({
      data: {
        vehicleId: soldOrders[i].vehicleId,
        authorId: soldOrders[i].buyerId,
        targetId: soldOrders[i].sellerId,
        rating: 4 + (i % 2),
        comment: comments[i % comments.length],
      },
    });
  }

  // Inspections (assigned by the admin to the two field inspectors)
  const checklistDone = {
    sellerVerified: true, sellerNotes: "Owner present with Aadhaar and RC.",
    documentsVerified: true, vehicleIdentityVerified: true,
    exteriorVerified: true, interiorVerified: true, mechanicalVerified: true,
    testDriveCompleted: true, locationVerified: true, photosCompleted: true,
  };
  const checks = (good) => [
    { id: "x1", category: "Identity", item: "Registration Number Match", condition: good ? "Matched" : "Mismatch", status: good ? "VERIFIED" : "FAILED", remarks: null },
    { id: "x2", category: "Identity", item: "VIN/Chassis Number Match", condition: good ? "Matched" : "Mismatch", status: good ? "VERIFIED" : "FAILED", remarks: good ? null : "Chassis number differs from RC" },
    { id: "x3", category: "Exterior", item: "Front", condition: "Good", status: "VERIFIED", remarks: null },
    { id: "x4", category: "Exterior", item: "Tyres", condition: good ? "Excellent" : "Fair", status: "VERIFIED", remarks: null },
    { id: "x5", category: "Mechanical", item: "Engine Start", condition: "Good", status: "VERIFIED", remarks: null },
    { id: "x6", category: "TestDrive", item: "Test Drive", condition: "4/5", status: "VERIFIED", remarks: "Rating: 4/5" },
  ];
  const at = (days, hour) => { const d = days >= 0 ? daysFromNow(days) : daysAgo(-days); d.setHours(hour, 0, 0, 0); return d; };
  const soldVehicle = sold[0];
  const inspectionPlan = [
    // inspector 1 — today's job waiting to be accepted, one accepted for later, one in progress, two finished
    { v: pending[0], inspector: users.inspector1, status: "ASSIGNED", at: at(0, 15), priority: "HIGH" },
    { v: live[2], inspector: users.inspector1, status: "ACCEPTED", at: at(3, 11), priority: "MEDIUM", accepted: true },
    { v: live[3], inspector: users.inspector1, status: "IN_PROGRESS", at: at(0, 10), priority: "URGENT", accepted: true, started: true,
      checklist: { sellerVerified: true, sellerNotes: "Seller present.", documentsVerified: true } },
    { v: live[0], inspector: users.inspector1, status: "COMPLETED", at: at(-80, 11), priority: "MEDIUM", accepted: true, started: true, result: "VERIFIED", rating: 5,
      notes: "Engine, transmission and body in excellent condition. No accident history.", checklist: checklistDone, checks: checks(true) },
    { v: vehicles.find((x) => x.status === "REJECTED"), inspector: users.inspector1, status: "COMPLETED", at: at(-20, 12), priority: "HIGH", accepted: true, started: true, result: "REJECTED",
      rejection: "Chassis number on RC does not match vehicle.", checklist: { ...checklistDone, vehicleIdentityVerified: false }, checks: checks(false) },
    // inspector 2
    { v: pending[1], inspector: users.inspector2, status: "ASSIGNED", at: at(2, 16), priority: "MEDIUM" },
    { v: live[1], inspector: users.inspector2, status: "COMPLETED", at: at(-70, 10), priority: "LOW", accepted: true, started: true, result: "VERIFIED", rating: 4,
      notes: "Minor scratches on rear bumper. Tyres at 70%. Recommended.", checklist: checklistDone, checks: checks(true) },
    { v: soldVehicle, inspector: users.inspector2, status: "COMPLETED", at: at(-30, 14), priority: "MEDIUM", accepted: true, started: true, result: "NEEDS_CORRECTION", rating: 3,
      correction: "Insurance copy expired — seller to upload the renewed policy.", checklist: { ...checklistDone, documentsVerified: false }, checks: checks(true) },
    // not assigned yet — the admin assigns it from Vehicle Approvals
    { v: pending[2], inspector: null, status: "PENDING", at: null, priority: "MEDIUM" },
  ].filter((p) => p.v);
  for (const p of inspectionPlan) {
    const assignedAt = p.inspector ? (p.at && p.at < new Date() ? new Date(p.at.getTime() - 3 * 86400000) : daysAgo(1)) : null;
    const done = p.status === "COMPLETED";
    await prisma.inspection.create({
      data: {
        vehicleId: p.v.id,
        inspectorId: p.inspector?.id || null,
        scheduledAt: p.at,
        status: p.status,
        priority: p.priority,
        approved: p.result === "VERIFIED",
        assignedAt,
        assignedById: p.inspector ? users.admin.id : null,
        acceptedAt: p.accepted ? assignedAt : null,
        startedAt: p.started ? p.at : null,
        completedAt: done ? new Date(p.at.getTime() + 2 * 3600000) : null,
        result: p.result || null,
        finalRating: p.rating || null,
        finalNotes: p.notes || null,
        rejectionReason: p.rejection || null,
        correctionReason: p.correction || null,
        report: p.notes || p.rejection || p.correction || null,
        checklist: p.checklist || undefined,
        vehicleChecks: p.checks || undefined,
        documentChecks: done ? [{ id: "d1", documentType: "RC", documentUrl: p.v.rcFront, documentNumber: p.v.registrationNumber, status: p.result === "REJECTED" ? "REJECTED" : "VERIFIED", remarks: null, rejectionReason: p.result === "REJECTED" ? p.rejection : null }] : undefined,
        locationCheck: done ? { actualAddress: `${p.v.location}, ${p.v.city}`, locationMatched: true, vehiclePresent: true, sellerPresent: true, remarks: null } : undefined,
        photos: done ? (p.v.images || []).slice(0, 2).map((url, k) => ({ id: `ph${k}`, imageUrl: url, category: k ? "Vehicle Rear" : "Vehicle Front", uploadedAt: p.at.toISOString() })) : undefined,
      },
    });
  }

  // Loans
  const loanPlan = [
    { user: users.buyer1, v: live[2], amount: 1200000, status: "APPROVED", tenure: 60, rate: 9.5 },
    { user: users.buyer2, v: live[4], amount: 800000, status: "PENDING", tenure: 48, rate: 10.25 },
    { user: users.buyer3, v: live[6], amount: 500000, status: "REJECTED", tenure: 36, rate: 11 },
    { user: users.buyer4, v: sold[0], amount: 700000, status: "PAID", tenure: 36, rate: 9.75 },
  ];
  for (const l of loanPlan) {
    const r = l.rate / 12 / 100;
    const emi = Math.round((l.amount * r * (1 + r) ** l.tenure) / ((1 + r) ** l.tenure - 1));
    await prisma.loan.create({
      data: {
        userId: l.user.id,
        vehicleId: l.v?.id || null,
        amount: l.amount,
        status: l.status,
        tenureMonths: l.tenure,
        interestRate: l.rate,
        emi,
        approvedBy: ["APPROVED", "PAID"].includes(l.status) ? users.admin.id : null,
      },
    });
  }

  // Subscriptions for dealers
  await prisma.subscription.createMany({
    data: [
      { userId: users.seller1.id, plan: "Dealer Pro", status: "ACTIVE", price: 4999, startDate: daysAgo(40), endDate: daysFromNow(325) },
      { userId: users.seller3.id, plan: "Dealer Basic", status: "TRIAL", price: 0, startDate: daysAgo(5), endDate: daysFromNow(9) },
      { userId: users.seller2.id, plan: "Individual Boost", status: "EXPIRED", price: 499, startDate: daysAgo(120), endDate: daysAgo(30) },
    ],
  });

  console.log(`  ${inquiries} inquiries, ${wish.length} wishlist, ${prPlan.length} purchase requests, ${orders.length} orders, ${inspectionPlan.length} inspections, ${loanPlan.length} loans`);
  return { orders, live, pending, sold };
}

// ------------------------------------------------------------
// 7. chat, notifications, reports, activity log, revenue
// ------------------------------------------------------------
async function seedCommunication(users, vehicles, { live, pending, sold }) {
  const seedMeta = (extra = {}) => ({ seed: true, ...extra });

  // Buyer <-> seller chats
  const chats = [
    { buyer: users.buyer1, v: live[0], lines: ["Hi, is this still available?", "Yes, it is. When would you like to see it?", "Saturday 11 AM works for me."] },
    { buyer: users.buyer2, v: live[3], lines: ["What is the final price?", "I can do ₹50,000 less for a quick deal."] },
    { buyer: users.buyer3, v: live[8], lines: ["Is the insurance transferable?", "Yes, we handle the transfer for you."] },
  ];
  for (const c of chats) {
    const seller = await prisma.user.findUnique({ where: { id: c.v.sellerId } });
    await prisma.conversation.create({
      data: {
        vehicleId: c.v.id,
        participants: {
          create: [
            { userId: c.buyer.id, lastReadAt: new Date() },
            { userId: seller.id },
          ],
        },
        messages: {
          create: c.lines.map((text, idx) => ({
            senderId: idx % 2 === 0 ? c.buyer.id : seller.id,
            senderType: "USER",
            text,
            createdAt: new Date(Date.now() - (c.lines.length - idx) * 15 * 60 * 1000),
          })),
        },
      },
    });
  }
  // Admin <-> pending seller
  await prisma.conversation.create({
    data: {
      participants: { create: [{ userId: users.admin.id }, { userId: users.seller4.id }] },
      messages: {
        create: [
          { senderId: users.admin.id, senderType: "ADMIN", text: "Please upload your GST certificate to complete verification." },
          { senderId: users.seller4.id, senderType: "USER", text: "Uploaded just now, please check." },
        ],
      },
    },
  });

  // Notifications
  const n = [];
  const sellerOf = (v) => v.sellerId;
  live.slice(0, 6).forEach((v) =>
    n.push({ userId: sellerOf(v), type: "VEHICLE_APPROVED", title: "Listing approved", message: `${v.title} is now live.`, metadata: seedMeta({ vehicleId: v.id }), isRead: true }),
  );
  live.slice(0, 5).forEach((v, i) =>
    n.push({ userId: sellerOf(v), type: "NEW_INQUIRY", title: "New inquiry", message: `A buyer asked about ${v.title}.`, metadata: seedMeta({ vehicleId: v.id }), isRead: i > 2 }),
  );
  sold.forEach((v) =>
    n.push({ userId: sellerOf(v), type: "SALE_COMPLETED", title: "Vehicle sold", message: `${v.title} has been marked as sold.`, metadata: seedMeta({ vehicleId: v.id }) }),
  );
  const rejected = vehicles.find((v) => v.status === "REJECTED");
  if (rejected) {
    n.push({ userId: rejected.sellerId, type: "VEHICLE_REJECTED", title: "Listing rejected", message: rejected.rejectReason, metadata: seedMeta({ vehicleId: rejected.id }) });
  }
  n.push(
    { userId: users.seller1.id, type: "SELLER_APPROVED", title: "Dealer account approved", message: "Your dealer account has been verified.", metadata: seedMeta(), isRead: true },
    { userId: users.seller5.id, type: "SELLER_REJECTED", title: "Seller verification failed", message: "PAN card image does not match the owner name.", metadata: seedMeta() },
    { userId: users.buyer1.id, type: "NEW_MESSAGE", title: "New message", message: "Seller replied to your chat.", metadata: seedMeta() },
    { userId: users.buyer4.id, type: "PAYMENT_RECEIVED", title: "Payment successful", message: "Your payment was received.", metadata: seedMeta(), isRead: true },
    { userId: users.inspector1.id, type: "INSPECTION_SCHEDULED", title: "New inspection assigned", message: `Inspect ${pending[0]?.title || "a vehicle"} today at 3 PM.`, metadata: seedMeta() },
    { userId: users.inspector2.id, type: "INSPECTION_SCHEDULED", title: "New inspection assigned", message: `Inspect ${pending[1]?.title || "a vehicle"} in 2 days.`, metadata: seedMeta() },
    { userId: users.admin.id, type: "SYSTEM_ALERT", title: "New seller registration", message: "Irfan Car Bazaar is waiting for verification.", metadata: seedMeta({ sellerUserId: users.seller4.id }) },
    { userId: users.admin.id, type: "SYSTEM_ALERT", title: "Vehicles awaiting approval", message: `${pending.length} listings need review.`, metadata: seedMeta() },
  );
  await prisma.notification.createMany({ data: n });

  // Reports
  await prisma.report.createMany({
    data: [
      { type: "SALES", title: "Monthly sales summary", content: `Vehicles sold: ${sold.length}. Live listings: ${live.length}.`, generatedBy: "seed", userId: users.admin.id },
      { type: "INVENTORY", title: "Pending approvals", content: `${pending.length} vehicles pending admin review.`, generatedBy: "seed", userId: users.admin.id },
      { type: "FRAUD", title: "Listing flagged", content: "Chassis mismatch reported on a rejected listing.", generatedBy: "seed", userId: users.admin.id },
    ],
  });

  // Activity log
  const logs = [
    ...vehicles.slice(0, 10).map((v) => ({
      userId: v.sellerId, action: "vehicle.created", entityType: "Vehicle", entityId: v.id,
      metadata: seedMeta({ title: v.title }), createdAt: v.createdAt,
    })),
    ...live.slice(0, 6).map((v) => ({
      userId: users.admin.id, action: "vehicle.approved", entityType: "Vehicle", entityId: v.id,
      metadata: seedMeta({ title: v.title }),
    })),
    { userId: users.admin.id, action: "seller.approved", entityType: "SellerProfile", entityId: users.seller1.id, metadata: seedMeta() },
    { userId: users.admin.id, action: "seller.rejected", entityType: "SellerProfile", entityId: users.seller5.id, metadata: seedMeta() },
    { userId: users.seller4.id, action: "seller.registration_submitted", entityType: "SellerProfile", entityId: users.seller4.id, metadata: seedMeta() },
    ...sold.map((v) => ({ userId: v.sellerId, action: "order.completed", entityType: "Vehicle", entityId: v.id, metadata: seedMeta() })),
  ];
  await prisma.activityLog.createMany({ data: logs });

  // Revenue snapshots (upsert — unique on periodType + label + start)
  const snapshots = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let d = 6; d >= 0; d--) {
    const start = new Date(daysAgo(d).setHours(0, 0, 0, 0));
    snapshots.push({ periodType: "daily", periodLabel: dayNames[start.getDay()], periodStart: start, periodEnd: new Date(start.getTime() + 86399999), base: 180000 + d * 23000 });
  }
  for (let w = 4; w >= 1; w--) {
    const start = new Date(daysAgo(w * 7).setHours(0, 0, 0, 0));
    snapshots.push({ periodType: "weekly", periodLabel: `W${5 - w}`, periodStart: start, periodEnd: new Date(start.getTime() + 7 * 86400000 - 1), base: 1100000 + w * 90000 });
  }
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  for (let m = 5; m >= 0; m--) {
    const start = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - m + 1, 0, 23, 59, 59, 999);
    snapshots.push({ periodType: "monthly", periodLabel: monthNames[start.getMonth()], periodStart: start, periodEnd: end, base: 4200000 + (5 - m) * 350000 });
  }
  for (const s of snapshots) {
    const data = {
      periodEnd: s.periodEnd,
      totalRevenue: s.base,
      commissionEarned: Math.round(s.base * 0.02),
      pendingPayouts: Math.round(s.base * 0.15),
    };
    await prisma.revenueSnapshot.upsert({
      where: { periodType_periodLabel_periodStart: { periodType: s.periodType, periodLabel: s.periodLabel, periodStart: s.periodStart } },
      update: data,
      create: { periodType: s.periodType, periodLabel: s.periodLabel, periodStart: s.periodStart, ...data },
    });
  }

  console.log(`  ${chats.length + 1} conversations, ${n.length} notifications, ${logs.length} activity logs, ${snapshots.length} revenue snapshots`);
}

// ------------------------------------------------------------
// run
// ------------------------------------------------------------
async function main() {
  console.log("Seeding VehicleHub database…");
  await cleanup();
  const catalog = await seedCatalog();
  const users = await seedUsers();
  await seedSellers(users);
  const vehicles = await seedVehicles(users, catalog);
  const activity = await seedActivity(users, vehicles);
  await seedCommunication(users, vehicles, activity);
  console.log("Done ✔");
  console.log("Login with phone OTP (code from DummyOTP, default 1234): admin 9506536127 · dealer 9000000011 · seller 9000000012 · buyer 9000000021 · field inspector 9000000031");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });