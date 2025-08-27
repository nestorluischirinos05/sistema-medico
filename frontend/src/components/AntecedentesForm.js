// components/AntecedentesForm.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Alert,
} from '@mui/material';
import apiClient from '../services/apiClient.js';

const AntecedentesForm = ({ pacienteId }) => {
  const [antecedentes, setAntecedentes] = useState({
    enfermedades_cronicas: '',
    cirugias_previas: '',
    alergias: '',
    medicamentos_actuales: '',
    antecedentes_familiares: '',
    fuma: false,
    paquetes_por_dia: '',
    alcohol: 'nunca',
    ejercicio: '',
    dieta: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const cargarAntecedentes = async () => {
      try {
        const res = await apiClient.get(`/api/antecedentes/${pacienteId}/`);
        setAntecedentes(res.data);
      } catch (err) {
        console.error('Error al cargar antecedentes:', err);
      } finally {
        setLoading(false);
      }
    };
    cargarAntecedentes();
  }, [pacienteId]);

  const handleChange = (e) => {
    setAntecedentes({ ...antecedentes, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (field) => (e) => {
    setAntecedentes({ ...antecedentes, [field]: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/api/antecedentes/${pacienteId}/`, antecedentes);
      setSuccess('Antecedentes médicos actualizados correctamente.');
      setError('');
    } catch (err) {
      setError('Error al guardar los antecedentes.');
    }
  };

  if (loading) return <Typography>Cargando antecedentes...</Typography>;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>Antecedentes Médicos</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={2}
            name="enfermedades_cronicas"
            label="Enfermedades Crónicas"
            value={antecedentes.enfermedades_cronicas}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={2}
            name="cirugias_previas"
            label="Cirugías Previas"
            value={antecedentes.cirugias_previas}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={2}
            name="alergias"
            label="Alergias"
            value={antecedentes.alergias}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={2}
            name="medicamentos_actuales"
            label="Medicamentos Actuales"
            value={antecedentes.medicamentos_actuales}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={2}
            name="antecedentes_familiares"
            label="Antecedentes Familiares"
            value={antecedentes.antecedentes_familiares}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel>¿Fuma?</FormLabel>
            <RadioGroup row name="fuma" value={antecedentes.fuma ? 'true' : 'false'} onChange={(e) => setAntecedentes({ ...antecedentes, fuma: e.target.value === 'true' })}>
              <FormControlLabel value="true" control={<Radio />} label="Sí" />
              <FormControlLabel value="false" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {antecedentes.fuma && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="paquetes_por_dia"
              label="Paquetes por día"
              value={antecedentes.paquetes_por_dia}
              onChange={handleChange}
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <FormControl fullWidth>
            <FormLabel>Consumo de Alcohol</FormLabel>
            <RadioGroup
              row
              name="alcohol"
              value={antecedentes.alcohol}
              onChange={handleChange}
            >
              <FormControlLabel value="nunca" control={<Radio />} label="Nunca" />
              <FormControlLabel value="ocasional" control={<Radio />} label="Ocasional" />
              <FormControlLabel value="frecuente" control={<Radio />} label="Frecuente" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            name="ejercicio"
            label="Ejercicio"
            value={antecedentes.ejercicio}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            name="dieta"
            label="Dieta"
            value={antecedentes.dieta}
            onChange={handleChange}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Button type="submit" variant="contained" color="primary">
          Guardar Antecedentes
        </Button>
      </Box>
    </Box>
  );
};

export default AntecedentesForm;