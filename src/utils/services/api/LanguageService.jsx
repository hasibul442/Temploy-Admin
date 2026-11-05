import { ApiRequestHandler } from "@/utils/services/ApiRequestHandler";

/*
 * Languages (staff token required). Resolves to `{ data, status }`, or `{ message, response }` on failure.
 * Active languages are offered in the web app's language switcher. English is the fallback language:
 * the API won't turn it off or delete it.
 */

/** GET admin/languages → `data.data`: every language. */
export function getLanguages() {
  return ApiRequestHandler({ method: "GET", endpoint: "admin/languages", includeAuth: true });
}

/** POST admin/languages. Required: `code`, `name`. Optional: `native_name`, `flag` (emoji), `status`. Duplicate code → 409. */
export function createLanguage(body) {
  return ApiRequestHandler({ method: "POST", endpoint: "admin/languages", includeAuth: true, data: body });
}

/** PUT admin/languages/:id — same fields as create, only the ones sent change. */
export function updateLanguage(id, body) {
  return ApiRequestHandler({ method: "PUT", endpoint: `admin/languages/${encodeURIComponent(id)}`, includeAuth: true, data: body });
}

/** PUT admin/languages/:id/status — `{ status: true|false }`. */
export function setLanguageStatus(id, status) {
  return ApiRequestHandler({ method: "PUT", endpoint: `admin/languages/${encodeURIComponent(id)}/status`, includeAuth: true, data: { status } });
}

/** DELETE admin/languages/:id */
export function deleteLanguage(id) {
  return ApiRequestHandler({ method: "DELETE", endpoint: `admin/languages/${encodeURIComponent(id)}`, includeAuth: true });
}
