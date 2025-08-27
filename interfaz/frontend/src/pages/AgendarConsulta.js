// pages/AgendarConsulta.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  FormControl,
  TextField,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Fade,
} from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient.js'; // ✅ Usamos apiClient (ya incluye token)
import CONFIG from '../config.js';

const AgendarConsulta = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const calendarRef = useRef(null);

  // Datos del usuario
  const userData = JSON.parse(localStorage.getItem('user_data'));
  const pacienteId = userData?.id;
  const userRole = userData?.rol_codigo;

  // Estados
  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [horarios, setHorarios] = useState([]);

  const [selected, setSelected] = useState({
    especialidad: '',
    medico: '',
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMedicos, setLoadingMedicos] = useState(false);
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal de confirmación
  const [openConfirm, setOpenConfirm] = useState(false);
  const [motivo, setMotivo] = useState('');

  // Cargar especialidades al inicio
  useEffect(() => {
    const cargarEspecialidades = async () => {
      try {
        const res = await apiClient.get('/api/especialidades/');
        setEspecialidades(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar especialidades:', err);
        setError('No se pudieron cargar las especialidades.');
        setLoading(false);
      }
    };
    cargarEspecialidades();
  }, []);

  // Cargar médicos cuando se selecciona especialidad
  useEffect(() => {
    if (selected.especialidad) {
      setLoadingMedicos(true);
      apiClient
        .get(`/api/medicos/`, {
          params: { especialidad: selected.especialidad }
        })
        .then((res) => {
          setMedicos(res.data);
          setLoadingMedicos(false);
        })
        .catch((err) => {
          console.error('Error al cargar médicos:', err);
          setError('No se pudieron cargar los médicos.');
          setLoadingMedicos(false);
        });
    } else {
      setMedicos([]);
    }
  }, [selected.especialidad]);

  // Cargar horarios disponibles del médico
  useEffect(() => {
    if (selected.medico && selectedDate) {
      setLoadingHorarios(true);
      // Simulación de horarios disponibles (en producción: consulta API real)
      setTimeout(() => {
        const horas = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
        const eventos = horas.map((hora) => {
          const [h, m] = hora.split(':');
          const start = new Date(selectedDate);
          start.setHours(parseInt(h), parseInt(m), 0);
          const end = new Date(start);
          end.setMinutes(end.getMinutes() + 45);

          return {
            title: 'Disponible',
            start: start.toISOString(),
            end: end.toISOString(),
            backgroundColor: theme.palette.success.light,
            borderColor: theme.palette.success.main,
            allDay: false,
          };
        });
        setHorarios(eventos);
        setLoadingHorarios(false);
      }, 500);
    } else {
      setHorarios([]);
    }
  }, [selected.medico, selectedDate, theme.palette]);

  const handleEspecialidadChange = (e) => {
    setSelected({ ...selected, especialidad: e.target.value, medico: '' });
  };

  const handleMedicoChange = (e) => {
    setSelected({ ...selected, medico: e.target.value });
  };

  const handleDateSelect = (selectInfo) => {
    const fecha = new Date(selectInfo.start);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fecha < hoy) {
      alert('No puedes seleccionar una fecha pasada.');
      return;
    }

    setSelectedDate(fecha);
  };

  const handleTimeClick = (clickInfo) => {
    if (clickInfo.event.title === 'Disponible') {
      setSelectedDate(new Date(clickInfo.event.start));
      setOpenConfirm(true);
    }
  };

  const handleConfirm = async () => {
    if (!motivo.trim()) {
      alert('El motivo es obligatorio');
      return;
    }

    try {
      const data = {
        paciente: pacienteId,
        medico: selected.medico,
        fecha: selectedDate.toISOString().split('T')[0],
        motivo,
      };

      await apiClient.post('/api/consultas/', data);
      setSuccess('Consulta agendada correctamente.');
      setOpenConfirm(false);
      setMotivo('');
      setTimeout(() => navigate('/paciente/dashboard'), 2000);
    } catch (err) {
      console.error('Error al agendar consulta:', err);
      if (err.response?.data?.error) {
        setError(`Error: ${err.response.data.error}`);
      } else {
        setError('No se pudo agendar la consulta. Verifique su conexión.');
      }
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: isMobile ? 2 : 4, mb: 4 }}>
      <Paper sx={{ p: isMobile ? 2 : 4, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
          Agendar Consulta
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {!success ? (
          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 3 }}>
            {/* Filtros */}
            <Box sx={{ flex: isMobile ? 'none' : '0 0 300px', mb: isMobile ? 3 : 0 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Especialidad</InputLabel>
                <Select value={selected.especialidad} onChange={handleEspecialidadChange} label="Especialidad">
                  {especialidades.map((e) => (
                    <MenuItem key={e.id} value={e.id}>
                      {e.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Médico</InputLabel>
                <Select
                  value={selected.medico}
                  onChange={handleMedicoChange}
                  label="Médico"
                  disabled={!selected.especialidad || loadingMedicos}
                >
                  {loadingMedicos ? (
                    <MenuItem disabled>Cargando médicos...</MenuItem>
                  ) : (
                    medicos.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.nombre} {m.apellido}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              {selected.medico && (
                <Fade in timeout={500}>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Selecciona un día y hora disponible en el calendario.
                  </Alert>
                </Fade>
              )}
            </Box>

            {/* Calendario */}
            <Box sx={{ flex: 1 }}>
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: isMobile ? 'dayGridMonth,timeGridWeek' : 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                locale={esLocale}
                selectable
                select={handleDateSelect}
                events={horarios}
                eventClick={handleTimeClick}
                allDaySlot={false}
                slotMinTime="08:00:00"
                slotMaxTime="18:00:00"
                height="600px"
                nowIndicator
                dayMaxEvents={3}
                eventDisplay="block"
                titleFormat={{ year: 'numeric', month: 'long', day: 'numeric' }}
                noEventsContent="Selecciona un médico para ver disponibilidad"
              />
            </Box>
          </Box>
        ) : null}
      </Paper>

      {/* Modal de confirmación */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Confirmar Consulta
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" gutterBottom>
            <strong>Médico:</strong> {medicos.find(m => m.id === selected.medico)?.nombre}{' '}
            {medicos.find(m => m.id === selected.medico)?.apellido}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Fecha:</strong> {selectedDate?.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Hora:</strong> {selectedDate?.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </Typography>

          <TextField
            margin="normal"
            label="Motivo de la consulta"
            multiline
            rows={3}
            fullWidth
            required
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} variant="contained" color="primary">
            Agendar Consulta
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AgendarConsulta;