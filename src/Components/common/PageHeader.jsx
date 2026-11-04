import { Box, Typography } from "@mui/material";

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: { xs: "flex-start", sm: "flex-end" },
        justifyContent: "space-between",
        gap: 2,
        mb: 3,
      }}
    >
      <Box>
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: 14 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>{actions}</Box>}
    </Box>
  );
}
