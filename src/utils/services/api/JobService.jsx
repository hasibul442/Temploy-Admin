import { ApiRequestHandler } from "@/utils/services/ApiRequestHandler";

/*
 * Jobs (staff token required). Resolves to `{ data, status }`, or `{ message, response }` on failure.
 */

/**
 * GET admin/jobs → `data.data` (jobs, newest first) and `data.pagination` ({ page, limit, total, total_pages }).
 * params: `page` (1-based), `limit` (max 100), `search`, `status` (open|in_progress|completed|closed|expired),
 * `urgency` (normal|urgent), `category_id`, `posted_by`.
 */
export function getJobs(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ).toString();
  return ApiRequestHandler({ method: "GET", endpoint: `admin/jobs${query ? `?${query}` : ""}`, includeAuth: true });
}

/** GET admin/jobs/:id → `data.data`: `{ job, summary, hired, proposals, bookings }` (bookings carry `timeline`). */
export function getJob(id) {
  return ApiRequestHandler({ method: "GET", endpoint: `admin/jobs/${encodeURIComponent(id)}`, includeAuth: true });
}

/**
 * PUT admin/jobs/:id — only the fields sent change: `title`, `description`, `status`, `urgency`,
 * `expires_at` (ISO UTC), `category_id`, `subcategory_id`.
 */
export function updateJob(id, body) {
  return ApiRequestHandler({ method: "PUT", endpoint: `admin/jobs/${encodeURIComponent(id)}`, includeAuth: true, data: body });
}
