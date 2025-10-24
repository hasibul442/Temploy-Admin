"use client";
import Link from "next/link";
import React from "react";
import * as FaIcons from "react-icons/fa6";
import { FaSignOutAlt } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { MdCategory, MdTypeSpecimen } from "react-icons/md";

function Sidebar() {
  const pathname = usePathname() || "";
  return (
    <>
      <aside
        className="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3 "
        id="sidenav-main"
      >
        <div className="sidenav-header">
          <i
            className="fas fa-times p-3 cursor-pointer text-secondary opacity-5 position-absolute end-0 top-0 d-none d-xl-none"
            aria-hidden="true"
            id="iconSidenav"
          ></i>
          <Link className="navbar-brand m-0" href="/admin">
            <img
              src="/assets/img/logo-ct-dark.png"
              className="navbar-brand-img h-100"
              alt="main_logo"
            />
            <span className="ms-1 font-weight-bold">Hasibul Hasan</span>
          </Link>
        </div>
        <hr className="horizontal dark mt-0" />
        <div
          className="collapse navbar-collapse  w-auto "
          id="sidenav-collapse-main"
        >
          <ul className="navbar-nav">
            <li className="nav-item mt-3">
              <h6 className="ps-4 ms-2 text-uppercase text-xs font-weight-bolder opacity-6">
                General Setting
              </h6>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${
                  pathname === "/educations" ? "active" : ""
                }`}
                href="/educations"
              >
                <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                  <FaIcons.FaBook size={16} />
                </div>
                <span className="nav-link-text ms-1">Degree</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${
                  pathname === "/specialities" ? "active" : ""
                }`}
                href="/specialities"
              >
                <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                  <MdTypeSpecimen size={16} />
                </div>
                <span className="nav-link-text ms-1">Specialities</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${
                  pathname === "/test/categories" ? "active" : ""
                }`}
                href="/test/categories"
              >
                <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                  <MdCategory size={16} />
                </div>
                <span className="nav-link-text ms-1">Test Categories</span>
              </Link>
            </li>

            <li className="nav-item mt-3">
              <h6 className="ps-4 ms-2 text-uppercase text-xs font-weight-bolder opacity-6">
                Main Menu
              </h6>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${pathname === "/" ? "active" : ""}`}
                href="/"
              >
                <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                  <FaIcons.FaBuffer size={16} />
                </div>
                <span className="nav-link-text ms-1">Dashboard</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${pathname === "/unit" ? "active" : ""}`}
                href="/unit"
              >
                <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                  <FaIcons.FaHive size={16} />
                </div>
                <span className="nav-link-text ms-1">Units</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${pathname === "/roles" ? "active" : ""}`}
                href="/roles"
              >
                <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                  <FaIcons.FaRocket size={16} />
                </div>
                <span className="nav-link-text ms-1">Roles</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${pathname === "/users" ? "active" : ""}`}
                href="/users"
              >
                <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                  <FaIcons.FaArrowsTurnRight size={16} />
                </div>
                <span className="nav-link-text ms-1">Users</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  pathname === "/patients" ? "active" : ""
                }`}
                href="/patients"
              >
                <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                  <FaIcons.FaBook size={16} />
                </div>
                <span className="nav-link-text ms-1">Patients</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  pathname === "/appointments" ? "active" : ""
                }`}
                href="/appointments"
              >
                <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                  <FaIcons.FaAtom size={16} />
                </div>
                <span className="nav-link-text ms-1">Appointments</span>
              </Link>
            </li>
            <li className="nav-item mt-3">
              <h6 className="ps-4 ms-2 text-uppercase text-xs font-weight-bolder opacity-6">
                Test
              </h6>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  pathname === "/test/categories" ? "active" : ""
                }`}
                href="/test/categories"
              >
                <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                  <FaIcons.FaAward size={16} />
                </div>
                <span className="nav-link-text ms-1">Test Categories</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${pathname === "/test" ? "active" : ""}`}
                href="/test"
              >
                <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                  <FaIcons.FaBlog size={16} />
                </div>
                <span className="nav-link-text ms-1">Test</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link  " href="/admin">
                <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                  <FaSignOutAlt size={16} />
                </div>
                <span className="nav-link-text ms-1">Log Out</span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
