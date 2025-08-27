// components/Sidebar.js
import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Box,
  Typography,
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
  Science as ScienceIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

export default function Sidebar({ onLogout, userRole, collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  // Ancho del sidebar
  const drawerWidth = collapsed ? 80 : 280;

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white',
        color: 'text.primary',
        boxShadow: '0 0 20px rgba(0,0,0,0.08)',
      }}
     
    >
      {/* Encabezado */}
      <Box
        sx={{
          p: 2,
          backgroundColor: '#1976d2',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',          
        }}
        
      >
        <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
          {collapsed ? '' : 'Sistema Médico'}
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Scrollable content */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
        <List component="nav" sx={{ px: 0 }}>
          {/* Dashboard */}
          <ListItemButton
            component={Link}
            to="/dashboard"
            sx={{
              px: collapsed ? 2 : 3,
              py: 1.2,
              color: 'text.secondary',
              justifyContent: collapsed ? 'center' : 'flex-start',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                borderLeft: !collapsed ? '3px solid #1976d2' : 'none',
                transform: !collapsed ? 'translateX(2px)' : 'none',
                transition: 'all 0.2s ease',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#1976d2', minWidth: 40 }}>
              <DashboardIcon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Dashboard"
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              />
            )}
          </ListItemButton>

          {/* Gestión de Usuarios (Admin) */}
          {userRole === 'admin' && !collapsed && (
            <ListItemButton
              component={Link}
              to="/usuarios"
              sx={{
                px: 3,
                py: 1.2,
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  borderLeft: '3px solid #1976d2',
                  transform: 'translateX(2px)',
                  transition: 'all 0.2s ease',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#1976d2', minWidth: 40 }}>
                <GroupIcon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary="Gestión de Usuarios"
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              />
            </ListItemButton>
          )}

          {/* Agenda */}
          <ListItemButton
            component={Link}
            to="/calendario"
            sx={{
              px: collapsed ? 2 : 3,
              py: 1.2,
              color: 'text.secondary',
              justifyContent: collapsed ? 'center' : 'flex-start',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                borderLeft: !collapsed ? '3px solid #1976d2' : 'none',
                transform: !collapsed ? 'translateX(2px)' : 'none',
                transition: 'all 0.2s ease',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#1976d2', minWidth: 40 }}>
              <EventIcon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Agenda"
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              />
            )}
          </ListItemButton>

          {/* Consultas */}
          <ListItemButton
            component={Link}
            to="/consultas"
            sx={{
              px: collapsed ? 2 : 3,
              py: 1.2,
              color: 'text.secondary',
              justifyContent: collapsed ? 'center' : 'flex-start',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                borderLeft: !collapsed ? '3px solid #1976d2' : 'none',
                transform: !collapsed ? 'translateX(2px)' : 'none',
                transition: 'all 0.2s ease',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#1976d2', minWidth: 40 }}>
              <EventNoteIcon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Consultas"
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              />
            )}
          </ListItemButton>

          {/* Exámenes Médicos */}
          <ListItemButton
            component={Link}
            to="/examenes"
            sx={{
              px: collapsed ? 2 : 3,
              py: 1.2,
              color: 'text.secondary',
              justifyContent: collapsed ? 'center' : 'flex-start',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                borderLeft: !collapsed ? '3px solid #1976d2' : 'none',
                transform: !collapsed ? 'translateX(2px)' : 'none',
                transition: 'all 0.2s ease',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#1976d2', minWidth: 40 }}>
              <ScienceIcon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Exámenes Médicos"
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              />
            )}
          </ListItemButton>

          {/* Agendar Consulta (Paciente) */}
          {userRole === 'paciente' && !collapsed && (
            <ListItemButton
              component={Link}
              to="/paciente/agendar-consulta"
              sx={{
                px: 4,
                py: 1,
                ml: 1,
                borderRadius: 1,
                backgroundColor: 'rgba(25, 118, 210, 0.05)',
                borderLeft: '3px solid #1976d2',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                },
              }}
            >
              <ListItemText
                primary="Agendar Consulta"
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: '#1976d2',
                }}
              />
            </ListItemButton>
          )}

          <Divider sx={{ my: 2, mx: 2 }} />

          {/* Sección: Registrar */}
          {!collapsed && (
            <Typography
              variant="overline"
              sx={{
                px: 3,
                color: 'text.secondary',
                fontWeight: 600,
                letterSpacing: '1px',
              }}
            >
              Registrar
            </Typography>
          )}

          {/* Registrar Médico (Admin) */}
          {userRole === 'admin' && !collapsed && (
            <ListItemButton
              component={Link}
              to="/registrar-medico"
              sx={{
                px: 3,
                py: 1.2,
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  borderLeft: '3px solid #1976d2',
                  transform: 'translateX(2px)',
                  transition: 'all 0.2s ease',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#1976d2', minWidth: 40 }}>
                <PersonAddIcon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary="Registrar Médico"
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              />
            </ListItemButton>
          )}

          {/* Registrar Paciente */}
          <ListItemButton
            component={Link}
            to="/registrar-paciente"
            sx={{
              px: collapsed ? 2 : 3,
              py: 1.2,
              color: 'text.secondary',
              justifyContent: collapsed ? 'center' : 'flex-start',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                borderLeft: !collapsed ? '3px solid #1976d2' : 'none',
                transform: !collapsed ? 'translateX(2px)' : 'none',
                transition: 'all 0.2s ease',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#1976d2', minWidth: 40 }}>
              <PersonAddIcon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Registrar Paciente"
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              />
            )}
          </ListItemButton>

          {/* Registrar Especialidad (Admin) */}
          {userRole === 'admin' && !collapsed && (
            <ListItemButton
              component={Link}
              to="/registrar-especialidad"
              sx={{
                px: 3,
                py: 1.2,
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  borderLeft: '3px solid #1976d2',
                  transform: 'translateX(2px)',
                  transition: 'all 0.2s ease',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#1976d2', minWidth: 40 }}>
                <MedicalIcon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary="Registrar Especialidad"
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              />
            </ListItemButton>
          )}

          {/* Tipos de Exámenes */}
          <ListItemButton
            component={Link}
            to="/tipo-examenes"
            sx={{
              px: collapsed ? 2 : 3,
              py: 1.2,
              color: 'text.secondary',
              justifyContent: collapsed ? 'center' : 'flex-start',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                borderLeft: !collapsed ? '3px solid #1976d2' : 'none',
                transform: !collapsed ? 'translateX(2px)' : 'none',
                transition: 'all 0.2s ease',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#1976d2', minWidth: 40 }}>
              <ScienceIcon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Tipos de Exámenes"
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              />
            )}
          </ListItemButton>

          {/* Ver Historia Clínica */}
          <ListItemButton
            component={Link}
            to="/historia/1"
            sx={{
              px: collapsed ? 2 : 3,
              py: 1.2,
              color: 'text.secondary',
              justifyContent: collapsed ? 'center' : 'flex-start',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                borderLeft: !collapsed ? '3px solid #1976d2' : 'none',
                transform: !collapsed ? 'translateX(2px)' : 'none',
                transition: 'all 0.2s ease',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#1976d2', minWidth: 40 }}>
              <MedicalIcon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Ver Historia Clínica"
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              />
            )}
          </ListItemButton>

          {/* Gestionar Antecedentes (Admin) */}
          {userRole === 'admin' && !collapsed && (
            <ListItemButton
              component={Link}
              to="/antecedentes"
              sx={{
                px: 3,
                py: 1.2,
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  borderLeft: '3px solid #1976d2',
                  transform: 'translateX(2px)',
                  transition: 'all 0.2s ease',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#1976d2', minWidth: 40 }}>
                <MedicalIcon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary="Gestionar Antecedentes"
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              />
            </ListItemButton>
          )}

          <Divider sx={{ my: 2, mx: 2 }} />

          {/* Sección: Seguridad */}
          {!collapsed && (
            <Typography
              variant="overline"
              sx={{
                px: 3,
                color: 'text.secondary',
                fontWeight: 600,
                letterSpacing: '1px',
              }}
            >
              Seguridad
            </Typography>
          )}

          {/* Cambiar Contraseña */}
          <ListItemButton
            component={Link}
            to="/cambiar-contrasena"
            sx={{
              px: collapsed ? 2 : 3,
              py: 1.2,
              color: 'text.secondary',
              justifyContent: collapsed ? 'center' : 'flex-start',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                borderLeft: !collapsed ? '3px solid #1976d2' : 'none',
                transform: !collapsed ? 'translateX(2px)' : 'none',
                transition: 'all 0.2s ease',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#1976d2', minWidth: 40 }}>
              <SettingsIcon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Cambiar Contraseña"
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              />
            )}
          </ListItemButton>

          {/* Resetear Contraseña (Admin) */}
          {userRole === 'admin' && !collapsed && (
            <ListItemButton
              component={Link}
              to="/resetear-contrasena"
              sx={{
                px: 3,
                py: 1.2,
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  borderLeft: '3px solid #1976d2',
                  transform: 'translateX(2px)',
                  transition: 'all 0.2s ease',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#1976d2', minWidth: 40 }}>
                <PeopleIcon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary="Resetear Contraseña (Admin)"
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              />
            </ListItemButton>
          )}
        </List>
      </Box>

      {/* Botón de cierre */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <ListItemButton
          onClick={handleLogoutClick}
          sx={{
            borderRadius: 1,
            py: 1.2,
            backgroundColor: 'error.lighter',
            '&:hover': {
              backgroundColor: 'error.light',
            },
          }}
        >
          <ListItemIcon>
            <LogoutIcon color="error" />
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary="Cerrar Sesión"
              primaryTypographyProps={{ color: 'error', fontWeight: 500 }}
            />
          )}
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
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1300,
            backgroundColor: '#1976d2',
            color: 'white',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
            boxShadow: 3,
            width: 48,
            height: 48,
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
              backgroundColor: 'white',
              borderRight: 'none',
              height: '100vh',
              boxShadow: '0 0 20px rgba(0,0,0,0.08)',
              position: 'fixed',
              zIndex: 1200,
              transition: 'width 0.3s ease',
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
          backgroundColor: 'white',
          borderRight: 'none',
          height: '100vh',
          boxShadow: '0 0 20px rgba(0,0,0,0.08)',
          transition: 'width 0.3s ease',
          position: 'fixed',
          zIndex: 1200,
        },
      }}
    >
      {drawerContent}
      {/* Botón de colapso (solo en escritorio) */}
      {isDesktop && (
        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          sx={{
            position: 'absolute',
            top: 16,
            right: -16,
            zIndex: 1,
            backgroundColor: '#1976d2',
            color: 'white',
            width: 32,
            height: 32,
            '&:hover': { backgroundColor: '#1565c0' },
            boxShadow: 2,
          }}
        >
          {collapsed ? <MenuIcon fontSize="small" /> : <CloseIcon fontSize="small" />}
        </IconButton>
      )}
    </Drawer>
  );
}