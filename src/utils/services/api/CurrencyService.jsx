import { ApiRequestHandler } from "@/utils/services/ApiRequestHandler";

/*
 * Currencies (staff token required). Resolves to `{ data, status }`, or `{ message, response }` on failure.
 * `rate` is units per 1 USD (USD is always 1) and only converts prices for display. Inactive currencies are
 * hidden from the web app (GET /lang-curr). There is no delete: jobs and wallets store the code as text.
 */

/** GET admin/currency → `data.data`: every currency, active first, then by name. */
export function getCurrencies() {
  return ApiRequestHandler({ method: "GET", endpoint: "admin/currency", includeAuth: true });
}

/**
 * POST admin/currency. Required: `code` (3 letters, can't be changed later), `name`. Optional: `symbol`,
 * `symbol_native`, `decimal_digits`, `rate`, `status`. Duplicate code → 409.
 */
export function createCurrency(body) {
  return ApiRequestHandler({ method: "POST", endpoint: "admin/currency", includeAuth: true, data: body });
}

/** PUT admin/currency/:id — changes only the fields sent (not `code`). Sending `rate` stamps `rateUpdatedAt`. */
export function updateCurrency(id, body) {
  return ApiRequestHandler({ method: "PUT", endpoint: `admin/currency/${encodeURIComponent(id)}`, includeAuth: true, data: body });
}

/** PUT admin/currency/:id/status — `{ status: true|false }`. */
export function setCurrencyStatus(id, status) {
  return ApiRequestHandler({ method: "PUT", endpoint: `admin/currency/${encodeURIComponent(id)}/status`, includeAuth: true, data: { status } });
}
