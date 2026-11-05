import { ApiRequestHandler } from "@/utils/services/ApiRequestHandler";

/*
 * Countries (staff token required). Resolves to `{ data, status }`, or `{ message, response }` on failure.
 * Inactive countries are hidden from sign-up on the web app (GET /country-codes).
 */

/** GET admin/countries → `data.data`: every country, sorted by name. */
export function getCountries() {
  return ApiRequestHandler({ method: "GET", endpoint: "admin/countries", includeAuth: true });
}

/**
 * POST admin/countries. Required: `country`, `abbreviation` (2 letters), `calling_code`, `capital`, `continent`,
 * `currency_code` (3 letters), `currency_name`. Optional: `flag` (emoji), `is_active`. Duplicates → 409.
 */
export function createCountry(body) {
  return ApiRequestHandler({ method: "POST", endpoint: "admin/countries", includeAuth: true, data: body });
}

/** PUT admin/countries/:id — same fields as create, only the ones sent change. */
export function updateCountry(id, body) {
  return ApiRequestHandler({ method: "PUT", endpoint: `admin/countries/${encodeURIComponent(id)}`, includeAuth: true, data: body });
}

/** DELETE admin/countries/:id */
export function deleteCountry(id) {
  return ApiRequestHandler({ method: "DELETE", endpoint: `admin/countries/${encodeURIComponent(id)}`, includeAuth: true });
}
