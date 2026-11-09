import { ApiRequestHandler } from "@/utils/services/ApiRequestHandler";

/*
 * Job categories and subcategories (staff token required). Resolves to `{ data, status }`, or
 * `{ message, response }` on failure. Lists return every row unless `page` / `limit` is sent.
 * Used categories/subcategories can't be deleted (409); turn them off with `status: false` instead.
 */

const query = (params = {}) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")).toString();
  return q ? `?${q}` : "";
};
const path = (base, id) => `${base}/${encodeURIComponent(id)}`;

/** GET admin/categories → `data.data`: categories by name, each with `_count` { subCategories, jobs, gigs }. */
export function getCategories(params) {
  return ApiRequestHandler({ method: "GET", endpoint: `admin/categories${query(params)}`, includeAuth: true });
}

/** GET admin/categories/:id → `data.data`: the category plus `subCategories` (each with `_count` { jobs, gigs, profileServices }). */
export function getCategory(id) {
  return ApiRequestHandler({ method: "GET", endpoint: path("admin/categories", id), includeAuth: true });
}

/**
 * POST admin/categories. Required: `cat_name`. Optional: `slug` (blank → from the name), `cat_name_bn`, `cat_name_pt`,
 * `cat_icon_url`, `icon`, `color`, `description`, `description_bn`, `description_pt`, `status`. Duplicate name/slug → 409.
 */
export function createCategory(body) {
  return ApiRequestHandler({ method: "POST", endpoint: "admin/categories", includeAuth: true, data: body });
}

/** PUT admin/categories/:id — same fields as create, only the ones sent change. */
export function updateCategory(id, body) {
  return ApiRequestHandler({ method: "PUT", endpoint: path("admin/categories", id), includeAuth: true, data: body });
}

/** DELETE admin/categories/:id — 409 while subcategories, jobs or gigs use it. */
export function deleteCategory(id) {
  return ApiRequestHandler({ method: "DELETE", endpoint: path("admin/categories", id), includeAuth: true });
}

/** GET admin/subcategories → `data.data`: by name, each with its parent `category` and `_count`. params: `category_id`. */
export function getSubCategories(params) {
  return ApiRequestHandler({ method: "GET", endpoint: `admin/subcategories${query(params)}`, includeAuth: true });
}

/** POST admin/subcategories. Required: `sub_cat_name`, `cat_id`. Optional: `slug`, `sub_cat_icon_url`, `description`, `status`. */
export function createSubCategory(body) {
  return ApiRequestHandler({ method: "POST", endpoint: "admin/subcategories", includeAuth: true, data: body });
}

/** PUT admin/subcategories/:id — only the fields sent change. Moving a used one to another category → 409. */
export function updateSubCategory(id, body) {
  return ApiRequestHandler({ method: "PUT", endpoint: path("admin/subcategories", id), includeAuth: true, data: body });
}

/** DELETE admin/subcategories/:id — 409 while jobs, gigs or freelancer services use it. */
export function deleteSubCategory(id) {
  return ApiRequestHandler({ method: "DELETE", endpoint: path("admin/subcategories", id), includeAuth: true });
}
