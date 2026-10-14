// Self-contained catalog powering the homepage rails (Most Searched / Electric / Upcoming / Latest / Brands).
// Kept separate from mockData.js so nothing existing breaks — merge later if you want a single source of truth.

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <rect width="1200" height="800" rx="40" fill="#f8fafc"/>
  <rect x="40" y="40" width="1120" height="720" rx="32" fill="url(#g)"/>
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="100%" stop-color="#fdba74"/>
    </linearGradient>
  </defs>
  <path d="M260 560c25-84 90-144 172-144h278c95 0 176 69 200 164l40 128H220l40-148z" fill="#0f172a" opacity="0.95"/>
  <circle cx="360" cy="580" r="72" fill="#111827"/>
  <circle cx="820" cy="580" r="72" fill="#111827"/>
  <circle cx="360" cy="580" r="32" fill="#f8fafc"/>
  <circle cx="820" cy="580" r="32" fill="#f8fafc"/>
  <path d="M350 430h220l60-90h110l70 90h84l-75-126a60 60 0 0 0-50-30H430a60 60 0 0 0-52 30l-28 58z" fill="#f97316"/>
  <rect x="290" y="240" width="620" height="120" rx="24" fill="#fff7ed" opacity="0.95"/>
  <text x="600" y="312" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="700" fill="#0f172a">VehicleHub</text>
</svg>`;

export const fallbackVehicleImage = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(fallbackSvg)}`;
export const fallbackHeroImage = fallbackVehicleImage;

export const carCatalog = [
    // ---- SUV ----
    {
        id: 'cat-suv-brezza', title: 'Maruti Suzuki Brezza', brand: 'Maruti Suzuki', model: 'Brezza',
        category: 'suv', fuelType: 'Petrol', transmission: 'Automatic',
        priceMin: 740000, priceMax: 1371000, year: 2026,
        image: img('photo-1533473359331-0135ef1b58bf'),
        launchedOn: '2026-07-24', variantTag: null,
        mileage: 8000, engine: '1.5L K-Series, 103 bhp', owner: 'New', color: 'Multiple',
        registrationNumber: 'Available on booking', location: 'Pan India',
        sellerName: 'Maruti Suzuki Authorized Dealer', status: 'Available',
        description: 'A well-rounded compact SUV known for reliability, mileage, and low running costs.',
        features: ['360-degree camera', 'Head-up display', '6 airbags', 'Automatic climate control'],
    },
    {
        id: 'cat-suv-punch', title: 'Tata Punch', brand: 'Tata', model: 'Punch',
        category: 'suv', fuelType: 'Petrol', transmission: 'Manual',
        priceMin: 570000, priceMax: 1067000, year: 2026,
        image: img('photo-1552519507-da3b142c6e3d'),
        launchedOn: '2026-07-20',
        mileage: 6000, engine: '1.2L Revotron', owner: 'New', color: 'Multiple',
        registrationNumber: 'Available on booking', location: 'Pan India',
        sellerName: 'Tata Motors Authorized Dealer', status: 'Available',
        description: 'India\'s highest safety-rated micro-SUV, built for city and highway comfort alike.',
        features: ['5-star GNCAP rating', 'Sunroof', 'Cruise control', '10.25" touchscreen'],
    },
    {
        id: 'cat-suv-sierra', title: 'Tata Sierra', brand: 'Tata', model: 'Sierra',
        category: 'suv', fuelType: 'Petrol', transmission: 'Automatic',
        priceMin: 1149000, priceMax: 2129000, year: 2026,
        image: img('photo-1519641471654-76ce0107ad1b'),
        launchedOn: '2026-07-24', variantTag: 'New Variant',
        mileage: 3000, engine: '1.5L Turbo Petrol', owner: 'New', color: 'Multiple',
        registrationNumber: 'Available on booking', location: 'Pan India',
        sellerName: 'Tata Motors Authorized Dealer', status: 'Available',
        description: 'The iconic Sierra silhouette, reborn as a premium 5-seat SUV with a panoramic curved-glass roof.',
        features: ['Curved glass roof', 'ADAS Level 2', 'JBL sound system', 'Panoramic sunroof'],
    },
    {
        id: 'cat-suv-scorpio', title: 'Mahindra Scorpio N', brand: 'Mahindra', model: 'Scorpio N',
        category: 'suv', fuelType: 'Diesel', transmission: 'Automatic',
        priceMin: 1349000, priceMax: 2495000, year: 2026,
        image: img('photo-1621007947382-bb3c3994e3fb'),
        launchedOn: '2026-06-30',
        mileage: 15000, engine: '2.2L mHawk Diesel', owner: '1st Owner', color: 'Napoli Black',
        registrationNumber: 'MH-04-XX-4521', location: 'Mumbai',
        sellerName: 'Mahindra Certified Pre-Owned', status: 'Available',
        description: 'A rugged, full-size SUV with commanding road presence and serious off-road capability.',
        features: ['4XPLOR 4WD', '7 seats', 'Ventilated seats', 'Sony 3D sound system'],
    },

    // ---- Electric ----
    {
        id: 'cat-ev-vitara', title: 'Maruti Suzuki e Vitara', brand: 'Maruti Suzuki', model: 'e Vitara',
        category: 'suv', fuelType: 'Electric', transmission: 'Automatic', isElectric: true,
        priceMin: 1599000, priceMax: 2001000, year: 2026,
        image: img('photo-1617788138017-80ad40651399'),
        launchedOn: '2026-06-01',
        mileage: 2000, engine: '49 kWh Battery, 428 km range', owner: 'New', color: 'Multiple',
        registrationNumber: 'Available on booking', location: 'Pan India',
        sellerName: 'Maruti Suzuki Authorized Dealer', status: 'Available',
        description: 'Maruti Suzuki\'s first ground-up electric SUV, built on the Heartect-e platform.',
        features: ['428 km range', 'DC fast charging', 'e-Vitara flex seating', 'V2L support'],
    },  
    
    {
        id: 'cat-ev-punch', title: 'Tata Punch EV', brand: 'Tata', model: 'Punch EV',
        category: 'suv', fuelType: 'Electric', transmission: 'Automatic', isElectric: true,
        priceMin: 969000, priceMax: 1259000, year: 2026,
        image: img('photo-1615719413546-198b25453f85'),
        launchedOn: '2026-05-12',
        mileage: 5000, engine: '35 kWh Battery, 421 km range', owner: 'New', color: 'Multiple',
        registrationNumber: 'Available on booking', location: 'Pan India',
        sellerName: 'Tata Motors Authorized Dealer', status: 'Available',
        description: 'Compact EV with segment-best real-world range and Tata\'s acti.ev platform.',
        features: ['421 km range', 'Fast charging 10-80% in 56 min', 'Arcade.ev app suite'],
    },
    {
        id: 'cat-ev-be6', title: 'Mahindra BE 6', brand: 'Mahindra', model: 'BE 6',
        category: 'suv', fuelType: 'Electric', transmission: 'Automatic', isElectric: true,
        priceMin: 1890000, priceMax: 2849000, year: 2026,
        image: img('photo-1554744512-d6c603f27d85'),
        launchedOn: '2026-03-18',
        mileage: 3200, engine: '79 kWh Battery, 682 km range', owner: 'New', color: 'Multiple',
        registrationNumber: 'Available on booking', location: 'Pan India',
        sellerName: 'Mahindra Authorized Dealer', status: 'Available',
        description: 'Born-electric coupe-SUV on the INGLO platform with striking futuristic design.',
        features: ['682 km range', '175 kW fast charging', 'ADAS Level 2+', 'Panoramic display'],
    },
    {
        id: 'cat-ev-tiago', title: 'Tata Tiago EV', brand: 'Tata', model: 'Tiago EV',
        category: 'hatchback', fuelType: 'Electric', transmission: 'Automatic', isElectric: true,
        priceMin: 699000, priceMax: 999000, year: 2026,
        image: img('photo-1511919884226-fd3cad34687c'),
        launchedOn: '2026-04-05',
        mileage: 4000, engine: '24 kWh Battery, 315 km range', owner: 'New', color: 'Multiple',
        registrationNumber: 'Available on booking', location: 'Pan India',
        sellerName: 'Tata Motors Authorized Dealer', status: 'Available',
        description: 'India\'s most affordable electric hatchback, ideal for daily city commutes.',
        features: ['315 km range', 'Sub-4 lakh entry variant', 'Fast charging'],
    },

    // ---- Upcoming ----
    {
        id: 'cat-up-elevate-ev', title: 'Honda Elevate EV', brand: 'Honda', model: 'Elevate EV',
        category: 'suv', fuelType: 'Electric', transmission: 'Automatic', isUpcoming: true, isElectric: true,
        estimatedPrice: 1800000, expectedLaunch: '2026-08-15',
        image: img('photo-1580414057403-c5cb6f8870ae'), variantTag: null,
        mileage: 0, engine: 'TBA', owner: 'New', color: 'TBA', registrationNumber: 'Not launched',
        location: 'Pan India', sellerName: 'Honda Cars India', status: 'Upcoming',
        description: 'Honda\'s upcoming electric SUV, expected to share its platform with the Elevate.',
        features: ['Expected 350+ km range', 'ADAS suite (expected)'],
    },
    {
        id: 'cat-up-thar-e', title: 'Mahindra Thar E', brand: 'Mahindra', model: 'Thar E',
        category: 'suv', fuelType: 'Electric', transmission: 'Automatic', isUpcoming: true, isElectric: true,
        estimatedPrice: 2500000, expectedLaunch: '2026-08-15',
        image: img('photo-1533106418989-88406c7cc8ca'),
        mileage: 0, engine: 'TBA', owner: 'New', color: 'TBA', registrationNumber: 'Not launched',
        location: 'Pan India', sellerName: 'Mahindra Authorized Dealer', status: 'Upcoming',
        description: 'An all-electric take on the legendary Thar, retaining its rugged off-road DNA.',
        features: ['Dual-motor AWD (expected)', 'Removable roof'],
    },
    {
        id: 'cat-up-scorpio-facelift', title: 'Mahindra Scorpio N Facelift', brand: 'Mahindra', model: 'Scorpio N Facelift',
        category: 'suv', fuelType: 'Diesel', transmission: 'Automatic', isUpcoming: true,
        estimatedPrice: 1350000, expectedLaunch: '2026-08-15', variantTag: 'Facelift',
        image: img('photo-1605559424843-9e4c228bf1c2'),
        mileage: 0, engine: '2.2L mHawk Diesel', owner: 'New', color: 'TBA', registrationNumber: 'Not launched',
        location: 'Pan India', sellerName: 'Mahindra Authorized Dealer', status: 'Upcoming',
        description: 'A refreshed Scorpio N with updated styling and feature additions.',
        features: ['Updated grille', 'New infotainment'],
    },
    {
        id: 'cat-up-globalpickup', title: 'Mahindra Global Pik Up', brand: 'Mahindra', model: 'Global Pik Up',
        category: 'suv', fuelType: 'Diesel', transmission: 'Manual', isUpcoming: true,
        estimatedPrice: 2500000, expectedLaunch: '2026-08-16',
        image: img('photo-1595234524293-4f4c2c9c1b3a'),
        mileage: 0, engine: 'TBA', owner: 'New', color: 'TBA', registrationNumber: 'Not launched',
        location: 'Pan India', sellerName: 'Mahindra Authorized Dealer', status: 'Upcoming',
        description: 'Mahindra\'s global pickup platform, aimed at lifestyle and light-commercial buyers.',
        features: ['Roof rails', 'Body-on-frame construction'],
    },

    // ---- Latest ----
    {
        id: 'cat-latest-mini', title: 'Mini Cooper Convertible', brand: 'Mini', model: 'Cooper Convertible',
        category: 'luxury', fuelType: 'Petrol', transmission: 'Automatic',
        priceMin: 5900000, priceMax: 6290000, year: 2026,
        image: img('photo-1503376780353-7e6692767b70'),
        launchedOn: '2026-07-29', variantTag: null,
        mileage: 1000, engine: '2.0L Turbo Petrol', owner: 'New', color: 'Multiple',
        registrationNumber: 'Available on booking', location: 'Pan India',
        sellerName: 'Mini Authorized Dealer', status: 'Available',
        description: 'A stylish soft-top convertible blending retro charm with modern performance.',
        features: ['Electric soft-top roof', 'Harman Kardon audio', 'Adaptive suspension'],
    },
    {
        id: 'cat-latest-hilux', title: 'Toyota Hilux', brand: 'Toyota', model: 'Hilux',
        category: 'suv', fuelType: 'Diesel', transmission: 'Automatic',
        priceMin: 3199000, priceMax: 3669000, year: 2026,
        image: img('photo-1568605117036-5fe5e7bab0b7'),
        launchedOn: '2026-07-28', variantTag: 'Facelift',
        mileage: 2000, engine: '2.8L Diesel', owner: 'New', color: 'Multiple',
        registrationNumber: 'Available on booking', location: 'Pan India',
        sellerName: 'Toyota Authorized Dealer', status: 'Available',
        description: 'A tough, capable pickup with a refreshed face and updated cabin tech.',
        features: ['4WD low-range', 'Tow capacity 3.5T', 'JBL premium audio'],
    },
    {
        id: 'cat-latest-brezza', title: 'Maruti Suzuki Brezza', brand: 'Maruti Suzuki', model: 'Brezza',
        category: 'suv', fuelType: 'Petrol', transmission: 'Automatic',
        priceMin: 740000, priceMax: 1371000, year: 2026,
        image: img('photo-1533473359331-0135ef1b58bf'),
        launchedOn: '2026-07-24',
        mileage: 500, engine: '1.5L K-Series', owner: 'New', color: 'Multiple',
        registrationNumber: 'Available on booking', location: 'Pan India',
        sellerName: 'Maruti Suzuki Authorized Dealer', status: 'Available',
        description: 'A well-rounded compact SUV known for reliability, mileage, and low running costs.',
        features: ['360-degree camera', 'Head-up display', '6 airbags'],
    },
    {
        id: 'cat-latest-zrv', title: 'Honda ZR-V', brand: 'Honda', model: 'ZR-V',
        category: 'suv', fuelType: 'Petrol', transmission: 'Automatic',
        priceMin: 4799000, priceMax: 4799000, year: 2026,
        image: img('photo-1541348263662-e068662d82af'),
        launchedOn: '2026-07-25',
        mileage: 800, engine: '2.0L e:HEV Hybrid', owner: 'New', color: 'Multiple',
        registrationNumber: 'Available on booking', location: 'Pan India',
        sellerName: 'Honda Cars India', status: 'Available',
        description: 'A premium hybrid crossover with refined ride quality and strong fuel efficiency.',
        features: ['Hybrid powertrain', 'Honda Sensing suite', 'Wireless CarPlay/Android Auto'],
    },
];

export const popularBrands = [
    { name: 'Maruti Suzuki', initials: 'MS', icon: 'CarFront', color: 'text-[#001f3f]', bg: 'bg-[#e6f2ff]' },
    { name: 'Tata', initials: 'TT', icon: 'Truck', color: 'text-[#001f3f]', bg: 'bg-[#e6f2ff]' },
    { name: 'Kia', initials: 'KA', icon: 'Sparkles', color: 'text-[#001f3f]', bg: 'bg-[#e6f2ff]' },
    { name: 'Toyota', initials: 'TY', icon: 'Car', color: 'text-[#001f3f]', bg: 'bg-[#e6f2ff]' },
    { name: 'Hyundai', initials: 'HY', icon: 'Bolt', color: 'text-[#001f3f]', bg: 'bg-[#e6f2ff]' },
    { name: 'Mahindra', initials: 'MH', icon: 'BusFront', color: 'text-[#001f3f]', bg: 'bg-[#e6f2ff]' },
];

export const categoryTabs = [
    { id: 'suv', label: 'SUV' },
    { id: 'hatchback', label: 'Hatchback' },
    { id: 'sedan', label: 'Sedan' },
    { id: 'muv', label: 'MUV' },
    { id: 'luxury', label: 'Luxury' },
];

// Normalizes a catalog entry into the shape VehicleDetailPage / VehicleCard expect.
export const normalizeCatalogCar = (car) => ({
    ...car,
    price: car.priceMin ?? car.estimatedPrice ?? 0,
    images: [car.image],
    sellerName: car.sellerName,
});

export const formatLakh = (value) => {
    if (!value) return 'Price on request';
    return `₹${(value / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`;
};

export const formatPriceRange = (car) => {
    if (car.isUpcoming) return `${formatLakh(car.estimatedPrice)}*`;
    if (car.priceMin === car.priceMax) return `${formatLakh(car.priceMin)}*`;
    return `${formatLakh(car.priceMin)} - ${formatLakh(car.priceMax).replace('₹', '')}*`;
};