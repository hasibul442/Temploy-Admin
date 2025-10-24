"use client";
import DeleteButton from "@/Components/Button/DeleteButton";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { formatDate } from "@/Helper/DateTimeHelper";
import { GetRequestData, PostRequestData } from "@/Helper/HttpRequestHelper";
import { Pagination, TextField } from "@mui/material";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { MdEditSquare } from "react-icons/md";
import Swal from "sweetalert2";

function Page() {
  const [tests, setTests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  
  const fetchTests = () => {
    GetRequestData(`api/v1/test?page=${currentPage}&limit=10&search=${searchTerm}`).then((data) => {
      setTests(data);
    });
  };


  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    fetchTests();
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
                  <Link
                    href="/test/create"
                    className="btn bg-gradient-info"
                  >
                    Add Category
                  </Link>
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
                          Test Name
                        </th>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                          Category
                        </th>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                          Branch/Units
                        </th>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                          Price
                        </th>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                          Description
                        </th>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                          Created At
                        </th>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                          Status
                        </th>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tests?.data?.length > 0 ? (
                        tests?.data.map((test, index) => (
                          <tr key={test._id}>
                            <td className="text-center">
                              <span className="text-secondary text-xs font-weight-bold">
                                {index + 1 + (currentPage - 1) * 10}
                              </span>
                            </td>
                            <td>
                              <span className="text-secondary text-xs font-weight-bold">
                                {test.name}
                              </span>
                            </td>
                            <td>
                              <span className="text-secondary text-xs font-weight-bold">
                                {test?.category?.name || "N/A"}
                              </span>
                            </td>
                            <td>
                              {test?.unit_id.length > 0 ? (
                                <span className="text-secondary text-xs font-weight-bold">
                                  {test.unit_id.map((unit) => unit.name).join(", ") || "N/A"}
                                </span>
                              ) : (
                                <span className="text-secondary text-xs font-weight-bold">
                                  N/A
                                </span>
                              )}
                            </td>
                            <td>
                              <span className="text-secondary text-xs font-weight-bold">
                                {test.price}
                              </span>
                            </td>
                            <td>
                              <span className="text-secondary text-xs font-weight-bold">
                                {test.description || "-"}
                              </span>
                            </td>
                            <td>
                              <span className="text-secondary text-xs font-weight-bold">
                                {formatDate(test.createdAt) || "-"}
                              </span>
                            </td>
                            <td>
                              <span className={`badge badge-sm ${test.status ? "bg-gradient-success" : "bg-gradient-danger"} text-xs font-weight-bold`}>
                                {test.status ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="d-flex">
                              <Link href={`/test/update/${test._id}`} className="btn btn-outline-info btn-sm p-2 mx-1" type="button"><MdEditSquare size={16}/></Link>
                              <DeleteButton id={test._id} service="test" deleteUrl="api/v1/test" />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <NoDataFound colSpan={9} />
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="text-center">
                  <Pagination
                    color="primary"
                    count={tests?.pagination?.totalPages}
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
    </>
  );
}

export default Page;
