// pages/DashboardPaciente.js
import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Event, MedicalServices, Description, CalendarToday } from '@mui/icons-material';

const DashboardPaciente = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const userData = JSON.parse(localStorage.getItem('user_data'));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Bienvenido, {userData.nombre} {userData.apellido}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Mis citas */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Event color="primary" fontSize="large" />
            <Box>
              <Typography variant="h6">Mis Citas</Typography>
              <Typography variant="body2" color="textSecondary">
                Revisa tus citas programadas
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Próxima cita */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <CalendarToday color="success" fontSize="large" />
            <Box>
              <Typography variant="h6">Próxima Cita</Typography>
              <Typography variant="body2" color="textSecondary">
                Prepárate para tu próxima consulta
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Historia clínica */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Description color="warning" fontSize="large" />
            <Box>
              <Typography variant="h6">Historia Clínica</Typography>
              <Typography variant="body2" color="textSecondary">
                Consulta tu historial médico
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Resultados de exámenes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <MedicalServices color="info" fontSize="large" />
            <Box>
              <Typography variant="h6">Exámenes</Typography>
              <Typography variant="body2" color="textSecondary">
                Revisa tus resultados médicos
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPaciente;