"use client";
import DeleteButton from "@/Components/Button/DeleteButton";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { GetRequestData, PostRequestData } from "@/Helper/HttpRequestHelper";
import { Pagination, TextField } from "@mui/material";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { MdEditSquare } from "react-icons/md";

function Page() {
  const [subcategories, setSubcategories] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = () => {
    GetRequestData(`api/v1/subcategories?page=${currentPage}&limit=10`).then(
      (data) => {
        console.log(data);
        setSubcategories(data);
      }
    );
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm]);
  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="card mb-4">
            <div className="card-header pb-0">
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Sub-Category/Service List</h6>
                </div>

                <div>
                  <Link
                    href="/subcategories/create"
                    className="btn bg-gradient-info"
                  >
                    Add Sub-Category
                  </Link>
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
                        Sub Category
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                        Category
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
                    {subcategories?.data?.length > 0 ? (
                      subcategories?.data.map((sub_cat, index) => (
                        <tr key={index}>
                          <td className="text-center">
                            <span className="text-secondary text-xs font-weight-bold">
                              {index + 1 + (currentPage - 1) * 10}
                            </span>
                          </td>

                          <td>
                            <span className="text-secondary text-xs font-weight-bold">
                              {sub_cat.sub_cat_name}
                            </span>
                          </td>
                          <td>
                            <span className="text-secondary text-xs font-weight-bold">
                              {sub_cat?.cat_id?.cat_name}
                            </span>
                          </td>
                          <td
                            style={{ width: "250px" }}
                            className="text-dark text-xs font-weight-bold"
                          >
                            {sub_cat.description}
                          </td>
                          <td className="text-center">
                            <span className="text-secondary">
                              <img
                                src={sub_cat.sub_cat_icon_url}
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
                                sub_cat.status
                                  ? "bg-gradient-success"
                                  : "bg-gradient-danger"
                              } text-xs font-weight-bold`}
                            >
                              {sub_cat.status ? "Active" : "Inactive"}
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
                              id={sub_cat._id}
                              service="Subcategories"
                              deleteUrl="api/v1/subcategories"
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <NoDataFound colSpan={7} />
                    )}
                  </tbody>
                </table>
              </div>

              <div className="text-center d-flex justify-content-center mt-4">
                <Pagination
                  color="primary"
                  count={subcategories?.pagination?.totalPages}
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
    </>
  );
}

export default Page;
