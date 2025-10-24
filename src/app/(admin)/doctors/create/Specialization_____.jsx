"use client";
import { GetRequestData } from "@/Helper/HttpRequestHelper";
import { InputLabel, MenuItem, OutlinedInput, Select } from "@mui/material";
import React, { useEffect, useState } from "react";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function Specialization({ onSpecializationChange }) {
  const [specializationList, setSpecializationList] = useState([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);

  const getSpecializationList = async () => {
    GetRequestData(`/api/v1/settings/specialities`).then((result) => {
      setSpecializationList(result);
    });
  };

  useEffect(() => {
    getSpecializationList();
  }, []);

  // Handle selection change: value is array of selected specialization objects
  const handleChange = (event) => {
    const {
      target: { value },
    } = event;

    // value can sometimes be a string (if autofill), normalize to array
    const newSelected = typeof value === "string" ? value.split(",") : value;

    setSelectedSpecializations(newSelected);
    onSpecializationChange(newSelected);
  };

  return (
    <>
      <Select
        label="Specialization"
        id="specialization-multiple"
        multiple
        value={selectedSpecializations}
        onChange={handleChange}
        fullWidth
        input={<OutlinedInput label="Specialization" />}
        MenuProps={MenuProps}
        renderValue={(selected) =>
          selected.map((spec) => spec.name).join(", ")
        }
      >
        {specializationList.map((spec) => (
          <MenuItem key={spec._id} value={spec}>
            {spec.name}
          </MenuItem>
        ))}
      </Select>
    </>
  );
}

export default Specialization;
