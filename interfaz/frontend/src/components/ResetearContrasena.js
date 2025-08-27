// components/ResetearContrasena.js
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
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import axios from 'axios';
import CONFIG from '../config.js'

const ResetearContrasena = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    usuario_id: '',
    nueva_contrasena: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar lista de usuarios
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const token = localStorage.getItem('access_token');
        // Asumiendo que tienes un endpoint para obtener usuarios
        const response = await axios.get(`${CONFIG.API_BASE_URL}/api/usuarios/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUsuarios(response.data);
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
      }
    };
    
    cargarUsuarios();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
      const response = await axios.post(`http${CONFIG.API_BASE_URL}/api/resetear-contrasena/`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSuccess(response.data.message);
      setFormData({
        usuario_id: '',
        nueva_contrasena: ''
      });
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Error al resetear la contraseña');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Typography component="h1" variant="h5" align="center" sx={{ mb: 3 }}>
          Resetear Contraseña de Usuario
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
          <FormControl fullWidth margin="normal">
            <InputLabel id="usuario-label">Seleccionar Usuario</InputLabel>
            <Select
              labelId="usuario-label"
              id="usuario_id"
              name="usuario_id"
              value={formData.usuario_id}
              label="Seleccionar Usuario"
              onChange={handleChange}
            >
              {usuarios.map((usuario) => (
                <MenuItem key={usuario.id} value={usuario.id}>
                  {usuario.nombre} {usuario.apellido} ({usuario.correo})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
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
            helperText="Esta será la nueva contraseña del usuario"
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || !formData.usuario_id || !formData.nueva_contrasena}
          >
            {loading ? <CircularProgress size={24} /> : 'Resetear Contraseña'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetearContrasena;