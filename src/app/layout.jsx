import { Inter } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { ToastContainer } from "react-toastify";
import ThemeRegistry from "@/theme/ThemeRegistry";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata = {
  title: "Temploy Admin",
  description: "Temploy marketplace administration",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="class" defaultMode="system" />
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
