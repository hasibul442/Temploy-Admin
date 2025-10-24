import { Suspense } from "react";
import Sidebar from "./include/Sidebar";
import Navbar from "./include/Navbar";
import Footer from "./include/Footer";

export default function AppLayout({ children }) {
  return (
    <>
      <body className="g-sidenav-show bg-gray-100">
        <Suspense>
          <Sidebar />
          <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
            <Navbar />
            <div className="container-fluid py-4">
              {children}
              <Footer />
            </div>
          </main>
        </Suspense>
      </body>
    </>
  );
}
