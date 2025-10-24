"use client";
import DeleteButton from "@/Components/Button/DeleteButton";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { GetRequestData, PostRequestData } from "@/Helper/HttpRequestHelper";
import { Pagination } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Swal from "sweetalert2";
import UpdateForm from "./UpdateForm";

function Page() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchData = () => {
    GetRequestData(
      `/api/v1/settings/specialities?page=${currentPage}&limit=20`
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
      name: name,
      description: description,
    };

    PostRequestData(formData, "api/v1/settings/specialities")
      .then((data) => {
        if (data?.status === "success") {
          fetchData();
          setName("");
          setDescription("");
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
                  <h6>Specialities List</h6>
                </div>

                <div>
                  <button
                    type="button"
                    className="btn bg-gradient-info"
                    onClick={handleShow}
                  >
                    Add Speciality
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body px-0 pt-0 pb-2">
              <div className="p-0">
                <table className="table align-items-center mb-0">
                  <thead>
                    <tr>
                      <th className="text-center text-secondary text-xxs font-weight-bolder opacity-7">
                        #
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                        Specialities Name
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                        Description
                      </th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {data?.data?.length > 0 ? (
                      data?.data.map((speciality, index) => (
                        <tr key={speciality._id}>
                          <td className="text-center text-secondary text-xxs font-weight-bolder">
                            {index + 1 + (currentPage - 1) * 10}
                          </td>
                          <td className="text-uppercase text-secondary text-xxs font-weight-bolder ps-2">
                            {speciality.name}
                          </td>
                          <td className="text-secondary text-xxs font-weight-bolder">
                            {speciality.description || "-"}
                          </td>
                          <td className="d-flex">
                            <UpdateForm id={speciality._id} name_={speciality.name} description_={speciality.description} onUpdate={fetchData} />
                            <DeleteButton
                              id={speciality._id}
                              service="speciality"
                              deleteUrl="api/v1/settings/specialities"
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <NoDataFound colSpan={3} />
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
                <h5 className="modal-title" id="addSpecialityModalLabel">
                  Add Speciality
                </h5>
              </Modal.Header>
              <div className="modal-body">
                <form>
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      placeholder="Enter Speciality Name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="name">Description</label>
                    <textarea
                      className="form-control"
                      id="description"
                      placeholder="Enter Speciality Description"
                      required
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
