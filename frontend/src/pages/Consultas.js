// pages/Consultas.js
import React, { useEffect, useState } from 'react';
import {
  Container,
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
  useMediaQuery,
  useTheme,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient'; // ✅ Usamos apiClient
import CONFIG from '../config';

const Consultas = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const [consultas, setConsultas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    paciente: '',
    medico: '',
    fecha: '',
    motivo: '',
  });

  const [errors, setErrors] = useState({});

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [consultasRes, pacientesRes, medicosRes] = await Promise.all([
          apiClient.get(`${CONFIG.API_BASE_URL}/api/consultas/`),
          apiClient.get(`${CONFIG.API_BASE_URL}/api/pacientes/`),
          apiClient.get(`${CONFIG.API_BASE_URL}/api/medicos/`),
        ]);
        setConsultas(consultasRes.data);
        setPacientes(pacientesRes.data);
        setMedicos(medicosRes.data);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setAlert({
          open: true,
          message: 'No se pudieron cargar los datos.',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setFormData({ paciente: '', medico: '', fecha: '', motivo: '' });
    setErrors({});
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ paciente: '', medico: '', fecha: '', motivo: '' });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error al editar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validación del formulario
  const validate = () => {
    const newErrors = {};

    if (!formData.paciente) newErrors.paciente = 'Debe seleccionar un paciente';
    if (!formData.medico) newErrors.medico = 'Debe seleccionar un médico';
    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es obligatoria';
    } else {
      const selectedDate = new Date(formData.fecha);
      if (isNaN(selectedDate.getTime())) {
        newErrors.fecha = 'Fecha inválida';
      } else if (selectedDate < new Date()) {
        newErrors.fecha = 'No puede ser una fecha pasada';
      }
    }

    if (formData.motivo && formData.motivo.length < 5) {
      newErrors.motivo = 'El motivo debe tener al menos 5 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setFormLoading(true);
    try {
      await apiClient.post(`${CONFIG.API_BASE_URL}/api/consultas/`, formData);
      const res = await apiClient.get(`${CONFIG.API_BASE_URL}/api/consultas/`);
      setConsultas(res.data);
      handleClose();
      setAlert({
        open: true,
        message: 'Consulta registrada correctamente.',
        severity: 'success',
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al registrar la consulta';
      setAlert({
        open: true,
        message: `Error: ${JSON.stringify(errorMsg)}`,
        severity: 'error',
      });
      if (err.response?.data) {
        setErrors(err.response.data);
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Filas para DataGrid
  const rows = consultas.map((c) => ({
    id: c.id,
    paciente: `${c.paciente_detalle?.nombre || ''} ${c.paciente_detalle?.apellido || ''}`,
    medico: `${c.medico_detalle?.nombre || ''} ${c.medico_detalle?.apellido || ''}`,
    fecha: c.fecha,
    motivo: c.motivo,
    paciente_id: c.paciente_detalle?.id,
  }));

  const columns = [
    {
      field: 'paciente',
      headerName: 'Paciente',
      flex: isMobile ? 2 : 1,
      minWidth: 150,
    },
    {
      field: 'medico',
      headerName: 'Médico',
      flex: isMobile ? 2 : 1,
      minWidth: 150,
    },
    {
      field: 'fecha',
      headerName: 'Fecha',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'motivo',
      headerName: 'Motivo',
      flex: isMobile ? 2 : 1.5,
      minWidth: 180,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <span>{params.value?.length > 40 ? `${params.value.substring(0, 40)}...` : params.value}</span>
        </Tooltip>
      ),
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      flex: isMobile ? 1 : 0.8,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => {
        const pacienteId = params.row.paciente_id;
        if (!pacienteId) {
          return (
            <Typography variant="body2" color="error" sx={{ fontSize: '0.75rem' }}>
              Sin paciente
            </Typography>
          );
        }
        return (
          <Tooltip title="Ver Historia Clínica">
            <IconButton
              size={isMobile ? 'small' : 'medium'}
              color="primary"
              onClick={() => navigate(`/historia/${pacienteId}`)}
              sx={{ p: isMobile ? 0.5 : 1 }}
            >
              <VisibilityIcon fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 6 }}>
      {/* Alerta de éxito/error */}
      {alert.open && (
        <Alert
          severity={alert.severity}
          onClose={() => setAlert({ ...alert, open: false })}
          sx={{ mb: 3 }}
        >
          {alert.message}
        </Alert>
      )}

      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          backgroundColor: '#f8f9ff',
          border: '1px solid #e0e0e0',
        }}
      >
        {/* Encabezado */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 2 : 0,
            mb: 3,
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            color="primary"
            sx={{ textAlign: isMobile ? 'center' : 'left' }}
          >
            Historial de Consultas
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            fullWidth={isMobile}
            sx={{
              fontSize: isMobile ? '0.875rem' : '1rem',
              py: isMobile ? 1 : 1.5,
              px: isMobile ? 2 : 4,
              fontWeight: 600,
            }}
          >
            {isMobile ? 'Nueva' : 'Nueva Consulta'}
          </Button>
        </Box>

        {/* Tabla */}
        <Box sx={{ height: isMobile ? 300 : 400, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            pageSize={isMobile ? 5 : 10}
            rowsPerPageOptions={isMobile ? [5, 10] : [10, 20, 50]}
            pagination
            autoHeight={isMobile}
            getRowId={(row) => row.id}
            components={{
              Toolbar: GridToolbar,
            }}
            componentsProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            sx={{
              '& .MuiDataGrid-cell': { fontSize: isMobile ? '0.8125rem' : '0.875rem' },
              '& .MuiDataGrid-columnHeaders': { fontSize: isMobile ? '0.8125rem' : '0.875rem' },
              '& .MuiDataGrid-toolbarContainer': {
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? 1 : 0,
                p: 1,
              },
            }}
          />
        </Box>
      </Paper>

      {/* Modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: '#1976d2',
            color: 'white',
            fontSize: isMobile ? '1.25rem' : '1.5rem',
          }}
        >
          Registrar Nueva Consulta
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
          <FormControl fullWidth margin="normal" error={!!errors.paciente}>
            <InputLabel sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>Paciente</InputLabel>
            <Select
              name="paciente"
              value={formData.paciente}
              onChange={handleChange}
              label="Paciente"
              sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
            >
              {pacientes.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.nombre} {p.apellido}
                </MenuItem>
              ))}
            </Select>
            {errors.paciente && (
              <Typography color="error" variant="caption">{errors.paciente}</Typography>
            )}
          </FormControl>

          <FormControl fullWidth margin="normal" error={!!errors.medico}>
            <InputLabel sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>Médico</InputLabel>
            <Select
              name="medico"
              value={formData.medico}
              onChange={handleChange}
              label="Médico"
              sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
            >
              {medicos.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  Dr. {m.nombre} {m.apellido}
                </MenuItem>
              ))}
            </Select>
            {errors.medico && (
              <Typography color="error" variant="caption">{errors.medico}</Typography>
            )}
          </FormControl>

          <TextField
            margin="normal"
            name="fecha"
            label="Fecha"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.fecha}
            onChange={handleChange}
            error={!!errors.fecha}
            helperText={errors.fecha}
            InputProps={{ style: { fontSize: isMobile ? '0.875rem' : '1rem' } }}
            InputLabelProps={{ style: { fontSize: isMobile ? '0.875rem' : '1rem' } }}
          />

          <TextField
            margin="normal"
            name="motivo"
            label="Motivo"
            multiline
            rows={isMobile ? 3 : 4}
            fullWidth
            value={formData.motivo}
            onChange={handleChange}
            error={!!errors.motivo}
            helperText={errors.motivo}
            InputProps={{ style: { fontSize: isMobile ? '0.875rem' : '1rem' } }}
            InputLabelProps={{ style: { fontSize: isMobile ? '0.875rem' : '1rem' } }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            p: isMobile ? 2 : 3,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 1 : 0,
          }}
        >
          <Button
            onClick={handleClose}
            color="error"
            fullWidth={isMobile}
            size={isMobile ? 'small' : 'medium'}
            sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={formLoading}
            fullWidth={isMobile}
            sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
            size={isMobile ? 'small' : 'medium'}
          >
            {formLoading ? <CircularProgress size={20} color="inherit" /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Consultas;