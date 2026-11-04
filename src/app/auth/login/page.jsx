"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Link as MuiLink,
} from "@mui/material";
import { LuMail, LuLock, LuEye, LuEyeOff, LuArrowRight } from "react-icons/lu";

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  // TODO(backend): replace with PostRequestData({ email, password }, "admin/login")
  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    Cookies.set("token", "demo-token", { sameSite: "lax" });
    router.push("/");
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, bgcolor: "background.paper" }}>
      {/* Brand panel */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: 6,
          color: "#fff",
          background: "radial-gradient(1200px 600px at 0% 0%, #6366f1 0%, #3730a3 45%, #1e1b4b 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "rgba(255,255,255,.15)", display: "grid", placeItems: "center", fontWeight: 800 }}>T</Box>
          <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Temploy</Typography>
        </Box>
        <Box sx={{ maxWidth: 440, position: "relative", zIndex: 1 }}>
          <Typography sx={{ fontSize: 34, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
            Run the marketplace from one place.
          </Typography>
          <Typography sx={{ mt: 2, opacity: 0.8, fontSize: 15.5 }}>
            Monitor orders, resolve disputes, approve payouts and keep the catalog in shape.
          </Typography>
          <Box sx={{ display: "flex", gap: 4, mt: 5 }}>
            {[
              ["27.7K", "Users"],
              ["1,284", "Active orders"],
              ["$312K", "Monthly volume"],
            ].map(([v, l]) => (
              <Box key={l}>
                <Typography sx={{ fontSize: 22, fontWeight: 700 }}>{v}</Typography>
                <Typography sx={{ fontSize: 13, opacity: 0.7 }}>{l}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Typography sx={{ fontSize: 12.5, opacity: 0.6 }}>© {new Date().getFullYear()} Temploy</Typography>
        <Box sx={{ position: "absolute", right: -120, bottom: -120, width: 380, height: 380, borderRadius: "50%", border: "1px solid rgba(255,255,255,.12)" }} />
        <Box sx={{ position: "absolute", right: -40, bottom: -40, width: 220, height: 220, borderRadius: "50%", border: "1px solid rgba(255,255,255,.12)" }} />
      </Box>

      {/* Form */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 3, sm: 6 } }}>
        <Box component="form" onSubmit={onSubmit} sx={{ width: "100%", maxWidth: 380 }}>
          <Typography variant="h4" component="h1">Sign in</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75, mb: 4, fontSize: 14.5 }}>
            Welcome back. Use your staff account to continue.
          </Typography>

          <TextField
            fullWidth
            label="Email"
            type="email"
            autoComplete="email"
            defaultValue="admin@temploy.com"
            sx={{ mb: 2 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><LuMail size={16} /></InputAdornment> } }}
          />
          <TextField
            fullWidth
            label="Password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            defaultValue="password"
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><LuLock size={16} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShow((s) => !s)} edge="end" aria-label={show ? "Hide password" : "Show password"}>
                      {show ? <LuEyeOff size={16} /> : <LuEye size={16} />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", my: 1.5 }}>
            <FormControlLabel control={<Checkbox size="small" defaultChecked />} label={<Typography sx={{ fontSize: 13.5 }}>Keep me signed in</Typography>} />
            <MuiLink href="#" underline="hover" sx={{ fontSize: 13.5, fontWeight: 600 }}>Forgot password?</MuiLink>
          </Box>

          <Button type="submit" fullWidth variant="contained" size="large" loading={loading} endIcon={<LuArrowRight size={16} />} sx={{ py: 1.25 }}>
            Sign in
          </Button>

          <Typography color="text.secondary" sx={{ mt: 3, fontSize: 12.5, textAlign: "center" }}>
            Demo mode: any credentials sign you in until the API is connected.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
