// pages/Consultas.js (versión mejorada y responsive)
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
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CONFIG from '../config.js'

const Consultas = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  const [consultas, setConsultas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    paciente: '',
    medico: '',
    fecha: '',
    motivo: '',
  });
  const [loading, setLoading] = useState(true);

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [consultasRes, pacientesRes, medicosRes] = await Promise.all([
          axios.get(`${CONFIG.API_BASE_URL}/api/consultas/`),
          axios.get(`${CONFIG.API_BASE_URL}/api/pacientes/`),
          axios.get(`${CONFIG.API_BASE_URL}/api/medicos/`)
        ]);
        
        setConsultas(consultasRes.data);
        setPacientes(pacientesRes.data);
        setMedicos(medicosRes.data);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        alert('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({ paciente: '', medico: '', fecha: '', motivo: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${CONFIG.API_BASE_URL}/api/consultas/`, formData);
      const res = await axios.get(`${CONFIG.API_BASE_URL}/api/consultas/`);
      setConsultas(res.data);
      handleClose();
      alert('Consulta registrada correctamente');
    } catch (err) {
      console.error('Error al registrar consulta:', err.response?.data || err.message);
      alert('Error al registrar consulta');
    }
  };

  // Construir filas para el DataGrid
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
      minWidth: 120
    },
    { 
      field: 'medico', 
      headerName: 'Médico', 
      flex: isMobile ? 2 : 1,
      minWidth: 120
    },
    { 
      field: 'fecha', 
      headerName: 'Fecha', 
      flex: 1,
      minWidth: 100
    },
    { 
      field: 'motivo', 
      headerName: 'Motivo', 
      flex: isMobile ? 2 : 1.5,
      minWidth: 150,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <span>{params.value?.length > 30 ? `${params.value.substring(0, 30)}...` : params.value}</span>
        </Tooltip>
      )
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
              size={isMobile ? "small" : "medium"}
              color="primary"
              onClick={() => navigate(`/historia/${pacienteId}`)}
              sx={{ 
                minWidth: 'auto',
                padding: isMobile ? 0.5 : 1
              }}
            >
              <VisibilityIcon fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
          </Tooltip>
        );
      }
    }
  ];

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: isMobile ? 2 : 4, 
        mb: isMobile ? 2 : 4,
        px: isMobile ? 1 : 3
      }}
    >
      <Paper 
        sx={{ 
          padding: isMobile ? 2 : 3,
          borderRadius: isMobile ? 2 : 4
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 2 : 0,
          mb: isMobile ? 2 : 3
        }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            gutterBottom
            sx={{ 
              fontWeight: 'bold', 
              color: 'primary.main',
              textAlign: isMobile ? 'center' : 'left'
            }}
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
              px: isMobile ? 2 : 4
            }}
          >
            {isMobile ? "Nueva" : "Nueva Consulta"}
          </Button>
        </Box>

        <div style={{ 
          height: isMobile ? 300 : 400, 
          width: '100%',
          fontSize: isMobile ? '0.75rem' : '1rem'
        }}>
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
              '& .MuiDataGrid-cell': {
                fontSize: isMobile ? '0.75rem' : '0.875rem',
              },
              '& .MuiDataGrid-columnHeaders': {
                fontSize: isMobile ? '0.75rem' : '0.875rem',
              },
              '& .MuiDataGrid-toolbarContainer': {
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? 1 : 0,
                padding: isMobile ? 1 : 2,
              },
            }}
          />
        </div>

        {/* Modal para nueva consulta */}
        <Dialog 
          open={open} 
          onClose={handleClose}
          fullScreen={isMobile}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle 
            sx={{ 
              backgroundColor: 'primary.main', 
              color: 'white',
              fontSize: isMobile ? '1.25rem' : '1.5rem'
            }}
          >
            Registrar Nueva Consulta
          </DialogTitle>
          <DialogContent 
            sx={{ 
              pt: 2,
              px: isMobile ? 1.5 : 3
            }}
          >
            <FormControl 
              fullWidth 
              margin="normal"
              size={isMobile ? "small" : "medium"}
            >
              <InputLabel 
                sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
              >
                Paciente
              </InputLabel>
              <Select 
                name="paciente" 
                value={formData.paciente} 
                onChange={handleChange}
                label="Paciente"
                sx={{ 
                  fontSize: isMobile ? '0.875rem' : '1rem'
                }}
              >
                {pacientes.map(p => (
                  <MenuItem 
                    key={p.id} 
                    value={p.id}
                    sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
                  >
                    {p.nombre} {p.apellido}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl 
              fullWidth 
              margin="normal"
              size={isMobile ? "small" : "medium"}
            >
              <InputLabel 
                sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
              >
                Médico
              </InputLabel>
              <Select 
                name="medico" 
                value={formData.medico} 
                onChange={handleChange}
                label="Médico"
                sx={{ 
                  fontSize: isMobile ? '0.875rem' : '1rem'
                }}
              >
                {medicos.map(m => (
                  <MenuItem 
                    key={m.id} 
                    value={m.id}
                    sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
                  >
                    {m.nombre} {m.apellido}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              name="fecha"
              label="Fecha"
              type="date"
              fullWidth
              InputLabelProps={{ 
                shrink: true,
                style: { fontSize: isMobile ? '0.875rem' : '1rem' }
              }}
              inputProps={{ 
                style: { fontSize: isMobile ? '0.875rem' : '1rem' }
              }}
              value={formData.fecha}
              onChange={handleChange}
              size={isMobile ? "small" : "medium"}
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
              inputProps={{ 
                style: { fontSize: isMobile ? '0.875rem' : '1rem' }
              }}
              InputLabelProps={{ 
                style: { fontSize: isMobile ? '0.875rem' : '1rem' }
              }}
              size={isMobile ? "small" : "medium"}
            />
          </DialogContent>
          <DialogActions 
            sx={{ 
              p: isMobile ? 1.5 : 2,
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 1 : 0
            }}
          >
            <Button 
              onClick={handleClose}
              color="error"
              fullWidth={isMobile}
              sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
              size={isMobile ? "small" : "medium"}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary"
              fullWidth={isMobile}
              sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
              size={isMobile ? "small" : "medium"}
            >
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default Consultas;