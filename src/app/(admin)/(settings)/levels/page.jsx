"use client";
import DeleteButton from "@/Components/Button/DeleteButton";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { GetRequestData, PostRequestData } from "@/Helper/HttpRequestHelper";
import { set } from "mongoose";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { MdEditSquare } from "react-icons/md";
import Swal from "sweetalert2";

function Page() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [data, setData] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(true);

  const fetchData = () => {
    GetRequestData(`api/v1/levels`).then((data) => {
      setData(data);
    });
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    const newLevel = {
      name,
      description,
      status,
    };

    PostRequestData(newLevel, `api/v1/levels`)
      .then((data) => {
        fetchData();

        setName("");
        setDescription("");
        setStatus(true);

        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Your work has been saved",
          showConfirmButton: false,
          timer: 1500,
        });

        handleClose();
      })
      .catch((err) => {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Failed to save level",
          showConfirmButton: false,
          timer: 1500,
        });
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
                    onClick={handleShow}
                  >
                    Add Level
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
                        Name
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
                              {index + 1}
                            </span>
                          </td>
                          <td>
                            <span className="text-secondary text-xs font-weight-bold">
                              {item.name}
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
                              deleteUrl="api/v1/level"
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
                      placeholder="Level Name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
