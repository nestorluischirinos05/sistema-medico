// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Registro from './components/Registro';
import CambiarContrasena from './components/CambiarContrasena';
import ResetearContrasena from './components/ResetearContrasena';
import Sidebar from './components/Sidebar';
import MedicoForm from './components/MedicoForm';
import PacienteForm from './components/PacienteForm';
import EspecialidadForm from './components/EspecialidadForm';
import Dashboard from './pages/Dashboard';
import Consultas from './pages/Consultas';
import RegistrarUsuario from './pages/Usuarios';
import Configuracion from './pages/Configuracion';
import HistoriaClinica from './pages/HistoriaClinica';
import AgendarConsulta from './pages/AgendarConsulta'
import { useMediaQuery, useTheme, Box } from '@mui/material'; // Agregar estos imports

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Detectar dispositivos móviles

  // Verificar si el usuario ya está logueado al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        // console.log('Usuario encontrado en localStorage:', parsedUserData);
        setIsLoggedIn(true);
        setUserRole(parsedUserData.rol_codigo || 'paciente');
        // console.log('Estado actualizado - isLoggedIn:', true, 'userRole:', parsedUserData.rol_codigo);
      } catch (e) {
        console.error('Error al parsear user_data:', e);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
      }
    } else {
      // console.log('No hay datos de usuario en localStorage');
    }
  }, []);

  const handleLogin = (userData) => {
    // console.log('handleLogin llamado con:', userData);
    setIsLoggedIn(true);
    const role = userData.rol_codigo || 'paciente';
    setUserRole(role);
    // console.log('Estado actualizado por handleLogin - isLoggedIn:', true, 'userRole:', role);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  };

  // Componente para rutas protegidas
  const ProtectedRoute = ({ children, allowedRoles = null }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }
    
    // Si se especifican roles permitidos, verificar el rol del usuario
    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
      // console.log(`Acceso denegado: Rol ${userRole} no permitido para esta ruta. Roles permitidos: ${allowedRoles}`);
      // Redirigir según el rol del usuario
      if (userRole === 'medico') {
        return <Navigate to="/medico/dashboard" replace />;
      } else if (userRole === 'paciente') {
        return <Navigate to="/paciente/dashboard" replace />;
      }
      // Para cualquier otro rol no permitido, redirigir al dashboard principal
      return <Navigate to="/dashboard" replace />;
    }

    return (
      <>
        <Sidebar onLogout={handleLogout} userRole={userRole} />

        <Box
            component="main"
            sx={{
            flexGrow: 1,
            p: { xs: 1, sm: 3 },
            ml: { sm: '240px' }, // Solo en pantallas >= sm
            mt: { xs: '60px', sm: 0 }, // Ajusta si tienes un header fijo en móvil
            width: { sm: 'calc(100% - 240px)' },
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
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
        <Routes>
          {/* Rutas públicas */}
          <Route 
            path="/login" 
            element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} 
          />
          <Route path="/registro" element={<Registro />} />
          
          {/* Rutas protegidas para administradores */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'medico']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
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
              <ProtectedRoute allowedRoles={['admin']}>
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
          
          {/* Rutas para médicos */}
          <Route 
            path="/medico/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['medico']}>
                <Dashboard userType="medico" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/medico/consultas" 
            element={
              <ProtectedRoute allowedRoles={['medico']}>
                <Consultas userType="medico" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/medico/historia/:pacienteId" 
            element={
              <ProtectedRoute allowedRoles={['medico']}>
                <HistoriaClinica />
              </ProtectedRoute>
            } 
          />
          
          {/* Rutas para pacientes */}
          <Route 
            path="/paciente/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['paciente']}>
                <Dashboard userType="paciente" />
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
          
          {/* Rutas para cambio de contraseña */}
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
          
          {/* Redirección por defecto */}
          <Route 
            path="/" 
            element={
              isLoggedIn ? 
              <Navigate to={
                userRole === 'medico' ? "/medico/dashboard" : 
                userRole === 'paciente' ? "/paciente/dashboard" : 
                "/dashboard"
              } replace /> : 
              <Navigate to="/login" replace />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;