import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CpuandRamChart = () => {
  const [cpuData, setCpuData] = useState([]);
  const [memoryData, setMemoryData] = useState([]);
  const [startDate, setStartDate] = useState(dayjs().subtract(2, "hours")); // Start 2 hours before current time
  const [endDate, setEndDate] = useState(dayjs()); // Current time

  useEffect(() => {
    const fetchData = async () => {
      try {
        const startTimestamp = startDate.unix();
        const endTimestamp = endDate.unix();

        const now = dayjs().unix();
        if (endTimestamp > now) {
          setCpuData([]);
          setMemoryData([]);
        } else {
          // Fetch CPU Data
          const cpuResponse = await axios.get(
            "http://98.66.205.79/api/v1/query_range",
            {
              params: {
                query:
                  "sum by (pod) (container_cpu_usage_seconds_total{image!=''})",
                start: startTimestamp,
                end: endTimestamp,
                step: 60,
              },
            }
          );
          const cpuResult = cpuResponse.data.data.result;
          const formattedCpuData = cpuResult.flatMap((podData) =>
            podData.values.map(([timestamp, value]) => ({
              timestamp: timestamp * 1000,
              cpuUsage: parseFloat(value) / 100,
            }))
          );
          setCpuData(formattedCpuData);

          // Fetch Memory Data
          const memoryResponse = await axios.get(
            "http://98.66.205.79/api/v1/query_range",
            {
              params: {
                query: "sum by (pod) (container_memory_usage_bytes{image!=''})",
                start: startTimestamp,
                end: endTimestamp,
                step: 60,
              },
            }
          );
          const memoryResult = memoryResponse.data.data.result;
          const formattedMemoryData = memoryResult.flatMap((podData) =>
            podData.values.map(([timestamp, value]) => ({
              timestamp: timestamp * 1000,
              memoryUsage: parseFloat(value),
            }))
          );
          setMemoryData(formattedMemoryData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  const handleStartDateChange = (newValue) => {
    const now = dayjs();
    if (newValue.isAfter(now)) {
      toast.error(
        "La date de début ne peut pas être supérieure à la date actuelle.",
        {
          position: "top-center",
          autoClose: 3000,
        }
      );
    } else {
      setStartDate(newValue);
    }
  };

  // Calcul du coût horaire normalisé
  const normalizedCPUPrice = 0.049; // Prix du CPU AKS : 0.049€
  const normalizedRAMPrice = 0.0165; // Prix du RAM AKS : 0.0165€

  // Fonction pour calculer le coût horaire du nœud
  const calculateNodeHourlyCost = (cpuHours, ramGBHours) => {
    return normalizedCPUPrice * cpuHours + normalizedRAMPrice * ramGBHours;
  };

  // Générer les données pour le graphique de prix CPU
  const generateCPUPricingData = () => {
    const data = [];
    const currentTime = dayjs();
    for (let i = 120; i >= 0; i--) {
      // 120 minutes (2 heures) avant l'heure actuelle
      const timestamp = currentTime.subtract(i, "minute").unix();
      const cost = calculateNodeHourlyCost(1, 0); // Supposons 1 heure CPU et 0 heures RAM
      data.push({ timestamp: timestamp * 1000, cost });
    }
    return data;
  };

  /// Générer les données pour le graphique de prix RAM
  const generateRAMPricingData = () => {
    const data = [];
    const currentTime = dayjs();
    for (let i = 120; i >= 0; i--) {
      // 120 minutes (2 heures) avant l'heure actuelle
      const timestamp = currentTime.subtract(i, "minute").unix();
      const cost = calculateNodeHourlyCost(0, 1); // Supposons 0 heures CPU et 1 heure RAM
      data.push({ timestamp: timestamp * 1000, cost });
    }
    return data;
  };

  const cpuPricingData = generateCPUPricingData();
  const ramPricingData = generateRAMPricingData();

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
                CPU and Memory Usage Chart
              </Typography>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                mb={4}
              >
                <DateTimePicker
                  label="Start Date & Time"
                  value={startDate}
                  onChange={handleStartDateChange}
                  inputProps={{ style: { color: "#388e3c" } }}
                />
                <DateTimePicker
                  label="End Date & Time"
                  value={endDate}
                  readOnly
                  inputProps={{ style: { color: "#388e3c" } }}
                />
              </Box>
              <Box mb={4}>
                <Typography
                  variant="h6"
                  component="div"
                  mb={2}
                  textAlign="center"
                  color="#388e3c"
                >
                  Memory Usage
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={memoryData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      type="number"
                      domain={["dataMin", "dataMax"]}
                      tickFormatter={(timestamp) =>
                        new Date(timestamp).toLocaleTimeString()
                      }
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tickFormatter={(value) =>
                        `${(value / 1024 / 1024).toFixed(2)} MB`
                      }
                    />
                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleTimeString()
                      }
                      formatter={(value) =>
                        `${(value / 1024 / 1024).toFixed(2)} MB`
                      }
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="memoryUsage"
                      stroke="#82ca9d"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
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
                      tickFormatter={(timestamp) =>
                        new Date(timestamp).toLocaleTimeString()
                      }
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tickFormatter={(value) => `${value * 10}%`}
                    />
                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleTimeString()
                      }
                      formatter={(value) => `${value * 10}%`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="cpuUsage"
                      stroke="#8884d8"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

              <Box mb={4}>
                <Typography
                  variant="h6"
                  component="div"
                  mb={2}
                  textAlign="center"
                  color="#388e3c"
                >
                  CPU Pricing
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart
                    data={cpuPricingData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      type="number"
                      domain={["dataMin", "dataMax"]}
                      tickFormatter={(timestamp) =>
                        new Date(timestamp).toLocaleTimeString()
                      }
                    />
                    <YAxis
                      domain={[0, "auto"]}
                      tickFormatter={(value) => `${value.toFixed(2)} €`}
                    />
                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleTimeString()
                      }
                      formatter={(value) => `${value.toFixed(2)} €`}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="cost"
                      stroke="#9c27b0"
                      fill="#9c27b0"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>

              <Box mb={4}>
                <Typography
                  variant="h6"
                  component="div"
                  mb={2}
                  textAlign="center"
                  color="#388e3c"
                >
                  RAM Pricing
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart
                    data={ramPricingData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      type="number"
                      domain={["dataMin", "dataMax"]}
                      tickFormatter={(timestamp) =>
                        new Date(timestamp).toLocaleTimeString()
                      }
                    />
                    <YAxis
                      domain={[0, "auto"]}
                      tickFormatter={(value) => `${value.toFixed(2)} €`}
                    />
                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleTimeString()
                      }
                      formatter={(value) => `${value.toFixed(2)} €`}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="cost"
                      stroke="#4caf50"
                      fill="#4caf50"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
      <ToastContainer />
    </LocalizationProvider>
  );
};

export default CpuandRamChart;
