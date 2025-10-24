// src\app\(admin)\test\categories\page.jsx
"use client";
import DeleteButton from "@/Components/Button/DeleteButton";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { GetRequestData, PostRequestData } from "@/Helper/HttpRequestHelper";
import { Pagination, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { MdEditSquare } from "react-icons/md";
import Swal from "sweetalert2";

function Page() {
  const [testCategories, setTestCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState(true);
  const [createdBy, setCreatedBy] = useState("");
  const [updatedBy, setUpdatedBy] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmitTestCategory = (e) => {
    e.preventDefault();
    const newTest = { 
      cat_name : name, 
      cat_icon_url : iconUrl,
      status: status,
      description: description,
      slug: slug,
      // created_by: createdBy,
      // updated_by: updatedBy,
    };

    PostRequestData(newTest, "api/v1/test/category")
      .then((data) => {
        setTestCategories([...testCategories, data]);
        setName("");
        setDescription("");
        setIconUrl("");
        setSlug("");
        setStatus(true);
        setCreatedBy("");
        setUpdatedBy("");
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

  const fetchTestCategories = () => {
    GetRequestData(`api/v1/test/category?page=${currentPage}&limit=10&search=${searchTerm}`).then((data) => {
      setTestCategories(data);
    });
  };


  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    fetchTestCategories();
  }, [currentPage, searchTerm]);

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="card mb-4">
            <div className="card-header pb-0">
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Test Category</h6>
                </div>

                <div>
                  <button
                    type="button"
                    className="btn bg-gradient-info"
                    data-bs-toggle="modal"
                    data-bs-target="#addCategoryModal"
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
                  <table className="table align-items-center mb-0" style={{ width: "100% !important" }}>
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
                          Status
                        </th>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testCategories?.data?.length > 0 ? (
                        testCategories?.data.map((category, index) => (
                          <tr key={category._id}>
                            <td className="text-center">
                              <span className="text-secondary text-xs font-weight-bold">
                                {index + 1 + (currentPage - 1) * 10}
                              </span>
                            </td>
                            <td>
                              <span className="text-secondary text-xs font-weight-bold">
                                {category.name}
                              </span>
                            </td>
                            <td>
                              <span className="text-secondary text-xs font-weight-bold">
                                {category.description}
                              </span>
                            </td>
                            <td>
                              <span className={`badge category.status ${category.status ? "bg-gradient-success" : "bg-gradient-danger"} text-xs font-weight-bold`}>
                                {category.status ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="d-flex">
                              <button className="btn btn-outline-info btn-sm p-2 mx-1" type="button"><MdEditSquare size={16}/></button>
                              <DeleteButton id={category._id} service="category" deleteUrl="api/v1/test/category" />
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
                    count={testCategories?.pagination?.totalPages}
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
        <div
          className="modal fade"
          id="addCategoryModal"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="addCategoryModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="addCategoryModalLabel">
                  Add Category
                </h5>
                <button
                  type="button"
                  className="btn-close text-dark"
                  data-bs-dismiss="modal"
                  aria-label="Close"
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
                      placeholder="John Doe"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
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
                  onClick={handleSubmitTestCategory}
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Page;
