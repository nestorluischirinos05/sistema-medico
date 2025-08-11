// components/PacienteForm.js
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
  useMediaQuery,
  useTheme,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import CONFIG from '../config.js';

const PacienteForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fecha_nacimiento: '',
    telefono: '',
    direccion: '',
  });

  // Estado del modal
  const [open, setOpen] = useState(false);

  // Lista de pacientes
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar pacientes al iniciar
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const response = await axios.get(`${CONFIG.API_BASE_URL}/api/pacientes/`);
        setPacientes(response.data);
      } catch (err) {
        setError('Error al cargar pacientes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPacientes();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${CONFIG.API_BASE_URL}/api/pacientes/`, formData);
      setPacientes([response.data, ...pacientes]); // Agregar al inicio
      alert('✅ Paciente registrado exitosamente');
      setFormData({
        nombre: '',
        apellido: '',
        dni: '',
        fecha_nacimiento: '',
        telefono: '',
        direccion: '',
      });
      setOpen(false); // Cerrar modal
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al registrar paciente';
      alert(`❌ ${errorMsg}`);
      console.error(err);
    }finally {
    setLoadingSubmit(false);
  }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
          Gestión de Pacientes
        </Typography>

        {/* Botón flotante para abrir el modal */}
        <Box display="flex" justifyContent="flex-end" mb={3}>
          <Fab
            color="secondary"
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

        {/* Tabla de pacientes */}
        <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2 }}>
          <Table size={isMobile ? 'small' : 'medium'}>
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>DNI</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Teléfono</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha Nac.</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography>Cargando pacientes...</Typography>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Alert severity="error">{error}</Alert>
                  </TableCell>
                </TableRow>
              ) : pacientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="textSecondary">No hay pacientes registrados</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pacientes.map((paciente) => (
                  <TableRow
                    key={paciente.id}
                    sx={{
                      '&:hover': { bgcolor: 'action.hover' },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight="500">
                        {paciente.nombre} {paciente.apellido}
                      </Typography>
                    </TableCell>
                    <TableCell>{paciente.dni}</TableCell>
                    <TableCell>{paciente.telefono || 'No registrado'}</TableCell>
                    <TableCell>
                      {new Date(paciente.fecha_nacimiento).toLocaleDateString()}
                    </TableCell>
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
    <Typography variant="h6" fontWeight="600" mb={3} color="primary">
      Registrar Nuevo Paciente
    </Typography>
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2} direction="column">
        
        {/* Nombre */}
        <Grid item xs={12}>
          <TextField
            name="nombre"
            label="Nombre"
            fullWidth
            required
            value={formData.nombre}
            onChange={handleChange}
            size={isMobile ? 'small' : 'medium'}
            placeholder="Ingrese el nombre del paciente"
          />
        </Grid>

        {/* Apellido */}
        <Grid item xs={12}>
          <TextField
            name="apellido"
            label="Apellido"
            fullWidth
            required
            value={formData.apellido}
            onChange={handleChange}
            size={isMobile ? 'small' : 'medium'}
            placeholder="Ingrese el apellido del paciente"
          />
        </Grid>

        {/* DNI */}
        <Grid item xs={12}>
          <TextField
            name="dni"
            label="DNI / Documento"
            fullWidth
            required
            value={formData.dni}
            onChange={handleChange}
            size={isMobile ? 'small' : 'medium'}
            placeholder="Ej: 12345678"
          />
        </Grid>

        {/* Fecha de nacimiento */}
        <Grid item xs={12}>
          <TextField
            name="fecha_nacimiento"
            label="Fecha de nacimiento"
            type="date"
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            size={isMobile ? 'small' : 'medium'}
          />
        </Grid>

        {/* Teléfono */}
        <Grid item xs={12}>
          <TextField
            name="telefono"
            label="Teléfono"
            fullWidth
            value={formData.telefono}
            onChange={handleChange}
            size={isMobile ? 'small' : 'medium'}
            placeholder="Ej: 04121234567"
          />
        </Grid>

        {/* Dirección */}
        <Grid item xs={12}>
          <TextField
            name="direccion"
            label="Dirección"
            fullWidth
            multiline
            rows={3}
            value={formData.direccion}
            onChange={handleChange}
            size={isMobile ? 'small' : 'medium'}
            placeholder="Ingrese la dirección completa"
          />
        </Grid>

        {/* Botones */}
        <Grid item xs={12} mt={2} display="flex" justifyContent={isMobile ? 'center' : 'flex-end'} gap={2}>
          <Button
            onClick={handleClose}
            color="inherit"
            variant="outlined"
            sx={{ minWidth: 100 }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={loadingSubmit}
            sx={{ minWidth: 120 }}
          >
            {loadingSubmit ? 'Registrando...' : 'Registrar'}
          </Button>
        </Grid>
      </Grid>
    </form>
  </Box>
</Modal>
    </Container>
  );
};

export default PacienteForm;