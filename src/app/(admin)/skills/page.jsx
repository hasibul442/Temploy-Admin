"use client";
import DeleteButton from "@/Components/Button/DeleteButton";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { GetRequestData } from "@/Helper/HttpRequestHelper";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Pagination, TextField } from "@mui/material";
import { MdEditSquare } from "react-icons/md";

function Page() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = () => {
    GetRequestData(`api/v1/skills?page=${currentPage}&limit=10`).then(
      (data) => {
        setData(data);
      }
    );
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);
  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="card mb-4">
            <div className="card-header pb-0">
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Skills</h6>
                </div>

                <div>
                  <Link href="/skills/create" className="btn bg-gradient-info">
                    Add Skills
                  </Link>
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
                        Name
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                        Tag
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Description
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
                    {data?.data?.length > 0 ? (
                      data?.data.map((item, index) => (
                        <tr key={index}>
                          <td className="text-center">
                            <span className="text-secondary text-xs font-weight-bold">
                              {index + 1 + (currentPage - 1) * 10}
                            </span>
                          </td>
                          <td>
                            <span className="text-secondary text-xs font-weight-bold">
                              {item.skill_name}
                            </span>
                          </td>
                          <td>
                            <span className="text-secondary text-xs font-weight-bold">
                              {item.slug}
                            </span>
                          </td>
                          <td>
                            <span className="text-secondary text-xs font-weight-bold">
                              {item.description}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge item.status ${
                                item.status
                                  ? "bg-gradient-success"
                                  : "bg-gradient-danger"
                              } text-xs font-weight-bold`}
                            >
                              {item.status ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="d-flex">
                            <Link
                              className="btn btn-outline-info btn-sm p-2 mx-1"
                              href={`/level/${item._id}`}
                            >
                              <MdEditSquare size={16} />
                            </Link>
                            <DeleteButton
                              id={item._id}
                              service="Level"
                              deleteUrl="api/v1/skills"
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

              <div className="text-center d-flex justify-content-center mt-4">
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
    </>
  );
}

export default Page;
