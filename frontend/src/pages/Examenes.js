// pages/Examenes.js
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, CloudUpload as CloudUploadIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import apiClient from '../services/apiClient.js';
import SubirArchivo from '../components/SubirArchivo.js';

const Examenes = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [examenes, setExamenes] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [tiposExamen, setTiposExamen] = useState([]);
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    paciente_id: '',
    tipo_examen_id: '',
    diagnostico_relacionado_id: '',
    fecha_realizacion: '',
    observaciones: '',
    archivo_resultado: null,
    medico_id: '', // Campo opcional, se usará solo si es admin
  });

  // Datos del usuario autenticado
  const [userRole, setUserRole] = useState('');
  const [userData, setUserData] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const token = localStorage.getItem('access_token');
      const userStr = localStorage.getItem('user_data');

      if (!token || !userStr) {
        alert('No estás autenticado. Redirigiendo al login...');
        window.location.href = '/login';
        return;
      }

      const user = JSON.parse(userStr);
      setUserData(user);
      setUserRole(user.rol_codigo); // 'admin' o 'medico'

      try {
        const [examenesRes, pacientesRes, medicosRes, tiposRes, diagnosticosRes] = await Promise.all([
          apiClient.get('/api/examenes/'),
          apiClient.get('/api/pacientes/'),
          apiClient.get('/api/medicos/'),
          apiClient.get('/api/tipo-examenes/'),
          apiClient.get('/api/diagnosticos/'),
        ]);

        setExamenes(examenesRes.data);
        setPacientes(pacientesRes.data);
        setMedicos(medicosRes.data);
        setTiposExamen(tiposRes.data);
        setDiagnosticos(diagnosticosRes.data);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        if (err.response?.status === 401) {
          alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
          window.location.href = '/login';
        } else {
          alert('Error al cargar los datos: ' + (err.response?.data?.detail || err.message));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpen = () => {
    // Si el usuario es médico, asigna su ID automáticamente
    if (userRole === 'medico') {
      const medico = medicos.find(m => m.usuario?.correo === userData.correo);
      if (medico) {
        setFormData(prev => ({ ...prev, medico_id: medico.id }));
      }
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      paciente_id: '',
      tipo_examen_id: '',
      diagnostico_relacionado_id: '',
      fecha_realizacion: '',
      observaciones: '',
      archivo_resultado: null,
      medico_id: '',
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (file) => {
    setFormData({ ...formData, archivo_resultado: file });
  };

  const handleSubmit = async () => {
    const formDataToSend = new FormData();

    // Agregar todos los campos
    Object.keys(formData).forEach(key => {
      if (key !== 'medico_id' && formData[key]) {
        formDataToSend.append(key, formData[key]);
      }
    });

    // Agregar medico_id solo si está presente (para admin)
    if (formData.medico_id) {
      formDataToSend.append('medico_id', formData.medico_id);
    }

    try {
      await apiClient.post('/api/examenes/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const res = await apiClient.get('/api/examenes/');
      setExamenes(res.data);
      handleClose();
      alert('Examen registrado correctamente');
    } catch (err) {
      console.error('Error al registrar examen:', err.response?.data || err.message);
      alert('Error al registrar el examen');
    }
  };

  const handleDownload = (examen) => {
    if (!examen.archivo_resultado_url) {
      alert('No hay archivo para descargar');
      return;
    }
    window.open(examen.archivo_resultado_url, '_blank');
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="primary">
          Registro de Exámenes Médicos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          fullWidth={isMobile}
        >
          {isMobile ? 'Nuevo' : 'Nuevo Examen'}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : examenes.length === 0 ? (
        <Alert severity="info">No hay exámenes registrados.</Alert>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Paciente</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {examenes.map((ex) => (
              <TableRow key={ex.id}>
                <TableCell>
                  {ex.paciente?.nombre} {ex.paciente?.apellido}
                </TableCell>
                <TableCell>{ex.tipo_examen?.nombre}</TableCell>
                <TableCell>{ex.fecha_realizacion || 'No definida'}</TableCell>
                <TableCell>
                  <Chip
                    label={ex.estado}
                    color={
                      ex.estado === 'completado'
                        ? 'success'
                        : ex.estado === 'solicitado'
                        ? 'info'
                        : 'warning'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Ver/Descargar archivo">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleDownload(ex)}
                      disabled={!ex.archivo_resultado_url}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modal para nuevo examen */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>Registrar Examen Médico</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Paciente</InputLabel>
            <Select
              name="paciente_id"
              value={formData.paciente_id}
              onChange={handleChange}
              label="Paciente"
            >
              {pacientes.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.nombre} {p.apellido}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de Examen</InputLabel>
            <Select
              name="tipo_examen_id"
              value={formData.tipo_examen_id}
              onChange={handleChange}
              label="Tipo de Examen"
            >
              {tiposExamen.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Diagnóstico Relacionado</InputLabel>
            <Select
              name="diagnostico_relacionado_id"
              value={formData.diagnostico_relacionado_id}
              onChange={handleChange}
              label="Diagnóstico Relacionado"
            >
              <MenuItem value="">Ninguno</MenuItem>
              {diagnosticos.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.descripcion}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Mostrar select de médico solo si es admin */}
          {userRole === 'admin' && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Médico</InputLabel>
              <Select
                name="medico_id"
                value={formData.medico_id}
                onChange={handleChange}
                label="Médico"
              >
                {medicos.map((med) => (
                  <MenuItem key={med.id} value={med.id}>
                    {med.nombre} {med.apellido}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Si es médico, mostrar solo lectura */}
          {userRole === 'medico' && (
            <TextField
              margin="normal"
              label="Médico"
              value={`${userData.nombre} ${userData.apellido}`}
              fullWidth
              InputProps={{ readOnly: true }}
              helperText="Tu perfil será asignado automáticamente"
            />
          )}

          <TextField
            margin="normal"
            name="fecha_realizacion"
            label="Fecha de Realización"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.fecha_realizacion}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            name="observaciones"
            label="Observaciones"
            multiline
            rows={3}
            fullWidth
            value={formData.observaciones}
            onChange={handleChange}
          />

          <SubirArchivo onFileSelect={handleFileChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="error">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Examenes;
// pages/Examenes.js