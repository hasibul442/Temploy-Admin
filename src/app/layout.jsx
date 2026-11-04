import { Poppins, Roboto } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ToastContainer } from "react-toastify";
import ThemeRegistry from "@/theme/ThemeRegistry";
import "./globals.css";

// Headings: Poppins (not a variable font, so weights are listed). Body: Roboto (variable).
const display = Poppins({ subsets: ["latin"], weight: ["500", "600", "700", "800"], display: "swap", variable: "--font-display" });
const body = Roboto({ subsets: ["latin"], display: "swap", variable: "--font-body" });

export const metadata = {
  title: "Temploy Admin",
  description: "Temploy marketplace administration",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeRegistry>
            {children}
            <ToastContainer position="bottom-right" theme="colored" />
          </ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
