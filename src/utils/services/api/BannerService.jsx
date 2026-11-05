import { ApiRequestHandler } from "@/utils/services/ApiRequestHandler";

/*
 * Home page banners (staff token required). Each call resolves to `{ data, status }` on success,
 * or `{ message, response }` on failure (see ApiRequestHandler).
 * Only one banner is active at a time: saving one with `status: true` turns the others off.
 */

/** GET admin/banners → `data.data`: banners, newest first. */
export function getBanners() {
  return ApiRequestHandler({ method: "GET", endpoint: "admin/banners", includeAuth: true });
}

/**
 * POST admin/banners. Body: `{ title, description, sub_title?, banner_type?: "image"|"video",
 * banner_images?: [url], status? }`. `title` and `description` are required.
 */
export function createBanner(body) {
  return ApiRequestHandler({ method: "POST", endpoint: "admin/banners", includeAuth: true, data: body });
}

/** PUT admin/banners/:id — changes only the fields sent. */
export function updateBanner(id, body) {
  return ApiRequestHandler({ method: "PUT", endpoint: `admin/banners/${encodeURIComponent(id)}`, includeAuth: true, data: body });
}

/** DELETE admin/banners/:id — the active banner can't be deleted (409). */
export function deleteBanner(id) {
  return ApiRequestHandler({ method: "DELETE", endpoint: `admin/banners/${encodeURIComponent(id)}`, includeAuth: true });
}
