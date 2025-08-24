import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Divider } from '@mui/material';
import { keyframes } from '@mui/system';
import io from "socket.io-client";

// Import MUI Icons
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import DangerousOutlinedIcon from '@mui/icons-material/DangerousOutlined';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import FloodIcon from '@mui/icons-material/Flood';
import CallIcon from '@mui/icons-material/Call';
import RecordVoiceOverOutlined from '@mui/icons-material/RecordVoiceOverOutlined';
import GppGoodOutlined from '@mui/icons-material/GppGoodOutlined';
import SupportAgentOutlined from '@mui/icons-material/SupportAgentOutlined';

// --- Helper Functions & Components ---

const getRandomNumber = (min, max) => Math.random() * (max - min) + min;
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;

const StatusIcon = ({ status }) => {
  const iconSx = { fontSize: { xs: '4rem', md: '6rem' }, color: 'rgba(255, 255, 255, 0.8)', mb: 2 };
  switch (status) {
    case 'Safe': return <CheckCircleOutlineIcon sx={iconSx} />;
    case 'Caution': return <WarningAmberOutlined sx={iconSx} />;
    case 'Danger': return <DangerousOutlinedIcon sx={iconSx} />;
    default: return null;
  }
};

// --- Data for New Sections ---

const safetyGuidelines = [
    { icon: <RecordVoiceOverOutlined />, text: "Follow all official announcements and warnings." },
    { icon: <WarningAmberOutlined />, text: "Avoid beaches during high tide or rough seas." },
    { icon: <GppGoodOutlined />, text: "Fishermen: check sea conditions and secure boats." },
    { icon: <SupportAgentOutlined />, text: "Keep emergency contact numbers handy." },
];

const emergencyContacts = [
  { name: 'District Disaster Management', number: '1077', icon: <FloodIcon /> },
  { name: 'Calicut Police', number: '100', icon: <LocalPoliceIcon /> }, 
  { name: 'Beach Hospital Calicut', number: '0495 2366 580', icon: <LocalHospitalIcon /> },
];

const socket = io("http://localhost:5000");

// --- Main Page Component ---

export default function LocalPage() {
  const [status, setStatus] = useState('Safe');
  const [wavePeriod, setWavePeriod] = useState(0);
  const [receivedMessage, setReceivedMessage] = useState("");
  const [isSimulating, setIsSimulating] = useState(true);
  
  useEffect(() => {
    let intervalId;
    if (isSimulating) {
      intervalId = setInterval(() => {
        const newWavePeriod = parseFloat(getRandomNumber(5, 18).toFixed(2));
        let newStatus = 'Safe';
        if (newWavePeriod > 17) newStatus = 'Danger';
        else if (newWavePeriod > 14) newStatus = 'Caution';
        setStatus(newStatus);
        setWavePeriod(newWavePeriod);
      }, 4000);
    }

    socket.on("locals_message", (data) => {
      setReceivedMessage(data.message);
      setIsSimulating(false);
      setStatus('Danger');
      setWavePeriod(18.5);
      if (intervalId) {
        clearInterval(intervalId);
      }
    });

    return () => {
      if (intervalId) clearInterval(intervalId);
      socket.off("locals_message");
    };
  }, [isSimulating]);

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
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: '100vh', bgcolor: 'grey.900', color: 'white' }}>
          {/* Side Status Panel */}
          <Paper
              elevation={6}
              sx={{
                  width: { xs: '100%', md: '350px' },
                  minHeight: { xs: 'auto', md: '100vh' },
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
              <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', letterSpacing: '0.1em' }}>
                  {statusInfo.title}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.9)' }}>
                  {statusInfo.message}
              </Typography>
              <Divider sx={{ my: 3, width: '50%', bgcolor: 'rgba(255, 255, 255, 0.3)' }} />
              <Typography variant="h6">
                  Current Period: <Typography component="span" sx={{ fontWeight: 'bold' }}>{wavePeriod}s</Typography>
              </Typography>
              <Divider sx={{ my: 3, width: '50%', bgcolor: 'rgba(255, 255, 255, 0.3)' }} />
              <Typography variant="body1" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.9)' }}>
                  Message from Authorities:
                  <Typography component="span" sx={{ fontWeight: 'bold', display: 'block', mt: 1 }}>
                      {receivedMessage || "Waiting..."}
                  </Typography>
              </Typography>
          </Paper>

          {/* Main Content Area */}
          <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
                  Coastal Area Safety Guidelines
              </Typography>
              
              {/* Guidelines section */}
              <Box sx={{ width: '100%', maxWidth: '900px', mb: 4 }}>
                <Grid container spacing={2}>
                    {safetyGuidelines.map((item, index) => (
                        <Grid item xs={12} key={index}>
                            <Paper sx={{ p: 2, bgcolor: 'grey.800', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ color: 'primary.main' }}>{item.icon}</Box>
                                {/* EDITED: Changed variant from "body1" to "body2" to reduce text size */}
                                <Typography variant="body2">{item.text}</Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
              </Box>

              {/* The Emergency Contacts section remains. */}
              <Box sx={{ width: '100%', maxWidth: '900px' }}>
                  <Divider sx={{ my: 4, bgcolor: 'grey.700' }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
                      Emergency Contacts
                  </Typography>
                  <Grid container spacing={2} justifyContent="center">
                      {emergencyContacts.map((contact) => (
                          <Grid item xs={12} sm={6} md={4} key={contact.name}>
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