// components/Sidebar.js
import React, { useState, useEffect } from 'react';
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
  useTheme,
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
  Close as CloseIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userRole, setUserRole] = useState('admin'); // Puedes cargarlo del localStorage

  // Cargar rol del usuario desde localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUserRole(parsed.rol_codigo || 'paciente');
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  // Ancho del sidebar
  const drawerWidth = 240;

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      {/* Encabezado */}
      <Box
        sx={{
          p: 2,
          backgroundColor: 'primary.main',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" noWrap>
          Sistema Médico
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Lista de opciones */}
      <List component="nav" sx={{ px: 0, py: 1, flexGrow: 1 }}>
        <ListItemButton component={Link} to="/dashboard" sx={{ px: 2.5 }}>
          <ListItemIcon sx={{ color: 'primary.main' }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        <ListItemButton component={Link} to="/usuarios" sx={{ px: 2.5 }}>
          <ListItemIcon sx={{ color: 'primary.main' }}>
            <GroupIcon />
          </ListItemIcon>
          <ListItemText primary="Gestión de Usuarios" />
        </ListItemButton>

        <ListItemButton component={Link} to="/configuracion" sx={{ px: 2.5 }}>
          <ListItemIcon sx={{ color: 'primary.main' }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Configuración" />
        </ListItemButton>

        <ListItemButton component={Link} to="/consultas" sx={{ px: 2.5 }}>
          <ListItemIcon sx={{ color: 'primary.main' }}>
            <EventNoteIcon />
          </ListItemIcon>
          <ListItemText primary="Consultas" />
        </ListItemButton>

        {userRole === 'paciente' && (
          <ListItemButton component={Link} to="/paciente/agendar-consulta" sx={{ px: 4 }}>
            <ListItemText primary="Agendar Consulta" />
          </ListItemButton>
        )}

        <Divider sx={{ my: 1 }} />

        <Typography variant="overline" sx={{ px: 2.5, color: 'text.secondary' }}>
          Registrar
        </Typography>

        <ListItemButton component={Link} to="/registrar-medico" sx={{ px: 2.5 }}>
          <ListItemIcon sx={{ color: 'primary.main' }}>
            <PersonAddIcon />
          </ListItemIcon>
          <ListItemText primary="Registrar Médico" />
        </ListItemButton>

        <ListItemButton component={Link} to="/registrar-paciente" sx={{ px: 2.5 }}>
          <ListItemIcon sx={{ color: 'primary.main' }}>
            <PersonAddIcon />
          </ListItemIcon>
          <ListItemText primary="Registrar Paciente" />
        </ListItemButton>

        <ListItemButton component={Link} to="/registrar-especialidad" sx={{ px: 2.5 }}>
          <ListItemIcon sx={{ color: 'primary.main' }}>
            <MedicalIcon />
          </ListItemIcon>
          <ListItemText primary="Registrar Especialidad" />
        </ListItemButton>

        <ListItemButton component={Link} to="/historia/1" sx={{ px: 2.5 }}>
          <ListItemIcon sx={{ color: 'primary.main' }}>
            <MedicalIcon />
          </ListItemIcon>
          <ListItemText primary="Ver Historia Clínica" />
        </ListItemButton>

        <Divider sx={{ my: 1 }} />

        <Typography variant="overline" sx={{ px: 2.5, color: 'text.secondary' }}>
          Seguridad
        </Typography>

        <ListItemButton component={Link} to="/cambiar-contrasena" sx={{ px: 2.5 }}>
          <ListItemIcon sx={{ color: 'primary.main' }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Cambiar Contraseña" />
        </ListItemButton>

        {userRole === 'admin' && (
          <ListItemButton component={Link} to="/resetear-contrasena" sx={{ px: 2.5 }}>
            <ListItemIcon sx={{ color: 'primary.main' }}>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Resetear Contraseña (Admin)" />
          </ListItemButton>
        )}

        <Divider sx={{ my: 1 }} />
      </List>

      {/* Botón de cierre */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <ListItemButton onClick={handleLogoutClick} sx={{ borderRadius: 1 }}>
          <ListItemIcon>
            <LogoutIcon color="error" />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ color: 'error' }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  // Vista para móvil
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
              backgroundColor: 'primary.dark',
            },
            boxShadow: 3,
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
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </>
    );
  }

  // Vista para escritorio
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#f5f5f5',
          borderRight: 'none',
          height: '100vh',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}