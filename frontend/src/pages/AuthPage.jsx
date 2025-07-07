import { useState, useContext } from 'react';
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Paper,
  Box,
  Grid,
  Snackbar,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import '@fontsource/poppins';
import { useLocation } from 'react-router-dom';


const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
});

export default function AuthPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const [formState, setFormState] = useState(location.state?.mode === "signup" ? 1 : 0);
  const [open, setOpen] = useState(false);

  const { handleRegister, handleLogin } = useContext(AuthContext);

  const handleAuth = async () => {
    try {
      if (formState === 0) {
        await handleLogin(username, password);
      } else {
        const result = await handleRegister(name, username, password);
        setUsername('');
        setPassword('');
        setName('');
        setMessage(result);
        setOpen(true);
        setError('');
        setFormState(0);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      setError(msg);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ height: '100vh', width: '100vw' }}>
        {/* Left image side */}
        <Box
          sx={{
            flex: 15,
            display: { xs: 'none', md: 'block' },
            background:
              'url("https://images.unsplash.com/photo-1612831455359-970e23a1e4e9?w=600&auto=format&fit=crop&q=60") no-repeat center center/cover',
            width: '100%',
            height: '100%',
          }}
        />

        {/* Right form side */}
        <Box
          sx={{
            flex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 3, sm: 4 },
            py: { xs: 5, sm: 8 },
            backgroundColor: 'white',
            borderRadius: { xs: 0, sm: 3 },
            boxShadow: { xs: 'none', sm: '0 6px 20px rgba(0, 0, 0, 0.1)' },
            transition: 'all 0.3s ease',
          }}
          component={Paper}
          elevation={6}
          square
        >
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <Avatar sx={{ m: 'auto', bgcolor: '#ff9839', width: 56, height: 56 }}>
              <LockOutlinedIcon fontSize="large" />
            </Avatar>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 3,
                mb: 3,
                gap: 2,
              }}
            >
              <Button
                variant={formState === 0 ? 'contained' : 'outlined'}
                onClick={() => setFormState(0)}
                sx={{
                  px: 4,
                  fontWeight: 600,
                  bgcolor: formState === 0 ? '#4338ca' : undefined,
                  '&:hover': {
                    bgcolor: '#3730a3',
                  },
                }}
              >
                SIGN IN
              </Button>
              <Button
                variant={formState === 1 ? 'contained' : 'outlined'}
                onClick={() => setFormState(1)}
                sx={{
                  px: 4,
                  fontWeight: 600,
                  bgcolor: formState === 1 ? '#ff9839' : undefined,
                  '&:hover': {
                    bgcolor: '#fb923c',
                  },
                }}
              >
                SIGN UP
              </Button>
            </Box>

            <Box component="form" noValidate sx={{ mt: 1 }}>
              {formState === 1 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus={formState === 1}
                />
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={username}
                autoFocus={formState === 0}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                value={password}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                id="password"
              />

              {error && (
                <p
                  style={{
                    color: 'red',
                    marginTop: '10px',
                    fontWeight: 500,
                  }}
                >
                  {error}
                </p>
              )}

              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{
                  mt: 4,
                  mb: 2,
                  py: 1.5,
                  fontWeight: 600,
                  bgcolor: '#0f172a',
                  '&:hover': {
                    bgcolor: '#1e293b',
                  },
                }}
                onClick={handleAuth}
              >
                {formState === 0 ? 'Login' : 'Register'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Grid>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        message={message}
      />
    </ThemeProvider>
  );
}
