// pages/CalendarioCitas.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Close as CloseIcon } from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import apiClient from '../services/apiClient.js';

const CalendarioCitas = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const calendarRef = useRef(null);
  const [error, setError] = useState('');
  const [medicoFiltro, setMedicoFiltro] = useState('');
  const [medicos, setMedicos] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [currentMedico, setCurrentMedico] = useState(null);

  // Estados para el modal
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formCita, setFormCita] = useState({
    paciente: '',
    medico: '',
    motivo: '',
    estado: 'confirmada',
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);

  // Cargar rol del usuario
  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (!userData) return;

    try {
      const parsed = JSON.parse(userData);
      setUserRole(parsed.rol_codigo);

      if (parsed.rol_codigo === 'admin' || parsed.rol_codigo === 'medico') {
        cargarPacientes();
      }

      if (parsed.rol_codigo === 'admin') {
        cargarMedicos();
      }

      if (parsed.rol_codigo === 'medico') {
        const fetchMedico = async () => {
          try {
            const res = await apiClient.get('/api/medicos/');
            const miMedico = res.data.find(m => m.usuario?.id === parsed.id);
            if (miMedico) {
              setCurrentMedico(miMedico);
            } else {
              setError('No tienes un perfil de médico asociado. Contacta al administrador.');
            }
          } catch (err) {
            setError('No se pudo cargar tu perfil. Verifica tu conexión.');
          }
        };
        fetchMedico();
      }
    } catch (e) {
      console.error('Error al parsear user_data:', e);
    }
  }, []);

  const cargarMedicos = async () => {
    try {
      const res = await apiClient.get('/api/medicos/');
      setMedicos(res.data);
    } catch (err) {
      console.error('Error al cargar médicos:', err);
      setError('No se pudieron cargar los médicos.');
    }
  };

  const cargarPacientes = async () => {
    try {
      const res = await apiClient.get('/api/pacientes/');
      setPacientes(res.data);
    } catch (err) {
      console.error('Error al cargar pacientes:', err);
      setError('No se pudieron cargar los pacientes.');
    }
  };

  const handleEvents = async (info, successCallback, failureCallback) => {
    try {
      const params = {
        fecha_inicio: info.startStr,
        fecha_fin: info.endStr,
      };
      if (medicoFiltro) params.medico_id = medicoFiltro;

      const response = await apiClient.get('/api/citas/medico/', { params });
      successCallback(response.data);
    } catch (err) {
      console.error('Error al cargar citas:', err);
      const errorMsg = err.response?.data?.error || 'Error al cargar las citas.';
      setError(errorMsg);
      failureCallback(errorMsg);
    }
  };

  // Al hacer clic en un slot vacío
  const handleDateSelect = (selectInfo) => {
    setSelectedDate(selectInfo);
    setSelectedEvent(null);
    setFormCita({
      paciente: '',
      medico: currentMedico?.id || '',
      motivo: '',
      estado: 'solicitada',
    });
    setIsEditing(false);
    setOpenModal(true);
  };

  // Al hacer clic en un evento
  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;

    setSelectedEvent({
      id: event.id,
      start: event.startStr,
      extendedProps: event.extendedProps,
    });
    setSelectedDate({ startStr: event.startStr });

    setFormCita({
      paciente: event.extendedProps.paciente_id || '',
      medico: event.extendedProps.medico_id || '',
      motivo: event.extendedProps.motivo || '',
      estado: event.extendedProps.estado || 'solicitada',
    });

    setIsEditing(true);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedDate(null);
    setSelectedEvent(null);
  };

  const handleFormChange = (e) => {
    setFormCita({ ...formCita, [e.target.name]: e.target.value });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmitCita = async () => {
    if (!formCita.motivo.trim()) {
      showSnackbar('El motivo es obligatorio', 'warning');
      return;
    }

    if (!formCita.paciente) {
      showSnackbar('Debe seleccionar un paciente.', 'warning');
      return;
    }

    let medicoId = null;

    if (userRole === 'admin') {
      if (!formCita.medico) {
        showSnackbar('Por favor, selecciona un médico.', 'warning');
        return;
      }
      medicoId = formCita.medico;
    } else if (userRole === 'medico' && currentMedico) {
      medicoId = currentMedico.id;
    }

    if (!medicoId) {
      showSnackbar('No se pudo determinar el médico. Contacta al administrador.', 'error');
      return;
    }

    const data = {
      fecha_hora_propuesta: selectedDate.startStr,
      motivo: formCita.motivo,
      estado: formCita.estado,
      medico: medicoId,
      paciente: formCita.paciente,
    };

    try {
      let response;
      let newEvent;

      if (isEditing && selectedEvent) {
        // Actualizar cita
        response = await apiClient.put(`/api/citas/${selectedEvent.id}/`, data);
        // Notificar al paciente si fue editada 
        await notificarPaciente(
          formCita.paciente,
          'Cita actualizada',
          `Tu cita ha sido actualizada. Estado: ${response.data.estado}.`,
          { cita_id: selectedEvent.id }
        );
        newEvent = {
          id: response.data.id,
          title: pacientes.find(p => p.id === formCita.paciente)?.nombre || 'Paciente',
          start: response.data.fecha_hora_propuesta,
          end: response.data.fecha_hora_propuesta,
          extendedProps: {
            motivo: response.data.motivo,
            estado: response.data.estado,
            paciente_id: response.data.paciente,
            medico_id: response.data.medico,
          },
          backgroundColor: response.data.estado === 'confirmada' ? '#4CAF50' : '#FF9800',
          borderColor: '#000',
        };

        const calendarApi = calendarRef.current.getApi();
        const event = calendarApi.getEventById(selectedEvent.id);
        if (event) event.remove();
        calendarApi.addEvent(newEvent);
        showSnackbar('✅ Cita actualizada correctamente', 'success');
      } else {
        // Crear nueva cita
        response = await apiClient.post('/api/citas/', data);
        newEvent = {
          id: response.data.id,
          title: pacientes.find(p => p.id === formCita.paciente)?.nombre || 'Paciente',
          start: response.data.fecha_hora_propuesta,
          end: response.data.fecha_hora_propuesta,
          extendedProps: {
            motivo: response.data.motivo,
            estado: response.data.estado,
            paciente_id: response.data.paciente,
            medico_id: response.data.medico,
          },
          backgroundColor: response.data.estado === 'confirmada' ? '#4CAF50' : '#FF9800',
          borderColor: '#000',
        };
        calendarRef.current.getApi().addEvent(newEvent);
        showSnackbar('✅ Cita creada exitosamente', 'success');
      }

      handleCloseModal();
    } catch (err) {
      console.error('Error al procesar cita:', err);
      const errorMsg = err.response?.data?.error || JSON.stringify(err.response?.data) || 'Error al procesar la cita.';
      showSnackbar(`❌ ${errorMsg}`, 'error');
    }
  };

  const handleMedicoChange = (e) => {
    setMedicoFiltro(e.target.value);
  };

  const handleOpenConfirmDelete = () => {
    setOpenConfirmDelete(true);
  };

  const handleCloseConfirmDelete = () => {
    setOpenConfirmDelete(false);
  };

  const handleDeleteCita = async () => {
    try {
      await apiClient.delete(`/api/citas/${selectedEvent.id}/`);
      // Remover del calendario
      const calendarApi = calendarRef.current.getApi();
      const event = calendarApi.getEventById(selectedEvent.id);
      if (event) event.remove();
      handleCloseModal();
      handleCloseConfirmDelete();
      showSnackbar('✅ Cita eliminada correctamente', 'success');
    } catch (err) {
      console.error('Error al eliminar cita:', err);
      const errorMsg = err.response?.data?.error || 'Error al eliminar la cita.';
      showSnackbar(`❌ ${errorMsg}`, 'error');
    }
  };

  const handleEventDrop = async (info) => {
    const { event, oldEvent } = info;
    const citaId = event.id;
    const nuevaFecha = event.startStr;

    // ✅ Solo médicos y admins pueden mover
    if (userRole !== 'medico' && userRole !== 'admin') {
      info.revert();
      showSnackbar('❌ No tienes permiso para mover citas.', 'error');
      return;
    }

    // ✅ Verificar solapamiento
    const medicoId = event.extendedProps.medico_id;
    const disponible = await verificarDisponibilidad(medicoId, nuevaFecha);

    if (!disponible) {
      info.revert();
      showSnackbar('❌ El médico ya tiene una cita en ese horario.', 'error');
      return;
    }

    // ✅ Confirmación
    const confirmado = window.confirm(
      `¿Mover la cita de ${new Date(oldEvent.startStr).toLocaleString()} a ${new Date(nuevaFecha).toLocaleString()}?`
    );

    if (!confirmado) {
      info.revert();
      return;
    }

    try {
      const data = {
        fecha_hora_propuesta: nuevaFecha,
        motivo: event.extendedProps.motivo,
        estado: event.extendedProps.estado,
        medico: medicoId,
        paciente: event.extendedProps.paciente_id,
      };

      const response = await apiClient.put(`/api/citas/${citaId}/`, data);

      // ✅ Notificar al paciente
      await notificarPaciente(
        formCita.paciente,
        'Cita reprogramada',
        `Tu cita ha sido movida al ${new Date(nuevaFecha).toLocaleString()}.`,
        { cita_id: citaId }
      );

      showSnackbar('✅ Cita movida y paciente notificado', 'success');
    } catch (err) {
      console.error('Error al mover cita:', err);
      info.revert();
      const errorMsg = err.response?.data?.error || 'No se pudo mover la cita.';
      showSnackbar(`❌ ${errorMsg}`, 'error');
    }
  };

  // Verifica si hay superposición entre dos horarios
  const haySolapamiento = (start1, end1, start2, end2) => {
    return start1 < end2 && start2 < end1;
  };

  // Verifica si el nuevo horario está disponible
  const verificarDisponibilidad = async (medicoId, nuevaFechaStr, duracionMinutos = 30) => {
    const nuevaFecha = new Date(nuevaFechaStr);
    const finNueva = new Date(nuevaFecha.getTime() + duracionMinutos * 60000);

    try {
      const params = {
        fecha_inicio: new Date(nuevaFecha.getFullYear(), nuevaFecha.getMonth(), nuevaFecha.getDate()).toISOString(),
        fecha_fin: new Date(nuevaFecha.getFullYear(), nuevaFecha.getMonth(), nuevaFecha.getDate() + 1).toISOString(),
        medico_id: medicoId,
      };

      const res = await apiClient.get('/api/citas/medico/', { params });
      const citas = res.data;

      for (const cita of citas) {
        const citaFecha = new Date(cita.fecha_hora_propuesta);
        const citaFin = new Date(citaFecha.getTime() + duracionMinutos * 60000);

        if (cita.id.toString() !== selectedEvent?.id?.toString()) { // No comparar con sí misma
          if (haySolapamiento(nuevaFecha, finNueva, citaFecha, citaFin)) {
            return false; // Ocupado
          }
        }
      }

      return true; // Disponible
    } catch (err) {
      console.error('Error al verificar disponibilidad:', err);
      return false;
    }
  };

  // Notifica al paciente cuando se edita la cita 
  const notificarPaciente = async (pacienteId, titulo, mensaje, metadata = {}, tipo = 'cita') => {
  try {
    await apiClient.post('/api/notificaciones/', {
      usuario: pacienteId,
      tipo, // Ahora es configurable
      titulo,
      mensaje,
      metadata
    });
  } catch (err) {
    console.warn('No se pudo guardar la notificación:', err);
  }
};

  return (
    <Paper
      sx={{
        p: isMobile ? 2 : 3,
        borderRadius: 3,
        height: '100%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: '#f8f9ff',
      }}
    >
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: 1, mb: 2 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          color="primary.main"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          🗓️ Agenda Médica
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedDate(null);
            setFormCita({ paciente: '', medico: '', motivo: '', estado: 'solicitada' });
            setIsEditing(false);
            setOpenModal(true);
          }}
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            px: 3,
            boxShadow: 2,
          }}
        >
          Nueva Cita
        </Button>
      </Box>

      {/* Filtro de médico (solo admin) */}
      {userRole === 'admin' && (
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Ver agenda de médico</InputLabel>
            <Select value={medicoFiltro} label="Ver agenda de médico" onChange={handleMedicoChange}>
              <MenuItem value="">Todas las citas</MenuItem>
              {medicos.map((med) => (
                <MenuItem key={med.id} value={med.id}>
                  {med.nombre} {med.apellido}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Mensaje de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, fontSize: '0.9rem' }}>
          {error}
        </Alert>
      )}

      {/* Calendario */}
      <Box sx={{ height: isMobile ? 'calc(100vh - 300px)' : 'calc(100vh - 200px)' }}>
        <FullCalendar
          editable={userRole === 'medico' || userRole === 'admin'} // Solo ellos pueden arrastrar
          eventDrop={userRole === 'medico' || userRole === 'admin' ? handleEventDrop : null}
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: isMobile ? 'dayGridMonth' : 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          locale={esLocale}
          initialView={isMobile ? 'dayGridMonth' : 'timeGridWeek'}
          events={handleEvents}
          selectable
          select={handleDateSelect}
          eventClick={handleEventClick}          
          allDaySlot={false}
          slotMinTime="07:00:00"
          slotMaxTime="20:00:00"
          height="100%"
          nowIndicator
          dayMaxEvents={3}
          eventDisplay="block"
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
          }}
          titleFormat={{ year: 'numeric', month: 'long', day: 'numeric' }}
          noEventsContent="No hay citas programadas"
          eventContent={(info) => (
            <Box
              sx={{
                p: 0.5,
                cursor: 'pointer',
                borderRadius: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  transform: 'translateY(-1px)',
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                {info.event.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {info.timeText}
              </Typography>
            </Box>
          )}
        />
      </Box>

      {/* Modal de creación/edición */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle
          sx={{
            backgroundColor: '#1976d2',
            color: 'white',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {isEditing ? <EditIcon /> : <AddIcon />}
          {isEditing ? 'Editar Cita' : 'Agendar Nueva Cita'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {/* Fecha y Hora */}
          {selectedDate && (
            <TextField
              margin="normal"
              label="Fecha y Hora"
              value={new Date(selectedDate.startStr).toLocaleString()}
              fullWidth
              InputProps={{ readOnly: true }}
              sx={{ backgroundColor: 'white', borderRadius: 1 }}
            />
          )}

          {/* Médico */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Médico</InputLabel>
            <Select
              name="medico"
              value={formCita.medico}
              onChange={handleFormChange}
              label="Médico"
              required
              disabled={userRole !== 'admin' && !isEditing}
              sx={{ backgroundColor: 'white', borderRadius: 1 }}
            >
              {medicos.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  Dr. {m.nombre} {m.apellido}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Paciente */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Paciente</InputLabel>
            <Select
              name="paciente"
              value={formCita.paciente}
              onChange={handleFormChange}
              label="Paciente"
              required
              sx={{ backgroundColor: 'white', borderRadius: 1 }}
            >
              {pacientes.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.nombre} {p.apellido}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Motivo */}
          <TextField
            margin="normal"
            name="motivo"
            label="Motivo de la cita"
            multiline
            rows={3}
            fullWidth
            value={formCita.motivo}
            onChange={handleFormChange}
            placeholder="Ej: Consulta de seguimiento, dolor de cabeza, etc."
            sx={{ backgroundColor: 'white', borderRadius: 1 }}
          />

          {/* Estado */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Estado</InputLabel>
            <Select
              name="estado"
              value={formCita.estado}
              onChange={handleFormChange}
              label="Estado"
              sx={{ backgroundColor: 'white', borderRadius: 1 }}
            >
              <MenuItem value="solicitada">Solicitada</MenuItem>
              <MenuItem value="confirmada">Confirmada</MenuItem>
              <MenuItem value="cancelada">Cancelada</MenuItem>
              <MenuItem value="completada">Completada</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCloseModal} color="inherit" variant="outlined" sx={{ borderRadius: 2 }}>
            Cancelar
          </Button>
          {/* Botón de eliminar (solo para admin o médico asignado) */}
          {isEditing && (
            <Button
              color="error"
              onClick={handleOpenConfirmDelete}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                px: 3,
              }}
            >
              Eliminar Cita
            </Button>
          )}


          <Button
            onClick={handleSubmitCita}
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' },
              borderRadius: 2,
              fontWeight: 600,
              px: 4,
              boxShadow: 2,
            }}
          >
            {isEditing ? 'Actualizar Cita' : 'Agendar Cita'}
          </Button>

        </DialogActions>
      </Dialog>

      {/* Modal de confirmación de eliminación */}
      <Dialog
        open={openConfirmDelete}
        onClose={handleCloseConfirmDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#d32f2f', color: 'white' }}>
          ⚠️ Confirmar Eliminación
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography>
            ¿Estás seguro de que deseas eliminar esta cita?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseConfirmDelete} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteCita}
            color="error"
            variant="contained"
            sx={{ fontWeight: 600 }}
          >
            Sí, Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          action={
            <IconButton size="small" color="inherit" onClick={handleCloseSnackbar}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default CalendarioCitas;