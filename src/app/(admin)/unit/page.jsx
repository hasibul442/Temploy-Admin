"use client";
import DeleteButton from "@/Components/Button/DeleteButton";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { GetRequestData, PostRequestData } from "@/Helper/HttpRequestHelper";
import React, { useEffect, useState } from "react";
import { MdEditSquare } from "react-icons/md";
import Swal from "sweetalert2";

function Page() {
  const [units, setUnits] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmitUnit = (e) => {
    e.preventDefault();

    const unitData = {
      name,
      email,
      phone,
      address,
      status: true,
    };
    PostRequestData(unitData, "api/v1/unit")
      .then((data) => {
        setUnits([...units, data]);
        setName("");
        setEmail("");
        setPhone("");
        setAddress("");
        document.getElementById("exampleModal").classList.remove("show");
        document.querySelector(".modal-backdrop").remove();
      }).then(() => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Your work has been saved",
          showConfirmButton: false,
          timer: 1500
        });
      })};

    const fetchUnits = () => {
      GetRequestData("api/v1/unit")
        .then((data) => {
          setUnits(data);
        })
        .catch((error) => {
          console.error("Error fetching units:", error);
        });
    };

    useEffect(() => {
      fetchUnits();
    }, []);
    return (
      <>
        <div className="row">
          <div className="col-12">
            <div className="card mb-4">
              <div className="card-header pb-0">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6>Branch/Units List</h6>
                  </div>

                  <div>
                    <button
                      type="button"
                      className="btn bg-gradient-info"
                      data-bs-toggle="modal"
                      data-bs-target="#exampleModal"
                    >
                      Add Unit
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body px-0 pt-0 pb-2">
                <div className="table-responsive p-0">
                  <table className="table align-items-center mb-0 ">
                    <thead>
                      <tr>
                        <th className="text-center text-secondary text-xxs font-weight-bolder opacity-7">
                          #
                        </th>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                          Name
                        </th>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                          Address
                        </th>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                          Phone
                        </th>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                          Email
                        </th>
                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                          Status
                        </th>
                        <th className="text-secondary opacity-7"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {units.length === 0 ? (
                        <NoDataFound colSpan={7} />
                      ) : (
                        units.map((unit, index) => (
                          <tr key={unit._id}>
                            <td className="align-middle text-center text-xs">
                              {index + 1}
                            </td>
                            <td className="text-xs font-weight-bold">
                              {unit.name}
                            </td>
                            <td className="text-xs font-weight-bold">
                              {unit.address}
                            </td>
                            <td className="text-xs">{unit.phone}</td>
                            <td className="align-middle text-xs">{unit.email}</td>
                            <td className="align-middle text-xs">
                              <span
                                className={`badge badge-sm ${unit.status
                                  ? "bg-gradient-success"
                                  : "bg-gradient-danger"
                                  }`}
                              >
                                {unit.status ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="align-middle">
                              <button className="btn btn-outline-info btn-sm p-2 mx-2" type="button"><MdEditSquare size={16}/></button>
                              <DeleteButton id={unit._id} service="unit" deleteUrl="api/v1/unit" />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section>
          <div
            className="modal fade"
            id="exampleModal"
            tabIndex="-1"
            role="dialog"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalLabel">
                    Unit Add
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
                      <label htmlFor="email">Email address</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="name@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        id="phone"
                        placeholder="(123) 456-7890"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="address">Address</label>
                      <textarea
                        className="form-control"
                        id="address"
                        rows="3"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
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
                    onClick={handleSubmitUnit}
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
