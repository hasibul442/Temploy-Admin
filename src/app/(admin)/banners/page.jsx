"use client";
import DeleteButton from "@/Components/Button/DeleteButton";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { GetRequestData } from "@/Helper/HttpRequestHelper";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { MdEditSquare } from "react-icons/md";

function Page() {
  const [data, setData] = useState([]);

  const fetchData = () => {
    GetRequestData(`api/v1/banners`).then((data) => {
      setData(data);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="card mb-4">
            <div className="card-header pb-0">
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Levels</h6>
                </div>

                <div>
                  <button
                    type="button"
                    className="btn bg-gradient-info"
                    // onClick={handleShow}
                  >
                    Add Banner
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body px-0 pt-0 pb-2">
              <div className="mx-3">
                <div className="row">
                  {data?.data?.length > 0 ? (
                    data?.data.map((item, index) => (
                      <div className="col-sm-4 mb-4" key={item._id}>
                        <div
                          style={{ maxHeight: "300px", height: "300px" }}
                          className="card shadow-lg border-0"
                        >
                          <img
                            style={{ height: 120 }}
                            src={item?.banner}
                            alt={item?.title}
                            className="card-img-top object-fit-cover"
                          />
                          <div className="card-body pb-0">
                            <h6>{item?.title} </h6>
                            <p
                              style={{
                                fontSize: "14px",
                                padding: "0",
                                margin: "0",
                              }}
                            >
                              {item?.description}
                            </p>
                          </div>
                          <div className="card-footer">
                            <Link
                              className="btn btn-outline-info btn-sm p-2 mx-1"
                              href={`/banners/${item._id}`}
                            >
                              <MdEditSquare size={16} />
                            </Link>
                            <DeleteButton
                              id={item._id}
                              service="Banner"
                              deleteUrl="api/v1/banner"
                            />
                            <h6
                              className={`badge badge-sm item.status ${
                                item?.status
                                  ? "bg-gradient-success"
                                  : "bg-gradient-danger"
                              } text-xs font-weight-bold`}
                            >
                              {item?.status ? "Active" : "Inactive"}
                            </h6>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <h5 className="text-center">No Data Found</h5>
                  )}
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
