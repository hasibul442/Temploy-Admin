import { Tag } from "@/components/common/cells";

// Colour per built-in role slug; roles staff add later render neutral.
const ROLE_TONES = {
  "super-admin": "secondary",
  admin: "primary",
  moderator: "warning",
  finance: "success",
  support: "info",
  content: "error",
};

export const roleTone = (role) => ROLE_TONES[role?.slug];

/** Coloured chip with the role's name. `role`: { name, slug } from the API. */
export default function RoleTag({ role }) {
  if (!role) return null;
  return <Tag tone={roleTone(role)}>{role.name}</Tag>;
}
