"use client";
import { toBase64 } from "@/Helper/Hepler";
import { GetRequestData, PostRequestData } from "@/Helper/HttpRequestHelper";
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa6";
import Swal from "sweetalert2";

function page() {
  const [categories, setCategories] = useState([]);
  const [rows, setRows] = useState([
    { skill_name: "", status: true, description: "" },
  ]);
  const [createdBy, setCreatedBy] = useState("");
  const [updatedBy, setUpdatedBy] = useState("");

  const handleAddRow = () => {
    setRows([...rows, { skill_name: "", status: true, description: "" }]);
  };

  const handleDeleteRow = (index) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
  };

  const handleChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const handleSubmitData = async (e) => {
    e.preventDefault();
    let completed = 0;

    Swal.fire({
      title: "Uploading Subcategories...",
      html: `
      <div class="progress" style="height: 25px;">
        <div id="progress-bar" class="progress-bar progress-bar-striped progress-bar-animated" 
          role="progressbar" style="width: 0%; text-align:center;">0%</div>
      </div>
    `,
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    for (let i = 0; i < rows.length; i++) {
      try {
        const slug = rows[i].skill_name
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/[^\w-]+/g, "");

        const newCategory = {
          skill_name: rows[i].skill_name,
          status: rows[i].status,
          description: rows[i].description,
          slug: slug,
          created_by: createdBy,
          updated_by: updatedBy,
        };

        await PostRequestData(newCategory, "api/v1/skills");

        // Update progress
        completed++;
        const progressPercent = Math.round((completed / rows.length) * 100);
        const progressBar =
          Swal.getHtmlContainer().querySelector("#progress-bar");
        progressBar.style.width = `${progressPercent}%`;
        progressBar.textContent = `${progressPercent}%`;
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Failed to save subcategory",
          text: error.message || "Something went wrong!",
        });
        return;
      }
    }
    Swal.fire({
      icon: "success",
      title: "All subcategories saved!",
      showConfirmButton: false,
      timer: 1500,
    });
    setRows([{ skill_name: "", status: true, description: "" }]);
    setCreatedBy("");
    setUpdatedBy("");
  };

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="card mb-4">
            <div className="card-header pb-0">
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Skill Add</h6>
                </div>
              </div>
            </div>

            <div className="card-body px-0 pt-0 pb-2">
              <div className="p-3">
                <div className="row">
                  <div className="col-12">
                    <form>
                      {rows.map((row, index) => (
                        <div className="row" key={index}>
                          <div className="col-3">
                            <div className="form-group">
                              <label htmlFor={`name-${index}`}>Name</label>
                              <input
                                type="text"
                                className="form-control"
                                id={`name-${index}`}
                                placeholder="Skill Name"
                                required
                                value={row?.skill_name}
                                onChange={(e) =>
                                  handleChange(
                                    index,
                                    "skill_name",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="col-3">
                            <div className="form-group">
                              <label htmlFor={`status-${index}`}>Status</label>
                              <select
                                className="form-control"
                                id={`status-${index}`}
                                value={row.status}
                                onChange={(e) =>
                                  handleChange(
                                    index,
                                    "status",
                                    e.target.value === "true"
                                  )
                                }
                              >
                                <option value={true}>Active</option>
                                <option value={false}>Inactive</option>
                              </select>
                            </div>
                          </div>

                          <div className="col-4">
                            <div className="form-group">
                              <label htmlFor={`description-${index}`}>
                                Description
                              </label>
                              <input
                                className="form-control"
                                id={`description-${index}`}
                                value={row.description}
                                onChange={(e) =>
                                  handleChange(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="col-2 d-flex align-items-end">
                            <div className="d-flex gap-2">
                              {index === rows.length - 1 && (
                                <button
                                  type="button"
                                  className="btn btn-primary btn-icon btn-2"
                                  onClick={handleAddRow}
                                >
                                  <FaPlus />
                                </button>
                              )}

                              {/* Delete Button */}
                              {rows.length > 1 && (
                                <button
                                  type="button"
                                  className="btn btn-danger btn-icon btn-2"
                                  onClick={() => handleDeleteRow(index)}
                                >
                                  <FaTrash />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </form>

                    <div className="mt-4 d-flex justify-content-center gap-3">
                      <button
                        className="btn btn-dark"
                        onClick={() => window.history.back()}
                      >
                        Back
                      </button>
                      <button
                        className="btn btn-success"
                        onClick={handleSubmitData}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default page;
