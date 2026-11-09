/**
 * Mock data for the frontend redesign. Replace each export with an API call
 * (see the old src/Helper/HttpRequestHelper.jsx) when wiring up the backend.
 */

export const kpis = [
  {
    key: "revenue",
    label: "Platform revenue",
    value: 48230,
    format: "currency",
    delta: 12.4,
    upIsGood: true,
    trend: [28, 30, 29, 33, 35, 34, 38, 40, 39, 43, 45, 48],
  },
  {
    key: "orders",
    label: "Active orders",
    value: 1284,
    delta: 6.1,
    upIsGood: true,
    trend: [900, 940, 980, 1010, 1000, 1060, 1100, 1150, 1170, 1210, 1250, 1284],
  },
  {
    key: "users",
    label: "New users",
    value: 3912,
    delta: -3.2,
    upIsGood: true,
    trend: [420, 410, 400, 395, 380, 372, 360, 350, 345, 338, 330, 326],
  },
  {
    key: "disputes",
    label: "Open disputes",
    value: 17,
    delta: -22.7,
    upIsGood: false,
    trend: [30, 28, 27, 26, 25, 24, 22, 22, 21, 19, 18, 17],
  },
];

const months = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
const gmv = [182, 176, 195, 210, 224, 218, 241, 256, 249, 272, 290, 312];
const fees = [21.8, 21.1, 23.4, 25.2, 26.9, 26.2, 28.9, 30.7, 29.9, 32.6, 34.8, 37.4];

/** Monthly totals in thousands (USD). */
export const revenueSeries = months.map((m, i) => ({ month: m, gmv: gmv[i], fees: fees[i] }));

export const ordersByCategory = [
  { category: "Development & IT", orders: 412 },
  { category: "Design & Creative", orders: 318 },
  { category: "Writing & Translation", orders: 204 },
  { category: "Sales & Marketing", orders: 176 },
  { category: "Admin Support", orders: 98 },
  { category: "Finance & Accounting", orders: 76 },
];

export const userSplit = { freelancers: 18420, clients: 9310 };

export const recentOrders = [
  { id: "ORD-10482", gig: "React dashboard development", client: "Nadia Rahman", freelancer: "Arif Hossain", amount: 1250, status: "In progress", date: "2026-11-04" },
  { id: "ORD-10481", gig: "Logo & brand identity", client: "Brightline LLC", freelancer: "Mira Chowdhury", amount: 340, status: "Delivered", date: "2026-11-04" },
  { id: "ORD-10480", gig: "SEO audit for e-commerce", client: "Tom Becker", freelancer: "Sakib Ahmed", amount: 220, status: "Completed", date: "2026-11-03" },
  { id: "ORD-10479", gig: "Mobile app UI kit", client: "Kumo Studio", freelancer: "Farzana Islam", amount: 880, status: "Disputed", date: "2026-11-03" },
  { id: "ORD-10478", gig: "Product description writing", client: "Lena Ortiz", freelancer: "Rafiq Uddin", amount: 95, status: "Cancelled", date: "2026-11-02" },
  { id: "ORD-10477", gig: "Laravel API integration", client: "Orbit Labs", freelancer: "Tanvir Karim", amount: 1600, status: "In progress", date: "2026-11-02" },
];

export const topFreelancers = [
  { name: "Arif Hossain", skill: "Full-stack developer", earnings: 18450, rating: 4.9, level: "Top rated" },
  { name: "Mira Chowdhury", skill: "Brand designer", earnings: 12320, rating: 5.0, level: "Level 2" },
  { name: "Tanvir Karim", skill: "Backend engineer", earnings: 11080, rating: 4.8, level: "Level 2" },
  { name: "Farzana Islam", skill: "UI/UX designer", earnings: 9740, rating: 4.9, level: "Level 1" },
];

export const pendingActions = [
  { label: "Withdrawal requests", count: 5, href: "/withdrawals", tone: "warning" },
  { label: "Disputes awaiting review", count: 3, href: "/disputes", tone: "error" },
  { label: "Reported gigs", count: 8, href: "/reports", tone: "error" },
  { label: "Jobs pending approval", count: 12, href: "/jobs", tone: "info" },
];

const firstNames = ["Arif", "Mira", "Sakib", "Farzana", "Rafiq", "Tanvir", "Nadia", "Tom", "Lena", "Omar", "Priya", "Jonas", "Ayesha", "Daniel", "Sumaiya", "Kenji"];
const lastNames = ["Hossain", "Chowdhury", "Ahmed", "Islam", "Uddin", "Karim", "Rahman", "Becker", "Ortiz", "Farooq", "Nair", "Weber", "Siddiqua", "Moreno", "Akter", "Sato"];
const countries = ["Bangladesh", "Germany", "United States", "India", "Spain", "Japan", "Pakistan", "United Kingdom"];
const statuses = ["Active", "Active", "Active", "Pending", "Suspended"];

export const users = Array.from({ length: 48 }, (_, i) => {
  const first = firstNames[i % firstNames.length];
  const last = lastNames[(i * 7) % lastNames.length];
  return {
    id: 1000 + i,
    name: `${first} ${last}`,
    email: `${first}.${last}${i}@example.com`.toLowerCase(),
    type: i % 3 === 0 ? "Client" : "Freelancer",
    country: countries[(i * 5) % countries.length],
    status: statuses[(i * 3) % statuses.length],
    verified: i % 4 !== 1,
    joined: new Date(Date.UTC(2026, 10, 4) - i * 86400000 * 3).toISOString().slice(0, 10),
    spentOrEarned: Math.round(((i * 937) % 9000) + 120),
  };
});
