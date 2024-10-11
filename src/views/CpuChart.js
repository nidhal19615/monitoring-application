import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const monthMapping = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

const CpuChart = () => {
  const [filterType, setFilterType] = useState("custom");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [startDate, setStartDate] = useState(dayjs().subtract(1, "days")); // Default to last 7 days
  const [endDate, setEndDate] = useState(dayjs()); // Current date
  const [cpuData, setCpuData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFilterTypeChange = (event) => {
    setFilterType(event.target.value);
    setSelectedYear("");
    setSelectedMonth("");
    setSelectedWeek("");
    setStartDate(dayjs().subtract(1, "days")); // Reset to last 7 days
    setEndDate(dayjs()); // Reset to current date
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    setSelectedWeek(""); // Reset selected week when month changes
  };

  const handleWeekChange = (event) => {
    setSelectedWeek(event.target.value);
  };

  const handleStartDateChange = (newValue) => {
    setStartDate(newValue);
  };

  const handleEndDateChange = (newValue) => {
    setEndDate(newValue);
  };

  const renderYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
    return years.map((year) => (
      <MenuItem key={year} value={year}>
        {year}
      </MenuItem>
    ));
  };

  const renderMonthOptions = () => {
    const months = [
      { value: "january", label: "January" },
      { value: "february", label: "February" },
      { value: "march", label: "March" },
      { value: "april", label: "April" },
      { value: "may", label: "May" },
      { value: "june", label: "June" },
      { value: "july", label: "July" },
      { value: "august", label: "August" },
      { value: "september", label: "September" },
      { value: "october", label: "October" },
      { value: "november", label: "November" },
      { value: "december", label: "December" },
    ];

    return months.map((month) => (
      <MenuItem key={month.value} value={month.value}>
        {month.label}
      </MenuItem>
    ));
  };

  const renderWeekOptions = () => {
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
    return weeks.map((week) => (
      <MenuItem key={week} value={week}>
        {week}
      </MenuItem>
    ));
  };

  const calculateStep = (start, end) => {
    const duration = end.diff(start, "seconds");
    if (duration > 365 * 24 * 60 * 60) {
      // More than a year
      return "1d"; // 1 day
    } else if (duration > 30 * 24 * 60 * 60) {
      // More than a month
      return "1h"; // 1 hour
    } else if (duration > 7 * 24 * 60 * 60) {
      // More than a week
      return "10m"; // 10 minutes
    } else {
      return "1m"; // 1 minute
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let startTimestamp;
        let endTimestamp;
        let step;

        if (filterType === "year" && selectedYear) {
          startTimestamp = dayjs(`${selectedYear}-01-01`);
          endTimestamp = dayjs(`${selectedYear}-12-31`);
        } else if (filterType === "month" && selectedMonth) {
          const monthIndex = monthMapping[selectedMonth];
          const year = selectedYear || new Date().getFullYear();
          startTimestamp = dayjs(new Date(year, monthIndex, 1));
          endTimestamp = dayjs(new Date(year, monthIndex + 1, 0));
        } else if (filterType === "week" && selectedMonth && selectedWeek) {
          const monthIndex = monthMapping[selectedMonth];
          const year = selectedYear || new Date().getFullYear();
          const firstDayOfMonth = new Date(year, monthIndex, 1);
          const weekNumber = parseInt(selectedWeek.split(" ")[1]);
          const firstDayOfWeek = new Date(firstDayOfMonth);
          firstDayOfWeek.setDate(
            firstDayOfMonth.getDate() + (weekNumber - 1) * 7
          );
          const lastDayOfWeek = new Date(firstDayOfWeek);
          lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
          startTimestamp = dayjs(firstDayOfWeek);
          endTimestamp = dayjs(lastDayOfWeek);
        } else if (filterType === "custom" && startDate && endDate) {
          startTimestamp = startDate;
          endTimestamp = endDate;
        } else {
          return;
        }

        step = calculateStep(startTimestamp, endTimestamp);

        const now = dayjs().unix();
        if (endTimestamp.unix() > now) {
          setCpuData([]);
        } else {
          // PromQL request to get CPU usage over the specified range
          const cpuResponse = await axios.get(
            "http://98.66.205.79/api/v1/query_range",
            {
              params: {
                query:
                  'sum by (pod) (rate(container_cpu_usage_seconds_total{image!=""}[1y]))',
                start: startTimestamp.unix(),
                end: endTimestamp.unix(),
                step: step, // Sampling interval (in seconds)
              },
            }
          );
          const cpuResult = cpuResponse.data.data.result;

          console.log("API Response:", cpuResult);

          const formattedData = formatDataForChart(cpuResponse);
          console.log("Formatted Data:", formattedData);

          const topPodsData = getTopPods(formattedData, 5);
          console.log("Top Pods Data:", topPodsData);

          setCpuData(topPodsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    filterType,
    selectedYear,
    selectedMonth,
    selectedWeek,
    startDate,
    endDate,
  ]);

  const getTopPods = (data, n) => {
    const podAverages = data.map((pod) => ({
      ...pod,
      averageCpu:
        pod.data.reduce((sum, point) => sum + point.cpuUsage, 0) /
        pod.data.length,
    }));

    // Sort by average CPU usage in descending order
    podAverages.sort((a, b) => b.averageCpu - a.averageCpu);

    // Take the top N pods
    const topPods = podAverages.slice(0, n);

    return topPods;
  };

  const formatDataForChart = (prometheusData) => {
    const podData = {};

    if (
      !prometheusData.data.data ||
      !prometheusData.data.data.result ||
      prometheusData.data.data.result.length === 0
    ) {
      return [];
    }

    prometheusData.data.data.result.forEach((result) => {
      const podName = result.metric.pod;
      result.values.forEach((dataPoint) => {
        const timestamp = dataPoint[0] * 1000; // Keep timestamp as Unix time in milliseconds
        const cpuUsage = parseFloat(dataPoint[1]) * 1000000;

        if (!podData[podName]) {
          podData[podName] = [];
        }
        podData[podName].push({ timestamp, cpuUsage });
      });
    });

    const chartData = Object.entries(podData).map(([podName, data]) => ({
      name: podName,
      data: data,
    }));

    return chartData;
  };

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        minHeight="100vh"
        bgcolor="#e8f5e9"
      >
        <Box width="80%" maxWidth={800} m="auto" mt={4}>
          <Card sx={{ width: "100%", boxShadow: 3 }}>
            <CardContent>
              <Typography
                variant="h5"
                component="div"
                mb={4}
                textAlign="center"
                color="#388e3c"
              >
                CPU Usage Chart
              </Typography>

              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                mb={4}
              >
                <FormControl
                  variant="outlined"
                  style={{ marginBottom: "16px", minWidth: 200 }}
                >
                  <InputLabel id="filter-type-label">Filter Type</InputLabel>
                  <Select
                    labelId="filter-type-label"
                    id="filter-type-select"
                    value={filterType}
                    onChange={handleFilterTypeChange}
                    label="Filter Type"
                  >
                    <MenuItem value="year">Year</MenuItem>
                    <MenuItem value="month">Month</MenuItem>
                    <MenuItem value="week">Week</MenuItem>
                    <MenuItem value="custom">Custom</MenuItem>
                  </Select>
                  <FormHelperText>
                    Select the type of filter you want to apply.
                  </FormHelperText>
                </FormControl>

                {filterType === "year" && (
                  <FormControl
                    variant="outlined"
                    style={{ marginBottom: "16px", minWidth: 200 }}
                  >
                    <InputLabel id="year-label">Select Year</InputLabel>
                    <Select
                      labelId="year-label"
                      id="year-select"
                      value={selectedYear}
                      onChange={handleYearChange}
                      label="Select Year"
                    >
                      {renderYearOptions()}
                    </Select>
                    <FormHelperText>
                      Select the year you are interested in.
                    </FormHelperText>
                  </FormControl>
                )}

                {(filterType === "month" || filterType === "week") && (
                  <FormControl
                    variant="outlined"
                    style={{ marginBottom: "16px", minWidth: 200 }}
                  >
                    <InputLabel id="month-label">Select Month</InputLabel>
                    <Select
                      labelId="month-label"
                      id="month-select"
                      value={selectedMonth}
                      onChange={handleMonthChange}
                      label="Select Month"
                    >
                      {renderMonthOptions()}
                    </Select>
                    <FormHelperText>
                      Select the month you are interested in.
                    </FormHelperText>
                  </FormControl>
                )}

                {filterType === "week" && (
                  <FormControl
                    variant="outlined"
                    style={{ marginBottom: "16px", minWidth: 200 }}
                  >
                    <InputLabel id="week-label">Select Week</InputLabel>
                    <Select
                      labelId="week-label"
                      id="week-select"
                      value={selectedWeek}
                      onChange={handleWeekChange}
                      label="Select Week"
                    >
                      <MenuItem value="">None</MenuItem>{" "}
                      {/* Option to not select a week */}
                      {renderWeekOptions()}
                    </Select>
                    <FormHelperText>
                      Select a specific week within the selected month.
                    </FormHelperText>
                  </FormControl>
                )}

                {filterType === "custom" && (
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    mb={4}
                  >
                    <DateTimePicker
                      label="Start Date & Time"
                      value={startDate}
                      onChange={handleStartDateChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          style={{ marginBottom: "16px", minWidth: 200 }}
                        />
                      )}
                    />
                    <DateTimePicker
                      label="End Date & Time"
                      value={endDate}
                      onChange={handleEndDateChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          style={{ marginBottom: "16px", minWidth: 200 }}
                        />
                      )}
                    />
                  </Box>
                )}
              </Box>

              {loading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height={400}
                >
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography variant="body1" color="error" textAlign="center">
                  {error}
                </Typography>
              ) : (
                <Box mb={4}>
                  <Typography
                    variant="h6"
                    component="div"
                    mb={2}
                    textAlign="center"
                    color="#388e3c"
                  >
                    CPU Usage
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={cpuData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        type="number"
                        domain={["dataMin", "dataMax"]}
                        tickFormatter={(unixTime) =>
                          dayjs(unixTime).format("YYYY/MM/DD HH:mm")
                        }
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        domain={["auto", "auto"]}
                        tickFormatter={(value) => `${value.toFixed(2)}%`} // Display as percentage
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        labelFormatter={(value) =>
                          dayjs(value).format("YYYY/MM/DD HH:mm")
                        }
                        formatter={(value) => `${value.toFixed(2)}%`} // Display as percentage
                      />
                      <Legend />
                      {cpuData.map((pod, index) => (
                        <Line
                          key={pod.name}
                          type="monotone"
                          data={pod.data}
                          name={pod.name}
                          dataKey="cpuUsage"
                          stroke={getRandomColor()}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
      <ToastContainer />
    </LocalizationProvider>
  );
};

export default CpuChart;
