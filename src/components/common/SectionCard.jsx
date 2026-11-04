import { Card, Box, Typography } from "@mui/material";

export default function SectionCard({ title, subtitle, action, children, noPadding = false, sx }) {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column", ...sx }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, px: 2.5, pt: 2.5, pb: noPadding ? 2 : 0 }}>
        <Box>
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
          {subtitle && (
            <Typography color="text.secondary" sx={{ fontSize: 13, mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Box>
      <Box sx={{ flex: 1, ...(noPadding ? {} : { p: 2.5 }) }}>{children}</Box>
    </Card>
  );
}
