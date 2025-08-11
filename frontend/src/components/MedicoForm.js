// components/MedicoForm.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Fab,
  Modal,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import CONFIG from '../config.js';

const MedicoForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    especialidad: '',
  });

  // Estado del modal
  const [open, setOpen] = useState(false);

  // Datos
  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState('');

  // Cargar especialidades y médicos al montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [especialidadesRes, medicosRes] = await Promise.all([
          axios.get(`${CONFIG.API_BASE_URL}/api/especialidades/`),
          axios.get(`${CONFIG.API_BASE_URL}/api/medicos/`),
        ]);
        setEspecialidades(especialidadesRes.data);
        setMedicos(medicosRes.data);
      } catch (err) {
        setError('Error al cargar datos. Verifica la conexión con el servidor.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    try {
      const response = await axios.post(`${CONFIG.API_BASE_URL}/api/medicos/`, formData);
      setMedicos([response.data, ...medicos]); // Añadir al inicio
      alert('✅ Médico registrado exitosamente');
      setFormData({
        nombre: '',
        apellido: '',
        dni: '',
        telefono: '',
        especialidad: '',
      });
      setOpen(false);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al registrar médico';
      alert(`❌ ${errorMsg}`);
      console.error(err);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    if (!loadingSubmit) setOpen(false);
  };

  // Estilo del modal
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: isMobile ? '90%' : '500px',
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    maxHeight: '90vh',
    overflow: 'auto',
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
        <Typography
          variant="h5"
          component="h1"
          gutterBottom
          align="center"
          fontWeight="600"
          color="primary"
        >
          Gestión de Médicos
        </Typography>

        {/* Botón flotante para abrir el modal */}
        <Box display="flex" justifyContent="flex-end" mb={3}>
          <Fab
            color="primary"
            aria-label="add"
            onClick={handleOpen}
            sx={{
              boxShadow: 3,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            <AddIcon />
          </Fab>
        </Box>

        {/* Tabla de médicos */}
        <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2 }}>
          <Table size={isMobile ? 'small' : 'medium'}>
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>DNI</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Especialidad</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Teléfono</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress size={24} /> Cargando médicos...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Alert severity="error">{error}</Alert>
                  </TableCell>
                </TableRow>
              ) : medicos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="textSecondary">No hay médicos registrados</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                medicos.map((medico) => (
                  <TableRow
                    key={medico.id}
                    sx={{
                      '&:hover': { bgcolor: 'action.hover' },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight="500">
                        {medico.nombre} {medico.apellido}
                      </Typography>
                    </TableCell>
                    <TableCell>{medico.dni}</TableCell>
                    <TableCell>{medico.especialidad?.nombre || 'Sin especialidad'}</TableCell>
                    <TableCell>{medico.telefono || 'No registrado'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal del formulario */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" fontWeight="600" mb={3}>
            Registrar Nuevo Médico
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} direction="column">
              <Grid item xs={12}>
                <TextField
                  name="nombre"
                  label="Nombre"
                  fullWidth
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  size={isMobile ? 'small' : 'medium'}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="apellido"
                  label="Apellido"
                  fullWidth
                  required
                  value={formData.apellido}
                  onChange={handleChange}
                  size={isMobile ? 'small' : 'medium'}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="dni"
                  label="DNI"
                  fullWidth
                  required
                  value={formData.dni}
                  onChange={handleChange}
                  size={isMobile ? 'small' : 'medium'}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="telefono"
                  label="Teléfono"
                  fullWidth
                  value={formData.telefono}
                  onChange={handleChange}
                  size={isMobile ? 'small' : 'medium'}
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
                    size={isMobile ? 'small' : 'medium'}
                  >
                    {especialidades.length === 0 ? (
                      <MenuItem disabled>No hay especialidades</MenuItem>
                    ) : (
                      especialidades.map((esp) => (
                        <MenuItem key={esp.id} value={esp.id}>
                          {esp.nombre}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2} mt={2}>
                <Button onClick={handleClose} color="inherit" disabled={loadingSubmit}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loadingSubmit}
                >
                  {loadingSubmit ? 'Registrando...' : 'Registrar Médico'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Modal>
    </Container>
  );
};

export default MedicoForm;