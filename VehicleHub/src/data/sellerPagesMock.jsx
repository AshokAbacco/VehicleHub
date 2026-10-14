export const inventoryStatusData = {
    'draft-vehicles': [
        { id: 'd1', title: 'Hyundai Creta 2024', category: 'SUV', price: 1450000, updatedAt: '2 days ago', completion: 60 },
        { id: 'd2', title: 'Royal Enfield Classic 350', category: 'Bike', price: 195000, updatedAt: '5 days ago', completion: 35 },
    ],
    'pending-approval': [
        { id: 'p1', title: 'Kia Seltos', category: 'SUV', price: 1250000, submittedAt: '1 day ago' },
        { id: 'p2', title: 'Honda City', category: 'Sedan', price: 1150000, submittedAt: '3 hours ago' },
    ],
    'approved-vehicles': [
        { id: 'a1', title: 'Maruti Suzuki Brezza', category: 'SUV', price: 1180000, approvedAt: '10 days ago' },
        { id: 'a2', title: 'Tata Punch EV', category: 'SUV', price: 990000, approvedAt: '24 days ago' },
    ],
    'rejected-vehicles': [
        { id: 'r1', title: 'Old Bajaj Pulsar', category: 'Bike', price: 45000, reason: 'Photos unclear / documents missing' },
    ],
    'active-listings': [
        { id: 'l1', title: 'BMW i7 xDrive60', category: 'Luxury', price: 18200000, views: 1820, leads: 12 },
        { id: 'l2', title: 'Tesla Model Y', category: 'EV', price: 1490000, views: 1430, leads: 8 },
    ],
    'sold-vehicles': [
        { id: 's1', title: 'Toyota Fortuner', category: 'SUV', price: 3500000, soldOn: 'Jul 20, 2026', buyer: 'Amit Sharma' },
    ],
};

export const customersData = [
    { id: 'c1', name: 'Amit Sharma', email: 'amit@example.com', phone: '+91 98765 43210', purchases: 1, status: 'Active' },
    { id: 'c2', name: 'Priya Nair', email: 'priya@example.com', phone: '+91 91234 56780', purchases: 0, status: 'Lead' },
];

export const inspectionRequestsData = [
    { id: 'i1', vehicle: 'BMW i7 xDrive60', customer: 'Amit Sharma', date: 'Aug 6, 2026', time: '11:00 AM', status: 'Pending' },
    { id: 'i2', vehicle: 'Tesla Model Y', customer: 'Priya Nair', date: 'Aug 7, 2026', time: '3:30 PM', status: 'Confirmed' },
];

export const invoicesData = [
    { id: 'INV-1042', customer: 'Amit Sharma', amount: 1820000, status: 'Paid', date: 'Jul 28, 2026' },
    { id: 'INV-1041', customer: 'Priya Nair', amount: 149000, status: 'Pending', date: 'Jul 25, 2026' },
];

export const paymentsData = [
    { id: 'PAY-901', method: 'Bank Transfer', amount: 1820000, status: 'Settled', date: 'Jul 29, 2026' },
    { id: 'PAY-900', method: 'UPI', amount: 45000, status: 'Processing', date: 'Jul 27, 2026' },
];

export const reviewsData = [
    { id: 'rv1', customer: 'Amit Sharma', rating: 5, text: 'Smooth buying experience, verified documents made it easy.', vehicle: 'BMW i7' },
    { id: 'rv2', customer: 'Priya Nair', rating: 4, text: 'Good response time, minor delay in inspection scheduling.', vehicle: 'Tesla Model Y' },
];

export const documentsData = [
    { id: 'doc1', name: 'Dealership License.pdf', status: 'Verified', uploadedAt: 'Jan 2026' },
    { id: 'doc2', name: 'GST Certificate.pdf', status: 'Verified', uploadedAt: 'Jan 2026' },
    { id: 'doc3', name: 'Business PAN.pdf', status: 'Pending review', uploadedAt: 'Jul 2026' },
];

export const teamMembersData = [
    { id: 't1', name: 'Rahul Verma', role: 'Owner', email: 'rahul@rkdealers.com', status: 'Active' },
    { id: 't2', name: 'Sneha Kapoor', role: 'Sales Executive', email: 'sneha@rkdealers.com', status: 'Active' },
];

export const vehicleReportsData = [
    { id: 'rep1', title: 'BMW i7 xDrive60', views: 1820, leads: 12, conversion: '0.66%' },
    { id: 'rep2', title: 'Tesla Model Y', views: 1430, leads: 8, conversion: '0.56%' },
];