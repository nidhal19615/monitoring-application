import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const PrometheusChart = () => {
  const [podCount, setPodCount] = useState(0);
  const [podError, setPodError] = useState(null);
  const [podStartDate, setPodStartDate] = useState(dayjs().subtract(1, "day"));
  const [podEndDate, setPodEndDate] = useState(dayjs());

  useEffect(() => {
    const fetchPodData = async () => {
      try {
        if (podEndDate > dayjs()) {
          setPodCount(0);
          return;
        }

        const response = await axios.get("http://98.66.205.79/api/v1/query", {
          params: {
            query: "count(up)",
            start: podStartDate.toISOString(),
            end: podEndDate.toISOString(),
          },
        });

        console.log("Pod Data Response:", response.data);

        const result = response.data.data.result;
        const count = result.length > 0 ? parseInt(result[0].value[1]) : 0;
        setPodCount(count);
      } catch (error) {
        console.error("Error fetching pod data:", error);
        setPodCount(0);
        setPodError("Error fetching pod data");
      }
    };

    fetchPodData();
  }, [podStartDate, podEndDate]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        minHeight="100vh"
        bgcolor="#e8f5e9"
      >
        <Box width="100%" maxWidth={600} m={2}>
          <Card sx={{ width: "100%", boxShadow: 3, margin: "16px" }}>
            <CardContent>
              <Typography
                variant="h5"
                component="div"
                mb={2}
                textAlign="center"
                color="#388e3c"
              >
                Number of Pods
              </Typography>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                mb={2}
              >
                <Typography
                  variant="body1"
                  component="div"
                  textAlign="center"
                  color="#388e3c"
                >
                  Date Range for Pods:
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                mb={2}
              >
                <DateTimePicker
                  label="Start Date & Time"
                  value={podStartDate}
                  onChange={(newValue) => setPodStartDate(newValue)}
                  inputProps={{
                    style: { color: "#388e3c" },
                  }}
                />
              </Box>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                mb={2}
              >
                <DateTimePicker
                  label="End Date & Time"
                  value={podEndDate}
                  onChange={(newValue) => setPodEndDate(newValue)}
                  inputProps={{
                    style: { color: "#388e3c" },
                  }}
                />
              </Box>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                mb={2}
              >
                <CircularProgressbar
                  value={podCount}
                  text={`${podCount}`}
                  strokeWidth={10}
                  styles={buildStyles({
                    textColor: "#388e3c",
                    pathColor: "#4caf50",
                    trailColor: "#a5d6a7",
                  })}
                />
              </Box>
              {podError && (
                <Typography color="error" mt={2} textAlign="center">
                  {podError}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default PrometheusChart;
