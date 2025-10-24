"use client";
import React, { useState } from 'react'
import { GetRequestData, PostRequestData } from "@/Helper/HttpRequestHelper";

function Page() {
    const [categories, setCategories] = useState([])

  const fetchCategories = () => {
    GetRequestData(`api/v1/categories?page=${currentPage}&limit=10&search=${searchTerm}`).then((data) => {
      setCategories(data);
    });
  };
  return (
    <>
        <div className="row">
            <div className="col">
                <h1>Categories</h1>
            </div>
        </div>
    </>
  )
}

export default Page