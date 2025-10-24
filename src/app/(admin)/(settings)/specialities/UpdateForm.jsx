"use client";
import { GetDetails, UpdateRequestData } from "@/Helper/HttpRequestHelper";
import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { MdEditSquare } from "react-icons/md";
import Swal from "sweetalert2";

function UpdateForm({ id, name_, description_, onUpdate }) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [name, setName] = useState(name_);
  const [description, setDescription] = useState(description_);

  const handleUpdateData = (e) => {
    e.preventDefault();

    const formData = {
      name: name,
      description: description,
    };

    UpdateRequestData(formData, `api/v1/settings/specialities/${id}`).then(
      (data) => {
        if (data?.status === "success") {
          handleClose();
          onUpdate();
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Your work has been saved",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    );
  };
  return (
    <>
      <button
        className="btn btn-outline-info btn-sm p-2 mx-1"
        type="button"
        onClick={handleShow}
      >
        <MdEditSquare size={16} />
      </button>

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
                  onClick={handleUpdateData}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </section>
    </>
  );
}

export default UpdateForm;
