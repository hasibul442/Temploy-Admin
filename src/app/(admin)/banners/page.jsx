"use client";
import { Box, Switch } from "@mui/material";
import { LuImage, LuCircleCheck, LuEyeOff } from "react-icons/lu";
import { toast } from "react-toastify";
import ResourcePage, { DetailList } from "@/components/common/ResourcePage";
import StatusChip from "@/components/common/StatusChip";
import { TitleCell, Tag } from "@/components/common/cells";
import { useApiList, ApiListFallback } from "@/components/common/ApiList";
import { getErrorMessage as errorMessage } from "@/utils/services/api/apiError";
import { getBanners, createBanner, updateBanner, deleteBanner } from "@/utils/services/api/BannerService";

/*
 * Home page banners, wired to the API (/admin/banners). The active banner is the hero on the
 * web app's home page (GET /home); the API keeps only one active at a time.
 */

const isVideo = (url) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url ?? "");
const fullName = (e) => (e ? `${e.fName ?? ""} ${e.lName ?? ""}`.trim() || e.email : "—");

/** API banner → table row. Form field names (title, sub_title, …) match the row keys so Edit pre-fills. */
function toRow(b) {
  return {
    id: b.id,
    title: b.title ?? "",
    sub_title: b.subTitle ?? "",
    description: b.description ?? "",
    banner_type: b.bannerType ?? "image",
    media_url: b.bannerImages?.[0]?.url ?? b.banner ?? "",
    status: Boolean(b.status),
    state: b.status ? "Active" : "Inactive",
    createdBy: fullName(b.createdBy),
    updatedBy: b.updatedBy ? fullName(b.updatedBy) : null,
  };
}

/** Form values → request body. The form edits one media URL, so it replaces the image list. */
const toBody = (v) => ({
  title: v.title,
  sub_title: v.sub_title,
  description: v.description,
  banner_type: v.banner_type,
  banner_images: v.media_url?.trim() ? [v.media_url.trim()] : [],
  status: Boolean(v.status),
});

/** The API turned the other banners off; mirror that in the table. */
function markOnlyActive(api, id) {
  api.rows.forEach((r) => {
    if (r.id !== id && r.status) api.update(r.id, { status: false, state: "Inactive" });
  });
}

function MediaPreview({ url, height = 40, width = 72, controls = false }) {
  const sx = { width, height, borderRadius: "10px", objectFit: "cover", bgcolor: "action.selected", display: "block" };
  if (!url) {
    return (
      <Box sx={{ ...sx, display: "grid", placeItems: "center", color: "text.disabled" }}>
        <LuImage size={16} />
      </Box>
    );
  }
  return isVideo(url) ? (
    <Box component="video" src={url} muted playsInline preload="metadata" controls={controls} sx={sx} aria-label="Banner video" />
  ) : (
    <Box component="img" src={url} alt="" sx={sx} />
  );
}

/** Active switch: asks first, because either way it changes what the home page shows. */
function LiveSwitch({ row, api }) {
  const toggle = (checked) =>
    api.confirm({
      title: checked ? "Show this banner on the home page?" : "Hide the home page banner?",
      body: checked
        ? `"${row.title}" will replace the banner that's live now.`
        : "The home page will show no banner until you activate another one.",
      confirmLabel: checked ? "Make it live" : "Hide it",
      tone: checked ? undefined : "error",
      onConfirm: async () => {
        const res = await updateBanner(row.id, { status: checked });
        if (!res?.data) return toast.error(errorMessage(res));
        if (checked) markOnlyActive(api, row.id);
        api.update(row.id, toRow(res.data.data), checked ? "Banner is live" : "Banner hidden");
      },
    });

  return (
    <Switch
      size="small"
      checked={row.status}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => toggle(e.target.checked)}
      slotProps={{ input: { "aria-label": `${row.title} live on home page` } }}
    />
  );
}

export default function BannersPage() {
  const { rows, error, reload } = useApiList(getBanners, toRow);
  if (!rows) {
    return <ApiListFallback title="Banners" subtitle="The hero banner on the web app's home page." error={error} onRetry={reload} />;
  }

  return (
    <ResourcePage
      title="Banners"
      subtitle="The hero banner on the web app's home page. Only one banner is live at a time."
      noun="banners"
      rows={rows}
      minWidth={760}
      stats={[
        { label: "Banners", value: (r) => r.length, icon: <LuImage size={20} /> },
        { label: "Live now", value: (r) => r.find((b) => b.status)?.title || "None", icon: <LuCircleCheck size={20} />, tone: "success" },
        { label: "Hidden", value: (r) => r.filter((b) => !b.status).length, icon: <LuEyeOff size={20} />, tone: "warning" },
      ]}
      tabs={{ field: "state", options: ["All", "Active", "Inactive"], labels: { Active: "Live", Inactive: "Hidden" } }}
      search={{ keys: ["title", "sub_title", "description"], placeholder: "Search banners" }}
      columns={[
        { key: "media", label: "Preview", render: (b) => <MediaPreview url={b.media_url} /> },
        { key: "title", label: "Banner", minWidth: 240, render: (b) => <TitleCell title={b.title || "Untitled"} sub={b.sub_title} maxWidth={340} /> },
        { key: "banner_type", label: "Type", render: (b) => <Tag>{isVideo(b.media_url) ? "Video" : "Image"}</Tag> },
        { key: "state", label: "Status", render: (b) => <StatusChip status={b.state} /> },
        { key: "updatedBy", label: "Last edited by", render: (b) => b.updatedBy ?? b.createdBy },
        { key: "status", label: "Live", align: "center", render: (b, api) => <LiveSwitch row={b} api={api} /> },
      ]}
      detail={{
        title: (b) => b.title || "Banner",
        render: (b) => (
          <>
            <Box sx={{ mb: 2 }}>
              <MediaPreview url={b.media_url} width="100%" height={220} controls />
            </Box>
            <DetailList
              items={[
                { label: "Status", value: <StatusChip status={b.state} /> },
                { label: "Subtitle", value: b.sub_title || "—" },
                { label: "Description", value: b.description || "—" },
                { label: "Media URL", value: b.media_url ? <Box component="a" href={b.media_url} target="_blank" rel="noreferrer" sx={{ wordBreak: "break-all" }}>{b.media_url}</Box> : "—" },
                { label: "Created by", value: b.createdBy },
                b.updatedBy && { label: "Last edited by", value: b.updatedBy },
              ]}
            />
          </>
        ),
      }}
      form={{
        entity: "banner",
        defaults: { title: "", sub_title: "", description: "", banner_type: "video", media_url: "", status: false },
        fields: [
          { name: "title", label: "Title", required: true, helperText: "The large heading on the home page" },
          { name: "sub_title", label: "Subtitle", type: "textarea" },
          { name: "description", label: "Description", type: "textarea", required: true },
          { name: "media_url", label: "Media URL", helperText: "Video (.mp4) or image URL shown behind the heading" },
          { name: "banner_type", label: "Type", type: "select", options: ["video", "image"], half: true },
          { name: "status", label: "Live on the home page (replaces the current banner)", type: "switch" },
        ],
        // The live banner can't be deleted (the API returns 409); hide it or activate another first.
        canDelete: (b) => !b.status,
        onSave: async (values, id, api) => {
          const res = id == null ? await createBanner(toBody(values)) : await updateBanner(id, toBody(values));
          if (!res?.data) {
            toast.error(errorMessage(res));
            return null;
          }
          const saved = toRow(res.data.data);
          if (saved.status) markOnlyActive(api, saved.id);
          return saved;
        },
        onDelete: async (b) => {
          const res = await deleteBanner(b.id);
          if (!res?.data) toast.error(errorMessage(res));
          return Boolean(res?.data);
        },
      }}
    />
  );
}
