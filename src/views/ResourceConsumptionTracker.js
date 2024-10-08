import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
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
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { MenuItem, Select } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResourceConsumptionTracker = () => {
  const [cpuData, setCpuData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().startOf("month")); // Mois sélectionné
  const [selectedWeek, setSelectedWeek] = useState(null); // Semaine sélectionnée
  const [weeksInMonth, setWeeksInMonth] = useState([]); // Liste des semaines disponibles

  useEffect(() => {
    // Calculer les semaines disponibles en fonction du mois sélectionné
    const startOfMonth = selectedMonth.startOf("month");
    const endOfMonth = selectedMonth.endOf("month");

    const weeks = [];
    let startOfWeek = startOfMonth;

    while (startOfWeek.isBefore(endOfMonth)) {
      let endOfWeek = startOfWeek.add(6, "days").isAfter(endOfMonth)
        ? endOfMonth
        : startOfWeek.add(6, "days");

      weeks.push({
        label: `Semaine du ${startOfWeek.format("DD/MM")} au ${endOfWeek.format(
          "DD/MM"
        )}`,
        startOfWeek: startOfWeek,
        endOfWeek: endOfWeek,
      });

      startOfWeek = endOfWeek.add(1, "day");
    }

    setWeeksInMonth(weeks);
    setSelectedWeek(weeks[0]); // Sélectionne par défaut la première semaine
  }, [selectedMonth]);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedWeek) return;

      try {
        const startTimestamp = selectedWeek.startOfWeek.unix();
        const endTimestamp = selectedWeek.endOfWeek.unix();

        const now = dayjs().unix();
        if (endTimestamp > now) {
          setCpuData([]);
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
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    };

    fetchData();
  }, [selectedWeek]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        minHeight="100vh"
        bgcolor="#f5f5f5"
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
                Suivi de la consommation des ressources (CPU)
              </Typography>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                mb={4}
              >
                <DatePicker
                  views={["year", "month"]}
                  label="Sélectionner le mois"
                  value={selectedMonth}
                  onChange={(newValue) => setSelectedMonth(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} sx={{ marginRight: 2 }} />
                  )}
                />
                <Select
                  label="Sélectionner la semaine"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  {weeksInMonth.map((week, index) => (
                    <MenuItem key={index} value={week}>
                      {week.label}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
              <Box mb={4}>
                <Typography
                  variant="h6"
                  component="div"
                  mb={2}
                  textAlign="center"
                  color="#388e3c"
                >
                  Consommation CPU
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
                        new Date(timestamp).toLocaleDateString("fr-FR")
                      }
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tickFormatter={(value) => `${value * 10}%`}
                    />
                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString("fr-FR")
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
            </CardContent>
          </Card>
        </Box>
      </Box>
      <ToastContainer />
    </LocalizationProvider>
  );
};

export default ResourceConsumptionTracker;
