import { GetRequestData } from "@/Helper/HttpRequestHelper";
import React from "react";

function page() {
  const fetchData = () => {
    GetRequestData(`api/v1/categories`).then((data) => {
      console.log(data);
      setSubcategories(data);
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
          </div>
        </div>
      </div>
    </>
  );
}

export default page;
