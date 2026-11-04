import { notFound } from "next/navigation";
import { Box, Button, Card, Typography } from "@mui/material";
import { LuConstruction, LuArrowRight } from "react-icons/lu";
import PageHeader from "@/Components/common/PageHeader";
import { findNavItem } from "@/config/navigation";

/**
 * Placeholder for sidebar sections whose screens haven't been designed yet.
 * Any route not in the nav config 404s. Delete once each page exists.
 */
export default async function PlaceholderPage({ params }) {
  const { slug } = await params;
  const item = findNavItem("/" + slug.join("/"));
  if (!item) notFound();

  return (
    <>
      <PageHeader title={item.label} subtitle={`${item.section} · design in progress`} />
      <Card sx={{ py: 10, px: 3, textAlign: "center" }}>
        <Box sx={{ width: 56, height: 56, mx: "auto", mb: 2, borderRadius: "14px", display: "grid", placeItems: "center", bgcolor: "primary.light", color: "primary.main" }}>
          <LuConstruction size={26} />
        </Box>
        <Typography variant="h6">This screen hasn&apos;t been designed yet</Typography>
        <Typography color="text.secondary" sx={{ fontSize: 14, mt: 0.5, mb: 3, maxWidth: 420, mx: "auto" }}>
          It will follow the same list pattern as the Users page: filters, a searchable table and bulk actions.
        </Typography>
        <Button href="/users" variant="outlined" endIcon={<LuArrowRight size={14} />}>
          See the Users page
        </Button>
      </Card>
    </>
  );
}
