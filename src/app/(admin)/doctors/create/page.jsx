"use client";
import { MenuItem, TextField } from "@mui/material";
import React, { useState } from "react";
import EducationInfo from "./EducationInfo";
import Specialization from "./Specialization";
import ConsultationDate from "./ConsultationDate";

function Page() {
  const [f_name, setFName] = useState("");
  const [l_name, setLName] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [educationInformation, setEducationInformation] = useState([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [availableDaysAndTimes, setAvailableDaysAndTimes] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [specialization, setSpecialization] = useState([]);

  const handleEducationChange = (newEducation) => {
    setEducationInformation(newEducation);
  };

  const handleSpecializationChange = (newSpecialization) => {
    setSpecialization(newSpecialization);
  };

  const handleSubmitData = (e) => {
    e.preventDefault();
    const formData = {
      first_name: f_name,
      last_name: l_name,
      gender,
      date_of_birth: dob,
      email,
      phone_number: phone,
      education: educationInformation,
    };

    console.log(formData);
  };
  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="card mb-4">
            <div className="card-header pb-0">
              <h5>Add Doctor Info</h5>
            </div>

            <div className="card-body">
              <h6>Personal Information</h6>
              <div className="row">
                <div className="col-4 mb-3">
                  <TextField
                    label="First Name"
                    variant="outlined"
                    fullWidth
                    value={f_name}
                    onChange={(e) => setFName(e.target.value)}
                  />
                </div>
                <div className="col-4 mb-3">
                  <TextField
                    label="Last Name"
                    variant="outlined"
                    fullWidth
                    value={l_name}
                    onChange={(e) => setLName(e.target.value)}
                  />
                </div>
                <div className="col-4 mb-3">
                  <TextField
                    label="Gender"
                    variant="outlined"
                    fullWidth
                    select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                </div>
                <div className="col-4 mb-3">
                  <TextField
                    label="Date of Birth"
                    type="date"
                    variant="outlined"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
                <div className="col-4 mb-3">
                  <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="col-4 mb-3">
                  <TextField
                    label="Phone"
                    variant="outlined"
                    fullWidth
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <h6>Academic Information</h6>
              <EducationInfo onEducationChange={handleEducationChange} />

              <h6>Experience And Specialization</h6>
              <div className="row">
                <div className="col-8 mb-3">
                  <div className="row">
                    <div className="col-4 mb-3">
                      <TextField
                        label="Experience (Years)"
                        variant="outlined"
                        fullWidth
                        type="number"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                      />
                    </div>
                    <div className="col-4 mb-3">
                      <TextField
                        label="License Number"
                        variant="outlined"
                        fullWidth
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                      />
                    </div>
                    <div className="col-4 mb-3">
                      <TextField
                        label="Consultation Fee"
                        variant="outlined"
                        fullWidth
                        type="text"
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(e.target.value)}
                      />
                    </div>

                    <div className="col-12 mb-4">
                      <h6>Consultation Date and Time</h6>
                    </div>

                    <div className="col-12 mb-4">
                      <ConsultationDate />
                    </div>
                  </div>
                </div>
                <div className="col-4 mb-3">
                  <h6>Specialization</h6>
                  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    <Specialization
                    onSpecializationChange={handleSpecializationChange}
                  />
                  </div>
                </div>
              </div>
              <hr />
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleSubmitData}
              >
                Save Doctor Info
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Page;
