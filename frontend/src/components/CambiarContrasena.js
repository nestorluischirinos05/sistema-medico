// components/CambiarContrasena.js
import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import CONFIG from '../config.js'
import axios from 'axios';

const CambiarContrasena = () => {
  const [formData, setFormData] = useState({
    contrasena_actual: '',
    nueva_contrasena: '',
    confirmar_contrasena: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar mensajes al cambiar algún campo
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${CONFIG.API_BASE_URL}/api/cambiar-contrasena/`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSuccess(response.data.message);
      
      // Limpiar formulario
      setFormData({
        contrasena_actual: '',
        nueva_contrasena: '',
        confirmar_contrasena: ''
      });
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Error al cambiar la contraseña');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Typography component="h1" variant="h5" align="center" sx={{ mb: 3 }}>
          Cambiar Contraseña
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="contrasena_actual"
            label="Contraseña Actual"
            type="password"
            id="contrasena_actual"
            value={formData.contrasena_actual}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="nueva_contrasena"
            label="Nueva Contraseña"
            type="password"
            id="nueva_contrasena"
            value={formData.nueva_contrasena}
            onChange={handleChange}
            helperText="Mínimo 6 caracteres"
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmar_contrasena"
            label="Confirmar Nueva Contraseña"
            type="password"
            id="confirmar_contrasena"
            value={formData.confirmar_contrasena}
            onChange={handleChange}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Cambiar Contraseña'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CambiarContrasena;