"use client";
import { PostRequestData } from "@/Helper/HttpRequestHelper";
import Cookies from "js-cookie";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-toastify";

function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    PostRequestData({ email, password }, "api/v1/auth/employee/login")
      .then((response) => {
        if (response.status == 200) {
          console.log(response);
          Cookies.set("token", response.token.token, { expires: 1 });
        } else {
          toast.error(response.message || "Login failed");
        }
      })
      .catch((error) => {
        console.log("Login failed:", error);
        toast.error(error.message || "Login failed");
      });
  };

  return (
    <>
      <main className="main-content  mt-0">
        <section>
          <div className="page-header min-vh-100">
            <div className="container">
              <div className="row">
                <div className="col-xl-4 col-lg-5 col-md-6 d-flex flex-column mx-auto">
                  <div className="card card-plain mt-8">
                    <div className="card-header pb-0 text-left bg-transparent">
                      <h3 className="font-weight-bolder text-info text-gradient">
                        Welcome back
                      </h3>
                      <p className="mb-0">
                        Enter your email and password to sign in
                      </p>
                    </div>
                    <div className="card-body">
                      <form>
                        <label>Email</label>
                        <div className="mb-3">
                          <input
                            type="email"
                            className="form-control"
                            placeholder="Email"
                            aria-label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                        <label>Password</label>
                        <div className="mb-3">
                          <input
                            type="password"
                            className="form-control"
                            placeholder="Password"
                            aria-label="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                        {/* <div className="form-check form-switch">
													<input className="form-check-input" type="checkbox" id="rememberMe" defaultChecked />
													<label className="form-check-label" htmlFor="rememberMe">Remember me</label>
												</div> */}
                        <div className="text-center">
                          <button
                            type="button"
                            className="btn bg-gradient-info w-100 mt-4 mb-0"
                            onClick={handleLogin}
                          >
                            Sign in
                          </button>
                        </div>
                      </form>
                    </div>
                    <div className="card-footer text-center pt-0 px-lg-2 px-1">
                      <p className="mb-4 text-sm mx-auto">
                        Don't have an account?
                        <Link
                          href="/auth/register"
                          className="text-info text-gradient font-weight-bold"
                        >
                          Sign up
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="oblique position-absolute top-0 h-100 d-md-block d-none me-n8">
                    <div
                      className="oblique-image bg-cover position-absolute fixed-top ms-auto h-100 z-index-0 ms-n6"
                      style={{
                        backgroundImage:
                          "url('/assets/img/curved-images/curved6.jpg')",
                      }}
                    >
                      <div className="h-100">
                        <div className="d-flex justify-content-center align-items-center h-100">
                          <div className="card">
                            <div className="card-body">
								<h6>Admin Demo Credentials</h6>
                              <b>Email</b>: system@temploy.com <br />
                              <b>Password</b>: 11111111
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Page;
