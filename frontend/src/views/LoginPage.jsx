import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  TextField,
  Paper,
  Divider,
  InputAdornment,
  Grid,
} from "@mui/material";
import { keyframes } from '@mui/system'; // Re-import keyframes for the animation

// Import MUI Icons
import PublicIcon from '@mui/icons-material/Public';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Lock from '@mui/icons-material/Lock';
import WavesIcon from '@mui/icons-material/Waves';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLocalLogin = () => {
    setError("");
    onLogin("LocalUser", "N/A");
  };

  const handleAuthoritiesLogin = (e) => {
    e.preventDefault();
    if (username === "Ajmal" && password === "Admin") {
      setError("");
      onLogin(username, password);
    } else {
      setError("❌ Invalid username or password");
    }
  };

  // Animation for the icon's glowing effect using a drop-shadow filter
  const glow = keyframes`
    0% { filter: drop-shadow(0 0 5px #03e9f4); }
    50% { filter: drop-shadow(0 0 20px #03e9f4); }
    100% { filter: drop-shadow(0 0 5px #03e9f4); }
  `;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: 'linear-gradient(135deg, #050a19 0%, #0c163b 100%)',
        display: "flex",
        flexDirection: "column",
        color: 'white',
      }}
    >
      {/* Navbar */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ backgroundColor: "transparent" }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            🌊 WaveGuard
          </Typography>
          <Button color="inherit">Home</Button>
          <Button color="inherit">About</Button>
          <Button color="inherit">Contact</Button>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Container
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Grid container alignItems="center" justifyContent="center" spacing={4}>
          
          {/* Left Column: Decorative Graphic (glow re-added to icon) */}
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Icon now has the glow animation applied */}
              <WavesIcon sx={{ 
                fontSize: 300, 
                color: '#03e9f4', // Changed color to make glow more visible
                animation: `${glow} 4s ease-in-out infinite`,
              }} />
            </Box>
          </Grid>

          {/* Right Column: Login Form */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: "transparent",
                padding: { xs: 3, md: 4 },
                textAlign: "center",
                color: "#fff",
              }}
            >
              <Typography component="h1" variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                Login
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.400', mb: 4 }}>
                Access your WaveGuard dashboard.
              </Typography>

              {/* Authorities Login Form */}
              <Box component="form" onSubmit={handleAuthoritiesLogin}>
                <TextField
                  label="Username"
                  variant="filled"
                  fullWidth
                  margin="normal"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    style: { backgroundColor: "#ffffff", borderRadius: 8 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircle sx={{ color: 'grey.500' }} />
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{ style: { color: 'grey.700' } }}
                />
                <TextField
                  label="Password"
                  type="password"
                  variant="filled"
                  fullWidth
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    style: { backgroundColor: "#ffffff", borderRadius: 8 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'grey.500' }} />
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{ style: { color: 'grey.700' } }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  startIcon={<AdminPanelSettingsIcon />}
                  sx={{ mt: 2, py: 1.5, textTransform: 'none', fontSize: '1rem', borderRadius: 2 }}
                >
                  Officials Login
                </Button>
              </Box>

              <Divider sx={{ my: 3, color: 'grey.400', '&::before, &::after': { borderColor: 'grey.800' } }}>OR</Divider>

              {/* Local User Login Button */}
              <Button
                variant="outlined"
                fullWidth
                startIcon={<PublicIcon />}
                sx={{ py: 1.5, color: 'grey.300', textTransform: 'none', fontSize: '1rem', borderColor: 'grey.800' }}
                onClick={handleLocalLogin}
              >
                Continue as Local User
              </Button>

              {/* Error Message */}
              {error && (
                <Typography
                  variant="body2"
                  sx={{ mt: 2, color: "#ffcdd2", backgroundColor: "rgba(211, 47, 47, 0.25)", p: 1.5, borderRadius: 2 }}
                >
                  {error}
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}