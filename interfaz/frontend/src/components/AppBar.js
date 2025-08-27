// components/NavBar.js
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Box,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import NotificacionesMenu from './NotificacionesMenu';

const NavBar = ({ collapsed, handleDrawerToggle }) => {
  const drawerWidth = collapsed ? 80 : 280; // ✅ Ajusta según el estado

  return (
    <AppBar
      position="fixed"
      sx={{
        // ✅ Ajusta el ancho y margen según si está colapsado
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },

        // ✅ Asegura que esté por encima del Sidebar
        

        backgroundColor: '#1976d2',
        color: 'white',
        boxShadow: 2,
        transition: 'width 0.3s ease, margin 0.3s ease', // ✅ Animación suave
      }}
    >
      <Toolbar>
        {/* Botón para abrir el menú en móvil */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Título */}
        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
          
        </Typography>

        {/* Notificaciones */}
        <NotificacionesMenu />

        {/* Avatar del usuario */}
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'white',
            color: '#1976d2',
            fontSize: '0.9rem',
            ml: 1,
          }}
        >
          {/* Puedes poner iniciales del usuario */}
          {localStorage.getItem('user_data') ? JSON.parse(localStorage.getItem('user_data')).nombre?.charAt(0).toUpperCase() : 'U'}
        </Avatar>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;