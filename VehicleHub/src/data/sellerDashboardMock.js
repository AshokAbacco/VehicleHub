export const sellerDashboardData = {
  stats: [
    { title: 'Total listings', value: 128, subtitle: 'Across all categories', color: 'from-cyan-500 to-fuchsia-500' },
    { title: 'Active listings', value: 84, subtitle: 'Visible to buyers', color: 'from-emerald-500 to-cyan-500' },
    { title: 'Pending approval', value: 12, subtitle: 'Awaiting moderation', color: 'from-amber-500 to-orange-400' },
    { title: 'Rejected listings', value: 5, subtitle: 'Needs review', color: 'from-rose-500 to-fuchsia-500' },
    { title: 'Draft vehicles', value: 27, subtitle: 'Incomplete listings', color: 'from-slate-500 to-slate-400' },
    { title: 'Sold vehicles', value: 102, subtitle: 'This quarter', color: 'from-violet-500 to-slate-500' },
    { title: "Today's leads", value: 16, subtitle: 'New buyer inquiries', color: 'from-fuchsia-500 to-pink-500' },
    // { title: 'Open inspections', value: 7, subtitle: 'Scheduled this week', color: 'from-cyan-500 to-sky-500' },
    { title: 'Revenue', value: '₹14.8L', subtitle: 'Net realized' },
 
  ],
  charts: {
   
  },
  latestLeads: [
    { id: 1, buyer: 'Aarav Sharma', vehicle: '2022 Mahindra Thar LX', price: '₹14.3L', inspection: 'Jul 31', status: 'Inspection Booked' },
    { id: 2, buyer: 'Priya Nair', vehicle: '2023 Tata Nexon EV Max', price: '₹16.1L', inspection: 'Aug 1', status: 'Offer Pending' },
    { id: 3, buyer: 'Rohan Mehta', vehicle: '2021 Hyundai Creta SX', price: '₹12.6L', inspection: 'Aug 2', status: 'Finance Pending' },
  ],
  inspections: [
    { id: 1, vehicle: '2022 Mahindra Thar LX', date: '2026-07-31', time: '10:00 AM', buyer: 'Aarav Sharma', status: 'Confirmed' },
    { id: 2, vehicle: '2023 Tata Nexon EV Max', date: '2026-08-01', time: '11:30 AM', buyer: 'Priya Nair', status: 'Pending' },
    { id: 3, vehicle: '2021 Hyundai Creta SX', date: '2026-08-02', time: '02:00 PM', buyer: 'Rohan Mehta', status: 'Confirmed' },
  ],
  messages: [
    { id: 1, buyer: 'Ananya Singh', subject: 'Inspection details', preview: 'Please share available inspection slots for the Creta.', unread: true, time: '2m ago' },
    { id: 2, buyer: 'Vikram Patel', subject: 'Offer follow-up', preview: 'Can you adjust the final quote by ₹15,000?', unread: false, time: '1h ago' },
    { id: 3, buyer: 'Sana Khan', subject: 'Loan approved', preview: 'I have received bank approval for the Nexon.', unread: false, time: '3h ago' },
  ],
  notifications: [
    { id: 1, title: 'Vehicle approved', description: 'Your listing for 2022 Thar LX has been approved.', time: '10m ago', type: 'success' },
    { id: 2, title: 'New lead received', description: 'Priya Nair sent an inquiry for Nexon EV Max.', time: '30m ago', type: 'info' },
    { id: 3, title: 'Payment reminder', description: 'Pending payout for 2023 Creta SX is due tomorrow.', time: '1h ago', type: 'warning' },
  ],
  topVehicles: [
    { id: 1, title: '2022 Mahindra Thar LX', sold: 18, views: 620, revenue: '₹24.3L' },
    { id: 2, title: '2023 Tata Nexon EV Max', sold: 14, views: 540, revenue: '₹18.8L' },
    { id: 3, title: '2021 Hyundai Creta SX', sold: 12, views: 500, revenue: '₹15.1L' },
  ],
  mostViewed: [
    { id: 1, title: '2022 Mahindra Thar LX', category: 'SUV', views: 620 },
    { id: 2, title: '2023 Tata Nexon EV Max', category: 'EV', views: 540 },
    { id: 3, title: '2021 Hyundai Creta SX', category: 'Compact SUV', views: 500 },
  ],
  recentOrders: [
    { id: 'ORD-4531', buyer: 'Aarav Sharma', vehicle: 'Thar LX', amount: '₹14.3L', status: 'Completed' },
    { id: 'ORD-4532', buyer: 'Priya Nair', vehicle: 'Nexon EV Max', amount: '₹16.1L', status: 'Processing' },
    { id: 'ORD-4533', buyer: 'Rohan Mehta', vehicle: 'Hyundai Creta SX', amount: '₹12.6L', status: 'Pending' },
  ],
  performance: {
    score: 92,
    health: 88,
    completion: 83,
    tips: [
      'Publish detailed inspection reports to increase buyer trust.',
      'Highlight finance-ready vehicles for faster conversions.',
      'Refresh 5 listings with new photos this week.',
    ],
  },
};


export const sellerNotifications = [
    { id: 'n1', type: 'purchase_request', title: 'New purchase request', description: 'Aarav Sharma wants to buy your 2022 Mahindra Thar LX for ₹14.3L.', time: '5m ago', read: false, buyer: 'Aarav Sharma', vehicle: '2022 Mahindra Thar LX' },
    { id: 'n2', type: 'message', title: 'New message', description: 'Priya Nair: "Can you adjust the final quote by ₹15,000?"', time: '18m ago', read: false, buyer: 'Priya Nair' },
    { id: 'n3', type: 'approval', title: 'Vehicle approved', description: 'Your listing for 2022 Thar LX has been approved and is now live.', time: '1h ago', read: false },
    { id: 'n4', type: 'inspection', title: 'Inspection confirmed', description: 'Rohan Mehta confirmed the inspection slot for Hyundai Creta SX.', time: '2h ago', read: true },
    { id: 'n5', type: 'payment', title: 'Payment received', description: '₹14,30,000 settled for order ORD-4531.', time: '5h ago', read: true },
    { id: 'n6', type: 'rejection', title: 'Listing needs changes', description: 'Bajaj Pulsar listing was rejected — photos unclear.', time: '1d ago', read: true },
];

export const sellerConversations = [
    {
        id: 'c1',
        buyer: 'Aarav Sharma',
        vehicle: '2022 Mahindra Thar LX',
        avatarColor: 'from-cyan-500 to-blue-500',
        messages: [
            { id: 'm1', sender: 'buyer', text: 'Hi, is the Thar LX still available?', time: '2026-08-03T10:12:00' },
            { id: 'm2', sender: 'seller', text: 'Yes, it is! Would you like to schedule an inspection?', time: '2026-08-03T10:20:00' },
            { id: 'm3', sender: 'buyer', text: 'Yes please, and I\'d like to make an offer of ₹14.3L.', time: '2026-08-03T10:25:00' },
        ],
    },
    {
        id: 'c2',
        buyer: 'Priya Nair',
        vehicle: '2023 Tata Nexon EV Max',
        avatarColor: 'from-fuchsia-500 to-pink-500',
        messages: [
            { id: 'm1', sender: 'buyer', text: 'Can you adjust the final quote by ₹15,000?', time: '2026-08-03T09:00:00' },
            { id: 'm2', sender: 'seller', text: 'Let me check with the team and get back to you shortly.', time: '2026-08-03T09:10:00' },
        ],
    },
    {
        id: 'c3',
        buyer: 'Sana Khan',
        vehicle: '2023 Tata Nexon EV Max',
        avatarColor: 'from-emerald-500 to-cyan-500',
        messages: [
            { id: 'm1', sender: 'buyer', text: 'I have received bank approval for the Nexon.', time: '2026-08-02T18:30:00' },
            { id: 'm2', sender: 'seller', text: 'Great news! Let\'s finalize the paperwork this week.', time: '2026-08-02T18:45:00' },
        ],
    },
];