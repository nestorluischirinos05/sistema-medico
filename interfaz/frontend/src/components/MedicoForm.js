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
  Divider,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';
import CONFIG from '../config.js';

const MedicoForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Estado del formulario
  const [formData, setFormData] = useState({
    correo: '',
    password: '',
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    especialidad_id: '',
  });

  // Estado del modal y mensajes
  const [open, setOpen] = useState(false);
  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingDni, setLoadingDni] = useState(false);
  const [dniError, setDniError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Cargar datos iniciales
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
        showSnackbar('Error al cargar datos. Verifica la conexión.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Buscar DNI
  useEffect(() => {
    if (formData.dni.length === 0) {
      setDniError('');
      return;
    }

    const timer = setTimeout(async () => {
      if (formData.dni.length < 6) return;

      setLoadingDni(true);
      try {
        const res = await axios.get(`${CONFIG.API_BASE_URL}/api/buscar-medico/`, {
          params: { dni: formData.dni }
        });

        if (res.data.existe) {
          setDniError(`DNI ya registrado: ${res.data.nombre_completo}`);
        } else {
          setDniError('');
        }
      } catch (err) {
        setDniError('Error al verificar el DNI');
      } finally {
        setLoadingDni(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [formData.dni]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (dniError && !loadingDni) {
      showSnackbar(dniError, 'error');
      return;
    }

    if (!formData.correo || !formData.password || !formData.nombre || !formData.apellido || !formData.dni || !formData.especialidad_id) {
      showSnackbar('Completa todos los campos obligatorios.', 'warning');
      return;
    }

    setLoadingSubmit(true);
    try {
      // Registrar usuario
      const userRes = await axios.post(`${CONFIG.API_BASE_URL}/api/registro/`, {
        correo: formData.correo,
        nombre: formData.nombre,
        apellido: formData.apellido,
        password: formData.password,
        rol_codigo: 'medico',
      });

      // Registrar médico
      const medicoRes = await axios.post(`${CONFIG.API_BASE_URL}/api/medicos/`, {
        usuario: userRes.data.user.id,
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        telefono: formData.telefono,
        especialidad_id: formData.especialidad_id,
      });

      setMedicos([medicoRes.data, ...medicos]);
      showSnackbar('✅ Médico registrado exitosamente', 'success');
      setFormData({
        correo: '',
        password: '',
        nombre: '',
        apellido: '',
        dni: '',
        telefono: '',
        especialidad_id: '',
      });
      setOpen(false);
    } catch (err) {
      console.error('Error:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || 'Error al registrar el médico.';
      showSnackbar(`❌ ${errorMsg}`, 'error');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    if (!loadingSubmit) setOpen(false);
  };

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
          Gestión de Médicos
        </Typography>

        {/* Botón flotante */}
        <Box display="flex" justifyContent="flex-end" mb={3}>
          <Fab
            color="primary"
            aria-label="add"
            onClick={handleOpen}
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>DNI</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Especialidad</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Teléfono</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} /> Cargando médicos...
                  </TableCell>
                </TableRow>
              ) : medicos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No hay médicos registrados
                  </TableCell>
                </TableRow>
              ) : (
                medicos.map((medico) => (
                  <TableRow
                    key={medico.id}
                    hover
                    sx={{
                      '&:nth-of-type(odd)': { backgroundColor: '#f9f9ff' },
                      '&:hover': { backgroundColor: '#e3f2fd !important' },
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight={500} color="text.primary">
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
            <AddIcon />
            Registrar Nuevo Médico
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Datos del Médico */}
              <Grid item xs={12}>
                <TextField
                  name="dni"
                  label="DNI del Médico"
                  fullWidth
                  required
                  value={formData.dni}
                  onChange={handleChange}
                  disabled={loadingSubmit}
                  size="small"
                  error={!!dniError}
                  helperText={loadingDni ? 'Verificando...' : dniError || 'Número de identificación'}
                  InputProps={{
                    endAdornment: loadingDni && (
                      <InputAdornment position="end">
                        <CircularProgress size={20} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#b3d4fc' },
                      '&:hover fieldset': { borderColor: '#1976d2' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="nombre"
                  label="Nombre"
                  fullWidth
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  size="small"
                  sx={{ backgroundColor: 'white', borderRadius: 1 }}
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
                  size="small"
                  sx={{ backgroundColor: 'white', borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="telefono"
                  label="Teléfono"
                  fullWidth
                  value={formData.telefono}
                  onChange={handleChange}
                  size="small"
                  sx={{ backgroundColor: 'white', borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required size="small">
                  <InputLabel>Especialidad</InputLabel>
                  <Select
                    name="especialidad_id"
                    value={formData.especialidad_id}
                    onChange={handleChange}
                    label="Especialidad"
                    sx={{ backgroundColor: 'white', borderRadius: 1 }}
                  >
                    {especialidades.map((esp) => (
                      <MenuItem key={esp.id} value={esp.id}>
                        {esp.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Divider sx={{ my: 2, width: '100%' }} />

              {/* Datos de Usuario */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary.main" gutterBottom>
                  🔐 Credenciales de Acceso
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="correo"
                  label="Correo Electrónico"
                  type="email"
                  fullWidth
                  required
                  value={formData.correo}
                  onChange={handleChange}
                  size="small"
                  sx={{ backgroundColor: 'white', borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="password"
                  label="Contraseña"
                  type="password"
                  fullWidth
                  required
                  value={formData.password}
                  onChange={handleChange}
                  size="small"
                  sx={{ backgroundColor: 'white', borderRadius: 1 }}
                />
              </Grid>

              {/* Botones */}
              <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2} mt={2}>
                <Button
                  onClick={handleClose}
                  color="inherit"
                  variant="outlined"
                  disabled={loadingSubmit}
                  sx={{ borderRadius: 2, fontWeight: 500 }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loadingSubmit}
                  sx={{
                    backgroundColor: '#1976d2',
                    '&:hover': { backgroundColor: '#1565c0' },
                    borderRadius: 2,
                    fontWeight: 600,
                    px: 3,
                    boxShadow: 2,
                  }}
                >
                  {loadingSubmit ? 'Registrando...' : 'Registrar Médico'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Modal>

      {/* Snackbar para mensajes */}
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

export default MedicoForm;