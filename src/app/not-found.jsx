import { Box, Button, Typography } from "@mui/material";

export default function NotFound() {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 3, bgcolor: "background.default", textAlign: "center" }}>
      <Box>
        <Typography sx={{ fontSize: 72, fontWeight: 800, letterSpacing: "-0.04em", color: "primary.main", lineHeight: 1 }}>404</Typography>
        <Typography variant="h5" sx={{ mt: 2 }}>Page not found</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </Typography>
        <Button href="/" variant="contained">Back to dashboard</Button>
      </Box>
    </Box>
  );
}
