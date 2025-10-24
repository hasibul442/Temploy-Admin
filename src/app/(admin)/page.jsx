import { FaBlog, FaCreditCard, FaGear, FaHeart, FaPeopleGroup, FaUserGroup } from "react-icons/fa6";
import { RiSpaceShipFill } from "react-icons/ri";

export default function Home() {
  return (
    <>
      <div className="row">
        <div className="col-lg-6 col-12">
          <div className="row">
            <div className="col-lg-6 col-md-6 col-12">
              <div className="card">
                <span className="mask bg-primary opacity-10 border-radius-lg"></span>
                <div className="card-body p-3 position-relative">
                  <div className="row">
                    <div className="col-12 text-start">
                      <div className="icon icon-shape bg-white shadow text-center border-radius-2xl">
                        <div
                          className="text-dark text-gradient text-lg opacity-10"
                          style={{ paddingTop: "20%" }}
                          aria-hidden="true"
                        >
                          <FaUserGroup />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-6">
                          <h5 className="text-white font-weight-bolder mb-0 mt-3">
                            1600
                          </h5>
                          <span className="text-white text-sm">
                            Users Active
                          </span>
                        </div>

                        <div className="col-6">
                          <p className="text-white text-sm text-end font-weight-bolder mt-3 mb-0">
                            +20
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-12 mt-4 mt-md-0">
              <div className="card">
                <span className="mask bg-dark opacity-10 border-radius-lg"></span>
                <div className="card-body p-3 position-relative">
                  <div className="row">
                    <div className="col-12 text-start">
                      <div className="icon icon-shape bg-white shadow text-center border-radius-2xl">
                        <div
                          className="text-dark text-gradient text-lg opacity-10"
                          style={{ paddingTop: "20%" }}
                          aria-hidden="true"
                        >
                          <FaPeopleGroup />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-6">
                          <h5 className="text-white font-weight-bolder mb-0 mt-3">
                            357
                          </h5>
                          <span className="text-white text-sm">Test Item</span>
                        </div>

                        <div className="col-6">
                          <p className="text-white text-sm text-end font-weight-bolder mt-3 mb-0">
                            +124%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row mt-4">
            <div className="col-lg-6 col-md-6 col-12">
              <div className="card">
                <span className="mask bg-dark opacity-10 border-radius-lg"></span>
                <div className="card-body p-3 position-relative">
                  <div className="row">
                    <div className="col-12 text-start">
                      <div className="icon icon-shape bg-white shadow text-center border-radius-2xl">
                        <div
                          className="text-dark text-gradient text-lg opacity-10"
                          style={{ paddingTop: "20%" }}
                          aria-hidden="true"
                        >
                          <FaBlog />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-6">
                          <h5 className="text-white font-weight-bolder mb-0 mt-3">
                            10
                          </h5>
                          <span className="text-white text-sm">Blogs</span>
                        </div>

                        <div className="col-6">
                          <p className="text-white text-sm text-end font-weight-bolder mt-3 mb-0">
                            +20%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-12 mt-4 mt-md-0">
              <div className="card">
                <span className="mask bg-dark opacity-10 border-radius-lg"></span>
                <div className="card-body p-3 position-relative">
                  <div className="row">
                    <div className="col-8 text-start">
                      <div className="icon icon-shape bg-white shadow text-center border-radius-2xl">
                        <div
                          className="text-dark text-gradient text-lg opacity-10"
                          style={{ paddingTop: "20%" }}
                          aria-hidden="true"
                        >
                          <FaHeart />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-6">
                          <h5 className="text-white font-weight-bolder mb-0 mt-3">
                            940
                          </h5>
                          <span className="text-white text-sm">Likes</span>
                        </div>

                        <div className="col-6">
                          <p className="text-white text-sm text-end font-weight-bolder mt-3 mb-0">
                            +20%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6 col-12 mt-4 mt-lg-0">
          {/* <GithubOverView /> */}
        </div>
      </div>
      <div className="row my-4">
        <div className="col-lg-8 col-md-6 mb-md-0 mb-4">
          {/* <HomePageProjectTable /> */}
        </div>
        <div className="col-lg-4 col-md-6">
          {/* <ExprienceOverView /> */}
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-lg-7 mb-lg-0 mb-4">
          <div className="card">
            <div className="card-body p-3">
              <div className="row">
                <div className="col-lg-6">
                  <div className="d-flex flex-column h-100">
                    <p className="mb-1 pt-2 text-bold">Built by developers</p>
                    <h5 className="font-weight-bolder">Soft UI Dashboard</h5>
                    <p className="mb-5">
                      From colors, cards, typography to complex elements, you
                      will find the full documentation.
                    </p>
                    <a
                      className="text-body text-sm font-weight-bold mb-0 icon-move-right mt-auto"
                      href="javascript:;"
                    >
                      Read More
                      <i
                        className="fas fa-arrow-right text-sm ms-1"
                        aria-hidden="true"
                      ></i>
                    </a>
                  </div>
                </div>
                <div className="col-lg-5 ms-auto text-center mt-5 mt-lg-0">
                  <div className="bg-primary border-radius-lg h-100">
                    <img
                      src="../assets/img/shapes/waves-white.svg"
                      className="position-absolute h-100 w-50 top-0 d-lg-block d-none"
                      alt="waves"
                    />
                    <div className="position-relative d-flex align-items-center justify-content-center h-100">
                      <img
                        className="w-100 position-relative z-index-2 pt-4"
                        src="../assets/img/illustrations/rocket-white.png"
                        alt="rocket"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card h-100 p-3">
            <div
              className="overflow-hidden position-relative border-radius-lg bg-cover h-100"
              style={{ backgroundImage: "url('../assets/img/ivancik.jpg')" }}
            >
              <span className="mask bg-gradient-dark"></span>
              <div className="card-body position-relative z-index-1 d-flex flex-column h-100 p-3">
                <h5 className="text-white font-weight-bolder mb-4 pt-2">
                  Work with the rockets
                </h5>
                <p className="text-white">
                  Wealth creation is an evolutionarily recent positive-sum game.
                  It is all about who take the opportunity first.
                </p>
                <a
                  className="text-white text-sm font-weight-bold mb-0 icon-move-right mt-auto"
                  href="javascript:;"
                >
                  Read More
                  <i
                    className="fas fa-arrow-right text-sm ms-1"
                    aria-hidden="true"
                  ></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-lg-12 mb-lg-0 mb-4">
          <div className="card z-index-2">
            <div className="card-body p-2">
              <div className="bg-dark border-radius-md py-3 pe-1 mb-3">
                <div className="chart">
                  <canvas
                    id="chart-bars"
                    className="chart-canvas"
                    height="170"
                  ></canvas>
                </div>
              </div>
              <h6 className="ms-2 mt-4 mb-0"> Active Users </h6>
              <p className="text-sm ms-2">
                {" "}
                (<span className="font-weight-bolder">+23%</span>) than last
                week{" "}
              </p>
              <div className="container border-radius-lg">
                <div className="row">
                  <div className="col-3 py-3 ps-0">
                    <div className="d-flex mb-2">
                      <div className="icon icon-shape icon-xxs shadow border-radius-sm bg-primary text-center me-2 d-flex align-items-center justify-content-center">
                        <FaUserGroup size="10px" color="#fff"/>
                      </div>
                      <p className="text-xs mt-1 mb-0 font-weight-bold">
                        Users
                      </p>
                    </div>
                    <h4 className="font-weight-bolder">36K</h4>
                    <div className="progress w-75">
                      <div
                        className="progress-bar bg-dark w-60"
                        role="progressbar"
                        aria-valuenow="60"
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                  <div className="col-3 py-3 ps-0">
                    <div className="d-flex mb-2">
                      <div className="icon icon-shape icon-xxs shadow border-radius-sm bg-gradient-info text-center me-2 d-flex align-items-center justify-content-center">
                        <RiSpaceShipFill size="10px" color="#fff"/>
                      </div>
                      <p className="text-xs mt-1 mb-0 font-weight-bold">
                        Clicks
                      </p>
                    </div>
                    <h4 className="font-weight-bolder">2m</h4>
                    <div className="progress w-75">
                      <div
                        className="progress-bar bg-dark w-90"
                        role="progressbar"
                        aria-valuenow="90"
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                  <div className="col-3 py-3 ps-0">
                    <div className="d-flex mb-2">
                      <div className="icon icon-shape icon-xxs shadow border-radius-sm bg-gradient-warning text-center me-2 d-flex align-items-center justify-content-center">
                        <FaCreditCard size="10px" color="#fff"/>
                      </div>
                      <p className="text-xs mt-1 mb-0 font-weight-bold">
                        Sales
                      </p>
                    </div>
                    <h4 className="font-weight-bolder">435$</h4>
                    <div className="progress w-75">
                      <div
                        className="progress-bar bg-dark w-30"
                        role="progressbar"
                        aria-valuenow="30"
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                  <div className="col-3 py-3 ps-0">
                    <div className="d-flex mb-2">
                      <div className="icon icon-shape icon-xxs shadow border-radius-sm bg-gradient-danger text-center me-2 d-flex align-items-center justify-content-center">
                        <FaGear size="10px" color="#fff"/>
                      </div>
                      <p className="text-xs mt-1 mb-0 font-weight-bold">
                        Items
                      </p>
                    </div>
                    <h4 className="font-weight-bolder">43</h4>
                    <div className="progress w-75">
                      <div
                        className="progress-bar bg-dark w-50"
                        role="progressbar"
                        aria-valuenow="50"
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
