// components/QuickActions.js
import React from 'react';
import {
  Grid,
  Button,
  Paper,
  Typography,
  Divider,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  People as PeopleIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Acciones Rápidas
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate('/usuarios')}
            sx={{ py: 1.5 }}
          >
            Registrar Usuario
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GroupIcon />}
            onClick={() => navigate('/registrar-medico')}
            sx={{ py: 1.5 }}
          >
            Registrar Médico
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<PeopleIcon />}
            onClick={() => navigate('/registrar-paciente')}
            sx={{ py: 1.5 }}
          >
            Registrar Paciente
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<CalendarTodayIcon />}
            onClick={() => navigate('/calendario')}
            sx={{ py: 1.5 }}
          >
            Ver Agenda
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default QuickActions;