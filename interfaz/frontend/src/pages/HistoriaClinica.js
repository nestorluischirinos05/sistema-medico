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
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Button,  
  AccordionActions,
  Chip,
  Divider,
  styled,
  Card,
  CardContent,
  Grid,
  Paper as MuiPaper,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useParams } from 'react-router-dom';
import apiClient from '../services/apiClient.js'; // ✅ Cambiado de axios a apiClient
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ScienceIcon from '@mui/icons-material/Science';
import InfoIcon from '@mui/icons-material/Info';
import PrintIcon from '@mui/icons-material/Print';
import CheckIcon from '@mui/icons-material/Check';

import CONFIG from '../config.js';
import generarReceta from '../utils/generarReceta.js'
import AntecedentesModal from '../components/AntecedentesModal.js';
import DiagnosticoModal from '../components/DiagnosticoModal.js';
import TratamientoModal from '../components/TratamientoModal.js';

// Estilos personalizados para los acordeones
const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: theme.spacing(1, 0),
  },
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: '8px 8px 0 0',
  minHeight: 48,
  '&.Mui-expanded': {
    minHeight: 48,
  },
  '& .MuiAccordionSummary-content': {
    margin: '12px 0',
    '&.Mui-expanded': {
      margin: '12px 0',
    },
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  backgroundColor: theme.palette.grey[50],
}));

const TreatmentSection = styled(MuiPaper)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    boxShadow: theme.shadows[2],
  },
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  color: theme.palette.primary.main,
  fontWeight: 600,
}));

const IndicationBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.light,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  marginTop: theme.spacing(1),
  borderLeft: `3px solid ${theme.palette.secondary.main}`,
}));

const PrintButton = styled(IconButton)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  '@media print': {
    display: 'none',
  },
}));

const HistoriaClinica = () => {
  const hoy = new Date();
  const fecha = hoy.toISOString().split('T')[0]; // "YYYY-MM-DD"
  const { pacienteId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [historia, setHistoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDiagnostico, setOpenDiagnostico] = useState(false);
  const [openTratamiento, setOpenTratamiento] = useState(false);
  const [diagnosticoData, setDiagnosticoData] = useState({
    consulta: '',
    descripcion: '',
  });
  const [tratamientoData, setTratamientoData] = useState({
    diagnostico: '',
    descripcion: '',
    indicaciones: '',
    duracion_dias: '',
    fecha_inicio: fecha,
  });
  const [selectedDiagnostico, setSelectedDiagnostico] = useState(null);

  // ✅ Estado para antecedentes médicos
  const [antecedentes, setAntecedentes] = useState({
    enfermedades_cronicas: '',
    cirugias_previas: '',
    alergias: '',
    medicamentos_actuales: '',
    antecedentes_familiares: '',
    fuma: false,
    paquetes_por_dia: '',
    alcohol: 'nunca',
    ejercicio: '',
    dieta: '',
  });
  const [loadingAntecedentes, setLoadingAntecedentes] = useState(true);
  const [openAntecedentes, setOpenAntecedentes] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
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
        const res = await apiClient.get(`${CONFIG.API_BASE_URL}/api/historia-clinica/paciente/${pacienteId}/`);
        const data = {
          ...res.data,
          consultas: Array.isArray(res.data.consultas) ? res.data.consultas : [],
          paciente_detalle: res.data.paciente_detalle || {},
          fecha_inicio: res.data.fecha_inicio || 'No disponible',
          observaciones: res.data.observaciones || '',
        };
        setHistoria(data);
      } catch (err) {
        console.error('Error al cargar historia clínica:', err);
        setError(err.response?.data?.error || 'No se pudo cargar la historia clínica.');
      } finally {
        setLoading(false);
      }
    };

    const cargarAntecedentes = async () => {
      try {
        const res = await apiClient.get(`${CONFIG.API_BASE_URL}/api/antecedentes/${pacienteId}/`);
        setAntecedentes(res.data);
      } catch (err) {
        console.error('Error al cargar antecedentes:', err);
        // Puede que no existan aún
      } finally {
        setLoadingAntecedentes(false);
      }
    };

    obtenerHistoria();
    cargarAntecedentes();
  }, [pacienteId]);

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
      await apiClient.post(`${CONFIG.API_BASE_URL}/api/diagnosticos/`, diagnosticoData);
      setSuccessMessage('Diagnóstico registrado correctamente');
      setTimeout(() => setSuccessMessage(''), 5000);
      handleCloseDiagnostico();
      const res = await apiClient.get(`${CONFIG.API_BASE_URL}/api/historia-clinica/paciente/${pacienteId}/`);
      setHistoria({
        ...res.data,
        consultas: Array.isArray(res.data.consultas) ? res.data.consultas : []
      });
    } catch (err) {
      console.error(err);
      setErrorMessage('Error al registrar diagnóstico');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleOpenTratamiento = (diagnosticoId) => {
    setSelectedDiagnostico(diagnosticoId);
    setTratamientoData({
      diagnostico: diagnosticoId,
      descripcion: '',
      indicaciones: '',
      duracion_dias: '',
      fecha_inicio: fecha
    });
    setOpenTratamiento(true);
  };

  const handleCloseTratamiento = () => {
    setOpenTratamiento(false);
    setTratamientoData({
      diagnostico: '',
      descripcion: '',
      indicaciones: '',
      duracion_dias: '',
      fecha_inicio: ''
    });
    setSelectedDiagnostico(null);
  };

  const handleTratamientoChange = (e) => {
    setTratamientoData({ ...tratamientoData, [e.target.name]: e.target.value });
  };

  const handleSubmitTratamiento = async () => {
    try {
      if (!tratamientoData.descripcion.trim()) {
        setSuccessMessage('Por favor ingrese el tratamiento');
        setTimeout(() => setSuccessMessage(''), 5000);
        return;
      }
      const datosTratamiento = {
        ...tratamientoData,
        descripcion: tratamientoData.descripcion,
        indicaciones: tratamientoData.indicaciones || null
      };
      await apiClient.post(`${CONFIG.API_BASE_URL}/api/tratamientos/`, datosTratamiento);
      setSuccessMessage('Tratamiento registrado correctamente');
      setTimeout(() => setSuccessMessage(''), 5000);
      handleCloseTratamiento();
      const res = await apiClient.get(`${CONFIG.API_BASE_URL}/api/historia-clinica/paciente/${pacienteId}/`);
      setHistoria({
        ...res.data,
        consultas: Array.isArray(res.data.consultas) ? res.data.consultas : []
      });
    } catch (err) {
      console.error('Error al registrar tratamiento:', err);
      if (err.response?.data) {
        setErrorMessage(`Error al registrar tratamiento: ${JSON.stringify(err.response.data)}`);
        setTimeout(() => setErrorMessage(''), 5000);
      } else {
        setErrorMessage('Error al registrar tratamiento');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrintTratamiento = (tratamiento, diagnosticoDescripcion, medicoNombre, fechaConsulta) => {
    const nombrePaciente = `${historia?.paciente_detalle?.nombre || ''} ${historia?.paciente_detalle?.apellido || ''}`;
    generarReceta(tratamiento, diagnosticoDescripcion, medicoNombre, fechaConsulta, nombrePaciente);
  };

  const handleOpenAntecedentes = () => {
    setOpenAntecedentes(true);
  };

  const handleCloseAntecedentes = () => {
    setOpenAntecedentes(false);
  };

  const handleAntecedentesChange = (e) => {
    setAntecedentes({ ...antecedentes, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (field) => (e) => {
    setAntecedentes({ ...antecedentes, [field]: e.target.checked });
  };

  const handleSubmitAntecedentes = async () => {
    try {
      await apiClient.put(`${CONFIG.API_BASE_URL}/api/antecedentes/${pacienteId}/`, antecedentes);
      setSuccessMessage('Antecedentes médicos actualizados correctamente');
      setTimeout(() => setSuccessMessage(''), 5000);
      handleCloseAntecedentes();
    } catch (err) {
      console.error('Error al guardar antecedentes:', err);
      setErrorMessage('Error al guardar los antecedentes');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 4, display: 'block', mx: 'auto' }} />;
  if (error) return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
  if (!historia) return <Alert sx={{ m: 4 }}>No se encontró información.</Alert>;

  const nombrePaciente = historia.paciente_detalle?.nombre || '';
  const apellidoPaciente = historia.paciente_detalle?.apellido || '';

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: isMobile ? 2 : 4,
        mb: isMobile ? 2 : 4,
        px: isMobile ? 1 : 3
      }}
    >
      {successMessage && (
  <Alert 
    icon={<CheckIcon fontSize="inherit" />} 
    severity="success" 
    sx={{ mb: 2 }}
  >
    {successMessage}
  </Alert>
)}

{errorMessage && (
  <Alert 
      severity="error" 
    sx={{ mb: 2 }}
  >
    {errorMessage}
  </Alert>
)}
      <Paper sx={{
        padding: isMobile ? 2 : 3,
        boxShadow: 3,
        borderRadius: isMobile ? 2 : 4
      }}>
        <Box sx={{ textAlign: 'center', mb: isMobile ? 2 : 3 }}>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            gutterBottom
            sx={{ fontWeight: 'bold', color: 'primary.main' }}
          >
            Historia Clínica
          </Typography>
          <Typography
            variant={isMobile ? "body1" : "h6"}
            color="textSecondary"
          >
            {nombrePaciente} {apellidoPaciente}
          </Typography>
          <Chip
            icon={<EventIcon />}
            label={`Inicio: ${formatearFecha(historia.fecha_inicio)}`}
            color="primary"
            variant="outlined"
            sx={{
              mt: 1,
              fontSize: isMobile ? '0.7rem' : '0.8125rem'
            }}
            size={isMobile ? "small" : "medium"}
          />
        </Box>

        {historia.observaciones && (
          <Box sx={{
            mb: isMobile ? 2 : 3,
            p: isMobile ? 1.5 : 2,
            backgroundColor: 'grey.100',
            borderRadius: 2
          }}>
            <Typography
              variant={isMobile ? "body1" : "h6"}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1,
                fontSize: isMobile ? '1rem' : '1.25rem'
              }}
            >
              <AssignmentIcon sx={{ mr: 1, fontSize: isMobile ? 20 : 24 }} />
              Observaciones Generales
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
            >
              {historia.observaciones}
            </Typography>
          </Box>
        )}

        {/* Sección de Antecedentes Médicos */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'background.default' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Antecedentes Médicos
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {loadingAntecedentes ? (
              <CircularProgress size={24} />
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography><strong>Enfermedades crónicas:</strong> {antecedentes.enfermedades_cronicas || 'Ninguna'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography><strong>Cirugías previas:</strong> {antecedentes.cirugias_previas || 'Ninguna'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography><strong>Alergias:</strong> {antecedentes.alergias || 'Ninguna'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography><strong>Medicamentos actuales:</strong> {antecedentes.medicamentos_actuales || 'Ninguno'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography><strong>Antecedentes familiares:</strong> {antecedentes.antecedentes_familiares || 'Ninguno'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography><strong>Hábitos:</strong> Fuma: {antecedentes.fuma ? 'Sí' : 'No'}, Alcohol: {antecedentes.alcohol}, Ejercicio: {antecedentes.ejercicio || 'Ninguno'}</Typography>
                </Grid>
              </Grid>
            )}
          </AccordionDetails>
          <AccordionActions>
            <Button size="small" color="primary" onClick={handleOpenAntecedentes}>
              Editar
            </Button>
          </AccordionActions>
        </Accordion>

        <Box sx={{ mt: isMobile ? 2 : 3 }}>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{
              mb: isMobile ? 1 : 2,
              display: 'flex',
              alignItems: 'center',
              fontSize: isMobile ? '1.125rem' : '1.5rem'
            }}
          >
            <MedicalServicesIcon sx={{ mr: 1, fontSize: isMobile ? 20 : 24 }} />
            Consultas Médicas
          </Typography>

          {historia.consultas.length === 0 ? (
            <Alert severity="info" sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
              No hay consultas registradas.
            </Alert>
          ) : (
            historia.consultas.map((consulta) => {
              const diagnosticos = Array.isArray(consulta.diagnosticos) ? consulta.diagnosticos : [];

              return (
                <StyledAccordion
                  key={consulta.id}
                  elevation={3}
                  sx={{
                    borderRadius: isMobile ? 1 : 2
                  }}
                >
                  <StyledAccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                    sx={{
                      minHeight: isMobile ? 40 : 48,
                      '& .MuiAccordionSummary-content': {
                        margin: isMobile ? '8px 0' : '12px 0',
                        '&.Mui-expanded': {
                          margin: isMobile ? '8px 0' : '12px 0',
                        },
                      },
                    }}
                  >
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                      alignItems: 'center',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? 0.5 : 0
                    }}>
                      <Typography
                        variant={isMobile ? "body2" : "h6"}
                        sx={{
                          textAlign: isMobile ? 'center' : 'left',
                          fontSize: isMobile ? '0.875rem' : '1.25rem'
                        }}
                      >
                        Dr. {consulta.medico_detalle?.nombre} {consulta.medico_detalle?.apellido}
                      </Typography>
                      <Chip
                        label={formatearFecha(consulta.fecha)}
                        size={isMobile ? "small" : "medium"}
                        sx={{
                          backgroundColor: 'white',
                          color: 'primary.main',
                          fontSize: isMobile ? '0.65rem' : '0.75rem'
                        }}
                      />
                    </Box>
                  </StyledAccordionSummary>

                  <AccordionDetails sx={{ p: isMobile ? 1 : 2 }}>
                    <Box sx={{ p: isMobile ? 0.5 : 1 }}>
                      <Typography
                        variant={isMobile ? "body2" : "subtitle1"}
                        sx={{
                          fontWeight: 'bold',
                          mb: 1,
                          color: 'primary.main',
                          fontSize: isMobile ? '0.875rem' : '1rem'
                        }}
                      >
                        Motivo de consulta:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 2,
                          fontStyle: 'italic',
                          fontSize: isMobile ? '0.8125rem' : '1rem'
                        }}
                      >
                        "{consulta.motivo}"
                      </Typography>

                      <Divider sx={{ my: isMobile ? 1 : 2 }} />

                      <Typography
                        variant={isMobile ? "body1" : "h6"}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: isMobile ? 1 : 2,
                          fontSize: isMobile ? '1rem' : '1.25rem'
                        }}
                      >
                        <DescriptionIcon sx={{ mr: 1, fontSize: isMobile ? 20 : 24 }} />
                        Diagnósticos
                      </Typography>

                      {diagnosticos.length > 0 ? (
                        diagnosticos.map((diag) => {
                          const tratamientos = Array.isArray(diag.tratamientos) ? diag.tratamientos : [];

                          return (
                            <Box key={diag.id} sx={{ mb: isMobile ? 1.5 : 3 }}>
                              <StyledCard sx={{
                                borderRadius: isMobile ? 1 : 2,
                                mb: isMobile ? 1 : 2
                              }}>
                                <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                                  <Box sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    gap: isMobile ? 1 : 0
                                  }}>
                                    <ListItemIcon sx={{
                                      minWidth: isMobile ? 30 : 40,
                                      mt: isMobile ? 0 : 0.5
                                    }}>
                                      <DescriptionIcon
                                        color="primary"
                                        sx={{ fontSize: isMobile ? 20 : 24 }}
                                      />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={diag.descripcion || 'Sin descripción'}
                                      secondary={`Fecha: ${formatearFecha(diag.fecha)}`}
                                      primaryTypographyProps={{
                                        fontSize: isMobile ? '0.875rem' : '1rem',
                                        fontWeight: 500
                                      }}
                                      secondaryTypographyProps={{
                                        fontSize: isMobile ? '0.75rem' : '0.875rem'
                                      }}
                                    />
                                  </Box>

                                  <Box sx={{
                                    mt: isMobile ? 1 : 2,
                                    pl: isMobile ? 0 : 5,
                                    width: '100%'
                                  }}>
                                    <Button
                                      variant="outlined"
                                      size={isMobile ? "small" : "medium"}
                                      onClick={() => handleOpenTratamiento(diag.id)}
                                      sx={{
                                        mb: isMobile ? 1 : 2,
                                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                                        py: isMobile ? 0.5 : 1
                                      }}
                                      startIcon={<ScienceIcon sx={{ fontSize: isMobile ? 16 : 20 }} />}
                                    >
                                      {isMobile ? "Tratamiento" : "Agregar Tratamiento"}
                                    </Button>

                                    {tratamientos.length > 0 && (
                                      <Box sx={{ mt: isMobile ? 1 : 2 }}>
                                        <Typography
                                          variant={isMobile ? "body2" : "subtitle1"}
                                          sx={{
                                            fontWeight: 'bold',
                                            mb: 1,
                                            color: 'secondary.main',
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: isMobile ? '0.875rem' : '1rem'
                                          }}
                                        >
                                          <ScienceIcon sx={{ mr: 1, fontSize: isMobile ? 16 : 20 }} />
                                          Tratamientos Prescritos
                                        </Typography>

                                        <Grid container spacing={isMobile ? 1 : 2}>
                                          {tratamientos.map((tratamiento, index) => (
                                            <Grid item xs={12}  key={`${diag.id}_trat_${index}`} sx={{px:0}}>
                                              <TreatmentSection
                                                elevation={0}
                                                sx={{
                                                  p: isMobile ? 1.5 : 2,
                                                  borderRadius: isMobile ? 1 : 2
                                                }}
                                              >
                                                <Box sx={{
                                                  display: 'flex',
                                                  justifyContent: 'space-between',
                                                  alignItems: 'center',
                                                  mb: 1,
                                                  flexDirection: isMobile ? 'column' : 'row',
                                                  gap: isMobile ? 1 : 0
                                                }}>
                                                  <SectionHeader
                                                    variant={isMobile ? "body1" : "h6"}
                                                    sx={{
                                                      mb: 0,
                                                      fontSize: isMobile ? '0.875rem' : '1.25rem'
                                                    }}
                                                  >
                                                    <ScienceIcon sx={{ mr: 1, fontSize: isMobile ? 16 : 24 }} />
                                                    Medicamento
                                                  </SectionHeader>
                                                  <PrintButton
                                                    size={isMobile ? "small" : "medium"}
                                                    onClick={() => handlePrintTratamiento(
                                                      tratamiento,
                                                      diag.descripcion,
                                                      `${consulta.medico_detalle?.nombre} ${consulta.medico_detalle?.apellido}`,
                                                      consulta.fecha
                                                    )}
                                                    sx={{ alignSelf: isMobile ? 'flex-end' : 'auto' }}
                                                  >
                                                    <PrintIcon sx={{ fontSize: isMobile ? 18 : 24 }} />
                                                  </PrintButton>
                                                </Box>

                                                <Typography
                                                  component="div"
                                                  variant="body2"
                                                  sx={{
                                                    whiteSpace: 'pre-line',
                                                    mb: isMobile ? 1 : 2,
                                                    fontSize: isMobile ? '0.875rem' : '1.1rem',
                                                    fontWeight: 500,
                                                    color: 'text.primary'
                                                  }}
                                                >
                                                  {tratamiento.descripcion || 'Sin medicamento especificado'}
                                                </Typography>

                                                {tratamiento.indicaciones && (
                                                  <Box sx={{ mt: isMobile ? 1 : 2 }}>
                                                    <SectionHeader
                                                      variant={isMobile ? "body2" : "subtitle1"}
                                                      sx={{ fontSize: isMobile ? '0.8125rem' : '1rem' }}
                                                    >
                                                      <InfoIcon sx={{ mr: 1, fontSize: isMobile ? 16 : 20 }} />
                                                      Indicaciones
                                                    </SectionHeader>
                                                    <IndicationBox sx={{
                                                      p: isMobile ? 1.5 : 2,
                                                      borderRadius: isMobile ? 1 : 2,
                                                      mt: isMobile ? 0.5 : 1
                                                    }}>
                                                      <Typography
                                                        component="div"
                                                        variant="body2"
                                                        sx={{
                                                          whiteSpace: 'pre-line',
                                                          color: 'secondary.dark',
                                                          fontSize: isMobile ? '0.8125rem' : '0.875rem'
                                                        }}
                                                      >
                                                        {tratamiento.indicaciones}
                                                      </Typography>
                                                    </IndicationBox>
                                                  </Box>
                                                )}

                                                <Box sx={{
                                                  display: 'flex',
                                                  flexWrap: 'wrap',
                                                  gap: isMobile ? 0.5 : 1,
                                                  mt: isMobile ? 1 : 2,
                                                  justifyContent: 'center'
                                                }}>
                                                  {tratamiento.fecha_inicio && (
                                                    <Chip
                                                      icon={<EventIcon sx={{ fontSize: isMobile ? 14 : 16 }} />}
                                                      label={`Inicio: ${formatearFecha(tratamiento.fecha_inicio)}`}
                                                      size={isMobile ? "small" : "medium"}
                                                      variant="outlined"
                                                      color="primary"
                                                      sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}
                                                    />
                                                  )}
                                                  {tratamiento.duracion_dias && (
                                                    <Chip
                                                      icon={<AccessTimeIcon sx={{ fontSize: isMobile ? 14 : 16 }} />}
                                                      label={`Duración: ${tratamiento.duracion_dias} días`}
                                                      size={isMobile ? "small" : "medium"}
                                                      variant="outlined"
                                                      color="secondary"
                                                      sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}
                                                    />
                                                  )}
                                                </Box>
                                              </TreatmentSection>
                                            </Grid>
                                          ))}
                                        </Grid>
                                      </Box>
                                    )}
                                  </Box>
                                </CardContent>
                              </StyledCard>
                            </Box>
                          );
                        })
                      ) : (
                        <Box sx={{
                          textAlign: 'center',
                          p: isMobile ? 1.5 : 2,
                          borderRadius: isMobile ? 1 : 2,
                          backgroundColor: 'grey.50'
                        }}>
                          <Typography
                            color="textSecondary"
                            sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
                          >
                            Sin diagnósticos registrados.
                          </Typography>
                          <Button
                            variant="contained"
                            onClick={() => handleOpenDiagnostico(consulta.id)}
                            sx={{
                              mt: 1,
                              fontSize: isMobile ? '0.75rem' : '0.875rem',
                              py: isMobile ? 0.5 : 1
                            }}
                            size={isMobile ? "small" : "medium"}
                            startIcon={<DescriptionIcon sx={{ fontSize: isMobile ? 16 : 20 }} />}
                          >
                            {isMobile ? "Diagnóstico" : "Agregar Diagnóstico"}
                          </Button>
                        </Box>
                      )}
                    </Box>

                    <AccordionActions sx={{ p: 0, justifyContent: 'center' }}>
                      <Button
                        size={isMobile ? "small" : "medium"}
                        variant="contained"
                        onClick={() => handleOpenDiagnostico(consulta.id)}
                        startIcon={<DescriptionIcon sx={{ fontSize: isMobile ? 16 : 20 }} />}
                        sx={{
                          fontSize: isMobile ? '0.75rem' : '0.875rem',
                          py: isMobile ? 0.5 : 1
                        }}
                      >
                        {isMobile ? "Diagnóstico" : "Agregar Diagnóstico"}
                      </Button>
                    </AccordionActions>
                  </AccordionDetails>
                </StyledAccordion>
              );
            })
          )}
        </Box>

        {/* Modal para diagnóstico */}
        <DiagnosticoModal
          open={openDiagnostico}
          onClose={handleCloseDiagnostico}
          data={diagnosticoData}
          handleChange={handleDiagnosticoChange}
          handleSubmit={handleSubmitDiagnostico}
          isMobile={isMobile}
        />

        <TratamientoModal
          open={openTratamiento}
          onClose={handleCloseTratamiento}
          data={tratamientoData}
          handleChange={handleTratamientoChange}
          handleSubmit={handleSubmitTratamiento}
          isMobile={isMobile}
        />

        {/* Modal para editar antecedentes */}
        <AntecedentesModal
          open={openAntecedentes}
          onClose={handleCloseAntecedentes}
          antecedentes={antecedentes}
          setAntecedentes={setAntecedentes}
          handleSubmit={handleSubmitAntecedentes}
          isMobile={isMobile}
        />
      </Paper>
    </Container>
  );
};

export default HistoriaClinica;