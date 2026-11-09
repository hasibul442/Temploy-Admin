import { ApiRequestHandler } from "@/utils/services/ApiRequestHandler";


const path = (id) => `admin/skills/${encodeURIComponent(id)}`;

/** GET admin/skills → `data.data`: every skill by name, each with `_count` { jobSkills, profileSkills }. */
export function getSkills() {
  return ApiRequestHandler({ method: "GET", endpoint: "admin/skills", includeAuth: true });
}

/** POST admin/skills. Required: `skill_name`. Optional: `slug` (blank → from the name), `description`, `status`. Duplicate → 409. */
export function createSkill(body) {
  return ApiRequestHandler({ method: "POST", endpoint: "admin/skills", includeAuth: true, data: body });
}

/** PUT admin/skills/:id — same fields as create, only the ones sent change. */
export function updateSkill(id, body) {
  return ApiRequestHandler({ method: "PUT", endpoint: path(id), includeAuth: true, data: body });
}

/** DELETE admin/skills/:id — 409 while jobs or freelancers use it. */
export function deleteSkill(id) {
  return ApiRequestHandler({ method: "DELETE", endpoint: path(id), includeAuth: true });
}
