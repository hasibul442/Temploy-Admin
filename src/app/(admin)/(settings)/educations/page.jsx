"use client";
import DeleteButton from "@/Components/Button/DeleteButton";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { GetRequestData, PostRequestData } from "@/Helper/HttpRequestHelper";
import { Pagination } from "@mui/material";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { MdEditSquare } from "react-icons/md";
import Swal from "sweetalert2";

function Page() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

 const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [fullName, setFullName] = useState("");
  const [shortName, setShortName] = useState("");

  const fetchData = () => {
    GetRequestData(
      `/api/v1/settings/educations?page=${currentPage}&limit=10`
    ).then((result) => {
      setData(result);
    });
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const handleSubmitData = (e) => {
    e.preventDefault();

    const formData = {
      full_name: fullName,
      short_name: shortName,
    };

    PostRequestData(formData, "api/v1/settings/educations")
      .then((data) => {
        if (data?.status === "success") {
          fetchData();
          setFullName("");
          setShortName("");
          handleClose();
        }
      })
      .then(() => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Your work has been saved",
          showConfirmButton: false,
          timer: 1500,
        });
      });
  };

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="card mb-4">
            <div className="card-header pb-0">
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Degree List</h6>
                </div>

                <div>
                  <button
                    type="button"
                    className="btn bg-gradient-info"
                    onClick={handleShow}
                  >
                    Add Degree
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body px-0 pt-0 pb-2">
              <div className="p-0">
                <table
                  className="table align-items-center mb-0"
                  style={{ width: "100% !important" }}
                >
                  <thead>
                    <tr>
                      <th className="text-center text-secondary text-xxs font-weight-bolder opacity-7">
                        #
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                        Full Name
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Short Name
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.data?.length > 0 ? (
                      data?.data.map((educations, index) => (
                        <tr key={educations._id}>
                          <td className="text-center">
                            <span className="text-secondary text-xs font-weight-bold">
                              {index + 1 + (currentPage - 1) * 10}
                            </span>
                          </td>
                          <td>
                            <span className="text-secondary text-xs font-weight-bold">
                              {educations.full_name}
                            </span>
                          </td>
                          <td>
                            <span className="text-secondary text-xs font-weight-bold">
                              {educations.short_name || "N/A"}
                            </span>
                          </td>
                          <td className="d-flex">
                            <Link
                              href={`/test/update/${educations._id}`}
                              className="btn btn-outline-info btn-sm p-2 mx-1"
                              type="button"
                            >
                              <MdEditSquare size={16} />
                            </Link>
                            <DeleteButton
                              id={educations._id}
                              service="educations"
                              deleteUrl="api/v1/settings/educations"
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <NoDataFound colSpan={4} />
                    )}
                  </tbody>
                </table>
              </div>

              <div className="text-center">
                <Pagination
                  color="primary"
                  count={data?.pagination?.totalPages}
                  showFirstButton
                  showLastButton
                  page={currentPage}
                  onChange={handlePageChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <section>
        <Modal show={show} onHide={handleClose}>
          <div className="">
            <div className="">
              <Modal.Header closeButton>
                <h5 className="modal-title" id="addDegreeModalLabel">
                  Add Degree
                </h5>
              </Modal.Header>
              <div className="modal-body">
                <form>
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="fullName"
                      placeholder="Higher School Certificate/Alim/HSC (Vocational)"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="name">Short Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="fullName"
                      placeholder="HSC/Vocational"
                      required
                      value={shortName}
                      onChange={(e) => setShortName(e.target.value)}
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn bg-gradient-secondary"
                  onClick={handleClose}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn bg-gradient-info"
                  onClick={handleSubmitData}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </section>
    </>
  );
}

export default Page;
