import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material'; // Using MUI for styling
import firebase from 'firebase/app';
import 'firebase/database'; // Import the database module

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBwZgY6_6iRxPzkFdf29iWWcfMzYd90eCQ",
  authDomain: "bluewave-8427b.firebaseapp.com",
  databaseURL: "https://bluewave-8427b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bluewave-8427b",
  storageBucket: "bluewave-8427b.firebasestorage.app",
  messagingSenderId: "879934919369",
  appId: "1:879934919369:web:16f7bcc8a0947969803318"
};

// Initialize Firebase only once
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();

export default function SensorData() {
    // State to hold the sensor data
    const [sensorData, setSensorData] = useState({
        roll: '--',
        accelX: '--',
        accelY: '--',
        accelZ: '--'
    });

    useEffect(() => {
        const sensorDataRef = database.ref('sensor/data');

        // Listen for real-time data updates
        sensorDataRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setSensorData({
                    roll: parseFloat(data.roll).toFixed(2),
                    accelX: parseFloat(data.accelX).toFixed(2),
                    accelY: parseFloat(data.accelY).toFixed(2),
                    accelZ: parseFloat(data.accelZ).toFixed(2)
                });
            }
        });

        // Clean up the listener when the component unmounts
        return () => {
            sensorDataRef.off('value');
        };
    }, []); // Empty dependency array ensures this effect runs only once on mount

    return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Live IMU Sensor Data
            </Typography>
            <Paper elevation={3} sx={{ p: 4, display: 'inline-block' }}>
                <Typography variant="h6">Roll: {sensorData.roll} degrees</Typography>
                <Typography variant="h6">Accel X: {sensorData.accelX}</Typography>
                <Typography variant="h6">Accel Y: {sensorData.accelY}</Typography>
                <Typography variant="h6">Accel Z: {sensorData.accelZ}</Typography>
            </Paper>
        </Box>
    );
}