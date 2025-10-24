"use client";
import { GetRequestData } from "@/Helper/HttpRequestHelper";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import React, { useEffect, useState } from "react";

function Specialization({ onSpecializationChange }) {
  const [specializationList, setSpecializationList] = useState([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);

  const getSpecializationList = async () => {
    GetRequestData(`/api/v1/settings/specialities`).then((result) => {
      setSpecializationList(result || []);
    });
  };

  useEffect(() => {
    getSpecializationList();
  }, []);

  const handleCheckboxChange = (spec, isChecked) => {
    const newSelected = isChecked
      ? [...selectedSpecializations, spec]
      : selectedSpecializations.filter((s) => s?._id !== spec?._id);

    setSelectedSpecializations(newSelected);
    onSpecializationChange(newSelected);
  };

  return (
    <>
      <FormGroup>
        {specializationList.map((spec) => (
        <FormControlLabel
          key={spec._id}
          control={
            <Checkbox
              checked={selectedSpecializations.some((s) => s?._id === spec?._id)}
              onChange={(e) => handleCheckboxChange(spec, e.target.checked)}
            />
          }
          label={spec.name}
        />
      ))}
      </FormGroup>
    </>
  );
}

export default Specialization;
