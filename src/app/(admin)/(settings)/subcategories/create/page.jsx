"use client";
import { GetRequestData } from "@/Helper/HttpRequestHelper";
import React, { useState } from "react";

function page() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [status, setStatus] = useState(true);
  const [createdBy, setCreatedBy] = useState("");
  const [updatedBy, setUpdatedBy] = useState("");
  const [catId, setCatId] = useState("");
  const fetchData = () => {
    GetRequestData(`api/v1/categories`).then((data) => {
      setCategories(data);
    });
  };

  const handleSubmitCategory = (e) => {
    e.preventDefault();
    const slug = name.toLowerCase().replace(/ /g, "-");
    const newCategory = {
      sub_cat_name: name,
      sub_cat_icon_url:
        "https://i.fbcd.co/products/resized/resized-750-500/563d0201e4359c2e890569e254ea14790eb370b71d08b6de5052511cc0352313.jpg",
      status: status,
      description: description,
      slug: slug,
      cat_id: catId,
      // created_by: createdBy,
      // updated_by: updatedBy,
    };

    PostRequestData(newCategory, "api/v1/categories")
      .then((data) => {
        // append the new category into the existing categories.data array
        fetchData();

        // Reset form fields
        setName("");
        setDescription("");
        setIconUrl("");
        setStatus(true);
        setCreatedBy("");
        setUpdatedBy("");

        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Your work has been saved",
          showConfirmButton: false,
          timer: 1500,
        });

        handleClose();
      })
      .catch((error) => {
        console.error(error);
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Failed to save category",
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
                  <h6>Subcategory Add</h6>
                </div>
              </div>
            </div>

            <div className="card-body px-0 pt-0 pb-2">
              <div className="p-3">
                <form>
                  <div className="row">
                    <div className="col-6">
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
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="iconUrl">Icon URL</label>
                    <input
                      type="file"
                      className="form-control"
                      id="iconUrl"
                      placeholder="https://example.com/icon.png"
                      required
                      onChange={(e) => setIconUrl(e.target.files[0])}
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default page;
