// components/DashboardAppBar.js (crea este archivo)
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const DashboardAppBar = ({ handleDrawerToggle, drawerWidth }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        backgroundColor: '#1976d2', // Azul profesional
        color: 'white',
        boxShadow: 2,
      }}
    >
      <Toolbar>
        {/* Botón de menú (solo en móvil) */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap>
          Sistema Médico...
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default DashboardAppBar;