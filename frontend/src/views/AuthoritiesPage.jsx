import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Paper,
  CircularProgress,
  TextField,
  Grid,
} from "@mui/material";
import WavesIcon from '@mui/icons-material/Waves';
import io from "socket.io-client";

// --- Helper Components & Functions ---

const HistoryChart = ({ data }) => {
  if (data.length < 2) return null;
  const maxVal = Math.max(22, ...data);
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d / maxVal) * 90}`).join(' ');

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Wave Period Trend (Last Minute)</Typography>
      <Paper elevation={3} sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
        <svg viewBox="0 0 100 100" width="100%" height="150">
          <polyline fill="none" stroke="#63b3ed" strokeWidth="1" points={points} />
          <circle cx={100} cy={100 - (data[data.length - 1] / maxVal) * 90} r="2" fill="white" />
          <text x="5" y="15" fill="rgba(255,255,255,0.7)" fontSize="5">{maxVal.toFixed(0)}s</text>
          <text x="5" y="98" fill="rgba(255,255,255,0.7)" fontSize="5">0s</text>
        </svg>
      </Paper>
    </Box>
  );
};

// --- Main Page Component ---

const initialFormState = {
  "Wave Height (m)": "1.5",
  "Max Wave (m)": "2.5",
  "Avg Period (s)": "5.0",
  "Peak Period (s)": "10.0",
  "Swell Direction (°)": "190",
  "Sea Temp (°C)": "28.5",
};

const labelToApiKeyMap = {
  "Wave Height (m)": "Hs",
  "Max Wave (m)": "Hmax",
  "Avg Period (s)": "Tz",
  "Peak Period (s)": "Tp",
  "Swell Direction (°)": "Peak Direction",
  "Sea Temp (°C)": "SST",
};

const socket = io("http://localhost:5000");

export default function AuthoritiesPage() {
  const [formData, setFormData] = useState(initialFormState);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  
  // Removed: messageToSend state

  // NEW: Function to send the message automatically
  const sendAlert = (message) => {
    socket.emit("authorities_message", { message });
  };

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (formData["Wave Height (m)"]) handleCheck();
    }, 500);
    return () => clearTimeout(timerId);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleCheck = async () => {
    try {
      setLoading(true);
      setResult(null);

      const numericData = {};
      for (const [key, value] of Object.entries(formData)) {
        const apiKey = labelToApiKeyMap[key];
        numericData[apiKey] = parseFloat(value);
      }
      
      setHistory(prev => [...prev.slice(-14), numericData.Tp]);

      const getDayOfYear = (date) => {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
      };

      const now = new Date();
      const dayOfYear = getDayOfYear(now);

      const fullFeatureData = {
        ...numericData,
        hour: now.getHours(),
        month: now.getMonth() + 1,
        day_of_year_sin: Math.sin((2 * Math.PI * dayOfYear) / 365),
        day_of_year_cos: Math.cos((2 * Math.PI * dayOfYear) / 365),
        Hs_rolling_6h: numericData.Hs,
        Tp_rolling_6h: numericData.Tp,
      };

      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullFeatureData),
      });

      const data = await response.json();
      setResult(data);
      
      // NEW: Check for Kallakkadal and send the message automatically
      if (data.prediction === 'Kallakkadal') {
        const alertMessage = "🚨 DANGER: Kallakkadal conditions detected. Please take caution.";
        sendAlert(alertMessage);
      }
      
    } catch (err) {
      console.error("Error:", err);
      setResult({ error: "Failed to connect to the server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", background: 'linear-gradient(135deg, #1a237e 0%, #0d1224 100%)', display: "flex", flexDirection: "column", color: 'white' }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: "rgba(0,0,0,0.2)", borderBottom: '1px solid', borderColor: 'grey.800' }}>
        <Toolbar>
          <WavesIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>Authorities Dashboard</Typography>
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", py: 4 }}>
        <Grid container alignItems="stretch" justifyContent="center" spacing={4}>
          
          {/* Left Column: Visualizations */}
          <Grid item xs={12} md={7}>
            <HistoryChart data={history} />
          </Grid>

          {/* Right Column: Prediction Form (Compressed) */}
          <Grid item xs={12} md={5}>
            <Paper variant="outlined" sx={{ backgroundColor: "rgba(255, 255, 255, 0.85)", backdropFilter: 'blur(10px)', color: 'black', border: '1px solid', borderColor: 'rgba(255, 255, 255, 0.3)', padding: { xs: 3, md: 4 }, height: '100%', borderRadius: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>Live Wave Prediction</Typography>
              <Typography variant="body2" sx={{ color: 'grey.700', mb: 3 }}>Prediction updates automatically.</Typography>
              <Grid container spacing={2}>
                {Object.keys(initialFormState).map((key) => (
                  <Grid item xs={12} key={key}>
                    <TextField fullWidth label={key} name={key} type="number" variant="filled" value={formData[key]} onChange={handleChange} InputProps={{ disableUnderline: true, style: { backgroundColor: "rgba(0,0,0,0.05)", borderRadius: 8 } }} InputLabelProps={{ style: { color: 'grey.700' } }} />
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ mt: 3, p: 2, borderRadius: 2, minHeight: 100, backgroundColor: result ? (result.error ? '#ffebee' : (result.value === 1 ? '#ffebee' : '#c8e6c9')) : '#f5f5f5', border: '1px solid', borderColor: result ? (result.error ? 'error.main' : (result.value === 1 ? 'error.main' : 'success.dark')) : 'grey.300', transition: 'all 0.5s ease' }}>
                {loading ? <CircularProgress size={24} /> : (
                  result && (
                    <>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'black' }}>Results</Typography>
                      {result.prediction ? (
                        <>
                          <Typography variant="h5" sx={{ color: result.value === 1 ? 'error.main' : 'success.dark', fontWeight: 'bold', my: 1 }}>{result.prediction}</Typography>
                          <Typography sx={{ color: 'black' }}><strong>Confidence:</strong> {result.confidence}</Typography>
                        </>
                      ) : (
                        <Typography sx={{ color: 'error.main', fontWeight: 'bold' }}>Error: {result.error || "An unknown error occurred."}</Typography>
                      )}
                    </>
                  )
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Removed: The separate Grid item for sending a message */}
        </Grid>
      </Container>
    </Box>
  );
}