// pages/GestionarAntecedentes.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  CircularProgress,
  Box,
  TextField,
  InputAdornment,
  Alert,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import apiClient from '../services/apiClient.js';

const GestionarAntecedentes = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cargarPacientes = async () => {
      try {
        const res = await apiClient.get('/api/pacientes/');
        setPacientes(res.data);
      } catch (err) {
        console.error('Error al cargar pacientes:', err);
        setError('No se pudieron cargar los pacientes. Verifica tu conexión.');
      } finally {
        setLoading(false);
      }
    };
    cargarPacientes();
  }, []);

  // Filtrar pacientes por búsqueda
  const filteredPacientes = pacientes.filter((p) =>
    `${p.nombre} ${p.apellido} ${p.dni}`.toLowerCase().includes(searchText.toLowerCase())
  );

  // Columnas de la tabla
  const columns = [
    {
      field: 'nombre',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 500, color: 'text.primary' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'apellido',
      headerName: 'Apellido',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography color="text.primary">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'dni',
      headerName: 'DNI',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Typography sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'telefono',
      headerName: 'Teléfono',
      flex: 1,
      minWidth: 130,
      valueGetter: (params) => params.value || 'No registrado',
    },
    {
      field: 'fecha_nacimiento',
      headerName: 'Fecha de Nacimiento',
      flex: 1,
      minWidth: 140,
      valueGetter: (params) => {
        const date = new Date(params.value);
        return isNaN(date.getTime()) ? '' : date.toLocaleDateString('es-ES');
      },
    },
    {
      field: 'actions',
      headerName: 'Acción',
      sortable: false,
      flex: 1,
      minWidth: 160,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => navigate(`/historia/${params.row.id}`)}
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': { backgroundColor: '#1565c0' },
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'none',
            px: 2,
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          📄 Ver Antecedentes
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center', py: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={24} />
          <Typography>Cargando pacientes...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ fontSize: '0.9rem' }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Encabezado */}
      <Typography
        variant="h5"
        gutterBottom
        fontWeight="bold"
        color="primary.main"
        sx={{
          textAlign: isMobile ? 'center' : 'left',
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        📋 Gestionar Antecedentes Médicos
      </Typography>

      {/* Buscador */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          backgroundColor: '#f8f9ff',
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="🔍 Buscar paciente por nombre, apellido o DNI..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            sx: {
              backgroundColor: 'white',
              borderRadius: 1,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#b3d4fc' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' },
            },
          }}
        />
      </Paper>

      {/* Tabla */}
      <Paper
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          height: isMobile ? 600 : 650,
        }}
      >
        <DataGrid
          rows={filteredPacientes}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          disableRowSelectionOnClick
          localeText={esES.components.MuiDataGrid.defaultProps.localeText}
          slots={{
            toolbar: GridToolbar,
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          sx={{
            '& .MuiDataGrid-root': {
              border: 'none',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#1976d2',
              color: 'white',
              fontWeight: '600',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            },
            '& .MuiDataGrid-cell': {
              fontSize: '0.875rem',
              borderBottom: '1px solid #e0e0e0',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#e3f2fd !important',
              cursor: 'pointer',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid #e0e0e0',
              backgroundColor: '#f5f5f5',
            },
            '& .MuiTablePagination-root': {
              fontSize: '0.875rem',
            },
          }}
        />
      </Paper>

      {/* Mensaje si no hay resultados */}
      {filteredPacientes.length === 0 && searchText && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, textAlign: 'center', fontStyle: 'italic' }}
        >
          No se encontraron pacientes con "{searchText}"
        </Typography>
      )}
    </Container>
  );
};

export default GestionarAntecedentes;