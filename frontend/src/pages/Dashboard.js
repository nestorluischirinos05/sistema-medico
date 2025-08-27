// pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';

import DashboardStats from '../components/DashboardStats';
import QuickActions from '../components/QuickActions';
import apiClient from '../services/apiClient.js';
import CONFIG from '../config.js';

export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [stats, setStats] = useState({
    pacientes: 0,
    medicos: 0,
    citas: 0,
    consultas: 0,
  });
  const [loading, setLoading] = useState(true);

  // Cargar estadísticas
   console.log("nada...")
  useEffect(() => {
    const cargarStats = async () => {
      try {
       
        const [pacientesRes, medicosRes, citasRes, consultasRes] = await Promise.all([
          apiClient.get(`${CONFIG.API_BASE_URL}/api/pacientes/`),
          apiClient.get(`${CONFIG.API_BASE_URL}/api/medicos/`),
          apiClient.get(`${CONFIG.API_BASE_URL}/api/citas/todas/`),
          apiClient.get(`${CONFIG.API_BASE_URL}/api/consultas/`),
        ]);
        
        console.log('Datos cargados:', {
          pacientes: pacientesRes.data.length,
          medicos: medicosRes.data.length,
          citas: citasRes.data.length,
          consultas: consultasRes.data.length,
        });
        setStats({
          pacientes: pacientesRes.data.length,
          medicos: medicosRes.data.length,
          citas: citasRes.data.length,
          consultas: consultasRes.data.length,
        });
      } catch (err) {
        console.error('Error al cargar estadísticas:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarStats();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Encabezado */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          gutterBottom
          fontWeight="bold"
          color="primary.main"
        >
          Panel de Administración
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona médicos, pacientes, citas y más
        </Typography>
      </Box>

      {/* Estadísticas */}
      <DashboardStats stats={stats} loading={loading} />

      {/* Acciones rápidas */}
      <QuickActions />
    </Container>
  );
}