// pages/HistoriaClinica.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Chip,
  Grid,
  IconButton,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PrintIcon from '@mui/icons-material/Print';
import CONFIG from '../config.js';

// Hook personalizado para detectar si es móvil
const useIsMobile = () => useMediaQuery((theme) => theme.breakpoints.down('sm'));

// Formatear fecha
const formatearFecha = (dateString) => {
  if (!dateString) return 'No disponible';
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

const HistoriaClinica = () => {
  const { pacienteId } = useParams();
  const theme = useTheme();
  const isMobile = useIsMobile();
  const [historia, setHistoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para diagnóstico
  const [openDiagnostico, setOpenDiagnostico] = useState(false);
  const [diagnosticoData, setDiagnosticoData] = useState({
    consulta: '',
    descripcion: '',
  });

  // Estados para tratamiento
  const [openTratamiento, setOpenTratamiento] = useState(false);
  const [tratamientoData, setTratamientoData] = useState({
    diagnostico: '',
    descripcion: '',
    indicaciones: '',
    duracion_dias: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
  });
  const [selectedDiagnostico, setSelectedDiagnostico] = useState(null);

  // Cargar historia clínica
  useEffect(() => {
    if (!pacienteId) {
      setError('No se especificó un paciente.');
      setLoading(false);
      return;
    }

    const obtenerHistoria = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${CONFIG.API_BASE_URL}/api/historia-clinica/paciente/${pacienteId}/`);
        setHistoria(res.data);
      } catch (err) {
        console.error('Error al cargar historia clínica:', err);
        setError(err.response?.data?.error || 'No se pudo cargar la historia clínica.');
      } finally {
        setLoading(false);
      }
    };

    obtenerHistoria();
  }, [pacienteId]);

  // Manejo de diagnósticos
  const handleOpenDiagnostico = (consultaId) => {
    setDiagnosticoData({ ...diagnosticoData, consulta: consultaId });
    setOpenDiagnostico(true);
  };

  const handleCloseDiagnostico = () => {
    setOpenDiagnostico(false);
    setDiagnosticoData({ consulta: '', descripcion: '' });
  };

  const handleDiagnosticoChange = (e) => {
    setDiagnosticoData({ ...diagnosticoData, [e.target.name]: e.target.value });
  };

  const handleSubmitDiagnostico = async () => {
    try {
      await axios.post(`${CONFIG.API_BASE_URL}/api/diagnosticos/`, diagnosticoData);
      alert('Diagnóstico registrado correctamente');
      handleCloseDiagnostico();
      // Recargar historia
      const res = await axios.get(`${CONFIG.API_BASE_URL}/api/historia-clinica/paciente/${pacienteId}/`);
      setHistoria(res.data);
    } catch (err) {
      console.error(err);
      alert('Error al registrar diagnóstico');
    }
  };

  // Manejo de tratamientos
  const handleOpenTratamiento = (diagnosticoId) => {
    setSelectedDiagnostico(diagnosticoId);
    setTratamientoData({ ...tratamientoData, diagnostico: diagnosticoId });
    setOpenTratamiento(true);
  };

  const handleCloseTratamiento = () => {
    setOpenTratamiento(false);
    setTratamientoData({
      diagnostico: '',
      descripcion: '',
      indicaciones: '',
      duracion_dias: '',
      fecha_inicio: new Date().toISOString().split('T')[0],
    });
  };

  const handleTratamientoChange = (e) => {
    setTratamientoData({ ...tratamientoData, [e.target.name]: e.target.value });
  };

  const handleSubmitTratamiento = async () => {
    try {
      await axios.post(`${CONFIG.API_BASE_URL}/api/tratamientos/`, tratamientoData);
      alert('Tratamiento registrado correctamente');
      handleCloseTratamiento();
      // Recargar historia
      const res = await axios.get(`${CONFIG.API_BASE_URL}/api/historia-clinica/paciente/${pacienteId}/`);
      setHistoria(res.data);
    } catch (err) {
      console.error('Error al registrar tratamiento:', err);
      alert('Error al registrar tratamiento');
    }
  };

  // Imprimir receta
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const consulta = historia.consultas[0]; // Ejemplo: primera consulta
    const diagnostico = consulta?.diagnosticos?.[0];
    const tratamiento = diagnostico?.tratamientos?.[0];

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receta Médica</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #1976d2; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin-bottom: 15px; }
          .footer { margin-top: 30px; text-align: center; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RECETA MÉDICA</h1>
          <p>Hospital Central | Tel: (0212) 555-1234</p>
        </div>
        <div class="section">
          <h3>Paciente: ${historia.paciente_detalle?.nombre} ${historia.paciente_detalle?.apellido}</h3>
          <p><strong>Fecha:</strong> ${formatearFecha(new Date())}</p>
        </div>
        ${diagnostico ? `
        <div class="section">
          <h3>Diagnóstico</h3>
          <p>${diagnostico.descripcion}</p>
        </div>` : ''}
        ${tratamiento ? `
        <div class="section">
          <h3>Tratamiento</h3>
          <p><strong>Descripción:</strong> ${tratamiento.descripcion}</p>
          <p><strong>Indicaciones:</strong> ${tratamiento.indicaciones}</p>
          <p><strong>Duración:</strong> ${tratamiento.duracion_dias} días</p>
          <p><strong>Inicio:</strong> ${formatearFecha(tratamiento.fecha_inicio)}</p>
        </div>` : ''}
        <div class="footer">
          <p>_________________________________</p>
          <p>Firma del Médico</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!historia) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert>No se encontró información.</Alert>
      </Container>
    );
  }

  const nombrePaciente = historia.paciente_detalle?.nombre || '';
  const apellidoPaciente = historia.paciente_detalle?.apellido || '';

  return (
    // ✅ Aquí se aplica el margin-left responsive
    <Box
      sx={{
        flexGrow: 1,
        p: isMobile ? 2 : 3,
        ml: { sm: '240px' }, // ← Este es el margen que evita el solapamiento con el Sidebar
        mt: 0,
        width: { sm: 'calc(100% - 240px)' },
        transition: 'margin 0.3s, width 0.3s',
      }}
    >
      <Container maxWidth="lg">
        <Paper sx={{ p: isMobile ? 2 : 3, borderRadius: 3, boxShadow: 3 }}>
          {/* Encabezado */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              fontWeight="bold"
              color="primary"
              gutterBottom
            >
              Historia Clínica
            </Typography>
            <Typography variant="h6" color="textSecondary">
              {nombrePaciente} {apellidoPaciente}
            </Typography>
            <Chip
              icon={<EventIcon />}
              label={`Inicio: ${formatearFecha(historia.fecha_inicio)}`}
              color="primary"
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </Box>

          {/* Observaciones */}
          {historia.observaciones && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <AssignmentIcon sx={{ mr: 1 }} /> Observaciones Generales
              </Typography>
              <Typography variant="body2">{historia.observaciones}</Typography>
            </Box>
          )}

          {/* Consultas */}
          <Box sx={{ mt: 2 }}>
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <MedicalServicesIcon sx={{ mr: 1 }} /> Consultas Médicas
            </Typography>

            {historia.consultas.length === 0 ? (
              <Alert severity="info">No hay consultas registradas.</Alert>
            ) : (
              historia.consultas.map((consulta) => (
                <Accordion
                  key={consulta.id}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    '&:before': { display: 'none' },
                    boxShadow: 2,
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <Typography variant="h6" fontWeight="500">
                        Dr. {consulta.medico_detalle?.nombre} {consulta.medico_detalle?.apellido}
                      </Typography>
                      <Chip
                        label={formatearFecha(consulta.fecha)}
                        size="small"
                        color="primary"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="subtitle1" fontWeight="500">
                      Motivo de consulta:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      "{consulta.motivo}"
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    {/* Diagnósticos */}
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      <DescriptionIcon sx={{ mr: 1 }} /> Diagnósticos
                    </Typography>
                    {consulta.diagnosticos && consulta.diagnosticos.length > 0 ? (
                      consulta.diagnosticos.map((diag) => (
                        <Box key={diag.id} sx={{ mb: 2 }}>
                          <Typography variant="body1">• {diag.descripcion}</Typography>
                          {diag.tratamientos && diag.tratamientos.length > 0 && (
                            <Box sx={{ mt: 1, pl: 2, borderLeft: '3px solid #1976d2' }}>
                              <Typography variant="subtitle2" color="primary" gutterBottom>
                                Tratamiento:
                              </Typography>
                              {diag.tratamientos.map((trat) => (
                                <Box key={trat.id} sx={{ mb: 1 }}>
                                  <Typography variant="body2">- {trat.descripcion}</Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Indicaciones:</strong> {trat.indicaciones}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    <strong>Inicio:</strong> {formatearFecha(trat.fecha_inicio)} |{' '}
                                    <strong>Duración:</strong> {trat.duracion_dias} días
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          )}
                          <Button
                            size="small"
                            startIcon={<DescriptionIcon />}
                            onClick={() => handleOpenTratamiento(diag.id)}
                            sx={{ mt: 1 }}
                          >
                            Agregar Tratamiento
                          </Button>
                        </Box>
                      ))
                    ) : (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        Sin diagnósticos registrados.
                      </Alert>
                    )}
                    <Button
                      variant="contained"
                      startIcon={<DescriptionIcon />}
                      onClick={() => handleOpenDiagnostico(consulta.id)}
                      size="small"
                    >
                      Agregar Diagnóstico
                    </Button>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Box>

          {/* Botón de impresión */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <IconButton onClick={handlePrint} color="primary" size="large">
              <PrintIcon fontSize="large" />
            </IconButton>
            <Typography variant="body2" color="textSecondary">
              Imprimir Receta
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Modal: Agregar Diagnóstico */}
      <Dialog open={openDiagnostico} onClose={handleCloseDiagnostico}>
        <DialogTitle>Agregar Diagnóstico</DialogTitle>
        <DialogContent>
          <TextField
            name="descripcion"
            label="Descripción"
            multiline
            rows={3}
            fullWidth
            value={diagnosticoData.descripcion}
            onChange={handleDiagnosticoChange}
            autoFocus
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDiagnostico} color="error">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitDiagnostico}
            variant="contained"
            color="primary"
            disabled={!diagnosticoData.descripcion.trim()}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Agregar Tratamiento */}
      <Dialog open={openTratamiento} onClose={handleCloseTratamiento}>
        <DialogTitle>Agregar Tratamiento</DialogTitle>
        <DialogContent>
          <TextField
            name="descripcion"
            label="Descripción"
            multiline
            rows={2}
            fullWidth
            value={tratamientoData.descripcion}
            onChange={handleTratamientoChange}
            sx={{ mt: 1 }}
          />
          <TextField
            name="indicaciones"
            label="Indicaciones"
            multiline
            rows={3}
            fullWidth
            value={tratamientoData.indicaciones}
            onChange={handleTratamientoChange}
            sx={{ mt: 2 }}
          />
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="duracion_dias"
                label="Duración (días)"
                type="number"
                fullWidth
                value={tratamientoData.duracion_dias}
                onChange={handleTratamientoChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="fecha_inicio"
                label="Fecha de inicio"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={tratamientoData.fecha_inicio}
                onChange={handleTratamientoChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTratamiento} color="error">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitTratamiento}
            variant="contained"
            color="primary"
            disabled={!tratamientoData.descripcion.trim()}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HistoriaClinica;