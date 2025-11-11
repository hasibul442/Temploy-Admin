"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";

function Navbar() {
  const pathname = usePathname() || "";
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((segment, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { href, label };
  });
  const lastLabel = crumbs.length ? crumbs[crumbs.length - 1].label : "Dashboard";

  const handleSignOut = () => {
    Cookies.remove("token");
  }

  return (
    <>
      <nav
        className="navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl"
        id="navbarBlur"
        navbar-scroll="true"
      >
        <div className="container-fluid py-1 px-3">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb bg-transparent mb-0 pb-0 pt-1 px-0 me-sm-6 me-5">
              <li className="breadcrumb-item text-sm">
                <a className="opacity-5 text-dark" href="/">
                  Home
                </a>
              </li>
              {crumbs.map((crumb, index) => (
                <li
                  key={crumb.href}
                  className={`breadcrumb-item text-sm ${index === crumbs.length - 1 ? "text-dark active" : ""
                    }`}
                  aria-current={
                    index === crumbs.length - 1 ? "page" : undefined
                  }
                >
                  {index === crumbs.length - 1 ? (
                    crumb.label
                  ) : (
                    <a className="opacity-5 text-dark" href={crumb.href}>
                      {crumb.label}
                    </a>
                  )}
                </li>
              ))}
            </ol>
            <h6 className="font-weight-bolder mb-0">{lastLabel}</h6>
          </nav>
          <div
            className="collapse navbar-collapse mt-sm-0 mt-2 me-md-0 me-sm-4"
            id="navbar"
          >
            <div className="ms-md-auto pe-md-3 d-flex align-items-center"></div>
            <ul className="navbar-nav  justify-content-end">
              <li className="nav-item d-flex align-items-center">
                <a
                  href="#"
                  onClick={handleSignOut}
                  className="nav-link text-body font-weight-bold px-0"
                >
                  <i className="fa fa-user me-sm-1"></i>
                  <span className="d-sm-inline d-none">Sign Out</span>
                </a>
              </li>
              <li className="nav-item d-xl-none ps-3 d-flex align-items-center">
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="nav-link text-body p-0"
                  id="iconNavbarSidenav"
                >
                  <div className="sidenav-toggler-inner">
                    <i className="sidenav-toggler-line"></i>
                    <i className="sidenav-toggler-line"></i>
                    <i className="sidenav-toggler-line"></i>
                  </div>
                </a>
              </li>
              <li className="nav-item px-3 d-flex align-items-center">
                <a href="#" onClick={(e) => e.preventDefault()} className="nav-link text-body p-0">
                  <i className="fa fa-cog fixed-plugin-button-nav cursor-pointer"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
