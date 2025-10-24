import React, { useState } from "react";
import { Checkbox, FormControlLabel, TextField, Grid } from "@mui/material";

function ConsultationDate() {
  const dayList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Initialize schedule state: one object per day
  const [schedule, setSchedule] = useState(
    dayList.map((day) => ({
      day,
      isActive: false,
      startTime: "",
      endTime: "",
    }))
  );

  const handleDayToggle = (index) => {
    const updated = [...schedule];
    updated[index].isActive = !updated[index].isActive;
    setSchedule(updated);
  };

  const handleTimeChange = (index, field, value) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
  };

  return (
    <div>
      {schedule.map((item, index) => (
        <div className="row mb-3" key={item.day}>
          <div className="col-4">
            <FormControlLabel
              control={
                <Checkbox
                  checked={item.isActive}
                  onChange={() => handleDayToggle(index)}
                />
              }
              label={item.day}
            />
          </div>
          <div className="col-4">
            <TextField
              label="Start Time"
              type="time"
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              inputProps={{ step: 300 }} // 5 min steps
              disabled={!item.isActive}
              value={item.startTime}
              onChange={(e) => handleTimeChange(index, "startTime", e.target.value)}
            />
          </div>
          <div className="col-4">
            <TextField
              label="End Time"
              type="time"
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              inputProps={{ step: 300 }}
              disabled={!item.isActive}
              value={item.endTime}
              onChange={(e) => handleTimeChange(index, "endTime", e.target.value)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ConsultationDate;
