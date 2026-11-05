import { ApiRequestHandler } from "@/utils/services/ApiRequestHandler";

/*
 * Marketplace users (staff token required). Resolves to `{ data, status }`, or `{ message, response }` on failure.
 * A deactivated user (`isActive: false`) is refused on every request they make.
 */

/**
 * GET admin/users → `data.data` (users, newest first) and `data.pagination` ({ page, limit, total, total_pages }).
 * params: `page` (1-based), `limit` (max 100), `search`, `role` (employer|freelancer), `status` (active|inactive), `kyc`.
 */
export function getUsers(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ).toString();
  return ApiRequestHandler({ method: "GET", endpoint: `admin/users${query ? `?${query}` : ""}`, includeAuth: true });
}

/** GET admin/users/:id — with profile and activity counts. */
export function getUser(id) {
  return ApiRequestHandler({ method: "GET", endpoint: `admin/users/${encodeURIComponent(id)}`, includeAuth: true });
}

/**
 * PUT admin/users/:id — only the fields sent change: `f_name`, `l_name`, `email`, `phone`, `country` (ISO alpha-2),
 * `user_role`, `user_type` (REGULAR|PRO), `is_email_verified`, `is_phone_verified`. Email/phone taken → 409.
 */
export function updateUser(id, body) {
  return ApiRequestHandler({ method: "PUT", endpoint: `admin/users/${encodeURIComponent(id)}`, includeAuth: true, data: body });
}

/** PUT admin/users/:id/status — `{ status: true|false }` activates or deactivates. */
export function setUserStatus(id, status) {
  return ApiRequestHandler({ method: "PUT", endpoint: `admin/users/${encodeURIComponent(id)}/status`, includeAuth: true, data: { status } });
}
