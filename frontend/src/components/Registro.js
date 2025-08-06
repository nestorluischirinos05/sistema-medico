// components/Registro.js
import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
  IconButton,
  InputAdornment,
  Collapse, // Para animar la aparición de campos condicionales
  FormHelperText, // Para mensajes de ayuda
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CONFIG from '../config.js';

const Registro = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    correo: '',
    nombre: '',
    apellido: '',
    password: '',
    password_confirm: '',
    rol: 'paciente', // Rol predeterminado
    // Campos adicionales para paciente
    dni: '',
    fecha_nacimiento: '',
    telefono: '',
    direccion: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar mensajes al cambiar algún campo
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Validación básica
    if (!formData.correo || !formData.nombre || !formData.apellido || 
        !formData.password || !formData.password_confirm) {
      setError('Por favor, complete todos los campos obligatorios.');
      setLoading(false);
      return;
    }
    
    if (formData.password !== formData.password_confirm) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }
    
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }
    
    // Validación adicional para pacientes
    if (formData.rol === 'paciente') {
      if (!formData.dni) {
        setError('El DNI es obligatorio para pacientes.');
        setLoading(false);
        return;
      }
      // Puedes agregar más validaciones aquí si lo deseas
    }

    try {
      // Enviar todos los datos al endpoint de registro
      const response = await axios.post(`${CONFIG.API_BASE_URL}/api/registro/`, formData);
      setSuccess(response.data.message);
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error("Error en registro:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data) {
        // Manejar errores de validación de Django REST Framework
        const errorMessages = Object.values(err.response.data).flat();
        setError(errorMessages.length > 0 ? errorMessages[0] : 'Error en el registro.');
      } else {
        setError('Error de conexión con el servidor. Intente nuevamente.');
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
        minHeight: '100vh',
        py: isMobile ? 1 : 0,
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          mt: isMobile ? 1 : 8, 
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
          Registro de Usuario
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
          {/* Campos comunes para todos los usuarios */}
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
            helperText="Mínimo 6 caracteres"
            FormHelperTextProps={{
              sx: { 
                fontSize: isMobile ? '0.7rem' : '0.75rem' 
              }
            }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password_confirm"
            label="Confirmar Contraseña"
            type={showConfirmPassword ? 'text' : 'password'}
            id="password_confirm"
            autoComplete="new-password"
            value={formData.password_confirm}
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
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowConfirmPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    size={isMobile ? "small" : "medium"}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          {/* El rol está fijo como 'paciente' según tu requerimiento */}
          <FormControl 
            fullWidth 
            margin="normal"
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
            <Select
              labelId="rol-label"
              id="rol"
              name="rol"
              value={formData.rol}
              label="Rol"
              onChange={handleChange}
              disabled // Deshabilitado para que sea predeterminado
            >
              <MenuItem value="paciente">Paciente</MenuItem>
              {/* <MenuItem value="medico">Médico</MenuItem> --> Comentado si solo es para pacientes */}
            </Select>
            <FormHelperText sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
              El rol se asigna automáticamente.
            </FormHelperText>
          </FormControl>
          
          {/* Campos adicionales específicos para pacientes */}
          {/* Usamos Collapse para una transición suave */}
          <Collapse in={formData.rol === 'paciente'}>
            <Box sx={{ 
              mt: isMobile ? 1 : 2, 
              pt: isMobile ? 1 : 2, 
              borderTop: formData.rol === 'paciente' ? '1px solid #e0e0e0' : 'none'
            }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  mb: isMobile ? 1 : 2, 
                  fontWeight: 'medium',
                  color: 'secondary.main',
                  fontSize: isMobile ? '0.9rem' : '1rem'
                }}
              >
                Información Adicional de Paciente
              </Typography>
              
              <TextField
                margin="normal"
                required={formData.rol === 'paciente'} // Requerido solo para pacientes
                fullWidth
                id="dni"
                label="DNI"
                name="dni"
                value={formData.dni}
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
                fullWidth
                id="fecha_nacimiento"
                label="Fecha de Nacimiento"
                name="fecha_nacimiento"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.fecha_nacimiento}
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
                fullWidth
                id="telefono"
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
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
                fullWidth
                id="direccion"
                label="Dirección"
                name="direccion"
                multiline
                rows={isMobile ? 2 : 3}
                value={formData.direccion}
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
            </Box>
          </Collapse>
          
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
            disabled={loading}
            size={isMobile ? "small" : "medium"}
          >
            {loading ? (
              <CircularProgress 
                size={isMobile ? 20 : 24} 
                sx={{ color: 'white' }} 
              />
            ) : (
              'Registrarse'
            )}
          </Button>
          
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate('/login')}
            sx={{ 
              py: isMobile ? 1 : 1.5,
              fontSize: isMobile ? '0.875rem' : '1rem'
            }}
            size={isMobile ? "small" : "medium"}
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Registro;