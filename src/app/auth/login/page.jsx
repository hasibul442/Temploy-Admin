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
import { LuMail, LuLock, LuEye, LuEyeOff, LuArrowRight, LuShieldCheck } from "react-icons/lu";
import { toast } from "react-toastify";
import { employeeLogin, verifyEmployeeLoginOtp } from "@/utils/services/api/AuthService";

const DEVICE_KEY = "admin_device_id";

// The server hands out a device_id after the first OTP on this browser; sending it back skips the OTP.
function readDeviceId() {
  try {
    return localStorage.getItem(DEVICE_KEY);
  } catch {
    return null; // storage blocked (private mode): every sign-in asks for an OTP
  }
}

function saveDeviceId(deviceId) {
  try {
    if (deviceId) localStorage.setItem(DEVICE_KEY, deviceId);
  } catch {
    // ignore: the next sign-in will just ask for an OTP again
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Set when the API asks for an OTP: { otp_token, email_hint }, plus the credentials for "Resend code".
  const [otpStep, setOtpStep] = useState(null);

  const fail = (res, fallback) => {
    const message = res?.message || res?.data?.message || fallback;
    setError(message);
    toast.error(message);
    setLoading(false);
  };

  const finish = (body, remember) => {
    Cookies.set("token", body.token.token, { sameSite: "lax", ...(remember ? { expires: 30 } : {}) });
    saveDeviceId(body.device_id);
    toast.success(body.message || "Signed in");
    router.replace("/");
    router.refresh();
  };

  const signIn = async ({ email, password, remember }) => {
    setError("");
    setLoading(true);
    const res = await employeeLogin({ email, password, device: { device_id: readDeviceId() } });
    const body = res?.data;

    if (body?.otp_required) {
      setOtpStep({ ...body.otp, email, password, remember });
      toast.info(body.message);
      setLoading(false);
      return;
    }
    if (!body?.token?.token) return fail(res, "Sign in failed. Please try again.");
    finish(body, remember);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    signIn({
      email: String(form.get("email") || "").trim(),
      password: String(form.get("password") || ""),
      remember: form.get("remember") === "on",
    });
  };

  const onVerify = async (e) => {
    e.preventDefault();
    const otp = String(new FormData(e.currentTarget).get("otp") || "").trim();
    setError("");
    setLoading(true);
    const res = await verifyEmployeeLoginOtp({ otp_token: otpStep.otp_token, otp });
    const body = res?.data;
    if (!body?.token?.token) return fail(res, "Verification failed. Please try again.");
    finish(body, otpStep.remember);
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
          background: "radial-gradient(1200px 600px at 0% 0%, #37913c 0%, #235c31 40%, #173a21 70%, #0f2716 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "rgba(255,255,255,.15)", display: "grid", placeItems: "center", fontWeight: 800 }}>T</Box>
          <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Temploy</Typography>
        </Box>
        <Box sx={{ maxWidth: 440, position: "relative", zIndex: 1 }}>
          <Typography variant="h3" component="p" sx={{ fontSize: 34, lineHeight: 1.2 }}>
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
        {otpStep ? (
          <Box component="form" key="otp" onSubmit={onVerify} sx={{ width: "100%", maxWidth: 380 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: "primary.main", color: "#fff", display: "grid", placeItems: "center", mb: 2.5 }}>
              <LuShieldCheck size={22} />
            </Box>
            <Typography variant="h4" component="h1">Verify this device</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75, mb: 4, fontSize: 14.5 }}>
              This is your first sign-in from this device. Enter the 6-digit code we sent to <strong>{otpStep.email_hint}</strong>.
            </Typography>

            <TextField
              fullWidth
              autoFocus
              label="Verification code"
              name="otp"
              required
              autoComplete="one-time-code"
              error={!!error}
              helperText={error || undefined}
              slotProps={{ htmlInput: { inputMode: "numeric", pattern: "[0-9]{6}", maxLength: 6, style: { letterSpacing: "0.4em", fontWeight: 600 } } }}
            />

            <Button type="submit" fullWidth variant="contained" size="large" loading={loading} endIcon={<LuArrowRight size={16} />} sx={{ py: 1.25, mt: 2.5 }}>
              Verify and sign in
            </Button>

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
              <MuiLink component="button" type="button" underline="hover" sx={{ fontSize: 13.5, fontWeight: 600 }} onClick={() => { setOtpStep(null); setError(""); }}>
                Back
              </MuiLink>
              <MuiLink component="button" type="button" underline="hover" sx={{ fontSize: 13.5, fontWeight: 600 }} disabled={loading} onClick={() => signIn(otpStep)}>
                Resend code
              </MuiLink>
            </Box>
          </Box>
        ) : (
        <Box component="form" key="login" onSubmit={onSubmit} sx={{ width: "100%", maxWidth: 380 }}>
          <Typography variant="h4" component="h1">Sign in</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75, mb: 4, fontSize: 14.5 }}>
            Welcome back. Use your staff account to continue.
          </Typography>

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            required
            autoComplete="email"
            error={!!error}
            sx={{ mb: 2 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><LuMail size={16} /></InputAdornment> } }}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            required
            type={show ? "text" : "password"}
            autoComplete="current-password"
            error={!!error}
            helperText={error || undefined}
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
            <FormControlLabel control={<Checkbox name="remember" size="small" defaultChecked />} label={<Typography sx={{ fontSize: 13.5 }}>Keep me signed in</Typography>} />
            <MuiLink href="#" underline="hover" sx={{ fontSize: 13.5, fontWeight: 600 }}>Forgot password?</MuiLink>
          </Box>

          <Button type="submit" fullWidth variant="contained" size="large" loading={loading} endIcon={<LuArrowRight size={16} />} sx={{ py: 1.25 }}>
            Sign in
          </Button>
        </Box>
        )}
      </Box>
    </Box>
  );
}
