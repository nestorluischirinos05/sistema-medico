// components/Sidebar.js
import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  EventNote as EventNoteIcon,
  PersonAdd as PersonAddIcon,
  MedicalInformation as MedicalIcon,
  Logout as LogoutIcon,
  Group as GroupIcon,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  const drawerContent = (
    <>
      <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Sistema Médico</Typography>
          {isMobile && (
            <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </Box>
      
      <List>
        <ListItemButton component={Link} to="/dashboard">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        
        <ListItemButton component={Link} to="/usuarios">
          <ListItemIcon>
            <GroupIcon />
          </ListItemIcon>
          <ListItemText primary="Gestión de Usuarios" />
        </ListItemButton>
        
        <ListItemButton component={Link} to="/configuracion">
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Configuración" />
        </ListItemButton>
        
        <ListItemButton component={Link} to="/consultas">
          <ListItemIcon>
            <EventNoteIcon />
          </ListItemIcon>
          <ListItemText primary="Consultas" />
        </ListItemButton>
        
        {userRole === 'paciente' && (
          <ListItemButton button component={Link} to="/paciente/agendar-consulta">
            <ListItemText primary="Agendar Consulta" />
          </ListItemButton>
        )}

        <Divider />
        
        <ListItemButton component={Link} to="/registrar-medico">
          <ListItemIcon>
            <PersonAddIcon />
          </ListItemIcon>
          <ListItemText primary="Registrar Médico" />
        </ListItemButton>
        
        <ListItemButton component={Link} to="/registrar-paciente">
          <ListItemIcon>
            <PersonAddIcon />
          </ListItemIcon>
          <ListItemText primary="Registrar Paciente" />
        </ListItemButton>
        
        <ListItemButton component={Link} to="/registrar-especialidad">
          <ListItemIcon>
            <MedicalIcon />
          </ListItemIcon>
          <ListItemText primary="Registrar Especialidad" />
        </ListItemButton>
        
        <ListItemButton component={Link} to="/historia/1">
          <ListItemIcon>
            <MedicalIcon />
          </ListItemIcon>
          <ListItemText primary="Ver historia clínica" />
        </ListItemButton>
        
        <Divider />
        
        <ListItemButton component={Link} to="/cambiar-contrasena">
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Cambiar Contraseña" />
        </ListItemButton>
        
        <ListItemButton component={Link} to="/resetear-contrasena">
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Resetear Contraseña (Admin)" />
        </ListItemButton>
        
        <Divider />
        
        <ListItemButton onClick={handleLogoutClick}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItemButton>
      </List>
    </>
  );

  if (isMobile) {
    return (
      <>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ 
            position: 'fixed', 
            top: 10, 
            left: 10, 
            zIndex: 1300,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark'
            }
          }}
        >
          <MenuIcon />
        </IconButton>
        
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': { 
              width: 280,
              backgroundColor: '#f5f5f5'
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </>
    );
  }

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 240,
        '& .MuiDrawer-paper': { 
          width: 240,
          backgroundColor: '#f5f5f5',
          height: '100vh',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}