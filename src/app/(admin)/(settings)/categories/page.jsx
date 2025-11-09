"use client";
import DeleteButton from "@/Components/Button/DeleteButton";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { toBase64 } from "@/Helper/Hepler";
import { GetRequestData, PostRequestData } from "@/Helper/HttpRequestHelper";
import { Pagination, TextField } from "@mui/material";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { MdEditSquare } from "react-icons/md";
import Swal from "sweetalert2";

function Page() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [status, setStatus] = useState(true);
  const [createdBy, setCreatedBy] = useState("");
  const [updatedBy, setUpdatedBy] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCategories = () => {
    GetRequestData(`api/v1/categories?page=${currentPage}&limit=10`).then(
      (data) => {
        setCategories(data);
      }
    );
  };

  const handleSubmitCategory = async(e) => {
    const base64String = await toBase64(iconUrl);

    e.preventDefault();
    const newCategory = {
      cat_name: name,
      cat_icon_url: base64String,
      status: status,
      description: description,
      // created_by: createdBy,
      // updated_by: updatedBy,
    };

    PostRequestData(newCategory, "api/v1/categories")
      .then((data) => {
        // append the new category into the existing categories.data array
        fetchCategories();

        // Reset form fields
        setName("");
        setDescription("");
        setIconUrl("");
        setStatus(true);
        setCreatedBy("");
        setUpdatedBy("");

        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Your work has been saved",
          showConfirmButton: false,
          timer: 1500,
        });

        handleClose();
      })
      .catch((error) => {
        console.error(error);
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Failed to save category",
          showConfirmButton: false,
          timer: 1500,
        });
      });
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchTerm]);
  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="card mb-4">
            <div className="card-header pb-0">
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Service Category</h6>
                </div>

                <div>
                  <button
                    type="button"
                    className="btn bg-gradient-info"
                    onClick={handleShow}
                  >
                    Add Category
                  </button>
                </div>
              </div>

              <div className="d-flex justify-content-end mt-3 mb-3">
                <TextField
                  label="Search"
                  variant="outlined"
                  size="small"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                          Name
                        </th>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                          Description
                        </th>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                          Icon
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
                      {categories?.data?.length > 0 ? (
                        categories?.data.map((category, index) => (
                          <tr key={index}>
                            <td className="text-center">
                              <span className="text-secondary text-xs font-weight-bold">
                                {index + 1 + (currentPage - 1) * 10}
                              </span>
                            </td>
                            <td>
                              <span className="text-secondary text-xs font-weight-bold">
                                {category.cat_name}
                              </span>
                            </td>
                            <td>
                              <span className="text-secondary text-xs font-weight-bold">
                                {category.description}
                              </span>
                            </td>
                            <td>
                              <span className="text-secondary text-xs font-weight-bold">
                                <img
                                  src={category.cat_icon_url}
                                  alt=""
                                  style={{
                                    height: "50px",
                                    width: "50px",
                                    objectFit: "cover",
                                  }}
                                />
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge category.status ${
                                  category.status
                                    ? "bg-gradient-success"
                                    : "bg-gradient-danger"
                                } text-xs font-weight-bold`}
                              >
                                {category.status ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="d-flex">
                              <Link
                                className="btn btn-outline-info btn-sm p-2 mx-1"
                                href={`/categories/${category._id}`}
                              >
                                <MdEditSquare size={16} />
                              </Link>
                              <DeleteButton
                                id={category._id}
                                service="category"
                                deleteUrl="api/v1/categories"
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

                <div className="text-center">
                  <Pagination
                    color="primary"
                    count={categories?.pagination?.totalPages}
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
      </div>

      <section>
        <Modal show={show} onHide={handleClose}>
          <div className="modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Category</h5>
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
                  onClick={handleSubmitCategory}
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
