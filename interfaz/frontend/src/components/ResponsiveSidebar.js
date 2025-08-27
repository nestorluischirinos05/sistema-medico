// components/ResponsiveDrawer.js
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

const drawerWidth = 280;

export default function ResponsiveDrawer({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const drawer = (
    <div>
      <Toolbar sx={{ backgroundColor: '#1976d2', color: 'white', minHeight: 64 }}>
        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
          {collapsed ? '' : 'Sistema Médico'}
        </Typography>
        {!collapsed && isMobile && (
          <IconButton color="inherit" onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List>
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              {!collapsed && <ListItemText primary={text} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['All mail', 'Trash', 'Spam'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              {!collapsed && <ListItemText primary={text} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {/* Botón de colapso (solo en escritorio) */}
      {!isMobile && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <IconButton
            onClick={handleToggleCollapse}
            sx={{
              backgroundColor: '#1976d2',
              color: 'white',
              width: 32,
              height: 32,
              '&:hover': { backgroundColor: '#1565c0' },
            }}
          >
            {collapsed ? <MenuIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
          </IconButton>
        </Box>
      )}
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* AppBar fijo */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: collapsed ? '80px' : `${drawerWidth}px` },
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#1976d2',
          color: 'white',
          transition: 'margin 0.3s ease',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap>
            Panel de Prueba
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: collapsed ? 80 : drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="menú de navegación"
      >
        {/* Sidebar móvil */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: 'white',
              borderRight: 'none',
              boxShadow: '0 0 20px rgba(0,0,0,0.08)',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Sidebar de escritorio */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: collapsed ? 80 : drawerWidth,
              backgroundColor: 'white',
              borderRight: 'none',
              boxShadow: '0 0 20px rgba(0,0,0,0.08)',
              transition: 'width 0.3s ease',
              position: 'fixed',
              height: '100vh',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { sm: collapsed ? '80px' : `${drawerWidth}px` },
          mt: '64px', // Altura del AppBar
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          transition: 'margin 0.3s ease',
        }}
      >
        <Toolbar /> {/* Espacio para el AppBar */}
        {children}
      </Box>
    </Box>
  );
}