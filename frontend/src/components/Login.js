// components/Login.js
import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Link,
  IconButton,
  InputAdornment,
  useMediaQuery, // Para detectar móviles
  useTheme,     // Para usar el tema
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import CONFIG from '../config.js'

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Detectar si es móvil
    const [credentials, setCredentials] = useState({
  correo: '',
  password: '' // ✅ Mejor que 'contraseña'
});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Para mostrar/ocultar contraseña

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
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
    
    // Validación básica del lado del cliente
    if (!credentials.correo || !credentials.password) {
        setError('Por favor, complete todos los campos.');
        return;
    }

    setLoading(true);
    setError('');

    try {
      console.log(`${CONFIG.API_BASE_URL}/api/login/`)
      const response = await axios.post(`${CONFIG.API_BASE_URL}/api/login/`, credentials);
      
      if (!response.data.access || !response.data.refresh) {
        throw new Error('Respuesta incompleta del servidor');
      }

      // Guardar token y datos del usuario en localStorage
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      const userDataToStore = {
        nombre: response.data.nombre || '',
        apellido: response.data.apellido || '',
        correo: response.data.correo || '',
        rol: response.data.rol || 'Sin rol',
        rol_codigo: response.data.rol_codigo || 'sin_rol',
        is_staff: response.data.is_staff || false
      };
      
      localStorage.setItem('user_data', JSON.stringify(userDataToStore));
      
      if (onLogin) {
        onLogin(userDataToStore);
      }
      
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
        // Errores específicos del servidor
        if (err.response.status === 401) {
            setError('Correo o contraseña incorrectos.');
        } else {
            setError(err.response.data.error || `Error del servidor (${err.response.status}).`);
        }
      } else if (err.request) {
        // Error de red, el servidor no respondió
        setError('Error de conexión. Verifique su red.');
      } else {
        // Otro tipo de error
        setError('Ocurrió un error inesperado. Intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      component="main" 
      maxWidth="xs"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '100vh', // Ocupa toda la altura de la pantalla
        py: isMobile ? 2 : 0, // Padding vertical menor en móviles
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: isMobile ? 2 : 4, // Padding menor en móviles
          width: '100%', // Asegurar ancho completo en el contenedor
          maxWidth: '100%', // Evitar que se desborde en pantallas muy pequeñas
        }}
      >
        <Typography 
          component="h1" 
          variant={isMobile ? "h5" : "h4"} // Tamaño de fuente adaptable
          align="center" 
          sx={{ mb: isMobile ? 2 : 3 }} // Margen inferior adaptable
        >
          Iniciar Sesión
        </Typography>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
                mb: 2,
                fontSize: isMobile ? '0.8rem' : '0.875rem' // Texto más pequeño en móviles
            }}
          >
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="correo"
            label="Correo Electrónico"
            name="correo"
            autoComplete="email"
            autoFocus={!isMobile} // Evitar autofocus en móviles puede ser molesto
            value={credentials.correo}
            onChange={handleChange}
            disabled={loading}
            size={isMobile ? "small" : "medium"} // Campos más pequeños en móviles
            sx={{ mb: isMobile ? 1 : 2 }} // Margen inferior adaptable
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password" // ✅
            label="Contraseña"
            type={showPassword ? 'text' : 'password'} // Alternar tipo de input
            id="contraseña"
            autoComplete="current-password"
            value={credentials.password}
            onChange={handleChange}
            disabled={loading}
            size={isMobile ? "small" : "medium"}
            sx={{ mb: isMobile ? 1 : 2 }}
            InputProps={{ // Icono para mostrar/ocultar contraseña
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    size={isMobile ? "small" : "medium"}
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
            sx={{ 
                mt: isMobile ? 2 : 3, 
                mb: isMobile ? 1 : 2,
                py: isMobile ? 1 : 1.5, // Padding vertical del botón adaptable
                fontSize: isMobile ? '0.9rem' : '1rem' // Tamaño de fuente adaptable
            }}
            disabled={loading}
            size={isMobile ? "small" : "medium"}
          >
           {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: isMobile ? 1 : 2 }}>
            <Typography 
                variant={isMobile ? "body2" : "body1"} // Tamaño de fuente adaptable
                sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
            >
              ¿No tienes cuenta?{' '}
              <Link 
                component={RouterLink} 
                to="/registro"
                sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
              >
                Regístrate aquí
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;

