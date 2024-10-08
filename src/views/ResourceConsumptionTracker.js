import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';

const ResourceConsumptionTracker = () => {
  const [cpuData, setCpuData] = useState([]);
  const [startDate, setStartDate] = useState(dayjs().subtract(2, 'hours'));
  const [endDate, setEndDate] = useState(dayjs());

  useEffect(() => {
    const fetchCpuData = async () => {
      const startTimestamp = startDate.unix();
      const endTimestamp = endDate.unix();
      const now = dayjs().unix();

      if (endTimestamp <= now) {
        try {
          const response = await axios.get('http://98.66.205.79/api/v1/query_range', {
            params: {
              query: "sum by (pod) (container_cpu_usage_seconds_total{image!=''})",
              start: startTimestamp,
              end: endTimestamp,
              step: 60,
            },
          });
          const result = response.data.data.result;
          const formattedData = result.flatMap((podData) =>
            podData.values.map(([timestamp, value]) => ({
              timestamp: timestamp * 1000,
              cpuUsage: parseFloat(value) / 100,
            }))
          );
          setCpuData(formattedData);
        } catch (error) {
          console.error('Error fetching CPU data:', error);
        }
      } else {
        setCpuData([]);
      }
    };

    fetchCpuData();
  }, [startDate, endDate]);

  return (
    <div>
      <h2>CPU Usage Chart</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={cpuData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
          />
          <YAxis domain={['auto', 'auto']} tickFormatter={(value) => `${value * 10}%`} />
          <Tooltip
            labelFormatter={(value) => new Date(value).toLocaleTimeString()}
            formatter={(value) => `${value * 10}%`}
          />
          <Legend />
          <Line type="monotone" dataKey="cpuUsage" stroke="#8884d8" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResourceConsumptionTracker;
