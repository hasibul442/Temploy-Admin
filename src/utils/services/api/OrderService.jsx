import { ApiRequestHandler } from "@/utils/services/ApiRequestHandler";

/*
 * Orders (staff token required). An order is a booking: a hired job or a gig. Read-only.
 * Resolves to `{ data, status }`, or `{ message, response }` on failure.
 */

/**
 * GET admin/orders → `data.data` (newest first), `data.pagination` and `data.summary`:
 * `byStatus` ({ CONFIRMED: 3, … }, ignores `status`) and `totals` (per currency: count, orderValueCents, platformFeesCents).
 * params: `page`, `limit` (max 100), `status` (comma-separated, lower case), `search`, `source` (job|gig),
 * `category_id`, `user_id`, `from`, `to`.
 */
export function getOrders(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ).toString();
  return ApiRequestHandler({ method: "GET", endpoint: `admin/orders${query ? `?${query}` : ""}`, includeAuth: true });
}

/** GET admin/orders/:id → `data.data`: the order with `timeline` (booking events) and `tracking` (milestone steps). */
export function getOrder(id) {
  return ApiRequestHandler({ method: "GET", endpoint: `admin/orders/${encodeURIComponent(id)}`, includeAuth: true });
}
