// components/Login.js
import React, { useState } from 'react';
import {
  Container,
  Card,
  Box,
  Grid,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Link,
  IconButton,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MuiLink from '@mui/material/Link';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import FacebookIcon from '@mui/icons-material/Facebook';
import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

import BasicLayout from './BasicLayout';
import bgImage from '../assets/images/bg-sign-in-basic.jpeg';
import CONFIG from '../config.js';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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

      // Guardar tokens y datos del usuario
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      const userDataToStore = {
        nombre: response.data.nombre || '',
        apellido: response.data.apellido || '',
        correo: response.data.correo || '',
        rol: response.data.rol || 'Sin rol',
        rol_codigo: response.data.rol_codigo || 'sin_rol',
        is_staff: response.data.is_staff || false,
        medico_id: response.data.medico_id || null,
      };

      localStorage.setItem('user_data', JSON.stringify(userDataToStore));

      if (onLogin) onLogin(userDataToStore);

      // Redirigir según rol
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
          setError(err.response.data.error || 'Error del servidor.');
        }
      } else if (err.request) {
        setError('Error de conexión. Verifique su red.');
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" 
      maxWidth="xs"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '100vh', // Ocupa toda la altura de la pantalla
        py: isMobile ? 2 : 0, // Padding vertical menor en móviles
      }}>
      <Card
        sx={{
          maxWidth: isMobile ? '95%' : isTablet ? '440px' : '480px',
          margin: '0 auto',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Header con color primario */}
        <Box
          sx={{
            backgroundColor: '#1976d2', // Color principal de Material Dashboard
            color: 'white',
            p: 3,
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold" color="white">
            Iniciar Sesión
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.8)" sx={{ mt: 1 }}>
            Bienvenido de vuelta
          </Typography>

          {/* Redes sociales */}
          <Grid container spacing={1} justifyContent="center" sx={{ mt: 2 }}>
            {[
              { Icon: FacebookIcon, color: '#3b5998' },
              { Icon: GoogleIcon, color: '#db4437' },
              { Icon: GitHubIcon, color: '#333' },
            ].map(({ Icon, color }, index) => (
              <Grid item key={index}>
                <IconButton
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    backgroundColor: color,
                    color: 'white',
                    '&:hover': { backgroundColor: color, opacity: 0.9 },
                    width: isMobile ? 32 : 36,
                    height: isMobile ? 32 : 36,
                  }}
                >
                  <Icon fontSize={isMobile ? 'small' : 'medium'} />
                </IconButton>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Formulario */}
        <Box pt={4} pb={3} px={isMobile ? 3 : 4}>
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  borderRadius: '8px',
                }}
              >
                {error}
              </Alert>
            )}

            {/* Correo */}
            <TextField
              fullWidth
              required
              id="correo"
              label="Correo Electrónico"
              name="correo"
              autoComplete="email"
              value={credentials.correo}
              onChange={handleChange}
              disabled={loading}
              autoFocus={!isMobile}
              sx={{
                mb: 2,
                '& .MuiInputBase-input': {
                  fontSize: isMobile ? '0.9rem' : '1rem',
                },
                '& .MuiInputLabel-root': {
                  fontSize: isMobile ? '0.9rem' : '1rem',
                },
              }}
            />

            {/* Contraseña */}
            <TextField
              fullWidth
              required
              name="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              disabled={loading}
              sx={{
                mb: 3,
                '& .MuiInputBase-input': {
                  fontSize: isMobile ? '0.9rem' : '1rem',
                },
                '& .MuiInputLabel-root': {
                  fontSize: isMobile ? '0.9rem' : '1rem',
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
                      size={isMobile ? 'small' : 'medium'}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Botón de login */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                mb: 2,
                py: 1.2,
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: 600,
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#1976d2' },
                borderRadius: '8px',
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                'Iniciar Sesión'
              )}
            </Button>

            {/* Enlace a registro */}
            <Box textAlign="center">
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.85rem' : '0.9rem' }}
              >
                ¿No tienes cuenta?{' '}
                <Link
                  component={RouterLink}
                  to="/registro"
                  sx={{
                    fontWeight: 600,
                    color: '#1976d2',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Regístrate aquí
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>
    </Container>
  );
};

export default Login;