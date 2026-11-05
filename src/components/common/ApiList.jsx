"use client";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, CircularProgress, Typography } from "@mui/material";
import { LuRefreshCw } from "react-icons/lu";
import PageHeader from "@/components/common/PageHeader";
import { getErrorMessage } from "@/utils/services/api/apiError";

/**
 * Loads a list from the API for a ResourcePage. `fetcher()` returns an ApiRequestHandler result whose
 * `data.data` is the array; each item goes through `toRow`. `rows` is null until it loads.
 * Pass stable functions (module-level), or the list reloads on every render.
 */
export function useApiList(fetcher, toRow) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setError(null);
    const res = await fetcher();
    if (res?.data) setRows((res.data.data ?? []).map(toRow));
    else setError(getErrorMessage(res));
  }, [fetcher, toRow]);

  useEffect(() => {
    // Fetch on mount; state is set after the await, not synchronously in the effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  return { rows, error, reload };
}

/** Page header plus a spinner, or the load error with a retry button. Render it while `rows` is null. */
export function ApiListFallback({ title, subtitle, error, onRetry }) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <Card sx={{ py: 10, textAlign: "center" }}>
        {error ? (
          <>
            <Typography sx={{ mb: 2 }} color="error">{error}</Typography>
            <Button variant="outlined" startIcon={<LuRefreshCw size={15} />} onClick={onRetry}>Try again</Button>
          </>
        ) : (
          <CircularProgress size={28} aria-label={`Loading ${title.toLowerCase()}`} />
        )}
      </Card>
    </>
  );
}
