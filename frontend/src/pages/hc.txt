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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
import ScienceIcon from '@mui/icons-material/Science';
import InfoIcon from '@mui/icons-material/Info';
import PrintIcon from '@mui/icons-material/Print';
import CONFIG from '../config.js'

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
    fecha_inicio: ''
  });
  const [selectedDiagnostico, setSelectedDiagnostico] = useState(null);

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
        const data = {
          ...res.data,
          consultas: Array.isArray(res.data.consultas) ? res.data.consultas : [],
          paciente_detalle: res.data.paciente_detalle || {},
          fecha_inicio: res.data.fecha_inicio || 'No disponible',
          observaciones: res.data.observaciones || '',
        };
        setHistoria(data);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar historia clínica:', err);
        setError(err.response?.data?.error || 'No se pudo cargar la historia clínica.');
        setLoading(false);
      }
    };

    obtenerHistoria();
  }, [pacienteId]);

  if (loading) return <CircularProgress sx={{ mt: 4, display: 'block', mx: 'auto' }} />;
  if (error) return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
  if (!historia) return <Alert sx={{ m: 4 }}>No se encontró información.</Alert>;

  const nombrePaciente = historia.paciente_detalle?.nombre || '';
  const apellidoPaciente = historia.paciente_detalle?.apellido || '';

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
      const res = await axios.get(`${CONFIG.API_BASE_URL}/api/historia-clinica/paciente/${pacienteId}/`);
      setHistoria({
        ...res.data,
        consultas: Array.isArray(res.data.consultas) ? res.data.consultas : []
      });
    } catch (err) {
      console.error(err);
      alert('Error al registrar diagnóstico');
    }
  };

  const handleOpenTratamiento = (diagnosticoId) => {
    setSelectedDiagnostico(diagnosticoId);
    setTratamientoData({ 
      diagnostico: diagnosticoId,
      descripcion: '',
      indicaciones: '',
      duracion_dias: '',
      fecha_inicio: new Date().toISOString().split('T')[0]
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
        alert('Por favor ingrese el tratamiento');
        return;
      }
      const datosTratamiento = {
        ...tratamientoData,
        descripcion: tratamientoData.descripcion,
        indicaciones: tratamientoData.indicaciones || null
      };
      await axios.post(`${CONFIG.API_BASE_URL}/api/tratamientos/`, datosTratamiento);
      alert('Tratamiento registrado correctamente');
      handleCloseTratamiento();
      const res = await axios.get(`${CONFIG.API_BASE_URL}/api/historia-clinica/paciente/${pacienteId}/`);
      setHistoria({
        ...res.data,
        consultas: Array.isArray(res.data.consultas) ? res.data.consultas : []
      });
    } catch (err) {
      console.error('Error al registrar tratamiento:', err);
      if (err.response?.data) {
        alert(`Error al registrar tratamiento: ${JSON.stringify(err.response.data)}`);
      } else {
        alert('Error al registrar tratamiento');
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
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receta Médica</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @media print {
              @page {
                margin: 0.5in;
              }
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
              line-height: 1.4;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #1976d2;
              padding-bottom: 15px;
              margin-bottom: 25px;
            }
            .header h1 {
              color: #1976d2;
              margin: 0 0 5px 0;
              font-size: 24px;
            }
            .header h2 {
              color: #2e7d32;
              margin: 0 0 10px 0;
              font-size: 20px;
            }
            .header p {
              margin: 3px 0;
              font-size: 14px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-weight: bold;
              color: #1976d2;
              font-size: 18px;
              margin-bottom: 10px;
              padding-bottom: 5px;
              border-bottom: 1px solid #ddd;
            }
            .content {
              background-color: #f9f9f9;
              border-left: 4px solid #1976d2;
              padding: 15px;
              margin: 10px 0;
              border-radius: 0 4px 4px 0;
            }
            .content.indicaciones {
              border-left-color: #2e7d32;
              background-color: #f0f7ff;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 10px;
              margin: 15px 0;
            }
            .info-item {
              background-color: #e3f2fd;
              padding: 10px;
              border-radius: 4px;
              font-size: 14px;
            }
            .info-item strong {
              color: #1976d2;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-style: italic;
              color: #666;
            }
            pre {
              white-space: pre-wrap;
              font-family: inherit;
              margin: 0;
            }
            @media screen {
              body {
                max-width: none;
              }
            }
            @media print {
              body {
                margin: 0;
                padding: 15px;
              }
            }
            @media (max-width: 600px) {
              body {
                padding: 10px;
              }
              .header h1 {
                font-size: 20px;
              }
              .header h2 {
                font-size: 18px;
              }
              .info-grid {
                grid-template-columns: 1fr;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RECETA MÉDICA</h1>
            <h2>HOSPITAL CENTRAL</h2>
            <p>Av. Principal 123, Ciudad Salud</p>
            <p>Tel: (0212) 555-1234 | Email: info@hospitalcentral.com</p>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <strong>Paciente:</strong> ${nombrePaciente} ${apellidoPaciente}
            </div>
            <div class="info-item">
              <strong>Fecha Emisión:</strong> ${formatearFecha(new Date().toISOString())}
            </div>
            <div class="info-item">
              <strong>Médico:</strong> Dr. ${medicoNombre}
            </div>
            <div class="info-item">
              <strong>Fecha Consulta:</strong> ${formatearFecha(fechaConsulta)}
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">DIAGNÓSTICO</div>
            <div class="content">
              <pre>${diagnosticoDescripcion}</pre>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">TRATAMIENTO</div>
            <div class="content">
              <pre>${tratamiento.descripcion || 'No especificado'}</pre>
            </div>
          </div>
          
          ${tratamiento.indicaciones ? `
          <div class="section">
            <div class="section-title">INDICACIONES</div>
            <div class="content indicaciones">
              <pre>${tratamiento.indicaciones}</pre>
            </div>
          </div>
          ` : ''}
          
          ${(tratamiento.duracion_dias || tratamiento.fecha_inicio) ? `
          <div class="section">
            <div class="section-title">DETALLES DEL TRATAMIENTO</div>
            <div class="info-grid">
              ${tratamiento.fecha_inicio ? `
              <div class="info-item">
                <strong>Inicio del tratamiento:</strong> ${formatearFecha(tratamiento.fecha_inicio)}
              </div>
              ` : ''}
              ${tratamiento.duracion_dias ? `
              <div class="info-item">
                <strong>Duración:</strong> ${tratamiento.duracion_dias} días
              </div>
              ` : ''}
            </div>
          </div>
          ` : ''}
          
          <div class="footer">
            <p>______________________________________________________</p>
            <p>Firma y Sello del Médico</p>
            <div class="important-note">
              <p>Esta receta es válida por 10 días a partir de la fecha de emisión.</p>
              <p>Presente esta receta en cualquier farmacia autorizada.</p>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: isMobile ? 2 : 4, 
        mb: isMobile ? 2 : 4,
        px: isMobile ? 1 : 3
      }}
    >
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
                                            <Grid item xs={12} key={`${diag.id}_trat_${index}`}>
                                              <TreatmentSection 
                                                elevation={0}
                                                sx={{
                                                  p: isMobile ? 1.5 : 2,
                                                  borderRadius: isMobile ? 1 : 2
                                                }}
                                              >
                                                {/* Encabezado con botón de impresión */}
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
                                                    sx={{ 
                                                      alignSelf: isMobile ? 'flex-end' : 'auto'
                                                    }}
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
                                                
                                                {/* Indicaciones - con mejor separación visual */}
                                                {tratamiento.indicaciones && (
                                                  <Box sx={{ mt: isMobile ? 1 : 2 }}>
                                                    <SectionHeader 
                                                      variant={isMobile ? "body2" : "subtitle1"}
                                                      sx={{
                                                        fontSize: isMobile ? '0.8125rem' : '1rem'
                                                      }}
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
                                                
                                                {/* Información adicional en chips */}
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
                                                      sx={{ 
                                                        fontSize: isMobile ? '0.65rem' : '0.75rem'
                                                      }}
                                                    />
                                                  )}
                                                  {tratamiento.duracion_dias && (
                                                    <Chip 
                                                      icon={<AccessTimeIcon sx={{ fontSize: isMobile ? 14 : 16 }} />} 
                                                      label={`Duración: ${tratamiento.duracion_dias} días`} 
                                                      size={isMobile ? "small" : "medium"}
                                                      variant="outlined" 
                                                      color="secondary"
                                                      sx={{ 
                                                        fontSize: isMobile ? '0.65rem' : '0.75rem'
                                                      }}
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
                    
                    <AccordionActions sx={{ 
                      p: 0,
                      justifyContent: 'center'
                    }}>
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
        <Dialog 
          open={openDiagnostico} 
          onClose={handleCloseDiagnostico} 
          maxWidth="sm" 
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle 
            sx={{ 
              backgroundColor: 'primary.main', 
              color: 'white',
              fontSize: isMobile ? '1.25rem' : '1.5rem'
            }}
          >
            Registrar Diagnóstico
          </DialogTitle>
          <DialogContent 
            sx={{ 
              pt: 2,
              px: isMobile ? 1.5 : 3
            }}
          >
            <TextField
              margin="normal"
              name="descripcion"
              label="Descripción del diagnóstico"
              multiline
              rows={isMobile ? 3 : 4}
              fullWidth
              value={diagnosticoData.descripcion}
              onChange={handleDiagnosticoChange}
              autoFocus
              variant="outlined"
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: isMobile ? '0.875rem' : '1rem'
                },
                '& .MuiInputLabel-root': {
                  fontSize: isMobile ? '0.875rem' : '1rem'
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: isMobile ? 1.5 : 2 }}>
            <Button 
              onClick={handleCloseDiagnostico} 
              color="error"
              size={isMobile ? "small" : "medium"}
              sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitDiagnostico} 
              variant="contained" 
              color="primary"
              disabled={!diagnosticoData.descripcion.trim()}
              size={isMobile ? "small" : "medium"}
              sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
            >
              Guardar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal para tratamiento */}
        <Dialog 
          open={openTratamiento} 
          onClose={handleCloseTratamiento} 
          maxWidth="sm" 
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle 
            sx={{ 
              backgroundColor: 'secondary.main', 
              color: 'white',
              fontSize: isMobile ? '1.25rem' : '1.5rem'
            }}
          >
            Agregar Tratamiento e Indicaciones
          </DialogTitle>
          <DialogContent sx={{ px: isMobile ? 1.5 : 3 }}>
            <TextField
              margin="normal"
              name="descripcion"
              label="Tratamiento / Medicamento"
              multiline
              rows={isMobile ? 3 : 4}
              fullWidth
              value={tratamientoData.descripcion}
              onChange={handleTratamientoChange}
              autoFocus
              variant="outlined"
              helperText="Ej: Omeprazol 500 mg, Acetaminofén 500 mg, etc. (Usa Enter para saltos de línea)"
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: isMobile ? '0.875rem' : '1rem'
                },
                '& .MuiInputLabel-root': {
                  fontSize: isMobile ? '0.875rem' : '1rem'
                },
                '& .MuiFormHelperText-root': {
                  fontSize: isMobile ? '0.7rem' : '0.75rem'
                }
              }}
            />
            <TextField
              margin="normal"
              name="indicaciones"
              label="Indicaciones"
              multiline
              rows={isMobile ? 3 : 4}
              fullWidth
              value={tratamientoData.indicaciones || ''}
              onChange={handleTratamientoChange}
              variant="outlined"
              helperText="Ej: Tomar 1 tableta cada 8 horas, En ayunas, etc. (Usa Enter para saltos de línea)"
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: isMobile ? '0.875rem' : '1rem'
                },
                '& .MuiInputLabel-root': {
                  fontSize: isMobile ? '0.875rem' : '1rem'
                },
                '& .MuiFormHelperText-root': {
                  fontSize: isMobile ? '0.7rem' : '0.75rem'
                }
              }}
            />
            <TextField
              margin="normal"
              name="duracion_dias"
              label="Duración (días)"
              type="number"
              fullWidth
              value={tratamientoData.duracion_dias || ''}
              onChange={handleTratamientoChange}
              variant="outlined"
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: isMobile ? '0.875rem' : '1rem'
                },
                '& .MuiInputLabel-root': {
                  fontSize: isMobile ? '0.875rem' : '1rem'
                }
              }}
            />
            <TextField
              margin="normal"
              name="fecha_inicio"
              label="Fecha de inicio"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={tratamientoData.fecha_inicio}
              onChange={handleTratamientoChange}
              variant="outlined"
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: isMobile ? '0.875rem' : '1rem'
                },
                '& .MuiInputLabel-root': {
                  fontSize: isMobile ? '0.875rem' : '1rem'
                }
              }}
            />
            <input
              type="hidden"
              name="diagnostico"
              value={tratamientoData.diagnostico}
            />
          </DialogContent>
          <DialogActions sx={{ p: isMobile ? 1.5 : 2 }}>
            <Button 
              onClick={handleCloseTratamiento} 
              color="error"
              size={isMobile ? "small" : "medium"}
              sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitTratamiento} 
              variant="contained" 
              color="secondary"
              disabled={!tratamientoData.descripcion.trim()}
              size={isMobile ? "small" : "medium"}
              sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
            >
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default HistoriaClinica;