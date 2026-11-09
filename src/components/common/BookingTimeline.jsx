import { Box, Typography } from "@mui/material";
import { formatLocalDateTime, humanize } from "@/helper/format";

const personName = (p) => (p ? `${p.fName ?? ""} ${p.lName ?? ""}`.trim() || p.email || "—" : "—");

/** Booking events (from the admin jobs/orders APIs), oldest first, as a vertical timeline with actor and GPS check. */
export default function BookingTimeline({ events }) {
  if (!events?.length) return <Typography sx={{ fontSize: 13, color: "text.secondary" }}>No events yet.</Typography>;
  return (
    <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0 }}>
      {events.map((e, i) => (
        <Box component="li" key={e.id} sx={{ display: "flex", gap: 1.5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 0.6 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: i === events.length - 1 ? "primary.main" : "text.disabled", flexShrink: 0 }} />
            {i < events.length - 1 && <Box sx={{ width: 2, flex: 1, bgcolor: "divider", my: 0.5 }} />}
          </Box>
          <Box sx={{ pb: i < events.length - 1 ? 1.25 : 0, minWidth: 0 }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{humanize(e.type)}</Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              {formatLocalDateTime(e.createdAt)} · {e.actor ? personName(e.actor) : "System"}
            </Typography>
            {e.distanceFromSiteM !== null && (
              <Typography sx={{ fontSize: 12, color: e.withinRadius === false ? "error.main" : "text.secondary" }}>
                {e.distanceFromSiteM} m from site{e.withinRadius === false ? " (outside the check-in radius)" : ""}
              </Typography>
            )}
            {e.payload && Object.keys(e.payload).length > 0 && (
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                {Object.entries(e.payload).map(([k, v]) => `${humanize(k)}: ${typeof v === "object" ? JSON.stringify(v) : humanize(String(v))}`).join(" · ")}
              </Typography>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
