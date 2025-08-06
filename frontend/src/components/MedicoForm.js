// components/MedicoForm.js
import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Container,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import axios from 'axios';
import CONFIG from '../config.js'

const MedicoForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    especialidad: '', // ID de la especialidad
  });

  const [especialidades, setEspecialidades] = useState([]);

  // Cargar especialidades al montar el componente
  useEffect(() => {
    axios.get(`${CONFIG.API_BASE_URL}/api/especialidades/`)
      .then(res => setEspecialidades(res.data))
      .catch(err => console.error('Error cargando especialidades:', err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${CONFIG.API_BASE_URL}/api/medicos/`, formData);
      alert('Médico registrado exitosamente');
      setFormData({
        nombre: '',
        apellido: '',
        dni: '',
        telefono: '',
        especialidad: '',
      });
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert('Error al registrar médico');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ padding: 3 }}>
        <Typography variant="h6" gutterBottom>Registrar Médico</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nombre"
                label="Nombre"
                fullWidth
                required
                value={formData.nombre}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="apellido"
                label="Apellido"
                fullWidth
                required
                value={formData.apellido}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="dni"
                label="DNI"
                fullWidth
                required
                value={formData.dni}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="telefono"
                label="Teléfono"
                fullWidth
                value={formData.telefono}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Especialidad</InputLabel>
                <Select
                  name="especialidad"
                  value={formData.especialidad}
                  onChange={handleChange}
                  label="Especialidad"
                >
                  {especialidades.map((esp) => (
                    <MenuItem key={esp.id} value={esp.id}>
                      {esp.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Registrar Médico
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default MedicoForm;