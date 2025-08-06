// src/components/Login.js
import React, { useState } from 'react';
import {
  Box,
  Container,
  CssBaseline,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Link,
  IconButton,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Visibility, VisibilityOff, Lock } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import CONFIG from '../config.js';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [credentials, setCredentials] = useState({
    correo: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.correo || !credentials.password) {
      setError('Por favor, complete todos los campos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${CONFIG.API_BASE_URL}/api/login/`, credentials);

      if (!response.data.access || !response.data.refresh) {
        throw new Error('Respuesta incompleta del servidor');
      }

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      const userDataToStore = {
        nombre: response.data.nombre || '',
        apellido: response.data.apellido || '',
        correo: response.data.correo || '',
        rol: response.data.rol || 'Sin rol',
        rol_codigo: response.data.rol_codigo || 'sin_rol',
        is_staff: response.data.is_staff || false,
      };

      localStorage.setItem('user_data', JSON.stringify(userDataToStore));

      if (onLogin) {
        onLogin(userDataToStore);
      }

      if (response.data.is_staff) {
        navigate('/dashboard', { replace: true });
      } else if (userDataToStore.rol_codigo === 'medico') {
        navigate('/medico/dashboard', { replace: true });
      } else if (userDataToStore.rol_codigo === 'paciente') {
        navigate('/paciente/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError('Correo o contraseña incorrectos.');
        } else {
          setError(err.response.data.error || `Error del servidor (${err.response.status}).`);
        }
      } else if (err.request) {
        setError('Error de conexión. Verifique su red.');
      } else {
        setError('Ocurrió un error inesperado. Intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
      }}
    >
      <CssBaseline />
      <Container
        component="main"
        maxWidth="sm"
        sx={{
          width: '100%',
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: isMobile ? 3 : 5,
            borderRadius: 3,
            backgroundColor: '#ffffff',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '450px',
            mx: 'auto',
          }}
        >
          {/* Icono de candado centrado */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                width: 60,
                height: 60,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              }}
            >
              <Lock fontSize="large" />
            </Box>
          </Box>

          {/* Título */}
          <Typography
            component="h1"
            variant="h5"
            align="center"
            fontWeight="600"
            color="text.primary"
            sx={{ mb: 1 }}
          >
            Iniciar Sesión
          </Typography>
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Bienvenido de vuelta, por favor ingresa tus credenciales
          </Typography>

          {/* Alerta de error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, fontSize: '0.875rem' }}>
              {error}
            </Alert>
          )}

          {/* Formulario */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="correo"
              label="Correo Electrónico"
              name="correo"
              autoComplete="email"
              autoFocus
              value={credentials.correo}
              onChange={handleChange}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                ¿No tienes cuenta?{' '}
                <Link
                  component={RouterLink}
                  to="/registro"
                  sx={{
                    fontWeight: 500,
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Regístrate aquí
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;