import Link from "next/link";
import React from "react";

function Footer() {
  return (
    <>
      <footer className="footer pt-3  ">
        <div className="container-fluid">
          <div className="row align-items-center justify-content-lg-between">
            <div className="col-lg-6 mb-lg-0 mb-4">
              <div className="copyright text-center text-sm text-muted text-lg-start">
                © {new Date().getFullYear()},
                Developed by Hasibul Hasan
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
