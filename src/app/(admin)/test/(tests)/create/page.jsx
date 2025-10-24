"use client";
import { GetRequestData, PostRequestData } from "@/Helper/HttpRequestHelper";
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  FormGroup,
  Radio,
  RadioGroup,
  TextField,
  Checkbox,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

function Page() {
  const [testCategories, setTestCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [units, setUnits] = useState([]);

  const [selectedUnits, setSelectedUnits] = useState([]);
  const [category, setCategory] = useState("");
  const [testName, setTestName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const fetchTestCategories = () => {
    GetRequestData(
      `api/v1/test/category?page=1&limit=200&search=${categorySearch}`
    ).then((data) => {
      setTestCategories(data.data);
    });
  };

  const fetchUnits = () => {
    GetRequestData(`api/v1/unit`).then((data) => {
      setUnits(data);
    });
  };

  useEffect(() => {
    fetchTestCategories();
  }, [categorySearch]);

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleToggleUnit = (unitId) => (event) => {
    const checked = event.target.checked;
    setSelectedUnits((prev) => {
      if (checked) {
        return prev.includes(unitId) ? prev : [...prev, unitId];
      }
      return prev.filter((id) => id !== unitId);
    });
  };

  const handleAddTest = () => {
    const newtestData = {
      category: category,
      name: testName,
      price: price,
      description: description,
      unit_id: selectedUnits,
    };

    PostRequestData(newtestData, "api/v1/test")
      .then((data) => {
        // setCategory("");
        setTestName("");
        setPrice("");
        setDescription("");
        // setSelectedUnits([]);
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
              <h5>Add Test</h5>
            </div>

            <div className="card-body">
              <div className="row">
                <div className="col-sm-5">
                  <div className="d-flex justify-content-between pb-3 border-bottom">
                    <h6>Test Category</h6>
                    <div>
                      <TextField
                        required
                        id="search"
                        label="Search Category"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        fullWidth
                      />
                    </div>
                  </div>
                  <FormControl>
                    <RadioGroup
                      row
                      aria-labelledby="demo-controlled-radio-buttons-group"
                      name="controlled-radio-buttons-group"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {testCategories.map((category) => (
                        <FormControlLabel
                          key={category._id}
                          value={category._id}
                          control={<Radio />}
                          label={category.name}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </div>

                <div className="col-sm-5">
                  <div className="mb-3">
                    <TextField
                      required
                      id="testName"
                      label="Test Name"
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      fullWidth
                    />
                  </div>

                  <div className="mb-3">
                    <TextField
                      required
                      id="price"
                      label="Price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      fullWidth
                    />
                  </div>

                  <div className="mb-3">
                    <TextField
                      id="description"
                      label="Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      fullWidth
                      multiline
                      rows={4}
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      className="btn bg-gradient-info"
                      onClick={handleAddTest}
                    >
                      Add Test
                    </button>
                  </div>
                </div>

                <div className="col-sm-2">
                  <div className="mb-3">
                    <FormControl component="fieldset" variant="standard">
                      <FormLabel component="legend">Units</FormLabel>
                      <FormGroup row>
                        {units?.map((u) => (
                          <FormControlLabel
                            key={u._id}
                            control={
                              <Checkbox
                                checked={selectedUnits.includes(u._id)}
                                onChange={handleToggleUnit(u._id)}
                                name={u.name}
                              />
                            }
                            label={u.name}
                          />
                        ))}
                      </FormGroup>
                    </FormControl>
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

export default Page;
