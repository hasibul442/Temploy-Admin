"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { LuUsers, LuShieldCheck, LuLayoutGrid } from "react-icons/lu";

/** Clay segmented switch between the "Employees & roles" screens. */
export default function TeamNav() {
  const pathname = usePathname();
  const value = pathname.startsWith("/employees/roles")
    ? "roles"
    : pathname.startsWith("/employees/permission-areas")
      ? "areas"
      : "employees";
  return (
    <ToggleButtonGroup size="small" exclusive value={value} aria-label="Team section" sx={{ "& .MuiToggleButton-root": { px: 1.75, py: 0.75, gap: 0.75, fontSize: 13 } }}>
      <ToggleButton value="employees" component={Link} href="/employees">
        <LuUsers size={15} /> Employees
      </ToggleButton>
      <ToggleButton value="roles" component={Link} href="/employees/roles">
        <LuShieldCheck size={15} /> Roles & permissions
      </ToggleButton>
      <ToggleButton value="areas" component={Link} href="/employees/permission-areas">
        <LuLayoutGrid size={15} /> Permission areas
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
