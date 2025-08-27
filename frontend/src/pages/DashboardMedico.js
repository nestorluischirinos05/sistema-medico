// pages/DashboardMedico.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  useMediaQuery,
  Button,
  Avatar,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CalendarToday,
  Event,
  MedicalServices,
  Person,
  Assignment,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient.js';
import CONFIG from '../config.js';

const DashboardMedico = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    citasHoy: 0,
    proximasCitas: 0,
    ultimasConsultas: [],
    totalPacientes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const medicoId = userData.medico_id;

  useEffect(() => {
    console.log('DashboardMedico - medicoId:', medicoId); // 👈 Depuración

    if (!medicoId) {
      setError('No tienes un perfil de médico asociado.');
      setLoading(false);
      return;
    }

    const cargarDatos = async () => {
      try {
        // ✅ 1. Obtener citas del médico
        const citasRes = await apiClient.get(`${CONFIG.API_BASE_URL}/api/citas/medico/`);
        const citas = Array.isArray(citasRes.data) ? citasRes.data : [];

        // ✅ 2. Obtener consultas del médico
        const consultasRes = await apiClient.get(`${CONFIG.API_BASE_URL}/api/consultas/`);
        const consultas = Array.isArray(consultasRes.data)
          ? consultasRes.data.filter(c => {
              // Maneja ambos casos: c.medico es un objeto o un ID
              const medicoValue = typeof c.medico === 'object' ? c.medico?.id : c.medico;
              return medicoValue === medicoId;
            })
          : [];

        // ✅ 3. Pacientes únicos
        const pacientesIds = new Set(consultas.map(c => c.paciente));
        const totalPacientes = pacientesIds.size;

        // ✅ 4. Filtrar citas por fecha
        const hoy = new Date().toISOString().split('T')[0];
        const citasHoy = citas.filter(c => c.fecha_hora_propuesta?.includes(hoy)).length;
        const proximasCitas = citas.filter(c => c.fecha_hora_propuesta > hoy).length;

        // ✅ 5. Últimas 3 consultas
        const ultimasConsultas = consultas
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
          .slice(0, 3);

        setStats({
          citasHoy,
          proximasCitas,
          ultimasConsultas,
          totalPacientes,
        });
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        console.error('Error response:', err.response?.data); // 👈 Clave para ver errores
        setError(
          err.response?.data?.error ||
          err.response?.data?.detail ||
          'No se pudieron cargar los datos. Intenta más tarde.'
        );
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [medicoId]);

  // Tarjeta de resumen
  const StatCard = ({ title, value, icon, color, onClick }) => (
    <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer' }} onClick={onClick}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: color, width: 50, height: 50 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {loading ? '...' : value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center', py: 4 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <CircularProgress size={24} />
          <Typography>Cargando dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Encabezado */}
      <Typography
        variant={isMobile ? 'h5' : 'h4'}
        gutterBottom
        fontWeight="bold"
        color="primary.main"
        sx={{ textAlign: isMobile ? 'center' : 'left', mb: 3 }}
      >
        Bienvenido, Dr. {userData.nombre} {userData.apellido}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Citas de Hoy"
            value={stats.citasHoy}
            icon={<Event fontSize="small" />}
            color="success.main"
            onClick={() => navigate('/calendario')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Próximas Citas"
            value={stats.proximasCitas}
            icon={<CalendarToday fontSize="small" />}
            color="warning.main"
            onClick={() => navigate('/calendario')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pacientes"
            value={stats.totalPacientes}
            icon={<Person fontSize="small" />}
            color="info.main"
            onClick={() => navigate('/historia/1')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Consultas"
            value={stats.ultimasConsultas.length}
            icon={<MedicalServices fontSize="small" />}
            color="primary.main"
            onClick={() => navigate('/consultas')}
          />
        </Grid>
      </Grid>

      {/* Actividad reciente */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary.main">
          Últimas Consultas
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {stats.ultimasConsultas.length > 0 ? (
          <List>
            {stats.ultimasConsultas.map((consulta) => (
              <React.Fragment key={consulta.id}>
                <ListItem
                  button
                  onClick={() => navigate(`/historia/${consulta.paciente_id}`)}
                  sx={{ borderRadius: 1, mb: 1, '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <ListItemIcon>
                    <Assignment />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Consulta del ${new Date(consulta.fecha).toLocaleDateString()}`}
                    secondary={`Paciente: ${typeof consulta.paciente === 'object' 
                      ? consulta.paciente.nombre 
                      : `ID ${consulta.paciente}`}`}
                  />
                  <ArrowForward color="action" />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No hay consultas registradas recientemente.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default DashboardMedico;