// pages/AgendarConsulta.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CONFIG from '../config.js';

const AgendarConsulta = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    medico: '',
    fecha: '',
    motivo: '',
  });

  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Obtener ID del paciente desde localStorage
  const userData = JSON.parse(localStorage.getItem('user_data'));
  const pacienteId = userData?.id;

  useEffect(() => {
    const cargarMedicos = async () => {
      try {
        const res = await axios.get(`${CONFIG.API_BASE_URL}/api/medicos/`);
        setMedicos(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar médicos:', err);
        setError('No se pudieron cargar los médicos. Intente más tarde.');
        setLoading(false);
      }
    };

    cargarMedicos();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!pacienteId) {
      setError('No se pudo identificar al paciente. Inicie sesión nuevamente.');
      return;
    }

    try {
      const consultaData = {
        paciente: pacienteId,
        medico: formData.medico,
        fecha: formData.fecha,
        motivo: formData.motivo,
      };

      await axios.post(`${CONFIG.API_BASE_URL}/api/consultas/`, consultaData);
      setSuccess('Consulta agendada correctamente. Pronto será atendido.');
      setFormData({ medico: '', fecha: '', motivo: '' });

      // Opcional: redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/paciente/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error al agendar consulta:', err.response?.data || err.message);
      setError('No se pudo agendar la consulta. Verifique los datos e intente nuevamente.');
    }
  };

  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        mt: isMobile ? 2 : 4, 
        mb: isMobile ? 2 : 4,
        px: isMobile ? 1 : 3
      }}
    >
      <Paper 
        sx={{ 
          padding: isMobile ? 2 : 4,
          borderRadius: isMobile ? 2 : 4
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom 
          align="center"
          sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}
        >
          Agendar Consulta
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Médico</InputLabel>
              <Select
                name="medico"
                value={formData.medico}
                onChange={handleChange}
                label="Médico"
                required
              >
                {medicos.length === 0 ? (
                  <MenuItem disabled>Cargando médicos...</MenuItem>
                ) : (
                  medicos.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.nombre} {m.apellido} - {m.especialidad?.nombre || 'Sin especialidad'}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <TextField
              name="fecha"
              label="Fecha de la consulta"
              type="date"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={formData.fecha}
              onChange={handleChange}
              margin="normal"
            />

            <TextField
              name="motivo"
              label="Motivo de la consulta"
              multiline
              rows={4}
              fullWidth
              required
              value={formData.motivo}
              onChange={handleChange}
              margin="normal"
            />

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="button"
                onClick={() => navigate('/paciente/dashboard')}
                fullWidth={isMobile}
                variant="outlined"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                fullWidth={isMobile}
                variant="contained"
                color="primary"
              >
                Agendar Consulta
              </Button>
            </Box>
          </form>
        )}
      </Paper>
    </Container>
  );
};

export default AgendarConsulta;