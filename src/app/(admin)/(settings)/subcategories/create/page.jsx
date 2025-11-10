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
    { name: "", iconUrl: null, status: true, description: "" },
  ]);
  const [createdBy, setCreatedBy] = useState("");
  const [updatedBy, setUpdatedBy] = useState("");
  const [catId, setCatId] = useState("");

  const fetchCatData = () => {
    GetRequestData(`api/v1/categories`).then((data) => {
      setCategories(data);
    });
  };

  const handleAddRow = () => {
    setRows([
      ...rows,
      { name: "", iconUrl: null, status: true, description: "" },
    ]);
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

  const handleSubmitSubCat = async (e) => {
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
        const base64String = await toBase64(rows[i].iconUrl);
        const slug = rows[i].name
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/[^\w-]+/g, "");

        const newCategory = {
          cat_id: catId,
          sub_cat_name: rows[i].name,
          sub_cat_icon_url: base64String,
          status: rows[i].status,
          description: rows[i].description,
          slug: slug,
          created_by: createdBy,
          updated_by: updatedBy,
        };

        await PostRequestData(newCategory, "api/v1/subcategories");

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
    setCatId("");
    setRows([{ name: "", iconUrl: null, status: true, description: "" }]);
    setCreatedBy("");
    setUpdatedBy("");
  };

  useEffect(() => {
    fetchCatData();
  }, []);
  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="card mb-4">
            <div className="card-header pb-0">
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Subcategory Add</h6>
                </div>
              </div>
            </div>

            <div className="card-body px-0 pt-0 pb-2">
              <div className="p-3">
                <div className="row">
                  <div className="col-12">
                    <div>
                      <FormControl>
                        <FormLabel id="demo-radio-buttons-group-label">
                          Select Category
                        </FormLabel>
                        <RadioGroup
                          row
                          aria-labelledby="demo-radio-buttons-group-label"
                          defaultValue=""
                          name="radio-buttons-group"
                        >
                          {categories?.data?.map((category) => (
                            <FormControlLabel
                              key={category._id}
                              value={category._id}
                              control={<Radio />}
                              label={category.cat_name}
                              onChange={() => setCatId(category._id)}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </div>
                  </div>
                  <div className="col-12">
                    <br />
                    <br />
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
                                placeholder="Enter Subcategory Name"
                                required
                                value={row?.name}
                                onChange={(e) =>
                                  handleChange(index, "name", e.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div className="col-3">
                            <div className="form-group">
                              <label htmlFor={`icon-${index}`}>Icon</label>
                              <input
                                type="file"
                                className="form-control"
                                id={`icon-${index}`}
                                required
                                onChange={(e) =>
                                  handleChange(
                                    index,
                                    "iconUrl",
                                    e.target.files[0]
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="col-1">
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

                          <div className="col-3">
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
                      <button className="btn btn-dark" onClick={handleSubmitSubCat}>
                        Back
                      </button>
                      <button className="btn btn-success" onClick={handleSubmitSubCat}>
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
