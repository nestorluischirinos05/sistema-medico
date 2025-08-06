// components/EspecialidadForm.js
import React, { useState } from 'react';
import {
  TextField,
  Button,
  Container,
  Paper,
  Typography,
} from '@mui/material';
import axios from 'axios';
import CONFIG from '../config.js'
const EspecialidadForm = () => {
  const [nombre, setNombre] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${CONFIG.API_BASE_URL}/api/especialidades/`, { nombre });
      alert('Especialidad registrada exitosamente');
      setNombre('');
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert('Error al registrar especialidad');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ padding: 3 }}>
        <Typography variant="h6" gutterBottom>Registrar Especialidad</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Nombre de la especialidad"
            fullWidth
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Cardiología, Pediatría, Dermatología"
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Registrar Especialidad
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default EspecialidadForm;