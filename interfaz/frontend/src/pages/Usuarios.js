// components/RegistrarUsuario.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  useMediaQuery,
  useTheme,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import CONFIG from '../config.js'

const RegistrarUsuario = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    correo: '',
    nombre: '',
    apellido: '',
    password: '',
    rol_codigo: 'paciente'
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Cargar roles al montar el componente
  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true);
      setError('');
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${CONFIG.API_BASE_URL}/api/admin/roles/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRoles(response.data);
      } catch (err) {
        console.error("Error al cargar roles:", err);
        setError('Error al cargar los roles disponibles.');
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Validación básica en el frontend
    if (!formData.correo || !formData.nombre || !formData.apellido || !formData.password) {
        setError('Todos los campos son obligatorios.');
        setLoading(false);
        return;
    }
    
    // Validar longitud mínima de contraseña
    if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        setLoading(false);
        return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${CONFIG.API_BASE_URL}/api/admin/usuarios/`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSuccess(response.data.message);
      
      // Limpiar formulario
      setFormData({
        correo: '',
        nombre: '',
        apellido: '',
        password: '',
        rol_codigo: 'paciente'
      });
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.correo) {
        setError(`Correo: ${err.response.data.correo[0]}`);
      } else {
        setError('Error al registrar el usuario. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      component="main" 
      maxWidth="sm"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '100vh',
        py: isMobile ? 1 : 0,
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          mt: isMobile ? 1 : 4, 
          mb: isMobile ? 1 : 0,
          p: isMobile ? 2 : 4,
          width: '100%',
          maxWidth: '100%',
        }}
      >
        <Typography 
          component="h1" 
          variant={isMobile ? "h5" : "h4"} 
          align="center" 
          sx={{ 
            mb: isMobile ? 2 : 3,
            fontWeight: 'bold',
            color: 'primary.main'
          }}
        >
          Registrar Nuevo Usuario
        </Typography>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              fontSize: isMobile ? '0.75rem' : '0.875rem'
            }}
          >
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 2,
              fontSize: isMobile ? '0.75rem' : '0.875rem'
            }}
          >
            {success}
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
            autoFocus={!isMobile}
            value={formData.correo}
            onChange={handleChange}
            disabled={loading}
            size={isMobile ? "small" : "medium"}
            sx={{ 
              mb: isMobile ? 1 : 2,
              '& .MuiInputBase-root': {
                fontSize: isMobile ? '0.875rem' : '1rem'
              },
              '& .MuiInputLabel-root': {
                fontSize: isMobile ? '0.875rem' : '1rem'
              }
            }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="nombre"
            label="Nombre"
            name="nombre"
            autoComplete="given-name"
            value={formData.nombre}
            onChange={handleChange}
            disabled={loading}
            size={isMobile ? "small" : "medium"}
            sx={{ 
              mb: isMobile ? 1 : 2,
              '& .MuiInputBase-root': {
                fontSize: isMobile ? '0.875rem' : '1rem'
              },
              '& .MuiInputLabel-root': {
                fontSize: isMobile ? '0.875rem' : '1rem'
              }
            }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="apellido"
            label="Apellido"
            name="apellido"
            autoComplete="family-name"
            value={formData.apellido}
            onChange={handleChange}
            disabled={loading}
            size={isMobile ? "small" : "medium"}
            sx={{ 
              mb: isMobile ? 1 : 2,
              '& .MuiInputBase-root': {
                fontSize: isMobile ? '0.875rem' : '1rem'
              },
              '& .MuiInputLabel-root': {
                fontSize: isMobile ? '0.875rem' : '1rem'
              }
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
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            helperText="La contraseña debe tener al menos 6 caracteres."
            disabled={loading}
            size={isMobile ? "small" : "medium"}
            sx={{ 
              mb: isMobile ? 1 : 2,
              '& .MuiInputBase-root': {
                fontSize: isMobile ? '0.875rem' : '1rem'
              },
              '& .MuiInputLabel-root': {
                fontSize: isMobile ? '0.875rem' : '1rem'
              },
              '& .MuiFormHelperText-root': {
                fontSize: isMobile ? '0.7rem' : '0.75rem'
              }
            }}
            InputProps={{
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

          <FormControl 
            fullWidth 
            margin="normal" 
            disabled={loadingRoles || loading}
            size={isMobile ? "small" : "medium"}
            sx={{ 
              mb: isMobile ? 1 : 2,
              '& .MuiInputBase-root': {
                fontSize: isMobile ? '0.875rem' : '1rem'
              },
              '& .MuiInputLabel-root': {
                fontSize: isMobile ? '0.875rem' : '1rem'
              }
            }}
          >
            <InputLabel id="rol-label">Rol</InputLabel>
            {loadingRoles ? (
              <CircularProgress size={isMobile ? 16 : 20} sx={{ m: isMobile ? 1 : 1.5 }} />
            ) : (
              <Select
                labelId="rol-label"
                id="rol_codigo"
                name="rol_codigo"
                value={formData.rol_codigo}
                label="Rol"
                onChange={handleChange}
              >
                {roles.map((rol) => (
                  <MenuItem 
                    key={rol.codigo} 
                    value={rol.codigo}
                    sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
                  >
                    {rol.nombre}
                  </MenuItem>
                ))}
              </Select>
            )}
            <FormHelperText sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
              Selecciona el rol para este usuario.
            </FormHelperText>
          </FormControl>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              mt: isMobile ? 2 : 3, 
              mb: isMobile ? 1 : 2,
              py: isMobile ? 1 : 1.5,
              fontSize: isMobile ? '0.875rem' : '1rem'
            }}
            disabled={loading || loadingRoles}
            size={isMobile ? "small" : "medium"}
          >
            {loading ? (
              <CircularProgress 
                size={isMobile ? 20 : 24} 
                sx={{ color: 'white' }} 
              />
            ) : (
              'Registrar Usuario'
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegistrarUsuario;