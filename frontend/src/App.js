// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Registro from './components/Registro';
import CambiarContrasena from './components/CambiarContrasena';
import ResetearContrasena from './components/ResetearContrasena';
import NavBar from './components/AppBar';
//import ResponsiveDrawer from './components/ResponsiveDrawer.js'
import Sidebar from './components/Sidebar';
import MedicoForm from './components/MedicoForm';
import PacienteForm from './components/PacienteForm';
import EspecialidadForm from './components/EspecialidadForm';
import Dashboard from './pages/Dashboard';
import Consultas from './pages/Consultas';
import RegistrarUsuario from './pages/Usuarios';
import Configuracion from './pages/Configuracion';
import HistoriaClinica from './pages/HistoriaClinica';
import AgendarConsulta from './pages/AgendarConsulta';
import Examenes from './pages/Examenes';
import TipoExamenes from './pages/TipoExamenes';
import CalendarioCitas from './pages/CalendarioCitas';
import DashboardMedico from './pages/DashboardMedico';
import DashboardPaciente from './pages/DashboardPaciente';
import GestionarAntecedentes from './components/GestionarAntecedentes.js';
import { useMediaQuery, useTheme, Box } from '@mui/material';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Verificar si el usuario ya está logueado
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      try {
        const parsed = JSON.parse(userData);
        setIsLoggedIn(true);
        setUserRole(parsed.rol_codigo || 'paciente');
      } catch (e) {
        console.error('Error al parsear user_data:', e);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUserRole(userData.rol_codigo || 'paciente');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  };

  // Estado de colapso del Sidebar
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Ruta protegida
  const ProtectedRoute = ({ children, allowedRoles = null }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
      if (userRole === 'medico') {
        return <Navigate to="/medico/dashboard" replace />;
      } else if (userRole === 'paciente') {
        return <Navigate to="/paciente/dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
    

      const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
      };

    return (
      <>
        {/* ✅ AppBar fijo en la parte superior */}
        <NavBar collapsed={collapsed} handleDrawerToggle={handleDrawerToggle} />

        {/* ✅ Sidebar */}
        <Sidebar onLogout={handleLogout} userRole={userRole} collapsed={collapsed} setCollapsed={setCollapsed} />
        
        {/* ✅ Contenido principal */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 1, sm: 3 },
            ml: { sm: collapsed ? '80px' : '280px' }, // Ajusta según collapsed
            mt: { xs: '64px', sm: '64px' }, // Altura del AppBar
            width: { sm: collapsed ? `calc(100% - 80px)` : `calc(100% - 280px)` },
            transition: 'margin 0.3s ease',
            minHeight: '100vh',
            backgroundColor: 'background.default',
          }}
        >
          {children}
        </Box>
      </>
    );
  };

  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <Routes>
          {/* Rutas públicas */}
          <Route
            path="/login"
            element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />}
          />
          <Route path="/registro" element={<Registro />} />

          {/* Dashboard por rol */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medico/dashboard"
            element={
              <ProtectedRoute allowedRoles={['medico']}>
                <DashboardMedico />
              </ProtectedRoute>
            }
          />
          <Route
            path="/paciente/dashboard"
            element={
              <ProtectedRoute allowedRoles={['paciente']}>
                <DashboardPaciente />
              </ProtectedRoute>
            }
          />

          {/* Otras rutas protegidas */}
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <RegistrarUsuario />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuracion"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Configuracion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultas"
            element={
              <ProtectedRoute allowedRoles={['admin', 'medico']}>
                <Consultas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/examenes"
            element={
              <ProtectedRoute allowedRoles={['admin', 'medico']}>
                <Examenes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tipo-examenes"
            element={
              <ProtectedRoute allowedRoles={['admin', 'medico']}>
                <TipoExamenes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrar-medico"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MedicoForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrar-paciente"
            element={
              <ProtectedRoute allowedRoles={['admin', 'medico']}>
                <PacienteForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrar-especialidad"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EspecialidadForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historia/:pacienteId"
            element={
              <ProtectedRoute allowedRoles={['admin', 'medico']}>
                <HistoriaClinica />
              </ProtectedRoute>
            }
          />
          <Route
            path="/paciente/historia"
            element={
              <ProtectedRoute allowedRoles={['paciente']}>
                <HistoriaClinica pacienteView={true} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cambiar-contrasena"
            element={
              <ProtectedRoute>
                <CambiarContrasena />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resetear-contrasena"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ResetearContrasena />
              </ProtectedRoute>
            }
          />
          <Route
            path="/paciente/agendar-consulta"
            element={
              <ProtectedRoute allowedRoles={['paciente']}>
                <AgendarConsulta />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendario"
            element={
              <ProtectedRoute allowedRoles={['medico', 'admin']}>
                <CalendarioCitas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/antecedentes"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <GestionarAntecedentes />
              </ProtectedRoute>
            }
          />
          {/* Redirección por defecto */}
          <Route
            path="/"
            element={
              <Navigate
                to={
                  isLoggedIn
                    ? userRole === 'medico'
                      ? '/medico/dashboard'
                      : userRole === 'paciente'
                        ? '/paciente/dashboard'
                        : '/dashboard'
                    : '/login'
                }
                replace
              />
            }
          />
          {/* Ruta 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;