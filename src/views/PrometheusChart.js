import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { ToastContainer, toast } from 'react-toastify'; // Importer les notifications
import 'react-toastify/dist/ReactToastify.css'; // Importer les styles

const PrometheusChart = () => {
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(dayjs().subtract(1, 'day'));
  const [endDate] = useState(dayjs()); // Date de fin fixe à la date actuelle

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://98.66.205.79/api/v1/query_range', {
          params: {
            query: 'count(up)',
            start: Math.floor(startDate.toDate().getTime() / 1000),
            end: Math.floor(endDate.toDate().getTime() / 1000),
            step: 60, // Intervalle de 60 secondes
          },
        });

        const result = response.data.data.result;
        if (result.length > 0) {
          setCount(parseFloat(result[0].values[result[0].values.length - 1][1]));
        } else {
          setCount(0);
          setError('Empty query result');
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          setCount(0); // Réinitialisation à zéro en cas d'erreur 400
          setError('Empty query result');
        } else {
          setError(error.message);
        }
      }
    };

    fetchData();
  }, [startDate, endDate]);

  const handleStartDateChange = (newValue) => {
    if (newValue && newValue.isAfter(dayjs())) {
      toast.error("La date de début ne peut pas être supérieure à la date actuelle.");
    } else {
      setStartDate(newValue);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#e8f5e9">
        <Card sx={{ width: '10cm', height: '20cm', boxShadow: 3, overflow: 'auto' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h5" component="div" mb={2} textAlign="center" color="#388e3c">
              Nombre de pods
            </Typography>
            <Box display="flex" justifyContent="center" alignItems="center" mb={2} sx={{ width: '100%', height: '50%' }}>
              <CircularProgressbar
                value={count}
                text={`${count}`}
                styles={buildStyles({
                  textColor: '#388e3c',
                  pathColor: '#4caf50',
                  trailColor: '#a5d6a7',
                })}
              />
            </Box>
            <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
              <Typography variant="body1" component="div" textAlign="center" color="#388e3c">
                Range :
              </Typography>
            </Box>
            <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
              <DateTimePicker
                renderInput={(props) => <TextField {...props} />}
                label="Start Date & Time"
                value={startDate}
                onChange={handleStartDateChange}
                inputProps={{
                  style: { color: '#388e3c' },
                }}
              />
            </Box>
            <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
              <DateTimePicker
                renderInput={(props) => <TextField {...props} />}
                label="End Date & Time"
                value={endDate}
                disabled // Rendre le sélecteur non interactif
                inputProps={{
                  style: { color: '#388e3c' },
                }}
              />
            </Box>
            {error && (
              <Typography color="error" mt={2} textAlign="center">
                {error}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
      <ToastContainer /> {/* Ajouter le conteneur pour les notifications */}
    </LocalizationProvider>
  );
};

export default PrometheusChart;
