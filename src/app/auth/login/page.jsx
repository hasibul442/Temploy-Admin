"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { setTokenCookie } from "@/utils/services/tokenCookie";
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

const OTP_LENGTH = 6;

// One box per digit: typing moves forward, Backspace moves back, pasting fills every box.
function OtpBoxes({ value, onChange, onComplete, error, disabled }) {
  const refs = useRef([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? "");
  const focus = (i) => refs.current[Math.max(0, Math.min(OTP_LENGTH - 1, i))]?.focus();

  const fill = (start, text) => {
    const incoming = text.replace(/\D/g, "").slice(0, OTP_LENGTH - start);
    if (!incoming) return;
    const next = [...digits];
    incoming.split("").forEach((d, i) => { next[start + i] = d; });
    const code = next.join("");
    onChange(code);
    focus(start + incoming.length);
    if (!next.includes("")) onComplete(code);
  };

  const onKeyDown = (i) => (e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      // Clear this box, or step back and clear the previous one when this box is empty.
      const target = digits[i] ? i : i - 1;
      if (target < 0) return;
      const next = [...digits];
      next[target] = "";
      onChange(next.join(""));
      focus(target);
    } else if (e.key === "ArrowLeft") {
      focus(i - 1);
    } else if (e.key === "ArrowRight") {
      focus(i + 1);
    }
  };

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${OTP_LENGTH}, 1fr)`, gap: 1.25 }}>
      {digits.map((digit, i) => (
        <Box
          key={i}
          component="input"
          ref={(el) => { refs.current[i] = el; }}
          value={digit}
          disabled={disabled}
          autoFocus={i === 0}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          // Typing into a filled box gives "old+new": keep the new digit. Longer values (autofill) fill from here.
          onChange={(e) => {
            const v = e.target.value;
            fill(i, digit && v.length === 2 ? v.replace(digit, "") : v);
          }}
          onKeyDown={onKeyDown(i)}
          onPaste={(e) => { e.preventDefault(); fill(0, e.clipboardData.getData("text")); }}
          onFocus={(e) => e.target.select()}
          sx={{
            width: "100%",
            minWidth: 0,
            height: 56,
            textAlign: "center",
            fontSize: 22,
            fontWeight: 700,
            color: "text.primary",
            bgcolor: "background.paper",
            border: "1.5px solid",
            borderColor: error ? "error.main" : digit ? "primary.main" : "divider",
            borderRadius: "12px",
            outline: "none",
            caretColor: "transparent",
            transition: "border-color .15s, box-shadow .15s",
            "&:focus": { borderColor: error ? "error.main" : "primary.main", boxShadow: "0 0 0 3px rgba(46, 125, 50, 0.18)" },
            "&:disabled": { opacity: 0.6 },
          }}
        />
      ))}
    </Box>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Set when the API asks for an OTP: { otp_token, email_hint }, plus the credentials for "Resend code".
  const [otpStep, setOtpStep] = useState(null);
  const [otp, setOtp] = useState("");

  const fail = (res, fallback) => {
    const message = res?.message || res?.data?.message || fallback;
    setError(message);
    toast.error(message);
    setLoading(false);
  };

  const finish = async (body, remember) => {
    await setTokenCookie(body.token.token, remember);
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
      setOtp("");
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

  const verify = async (code) => {
    if (loading || code.length !== OTP_LENGTH) return;
    setError("");
    setLoading(true);
    const res = await verifyEmployeeLoginOtp({ otp_token: otpStep.otp_token, otp: code });
    const body = res?.data;
    if (!body?.token?.token) {
      setOtp(""); // clear the boxes so the code can be typed again
      return fail(res, "Verification failed. Please try again.");
    }
    finish(body, otpStep.remember);
  };

  const onVerify = (e) => {
    e.preventDefault();
    verify(otp);
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

            <OtpBoxes value={otp} onChange={(v) => { setOtp(v); setError(""); }} onComplete={verify} error={!!error} disabled={loading} />
            <Typography color={error ? "error" : "text.secondary"} sx={{ mt: 1.25, fontSize: 12.5 }}>
              {error || "Use the code from the most recent email. Each new code replaces the previous one."}
            </Typography>

            <Button type="submit" fullWidth variant="contained" size="large" loading={loading} disabled={otp.length !== OTP_LENGTH} endIcon={<LuArrowRight size={16} />} sx={{ py: 1.25, mt: 2.5 }}>
              Verify and sign in
            </Button>

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
              <MuiLink component="button" type="button" underline="hover" sx={{ fontSize: 13.5, fontWeight: 600 }} onClick={() => { setOtpStep(null); setOtp(""); setError(""); }}>
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
