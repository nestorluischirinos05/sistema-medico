// components/NotificacionesMenu.js
import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import apiClient from '../services/apiClient.js';

const NotificacionesMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const open = Boolean(anchorEl);

  // Cargar notificaciones
  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/mis-notificaciones/');
      setNotificaciones(res.data);
      const noLeidas = res.data.filter(n => !n.leida).length;
      setUnreadCount(noLeidas);
    } catch (err) {
      setError('No se pudieron cargar las notificaciones.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Abrir menú
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (!open) {
      cargarNotificaciones();
    }
  };

  // Cerrar menú
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Marcar como leída al hacer clic
  const handleNotificacionClick = async (notificacion) => {
    if (!notificacion.leida) {
      try {
        await apiClient.patch(`/api/notificaciones/${notificacion.id}/marcar-leida/`, {
          leida: true
        });
        setNotificaciones(prev =>
          prev.map(n => n.id === notificacion.id ? { ...n, leida: true } : n)
        );
        setUnreadCount(prev => prev - 1);
      } catch (err) {
        console.error('Error al marcar como leída:', err);
      }
    }
    // Aquí puedes navegar a la historia clínica o cita
    setAnchorEl(null);
  };

  // Cargar al montar
  useEffect(() => {
    cargarNotificaciones();
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarNotificaciones, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <IconButton
        onClick={handleClick}
        color="inherit"
        size="large"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 400, maxWidth: '100%' }
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Notificaciones</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 1 }}>{error}</Alert>
        )}

        {loading ? (
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : notificaciones.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Typography color="text.secondary" align="center">
              No tienes notificaciones
            </Typography>
          </Box>
        ) : (
          notificaciones.map((noti) => (
            <MenuItem
              key={noti.id}
              onClick={() => handleNotificacionClick(noti)}
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                opacity: noti.leida ? 0.7 : 1,
                backgroundColor: noti.leida ? 'transparent' : 'action.hover'
              }}
            >
              <Typography variant="subtitle2" fontWeight={noti.leida ? 'normal' : 'bold'}>
                {noti.titulo}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {noti.mensaje}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {new Date(noti.fecha).toLocaleString()}
              </Typography>
            </MenuItem>
          ))
        )}

        <Divider />
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Mostrando {notificaciones.length} notificación(es)
          </Typography>
        </Box>
      </Menu>
    </>
  );
};

export default NotificacionesMenu;