import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Divider } from '@mui/material';
import { keyframes } from '@mui/system';
import io from "socket.io-client";

// Import MUI Icons
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DangerousOutlinedIcon from '@mui/icons-material/DangerousOutlined';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import FloodIcon from '@mui/icons-material/Flood';
import CallIcon from '@mui/icons-material/Call';

// --- Helper Functions & Components ---

const getRandomNumber = (min, max) => Math.random() * (max - min) + min;
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;

const StatusIcon = ({ status }) => {
  const iconSx = { fontSize: { xs: '4rem', md: '6rem' }, color: 'rgba(255, 255, 255, 0.8)', mb: 2 };
  switch (status) {
    case 'Safe': return <CheckCircleOutlineIcon sx={iconSx} />;
    case 'Caution': return <WarningAmberIcon sx={iconSx} />;
    case 'Danger': return <DangerousOutlinedIcon sx={iconSx} />;
    default: return null;
  }
};

const HistoryChart = ({ data }) => {
  if (data.length < 2) return null;
  const maxVal = Math.max(22, ...data);
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d / maxVal) * 90}`).join(' ');

  return (
    <Box>
      <Typography variant="h6" gutterBottom align="center">Wave Period Trend (Last Minute)</Typography>
      <Paper elevation={3} sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
        <svg viewBox="0 0 100 100" width="100%" height="200">
          <polyline fill="none" stroke="#63b3ed" strokeWidth="1" points={points} />
          <circle cx={100} cy={100 - (data[data.length - 1] / maxVal) * 90} r="2" fill="white" />
          <text x="5" y="15" fill="rgba(255,255,255,0.7)" fontSize="5">{maxVal.toFixed(0)}s</text>
          <text x="5" y="98" fill="rgba(255,255,255,0.7)" fontSize="5">0s</text>
        </svg>
      </Paper>
    </Box>
  );
};

// --- Emergency Contact Data ---
const emergencyContacts = [
  { name: 'District Disaster Management', number: '1077', icon: <FloodIcon /> },
  { name: 'Calicut Police', number: '0485 2842 224', icon: <LocalPoliceIcon /> },
  { name: 'Taluk Hospital', number: '0485 2842 226', icon: <LocalHospitalIcon /> },
];

const socket = io("http://localhost:5000");

// --- Main Page Component ---

export default function LocalPage() {
  const [status, setStatus] = useState('Safe');
  const [wavePeriod, setWavePeriod] = useState(0);
  const [history, setHistory] = useState([]);
  const [receivedMessage, setReceivedMessage] = useState("");
  // NEW: State to control whether the simulation is running
  const [isSimulating, setIsSimulating] = useState(true); 

  useEffect(() => {
    let intervalId;

    if (isSimulating) {
      intervalId = setInterval(() => {
        const newWavePeriod = parseFloat(getRandomNumber(5, 22).toFixed(2));
        let newStatus = 'Safe';

        if (newWavePeriod > 17) newStatus = 'Danger';
        else if (newWavePeriod > 14) newStatus = 'Caution';
        
        setStatus(newStatus);
        setWavePeriod(newWavePeriod);
        setHistory(prev => [...prev.slice(-14), newWavePeriod]);
      }, 4000);
    }

    // NEW: Listen for the 'locals_message' event
    socket.on("locals_message", (data) => {
      setReceivedMessage(data.message);
      
      // Stop the simulation and set to danger when a message is received
      setIsSimulating(false);
      setStatus('Danger');
      setWavePeriod(18.5); // Set to a value above 18
      setHistory(prev => [...prev.slice(-14), 18.5]);
      
      if (intervalId) {
        clearInterval(intervalId);
      }
    });

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      socket.off("locals_message");
    };
  }, [isSimulating]); // Dependency array to re-run effect when isSimulating changes

  const getStatusInfo = (currentStatus) => {
    switch (currentStatus) {
      case 'Safe': return { bgColor: 'success.main', title: 'SAFE', message: 'Sea conditions are normal.' };
      case 'Caution': return { bgColor: 'warning.main', title: 'CAUTION', message: 'Unusual swell detected.' };
      case 'Danger': return { bgColor: 'error.main', title: 'DANGER', message: 'High-risk Kallakkadal conditions.' };
      default: return { bgColor: 'grey.700', title: 'UNKNOWN', message: 'Awaiting data...' };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.900', color: 'white' }}>
      {/* Side Status Panel */}
      <Paper
        elevation={6}
        sx={{
          width: { xs: '100%', md: '350px' },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          p: 3,
          color: 'white',
          backgroundColor: statusInfo.bgColor,
          transition: 'background-color 1s ease-in-out',
        }}
      >
        <StatusIcon status={status} />
        <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', letterSpacing: '0.1em', animation: `${fadeIn} 1s` }}>
          {statusInfo.title}
        </Typography>
        <Typography variant="body1" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.9)' }}>
          {statusInfo.message}
        </Typography>
        <Divider sx={{ my: 3, width: '50%', bgcolor: 'rgba(255, 255, 255, 0.3)' }} />
        <Typography variant="h6">
          Current Period: <Typography component="span" sx={{ fontWeight: 'bold' }}>{wavePeriod} </Typography>
        </Typography>
        <Divider sx={{ my: 3, width: '50%', bgcolor: 'rgba(255, 255, 255, 0.3)' }} />
        <Typography variant="body1" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.9)' }}>
          Message from Authorities: 
          <Typography component="span" sx={{ fontWeight: 'bold' }}>
            {receivedMessage || "Waiting..."}
          </Typography>
        </Typography>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, overflowY: 'auto' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 4 }}>
          Calicut Coastal Information
        </Typography>
        
        <Box sx={{ maxWidth: '800px', mx: 'auto', mb: 5 }}>
          <HistoryChart data={history} />
        </Box>
        
        <Divider sx={{ my: 4, bgcolor: 'grey.700' }} />

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
            Emergency Contacts
          </Typography>
          <Grid container spacing={3}>
            {emergencyContacts.map((contact) => (
              <Grid item xs={12} md={6} lg={4} key={contact.name}>
                <Paper sx={{ p: 2, bgcolor: 'grey.800', display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 2, color: 'primary.main' }}>{contact.icon}</Box>
                  <Box>
                    <Typography sx={{ fontWeight: 'bold' }}>{contact.name}</Typography>
                    <Typography variant="body2" sx={{ color: 'grey.400', display: 'flex', alignItems: 'center' }}>
                      <CallIcon sx={{ fontSize: '1rem', mr: 0.5 }}/> {contact.number}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}