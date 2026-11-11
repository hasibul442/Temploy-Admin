import { ApiRequestHandler } from "@/utils/services/ApiRequestHandler";

/*
 * Staff accounts and roles (staff token with a `team` permission). Resolves to `{ data, status }`,
 * or `{ message, response }` on failure.
 */

/**
 * GET admin/employees → `data.data` (newest first), `data.summary.byStatus`, `data.pagination`.
 * params: `page`, `limit` (max 100), `search` (name, email, phone), `status` (comma-separated), `role_id`.
 */
export function getEmployees(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ).toString();
  return ApiRequestHandler({ method: "GET", endpoint: `admin/employees${query ? `?${query}` : ""}`, includeAuth: true });
}

/** GET admin/employees/:id — profile, role, role / extra / merged permissions, devices, recent activity. */
export function getEmployee(id) {
  return ApiRequestHandler({ method: "GET", endpoint: `admin/employees/${encodeURIComponent(id)}`, includeAuth: true });
}

/**
 * POST admin/employees — `f_name`, `l_name`, `email`, `password` (initial), `role_id`, optional `phone`,
 * `status` (ACTIVE | PENDING). Duplicate email → 409; a role with permissions you don't hold → 403.
 */
export function createEmployee(body) {
  return ApiRequestHandler({ method: "POST", endpoint: "admin/employees", includeAuth: true, data: body });
}

/** PUT admin/employees/:id/status — `{ status: "ACTIVE" | "SUSPENDED", reason? }`. Suspending signs them out. */
export function setEmployeeStatus(id, status, reason) {
  return ApiRequestHandler({
    method: "PUT",
    endpoint: `admin/employees/${encodeURIComponent(id)}/status`,
    includeAuth: true,
    data: reason ? { status, reason } : { status },
  });
}

/**
 * PUT admin/employees/:id — Super admin only. Any of `f_name`, `l_name`, `email`, `phone` (empty clears it), `role_id`,
 * `password` (new password; signs them out). Can't change your own role (403); email taken → 409.
 */
export function updateEmployee(id, body) {
  return ApiRequestHandler({ method: "PUT", endpoint: `admin/employees/${encodeURIComponent(id)}`, includeAuth: true, data: body });
}

/** DELETE admin/employees/:id — Super admin only. Soft delete: hidden, signed out, email stays taken. Not yourself. */
export function deleteEmployee(id) {
  return ApiRequestHandler({ method: "DELETE", endpoint: `admin/employees/${encodeURIComponent(id)}`, includeAuth: true });
}

/** GET auth/employee/profile — the signed-in employee (`role.is_system` = Super admin) and their permissions. */
export function getMyProfile() {
  return ApiRequestHandler({ method: "GET", endpoint: "auth/employee/profile", includeAuth: true });
}

/**
 * GET admin/permission-modules — the areas permissions are given on, in display order:
 * `{ id, key, name, description, actions: [...], sort_order, is_active }`. `active: true` returns switched-on ones only;
 * `usage: true` returns every area with `usage` ({ roles, employees, grants }) and timestamps.
 */
export function getPermissionModules({ active = true, usage = false } = {}) {
  const query = usage ? "?usage=true" : active ? "?active=true" : "";
  return ApiRequestHandler({ method: "GET", endpoint: `admin/permission-modules${query}`, includeAuth: true });
}

/**
 * POST admin/permission-modules — Super admin only. `{ key, name, description?, actions?, sort_order?, is_active? }`.
 * `key`: lowercase letters, numbers and `_`; the gateway's routes check it, so it can't change later. Taken key → 409.
 */
export function createPermissionModule(body) {
  return ApiRequestHandler({ method: "POST", endpoint: "admin/permission-modules", includeAuth: true, data: body });
}

/** PUT admin/permission-modules/:id — Super admin only. Removing an action also removes every grant of it. */
export function updatePermissionModule(id, body) {
  return ApiRequestHandler({ method: "PUT", endpoint: `admin/permission-modules/${encodeURIComponent(id)}`, includeAuth: true, data: body });
}

/** DELETE admin/permission-modules/:id — Super admin only; 409 while any role or employee has a permission on it. */
export function deletePermissionModule(id) {
  return ApiRequestHandler({ method: "DELETE", endpoint: `admin/permission-modules/${encodeURIComponent(id)}`, includeAuth: true });
}

/** GET admin/roles — every role with `permissions` ({ module: [actions] }, every module listed), `is_system`, `employees_count`. */
export function getRoles() {
  return ApiRequestHandler({ method: "GET", endpoint: "admin/roles", includeAuth: true });
}

/**
 * POST admin/roles — `{ name, description?, permissions? | copy_from_role_id? }`. Any write action also grants view.
 * Duplicate name → 409; permissions you don't hold yourself → 403.
 */
export function createRole(body) {
  return ApiRequestHandler({ method: "POST", endpoint: "admin/roles", includeAuth: true, data: body });
}

/** PUT admin/roles/:id — `{ name?, description?, permissions? }`; `permissions` replaces the whole set. Super admin is locked (403). */
export function updateRole(id, body) {
  return ApiRequestHandler({ method: "PUT", endpoint: `admin/roles/${encodeURIComponent(id)}`, includeAuth: true, data: body });
}

/** DELETE admin/roles/:id — 409 while any employee (deleted ones included) still has the role. */
export function deleteRole(id) {
  return ApiRequestHandler({ method: "DELETE", endpoint: `admin/roles/${encodeURIComponent(id)}`, includeAuth: true });
}
