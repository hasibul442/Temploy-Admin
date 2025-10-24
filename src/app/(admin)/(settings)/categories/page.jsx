"use client";
import DeleteButton from "@/Components/Button/DeleteButton";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { GetRequestData, PostRequestData } from "@/Helper/HttpRequestHelper";
import { Pagination, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { MdEditSquare } from "react-icons/md";
import Swal from "sweetalert2";

function Page() {
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
        console.log(data);
        setCategories(data);
      }
    );
  };

  const handleSubmitCategory = (e) => {
    e.preventDefault();
    const slug = name.toLowerCase().replace(/ /g, "-");
    const newCategory = {
      cat_name: name,
      cat_icon_url: "https://i.fbcd.co/products/resized/resized-750-500/563d0201e4359c2e890569e254ea14790eb370b71d08b6de5052511cc0352313.jpg",
      status: status,
      description: description,
      slug: slug,
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

  useEffect(() => {
    fetchCategories();
  }, []);
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
                                <img src={category.cat_icon_url} alt="" style={{ 
                                  height: "50px",
                                  width: "50px",
                                  objectFit: "cover"
                                 }}/>
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
                              <button
                                className="btn btn-outline-info btn-sm p-2 mx-1"
                                type="button"
                              >
                                <MdEditSquare size={16} />
                              </button>
                              <DeleteButton
                                id={category._id}
                                service="category"
                                deleteUrl="api/v1/test/category"
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
                    count={10}
                    showFirstButton
                    showLastButton
                    page={currentPage}
                    // onChange={handlePageChange}
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
                    <label htmlFor="iconUrl">Icon URL</label>
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
        </div>
      </section>
    </>
  );
}

export default Page;
