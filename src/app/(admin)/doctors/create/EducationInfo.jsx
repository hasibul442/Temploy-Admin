"use client";
import { GetRequestData } from "@/Helper/HttpRequestHelper";
import { MenuItem, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa6";

function EducationInfo({ onEducationChange }) {
  const [degreelist, setDegreeList] = useState([]);

  const getDegreeList = async () => {
    GetRequestData(`/api/v1/settings/educations`).then((result) => {
      setDegreeList(result);
    });
  };

  const [educationEntries, setEducationEntries] = useState([
    { id: 1, degree: "", department: "", school: "", year: "" },
  ]);

  const handleAddNewField = () => {
    setEducationEntries([
      ...educationEntries,
      {
        id: educationEntries.length + 1,
        degree: "",
        department: "",
        school: "",
        year: "",
      },
    ]);
  };

  const handleRemoveField = (id) => {
    setEducationEntries(educationEntries.filter((entry) => entry.id !== id));
  };

  const handleInputChange = (id, field, value) => {
    setEducationEntries(
      educationEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  useEffect(() => {
    getDegreeList();
  }, []);

  useEffect(() => {
    onEducationChange(educationEntries);
  }, [educationEntries, onEducationChange]);
  return (
    <>
      {educationEntries.map((entry, index) => (
        <div className="row" key={entry.id}>
          <div className="col-3 mb-3">
            <TextField
              label="Degree"
              variant="outlined"
              fullWidth
              value={entry.degree}
              onChange={(e) =>
                handleInputChange(entry.id, "degree", e.target.value)
              }
              select
            >
              {degreelist.map((degree) => (
                <MenuItem key={degree._id} value={degree.full_name}>
                  {degree.full_name}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <div className="col-3 mb-3">
            <TextField
              label="Department"
              variant="outlined"
              fullWidth
              value={entry.department}
              onChange={(e) =>
                handleInputChange(entry.id, "department", e.target.value)
              }
            />
          </div>
          <div className="col-3 mb-3">
            <TextField
              label="School/College/University"
              variant="outlined"
              fullWidth
              value={entry.school}
              onChange={(e) =>
                handleInputChange(entry.id, "school", e.target.value)
              }
            />
          </div>
          <div className="col-2 mb-3">
            <TextField
              label="Year of Graduation"
              variant="outlined"
              fullWidth
              value={entry.year}
              onChange={(e) =>
                handleInputChange(entry.id, "year", e.target.value)
              }
            />
          </div>
          <div className="col-1 mb-3">
            {index === 0 ? (
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleAddNewField}
              >
                <FaPlus />
              </button>
            ) : (
              <button
                className="btn btn-danger"
                type="button"
                onClick={() => handleRemoveField(entry.id)}
              >
                <FaMinus />
              </button>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

export default EducationInfo;
