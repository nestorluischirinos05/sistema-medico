// pages/TipoExamenes.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import apiClient from '../services/apiClient.js';

const TipoExamenes = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
  const [editingId, setEditingId] = useState(null);

  // Cargar tipos de exámenes
  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const res = await apiClient.get('/api/tipo-examenes/');
        setTipos(res.data);
      } catch (err) {
        console.error('Error al cargar tipos de exámenes:', err);
        alert('Error al cargar los datos. Verifica tu conexión o permisos.');
      } finally {
        setLoading(false);
      }
    };

    fetchTipos();
  }, []);

  const handleOpen = (tipo = null) => {
    if (tipo) {
      setEditingId(tipo.id);
      setFormData({ nombre: tipo.nombre, descripcion: tipo.descripcion });
    } else {
      setEditingId(null);
      setFormData({ nombre: '', descripcion: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ nombre: '', descripcion: '' });
    setEditingId(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await apiClient.put(`/api/tipo-examenes/${editingId}/`, formData);
      } else {
        await apiClient.post(`/api/tipo-examenes/`, formData);
      }
      const res = await apiClient.get('/api/tipo-examenes/');
      setTipos(res.data);
      handleClose();
      alert(`Tipo de examen ${editingId ? 'actualizado' : 'registrado'} correctamente`);
    } catch (err) {
      console.error('Error al guardar tipo de examen:', err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        alert('No tienes permiso para realizar esta acción.');
      } else if (err.response?.data?.error) {
        alert(`Error: ${err.response.data.error}`);
      } else {
        alert('Error al guardar el tipo de examen');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este tipo de examen?')) return;

    try {
      await apiClient.delete(`/api/tipo-examenes/${id}/`);
      setTipos(tipos.filter(t => t.id !== id));
      alert('Tipo de examen eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar:', err);
      if (err.response?.status === 403) {
        alert('No tienes permiso para eliminar este tipo.');
      } else {
        alert('Error al eliminar el tipo de examen');
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
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
            Tipos de Exámenes
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            fullWidth={isMobile}
          >
            {isMobile ? 'Nuevo' : 'Nuevo Tipo'}
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : tipos.length === 0 ? (
          <Alert severity="info">No hay tipos de exámenes registrados.</Alert>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tipos.map((tipo) => (
                <TableRow key={tipo.id}>
                  <TableCell>{tipo.nombre}</TableCell>
                  <TableCell>{tipo.descripcion || '-'}</TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary" onClick={() => handleOpen(tipo)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(tipo.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Modal para crear/editar */}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
            {editingId ? 'Editar Tipo de Examen' : 'Nuevo Tipo de Examen'}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              margin="normal"
              name="nombre"
              label="Nombre"
              fullWidth
              required
              value={formData.nombre}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              name="descripcion"
              label="Descripción"
              multiline
              rows={3}
              fullWidth
              value={formData.descripcion}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="error">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editingId ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default TipoExamenes;