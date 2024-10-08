import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TextField, MenuItem } from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/fr'; // Locale en français

const ResourceConsumptionTracker = () => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [cpuData, setCpuData] = useState([]);
  
  const months = [
    { value: '01', label: 'Janvier' },
    { value: '02', label: 'Février' },
    { value: '03', label: 'Mars' },
    { value: '04', label: 'Avril' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Juin' },
    { value: '07', label: 'Juillet' },
    { value: '08', label: 'Août' },
    { value: '09', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' }
  ];

  const getWeeksInMonth = (month) => {
    const year = dayjs().year(); 
    const startOfMonth = dayjs(`${year}-${month}-01`);
    const endOfMonth = startOfMonth.endOf('month');
    
    const weeks = [];
    let currentWeekStart = startOfMonth.startOf('week');
    while (currentWeekStart.isBefore(endOfMonth)) {
      const currentWeekEnd = currentWeekStart.endOf('week');
      weeks.push({
        startOfWeek: currentWeekStart,
        endOfWeek: currentWeekEnd.isBefore(endOfMonth) ? currentWeekEnd : endOfMonth
      });
      currentWeekStart = currentWeekStart.add(1, 'week');
    }
    return weeks;
  };

  const handleMonthChange = (event) => {
    const month = event.target.value;
    setSelectedMonth(month);
    setSelectedWeek(null);
  };

  const handleWeekChange = (event) => {
    const weekIndex = event.target.value;
    const weeksInMonth = getWeeksInMonth(selectedMonth);
    setSelectedWeek(weeksInMonth[weekIndex]);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedWeek) return;

      try {
        const startTimestamp = selectedWeek.startOfWeek.unix();
        const endTimestamp = selectedWeek.endOfWeek.unix();

        console.log("Fetching data from", startTimestamp, "to", endTimestamp);

        const cpuResponse = await axios.get(
          "http://98.66.205.79/api/v1/query_range",
          {
            params: {
              query: "sum by (pod) (container_cpu_usage_seconds_total{image!=''})",
              start: startTimestamp,
              end: endTimestamp,
              step: 60,
            },
          }
        );
        
        const cpuResult = cpuResponse.data.data.result;
        console.log("API response:", cpuResult);

        if (cpuResult && cpuResult.length > 0) {
          const formattedCpuData = cpuResult.flatMap((podData) =>
            podData.values.map(([timestamp, value]) => ({
              timestamp: timestamp * 1000,
              cpuUsage: parseFloat(value) / 100,
            }))
          );
          console.log("Formatted CPU Data:", formattedCpuData);
          setCpuData(formattedCpuData);
        } else {
          console.warn("No data found for the selected range");
          setCpuData([]);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    };

    fetchData();
  }, [selectedWeek]);

  const weeksInMonth = selectedMonth ? getWeeksInMonth(selectedMonth) : [];

  return (
    <div>
      <h2>Suivi de la consommation des ressources</h2>

      <TextField
        select
        label="Mois"
        value={selectedMonth}
        onChange={handleMonthChange}
        fullWidth
        margin="normal"
      >
        {months.map((month) => (
          <MenuItem key={month.value} value={month.value}>
            {month.label}
          </MenuItem>
        ))}
      </TextField>

      {selectedMonth && (
        <TextField
          select
          label="Semaine"
          value={selectedWeek ? weeksInMonth.findIndex(
            (week) => week.startOfWeek.isSame(selectedWeek.startOfWeek)
          ) : ''}
          onChange={handleWeekChange}
          fullWidth
          margin="normal"
        >
          {weeksInMonth.map((week, index) => (
            <MenuItem key={index} value={index}>
              {`Du ${week.startOfWeek.format('DD MMM')} au ${week.endOfWeek.format('DD MMM')}`}
            </MenuItem>
          ))}
        </TextField>
      )}

      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
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
      </div>
    </div>
  );
};

export default ResourceConsumptionTracker;
