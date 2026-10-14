import { dashboardStats, initialBlogs, initialInquiries, initialInspections, initialOrders, initialTickets, initialUsers, initialVehicles } from '../data/mockData.js';
import { carCatalog, normalizeCatalogCar } from '../data/catalogData.js';

let vehicles = [...initialVehicles];
let inquiries = [...initialInquiries];
let inspections = [...initialInspections];
let orders = [...initialOrders];
let tickets = [...initialTickets];
let blogs = [...initialBlogs];
let users = [...initialUsers];

export const mockApi = {
  getVehicles: async ({ category, brand, city, priceMax, search } = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 180));
    return vehicles.filter((vehicle) => {
      const matchesCategory = !category || category === 'all' || vehicle.category.toLowerCase() === category.toLowerCase();
      const matchesBrand = !brand || brand === 'all' || vehicle.brand.toLowerCase() === brand.toLowerCase();
      const matchesCity = !city || city === 'all' || vehicle.location.toLowerCase().includes(city.toLowerCase());
      const matchesPrice = !priceMax || vehicle.price <= priceMax;
      const matchesSearch = !search || `${vehicle.title} ${vehicle.description}`.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesBrand && matchesCity && matchesPrice && matchesSearch;
    });
  },
  getVehicleById: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 120));
    const marketplaceVehicle = vehicles.find((vehicle) => vehicle.id === id);
    if (marketplaceVehicle) return marketplaceVehicle;

    const catalogVehicle = carCatalog.find((vehicle) => vehicle.id === id);
    return catalogVehicle ? normalizeCatalogCar(catalogVehicle) : null;
  },
  createListing: async (payload) => {
    await new Promise((resolve) => setTimeout(resolve, 220));
    const newVehicle = {
      ...payload,
      id: `veh-${Date.now()}`,
      status: 'Pending Approval',
      views: 0,
      verifiedSeller: true,
      documents: ['RC', 'Insurance'],
      images: payload.images?.length ? payload.images : ['https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80'],
    };
    vehicles.unshift(newVehicle);
    return newVehicle;
  },
  createInquiry: async (payload) => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const inquiry = { id: `inq-${Date.now()}`, status: 'New', createdAt: new Date().toISOString().slice(0, 10), ...payload };
    inquiries.unshift(inquiry);
    return inquiry;
  },
  getInquiries: async () => inquiries,
  scheduleInspection: async (payload) => {
    await new Promise((resolve) => setTimeout(resolve, 180));
    const inspection = { id: `insp-${Date.now()}`, status: 'Scheduled', ...payload };
    inspections.unshift(inspection);
    return inspection;
  },
  getInspections: async () => inspections,
  createOrder: async (payload) => {
    await new Promise((resolve) => setTimeout(resolve, 230));
    const order = { id: `ord-${Date.now()}`, status: 'Paid', createdAt: new Date().toISOString().slice(0, 10), ...payload };
    orders.unshift(order);
    return order;
  },
  getOrders: async () => orders,
  getTickets: async () => tickets,
  getBlogs: async () => blogs,
  getDashboardStats: async () => dashboardStats,
  getUsers: async () => users,
  getOverviewData: async () => [
    { name: 'Jan', sales: 120 },
    { name: 'Feb', sales: 180 },
    { name: 'Mar', sales: 210 },
    { name: 'Apr', sales: 260 },
    { name: 'May', sales: 310 },
    { name: 'Jun', sales: 290 },
  ],
};
