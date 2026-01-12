"use client";
import DeleteButton from "@/Components/Button/DeleteButton";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { toBase64 } from "@/Helper/Hepler";
import { GetRequestData, PostRequestData, UpdateRequestData } from "@/Helper/HttpRequestHelper";
import { Pagination, TextField } from "@mui/material";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { MdEditSquare } from "react-icons/md";
import Swal from "sweetalert2";

function Page() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [currencies, setCurrencies] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [status, setStatus] = useState(true);
  const [createdBy, setCreatedBy] = useState("");
  const [updatedBy, setUpdatedBy] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCurrencies = useCallback(() => {
    GetRequestData(`api/v1/currency?page=${currentPage}&limit=10`, false).then(
      (data) => {
        console.log(data);
        setCurrencies(data);
      }
    );
  }, [currentPage, searchTerm]);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await UpdateRequestData(
        { status: !currentStatus },
        `api/v1/currency/${id}/status`
      );

      if (response) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Status updated successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        fetchCurrencies();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update status",
      });
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);
  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="card mb-4">
            <div className="card-header pb-0">
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Currency</h6>
                </div>

                <div>
                  <button
                    type="button"
                    className="btn bg-gradient-info"
                    onClick={handleShow}
                  >
                    Add Currency
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body px-0 pt-0 pb-2">
              <div className="d-flex justify-content-end mt-3 mb-3">
                <TextField
                  label="Search"
                  variant="outlined"
                  size="small"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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
                        Code
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Name
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        symbol_native
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Status
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currencies?.data?.length > 0 ? (
                      currencies?.data.map((currency, index) => (
                        <tr key={index}>
                          <td className="text-center">
                            <span className="text-secondary text-xs font-weight-bold">
                              {index + 1 + (currentPage - 1) * 10}
                            </span>
                          </td>
                          <td>
                            <span className="text-secondary text-xs font-weight-bold">
                              {currency.code}
                            </span>
                          </td>
                          <td>
                            <span className="text-secondary text-xs font-weight-bold">
                              {currency.name}
                            </span>
                          </td>
                          <td>
                            <span className="text-secondary text-xs font-weight-bold">
                              {currency.symbol_native}
                            </span>
                          </td>
                          <td>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={currency?.status}
                                onChange={() =>
                                  handleToggleStatus(
                                    currency._id,
                                    currency?.status
                                  )
                                }
                                style={{ cursor: "pointer" }}
                              />
                              <label className="form-check-label text-xs font-weight-bold">
                                {currency?.status ? "Active" : "Inactive"}
                              </label>
                            </div>
                          </td>
                          <td className="d-flex">
                            <Link
                              className="btn btn-outline-info btn-sm p-2 mx-1"
                              href={`/categories/${currency._id}`}
                            >
                              <MdEditSquare size={16} />
                            </Link>
                            <DeleteButton
                              id={currency._id}
                              service="currency"
                              deleteUrl="api/v1/currencies"
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <NoDataFound colSpan={5} />
                    )}
                  </tbody>
                </table>
              </div>

              {/* <div className="text-center">
                <Pagination
                  color="primary"
                  count={categories?.pagination?.totalPages}
                  showFirstButton
                  showLastButton
                  page={currentPage}
                  onChange={handlePageChange}
                />
              </div> */}
            </div>
          </div>
        </div>
      </div>

      <section>
        <Modal show={show} onHide={handleClose}>
          <div className="modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Currency</h5>
                <button
                  type="button"
                  className="btn-close text-dark"
                  onClick={handleClose}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      placeholder="Fitness & Wellness Support"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="iconUrl">Icon</label>
                    <input
                      type="file"
                      className="form-control"
                      id="iconUrl"
                      placeholder="https://example.com/icon.png"
                      required
                      onChange={(e) => setIconUrl(e.target.files[0])}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      className="form-control"
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      className="form-control"
                      id="description"
                      rows="3"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn bg-gradient-secondary"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn bg-gradient-info"
                //   onClick={handleSubmitCurrency}
                >
                  Save changes
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
