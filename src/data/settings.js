/**
 * Mock settings data (catalog + localization).
 * Deterministic so server and client renders match. Replace with API calls later.
 */
import { daysAgo } from "@/data/marketplace";

const slugify = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// ---------------------------------------------------------------- Categories
const CATEGORY_DEFS = [
  ["Development & IT", "Web, mobile and software development, QA and DevOps."],
  ["Design & Creative", "Brand identity, UI/UX, illustration, video and motion."],
  ["Writing & Translation", "Copywriting, content, editing and translation services."],
  ["Sales & Marketing", "SEO, paid ads, social media and lead generation."],
  ["Admin Support", "Virtual assistance, data entry and customer support."],
  ["Finance & Accounting", "Bookkeeping, tax preparation and financial analysis."],
  ["Engineering & Architecture", "CAD, structural design and 3D modelling."],
  ["Legal", "Contract drafting, trademark filing and legal research."],
];

export const categories = CATEGORY_DEFS.map(([name, description], i) => ({
  id: `CAT-${10 + i}`,
  name,
  slug: slugify(name),
  description,
  jobs: 40 + ((i * 487) % 1200),
  active: i !== 7,
}));

export const CATEGORY_OPTIONS = categories.map((c) => c.name);

// ---------------------------------------------------------------- Subcategories
const SUB_DEFS = {
  "Development & IT": ["Web development", "Mobile apps", "WordPress", "E-commerce", "QA & testing", "DevOps & cloud"],
  "Design & Creative": ["Logo design", "UI/UX design", "Illustration", "Video editing", "Motion graphics"],
  "Writing & Translation": ["Blog writing", "Copywriting", "Translation", "Proofreading"],
  "Sales & Marketing": ["SEO", "Social media marketing", "Google Ads", "Email marketing"],
  "Admin Support": ["Virtual assistant", "Data entry", "Customer support"],
  "Finance & Accounting": ["Bookkeeping", "Tax preparation", "Financial modelling"],
  "Engineering & Architecture": ["CAD drafting", "3D modelling"],
  Legal: ["Contract drafting", "Trademark filing"],
};

export const subcategories = Object.entries(SUB_DEFS).flatMap(([category, names], ci) =>
  names.map((name, j) => {
    const i = ci * 7 + j;
    return {
      id: `SUB-${100 + i}`,
      name,
      slug: slugify(name),
      category,
      jobs: 5 + ((i * 131) % 420),
      active: (i * 3) % 11 !== 4,
    };
  })
);

// ---------------------------------------------------------------- Currencies
const CURRENCY_DEFS = [
  ["Bangladeshi Taka", "BDT", "৳", 121.5],
  ["US Dollar", "USD", "$", 1],
  ["Euro", "EUR", "€", 0.92],
  ["British Pound", "GBP", "£", 0.79],
  ["Indian Rupee", "INR", "₹", 84.2],
  ["Pakistani Rupee", "PKR", "₨", 278.4],
  ["UAE Dirham", "AED", "د.إ", 3.67],
  ["Saudi Riyal", "SAR", "﷼", 3.75],
  ["Malaysian Ringgit", "MYR", "RM", 4.46],
  ["Japanese Yen", "JPY", "¥", 151.3],
];

export const currencies = CURRENCY_DEFS.map(([name, code, symbol, rate], i) => ({
  id: `CUR-${code}`,
  name,
  code,
  symbol,
  rate,
  isDefault: code === "BDT",
  active: i < 8,
  updated: daysAgo(i % 4),
}));

export const CURRENCY_CODES = currencies.map((c) => c.code);

// ---------------------------------------------------------------- Countries
const COUNTRY_DEFS = [
  ["Bangladesh", "BD", "+880", "BDT"],
  ["India", "IN", "+91", "INR"],
  ["Pakistan", "PK", "+92", "PKR"],
  ["United States", "US", "+1", "USD"],
  ["United Kingdom", "GB", "+44", "GBP"],
  ["Germany", "DE", "+49", "EUR"],
  ["France", "FR", "+33", "EUR"],
  ["Spain", "ES", "+34", "EUR"],
  ["Netherlands", "NL", "+31", "EUR"],
  ["United Arab Emirates", "AE", "+971", "AED"],
  ["Saudi Arabia", "SA", "+966", "SAR"],
  ["Malaysia", "MY", "+60", "MYR"],
  ["Japan", "JP", "+81", "JPY"],
  ["Canada", "CA", "+1", "USD"],
  ["Australia", "AU", "+61", "USD"],
  ["Nepal", "NP", "+977", "USD"],
  ["Sri Lanka", "LK", "+94", "USD"],
  ["Singapore", "SG", "+65", "USD"],
  ["Qatar", "QA", "+974", "USD"],
  ["Italy", "IT", "+39", "EUR"],
];

export const countries = COUNTRY_DEFS.map(([name, iso2, phoneCode, currency], i) => ({
  id: `CTY-${iso2}`,
  name,
  iso2,
  phoneCode,
  currency,
  users: i === 0 ? 14820 : 60 + ((i * 1733) % 3900),
  active: i % 9 !== 8,
}));

// ---------------------------------------------------------------- Languages
const LANGUAGE_DEFS = [
  ["English", "English", "en", "LTR", 100],
  ["Bangla", "বাংলা", "bn", "LTR", 96],
  ["Hindi", "हिन्दी", "hi", "LTR", 72],
  ["Urdu", "اردو", "ur", "RTL", 58],
  ["Arabic", "العربية", "ar", "RTL", 64],
  ["Spanish", "Español", "es", "LTR", 81],
  ["French", "Français", "fr", "LTR", 47],
  ["German", "Deutsch", "de", "LTR", 33],
];

export const languages = LANGUAGE_DEFS.map(([name, nativeName, code, direction, progress], i) => ({
  id: `LANG-${code}`,
  name,
  nativeName,
  code,
  direction,
  progress,
  isDefault: code === "en",
  active: i < 6,
}));
