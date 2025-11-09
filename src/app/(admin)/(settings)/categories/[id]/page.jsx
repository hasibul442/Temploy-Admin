"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GetDetails, UpdateRequestData } from "@/Helper/HttpRequestHelper";
import { toBase64 } from "@/Helper/Hepler";

function Page() {
  const [categories, setCategories] = useState({});
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [existingIconUrl, setExistingIconUrl] = useState("");
  const [newIconFile, setNewIconFile] = useState("");
  const [status, setStatus] = useState(true);
  const [updatedBy, setUpdatedBy] = useState("");

  const params = useParams();

  const fetchCategories = async () => {
    if (!params?.id) return;
    try {
      const res = await GetDetails(`api/v1/categories/${params.id}`);
      const payload = res?.data ?? res;
      setCategories(payload);
      setName(payload?.cat_name);
      setDescription(payload?.description);
      setExistingIconUrl(payload?.cat_icon_url);
      setStatus(Boolean(payload?.status));
      setUpdatedBy(payload?.updated_by);
    } catch (err) {
      console.error("Failed to fetch category:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [params?.id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    let icon = null;

    if (newIconFile != null) {
      icon = await toBase64(newIconFile);
    }

    const updatedData = {
      cat_name: name,
      description,
      cat_icon_url: newIconFile ? icon : existingIconUrl,
      status,
      updated_by: updatedBy,
    };

    UpdateRequestData(updatedData, `api/v1/categories/${params.id}`)
      .then((data) => {
        console.log("Category updated successfully:", data);
      })
      .catch((err) => {
        console.error("Failed to update category:", err);
      });
  };

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="card mb-4">
            <div className="card-header pb-0">
              <div>
                <h6>Update Category</h6>
              </div>
            </div>

            <div className="card-body px-3 pt-0 pb-2">
              <div className="row">
                <div className="col-6">
                  <div className="form-group mb-2">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      placeholder="Fitness & Wellness Support"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="form-group mb-2">
                    <label htmlFor="iconUrl">Icon</label>
                    <input
                      type="file"
                      className="form-control"
                      id="iconUrl"
                      placeholder="https://example.com/icon.png"
                      onChange={(e) => setNewIconFile(e.target.files[0])}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      className="form-control"
                      id="status"
                      value={status ? "true" : "false"}
                      onChange={(e) => setStatus(e.target.value === "true")}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
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

                  <div className="mt-3">
                    <button
                      className="btn btn-secondary mx-2"
                      onClick={() => window.history.back()}
                    >
                      Back
                    </button>
                    <button className="btn btn-primary" onClick={handleUpdate}>
                      Update Category
                    </button>
                  </div>
                </div>
                <div className="col-6 text-center">
                  <img
                    src={existingIconUrl}
                    alt=""
                    className="img-fluid"
                    style={{ maxHeight: "200px", objectFit: "contain" }}
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
