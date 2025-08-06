// components/PacienteForm.js
import React, { useState } from 'react';
import {
  TextField,
  Button,
  Container,
  Paper,
  Typography,
  Grid,
} from '@mui/material';
import axios from 'axios';
import CONFIG from '../config.js'

const PacienteForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fecha_nacimiento: '',
    telefono: '',
    direccion: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${CONFIG.API_BASE_URL}/api/pacientes/`, formData);
      alert('Paciente registrado exitosamente');
      setFormData({
        nombre: '',
        apellido: '',
        dni: '',
        fecha_nacimiento: '',
        telefono: '',
        direccion: '',
      });
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert('Error al registrar paciente');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ padding: 3 }}>
        <Typography variant="h6" gutterBottom>Registrar Paciente</Typography>
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
                name="fecha_nacimiento"
                label="Fecha de nacimiento"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={formData.fecha_nacimiento}
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
              <TextField
                name="direccion"
                label="Dirección"
                fullWidth
                multiline
                rows={2}
                value={formData.direccion}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="secondary">
                Registrar Paciente
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default PacienteForm;