// components/DashboardStats.js
import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  People as PeopleIcon,
  MedicalServices as MedicalServicesIcon,
  Event as EventIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

const DashboardStats = ({ stats, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const statData = [
    { title: 'Pacientes', value: stats.pacientes, icon: <PeopleIcon />, color: 'primary.main' },
    { title: 'Médicos', value: stats.medicos, icon: <MedicalServicesIcon />, color: 'success.main' },
    { title: 'Citas', value: stats.citas, icon: <EventIcon />, color: 'warning.main' },
    { title: 'Consultas', value: stats.consultas, icon: <DescriptionIcon />, color: 'info.main' },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {statData.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: stat.color, width: 56, height: 56 }}>
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {loading ? '...' : stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardStats;