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
  CircularProgress,
  Snackbar,
  Divider,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';
import CONFIG from '../config.js';

const PacienteForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Estado del formulario
  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    apellido: '',
    dni: '',
    fecha_nacimiento: '',
    telefono: '',
    direccion: '',
  });

  // Estado del modal y mensajes
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Cargar pacientes al iniciar
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const response = await axios.get(`${CONFIG.API_BASE_URL}/api/pacientes/`);
        setPacientes(response.data);
      } catch (err) {
        showSnackbar('Error al cargar pacientes', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPacientes();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpen = (paciente = null) => {
    if (paciente) {
      // Modo edición
      setFormData({
        id: paciente.id,
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        dni: paciente.dni,
        fecha_nacimiento: paciente.fecha_nacimiento,
        telefono: paciente.telefono || '',
        direccion: paciente.direccion || '',
      });
      setIsEditing(true);
    } else {
      // Modo nuevo
      setFormData({
        id: '',
        nombre: '',
        apellido: '',
        dni: '',
        fecha_nacimiento: '',
        telefono: '',
        direccion: '',
      });
      setIsEditing(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    if (!loadingSubmit) setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      if (isEditing) {
        // Actualizar paciente
        const response = await axios.put(`${CONFIG.API_BASE_URL}/api/pacientes/${formData.id}/`, formData);
        setPacientes(pacientes.map(p => p.id === formData.id ? response.data : p));
        showSnackbar('✅ Paciente actualizado exitosamente', 'success');
      } else {
        // Registrar nuevo paciente
        const response = await axios.post(`${CONFIG.API_BASE_URL}/api/pacientes/`, formData);
        setPacientes([response.data, ...pacientes]);
        showSnackbar('✅ Paciente registrado exitosamente', 'success');
      }
      setOpen(false);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.dni?.[0] ||
        'Error al procesar el paciente';
      showSnackbar(`❌ ${errorMsg}`, 'error');
      console.error('Error:', err);
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Estilo del modal
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: isMobile ? '90%' : 600,
    bgcolor: 'background.paper',
    borderRadius: 3,
    boxShadow: 24,
    p: 4,
    maxHeight: '90vh',
    overflowY: 'auto',
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Tarjeta principal */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          backgroundColor: '#f8f9ff',
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          gutterBottom
          align="center"
          fontWeight="bold"
          color="primary.main"
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
        >
          <AddIcon />
          Gestión de Pacientes
        </Typography>

        {/* Botón flotante */}
        <Box display="flex" justifyContent="flex-end" mb={3}>
          <Fab
            color="secondary"
            aria-label="add"
            onClick={() => handleOpen()}
            sx={{
              boxShadow: 3,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'scale(1.05)', boxShadow: 6 },
            }}
          >
            <AddIcon />
          </Fab>
        </Box>

        {/* Tabla */}
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          }}
        >
          <Table size={isMobile ? 'small' : 'medium'}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#1976d2' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>CÉDULA</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Teléfono</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha Nac.</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} /> Cargando pacientes...
                  </TableCell>
                </TableRow>
              ) : pacientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No hay pacientes registrados
                  </TableCell>
                </TableRow>
              ) : (
                pacientes.map((paciente) => (
                  <TableRow
                    key={paciente.id}
                    hover
                    sx={{
                      '&:nth-of-type(odd)': { backgroundColor: '#f9f9ff' },
                      '&:hover': { backgroundColor: '#e3f2fd !important' },
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight={500} color="text.primary">
                        {paciente.nombre} {paciente.apellido}
                      </Typography>
                    </TableCell>
                    <TableCell>{paciente.dni}</TableCell>
                    <TableCell>{paciente.telefono || 'No registrado'}</TableCell>
                    <TableCell>
                      {new Date(paciente.fecha_nacimiento).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Editar paciente">
                        <IconButton
                          onClick={() => handleOpen(paciente)}
                          color="primary"
                          size="small"
                          sx={{ borderRadius: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography
            variant="h6"
            fontWeight="bold"
            color="primary.main"
            mb={2}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            {isEditing ? <EditIcon /> : <AddIcon />}
            {isEditing ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Nombre y Apellido  container*/}
              <Grid item size={12} xs={12} sm={6}>
                <TextField
                  name="nombre"
                  label="Nombre"
                  fullWidth
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  size="small"
                  placeholder="Ej: Juan"
                  sx={{ backgroundColor: 'white', borderRadius: 1 }}
                />
              </Grid>
              <Grid item size={12} xs={12} sm={6}>
                <TextField
                  name="apellido"
                  label="Apellido"
                  fullWidth
                  required
                  value={formData.apellido}
                  onChange={handleChange}
                  size="small"
                  placeholder="Ej: Pérez"
                  sx={{ backgroundColor: 'white', borderRadius: 1 }}
                />
              </Grid>

              {/* DNI y Fecha de nacimiento */}
              <Grid item size={12} xs={12} sm={6}>
                <TextField
                  name="dni"
                  label="DNI / Documento"
                  fullWidth
                  required
                  value={formData.dni}
                  onChange={handleChange}
                  size="small"
                  placeholder="Ej: 12345678"
                  sx={{ backgroundColor: 'white', borderRadius: 1 }}
                />
              </Grid>
              <Grid item size={12} xs={12} sm={6}>
                <TextField
                  name="fecha_nacimiento"
                  label="Fecha de nacimiento"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={formData.fecha_nacimiento}
                  onChange={handleChange}
                  size="small"
                  sx={{ backgroundColor: 'white', borderRadius: 1 }}
                />
              </Grid>

              {/* Teléfono */}
              <Grid item size={12} xs={12}>
                <TextField
                  name="telefono"
                  label="Teléfono"
                  fullWidth
                  value={formData.telefono}
                  onChange={handleChange}
                  size="small"
                  placeholder="Ej: 0412-1234567"
                  sx={{ backgroundColor: 'white', borderRadius: 1 }}
                />
              </Grid>

              {/* Dirección */}
              <Grid item size={12} xs={12}>
                <TextField
                  name="direccion"
                  label="Dirección"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.direccion}
                  onChange={handleChange}
                  size="small"
                  placeholder="Ej: Calle 123, Urbanización X, Caracas"
                  sx={{ backgroundColor: 'white', borderRadius: 1 }}
                />
              </Grid>

              <Divider sx={{ my: 2, width: '100%' }} />

              {/* Botones */}
              <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2} mt={2}>
                <Button
                  onClick={handleClose}
                  color="inherit"
                  variant="outlined"
                  disabled={loadingSubmit}
                  sx={{ borderRadius: 2, fontWeight: 500, px: 3 }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  disabled={loadingSubmit}
                  sx={{
                    backgroundColor: '#ef6c00',
                    '&:hover': { backgroundColor: '#e65100' },
                    borderRadius: 2,
                    fontWeight: 600,
                    px: 4,
                    boxShadow: 2,
                  }}
                >
                  {loadingSubmit
                    ? (isEditing ? 'Actualizando...' : 'Registrando...')
                    : (isEditing ? 'Actualizar Paciente' : 'Registrar Paciente')}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ fontWeight: 500 }}
          action={
            <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PacienteForm;