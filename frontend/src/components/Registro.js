// components/Registro.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Collapse,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CONFIG from '../config.js';
import MDBox from "./MDBox"
import BasicLayout from "./BasicLayout";
import MDTypography from "./MDTypography";
import MDInput from "./MDInput";
import MDButton from "./MDButton";
const Registro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    correo: '',
    password: '',
    password_confirm: '',
    dni: '',
  });
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Buscar paciente por DNI
  useEffect(() => {
    if (formData.dni.length === 0) {
      setPaciente(null);
      setError('');
      return;
    }

    const timer = setTimeout(async () => {
      if (formData.dni.length < 6) return; // Evitar búsquedas cortas

      setLoadingSearch(true);
      try {
        const res = await axios.get(`${CONFIG.API_BASE_URL}/api/buscar-paciente/`, {
          params: { dni: formData.dni }
        });

        if (res.data.existe) {
          setPaciente(res.data);
          setError('');
        } else {
          setPaciente(null);
          setError('No se encontró un paciente con ese DNI.');
        }
      } catch (err) {
        setError('Error al buscar paciente.');
        setPaciente(null);
      } finally {
        setLoadingSearch(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [formData.dni]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validaciones
    if (!formData.dni) {
      setError('El DNI es obligatorio.');
      setLoading(false);
      return;
    }
    if (!formData.correo || !formData.password || !formData.password_confirm) {
      setError('Correo, contraseña y confirmación son obligatorios.');
      setLoading(false);
      return;
    }
    if (formData.password !== formData.password_confirm) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }
    if (!paciente) {
      setError('Debe ingresar un DNI válido de un paciente registrado.');
      setLoading(false);
      return;
    }

    try {
      const data = {
        correo: formData.correo,
        password: formData.password,
        rol_codigo: 'paciente',
        dni: formData.dni,
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        fecha_nacimiento: paciente.fecha_nacimiento,
        telefono: paciente.telefono,
        direccion: paciente.direccion,
      };

      const response = await axios.post(`${CONFIG.API_BASE_URL}/api/registro/`, data);
      setSuccess(response.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Registro de Paciente
          </MDTypography>
        </MDBox>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}


        <MDBox pt={4} pb={3} px={3}>
          {/* Búsqueda por DNI */}
          <TextField
            margin="normal"
            required
            fullWidth
            label="DNI"
            name="dni"
            value={formData.dni}
            onChange={handleChange}
            placeholder="Ingrese el DNI del paciente"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {loadingSearch && <CircularProgress size={20} />}
                </InputAdornment>
              ),
            }}
            disabled={loading}
          />

          {/* Datos del paciente encontrado */}
          <Collapse in={!!paciente}>
            {paciente && (
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mt: 2, bgcolor: '#f9f9f9' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Paciente encontrado:
                </Typography>
                <MDTypography><strong>Nombre:</strong> {paciente.nombre} {paciente.apellido}</MDTypography>
                <MDTypography><strong>Fecha Nac.:</strong> {new Date(paciente.fecha_nacimiento).toLocaleDateString()}</MDTypography>
                <MDTypography><strong>Teléfono:</strong> {paciente.telefono || 'No registrado'}</MDTypography>
                <MDTypography><strong>Dirección:</strong> {paciente.direccion || 'No registrada'}</MDTypography>
              </Box>
            )}
          </Collapse>

          {/* Campos solo si el paciente existe */}
          {paciente && (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Correo Electrónico"
                name="correo"
                type="email"
                value={formData.correo}
                onChange={handleChange}
                disabled={loading}
                sx={{ mt: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Contraseña"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Confirmar Contraseña"
                name="password_confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.password_confirm}
                onChange={handleChange}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </>
          )}

          <MDButton
            type="submit"
            fullWidth
            variant="contained"
            color="info"
            disabled={loading || !paciente}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Registrar Usuario'}
          </MDButton>

          <MDButton variant="gradient" color="info" fullWidth
            onClick={() => navigate('/login')}
          >
            ¿Ya tienes cuenta? Inicia sesión
          </MDButton>
        </MDBox>
      </Paper>
    </Container>
  );
};

export default Registro;