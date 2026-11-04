/**
 * Mock marketplace data (jobs, offers, orders, skills).
 * Deterministic (index-based, no Math.random) so server and client renders match.
 * Replace each export with an API call when wiring up the backend.
 */

export const CATEGORY_NAMES = [
  "Development & IT",
  "Design & Creative",
  "Writing & Translation",
  "Sales & Marketing",
  "Admin Support",
  "Finance & Accounting",
];

export const PEOPLE = [
  "Arif Hossain", "Mira Chowdhury", "Sakib Ahmed", "Farzana Islam", "Rafiq Uddin", "Tanvir Karim",
  "Nadia Rahman", "Tom Becker", "Lena Ortiz", "Omar Farooq", "Priya Nair", "Jonas Weber",
  "Ayesha Siddiqua", "Daniel Moreno", "Sumaiya Akter", "Kenji Sato",
];

export const CLIENTS = [
  "Brightline LLC", "Kumo Studio", "Orbit Labs", "Nadia Rahman", "Tom Becker", "Lena Ortiz",
  "Greenleaf Foods", "Pixel & Co", "Northwind Traders", "Daniel Moreno", "Atlas Health", "Bluefin Media",
];

/** ISO date `daysAgo` days before 2026-11-04 (the mock "today"). */
export const daysAgo = (n) => new Date(Date.UTC(2026, 10, 4) - n * 86400000).toISOString().slice(0, 10);
const pick = (arr, i) => arr[i % arr.length];

// ---------------------------------------------------------------- Jobs
const JOB_TITLES = [
  "Build a React admin dashboard",
  "Logo and brand guidelines for a bakery",
  "Translate product catalog EN → BN",
  "Facebook ads campaign for Eid sale",
  "Virtual assistant for inbox management",
  "Bookkeeping for a small agency",
  "Laravel REST API for a delivery app",
  "Mobile app UI redesign in Figma",
  "SEO blog articles (10 × 1,500 words)",
  "Shopify store setup and theme tweaks",
  "Data entry from scanned invoices",
  "Quarterly tax filing support",
];
const JOB_STATUSES = ["Open", "Open", "Pending approval", "In progress", "Open", "Closed", "Rejected", "Pending approval"];

export const jobs = Array.from({ length: 36 }, (_, i) => {
  const hourly = i % 3 === 1;
  return {
    id: `JOB-${2400 + i}`,
    title: pick(JOB_TITLES, i),
    client: pick(CLIENTS, i * 5),
    category: pick(CATEGORY_NAMES, i),
    budgetType: hourly ? "Hourly" : "Fixed",
    budget: hourly ? 12 + ((i * 7) % 30) : 150 + ((i * 373) % 2800),
    proposals: (i * 11) % 42,
    posted: daysAgo(i),
    status: pick(JOB_STATUSES, i * 3),
    description:
      "We're looking for an experienced freelancer to help us deliver this project on a tight timeline. Please include relevant portfolio links in your proposal.",
  };
});

// ---------------------------------------------------------------- Offers (freelancer gigs)
const OFFER_TITLES = [
  "I will build a responsive Next.js website",
  "I will design a modern minimalist logo",
  "I will translate English to Bangla professionally",
  "I will run your Google Ads campaign",
  "I will be your virtual assistant",
  "I will prepare your financial statements",
  "I will develop a custom WordPress plugin",
  "I will design your mobile app UI",
  "I will write SEO-optimized blog posts",
  "I will edit your YouTube videos",
];
const OFFER_STATUSES = ["Active", "Active", "Pending review", "Active", "Paused", "Rejected", "Active", "Pending review"];

export const offers = Array.from({ length: 30 }, (_, i) => ({
  id: `GIG-${5100 + i}`,
  title: pick(OFFER_TITLES, i),
  freelancer: pick(PEOPLE, i * 3),
  category: pick(CATEGORY_NAMES, i),
  price: 25 + ((i * 97) % 600),
  orders: (i * 13) % 140,
  rating: Math.round((4 + ((i * 7) % 10) / 10) * 10) / 10,
  created: daysAgo(i * 4),
  status: pick(OFFER_STATUSES, i * 5),
}));

// ---------------------------------------------------------------- Orders
const ORDER_STATUSES = ["In progress", "Delivered", "Completed", "Completed", "In progress", "Disputed", "Cancelled", "Completed"];

export const orders = Array.from({ length: 44 }, (_, i) => {
  const amount = 40 + ((i * 211) % 1900);
  return {
    id: `ORD-${10482 - i}`,
    gig: pick(OFFER_TITLES, i * 3).replace(/^I will /, "").replace(/^./, (c) => c.toUpperCase()),
    client: pick(CLIENTS, i),
    freelancer: pick(PEOPLE, i * 5),
    category: pick(CATEGORY_NAMES, i * 2),
    amount,
    fee: Math.round(amount * 0.1),
    placed: daysAgo(Math.floor(i / 2)),
    due: daysAgo(Math.floor(i / 2) - 7),
    status: pick(ORDER_STATUSES, i * 3),
  };
});

// ---------------------------------------------------------------- Skills
const SKILLS = [
  ["React", "Development & IT"], ["Next.js", "Development & IT"], ["Laravel", "Development & IT"],
  ["Node.js", "Development & IT"], ["Flutter", "Development & IT"], ["Python", "Development & IT"],
  ["Figma", "Design & Creative"], ["Logo design", "Design & Creative"], ["Illustration", "Design & Creative"],
  ["Video editing", "Design & Creative"], ["Copywriting", "Writing & Translation"], ["Bangla translation", "Writing & Translation"],
  ["Technical writing", "Writing & Translation"], ["SEO", "Sales & Marketing"], ["Google Ads", "Sales & Marketing"],
  ["Social media marketing", "Sales & Marketing"], ["Data entry", "Admin Support"], ["Virtual assistance", "Admin Support"],
  ["Bookkeeping", "Finance & Accounting"], ["Tax preparation", "Finance & Accounting"],
];

export const skills = SKILLS.map(([name, category], i) => ({
  id: `SK-${100 + i}`,
  name,
  category,
  freelancers: 120 + ((i * 337) % 2400),
  jobs: 8 + ((i * 53) % 300),
  hasTest: i % 3 !== 2,
  active: i % 7 !== 6,
}));
