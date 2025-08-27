// components/TratamientoModal.js
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';

const TratamientoModal = ({
  open,
  onClose,
  data,
  handleChange,
  handleSubmit,
  isMobile = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle
        sx={{
          backgroundColor: 'secondary.main',
          color: 'white',
          fontSize: isMobile ? '1.25rem' : '1.5rem',
        }}
      >
        Agregar Tratamiento e Indicaciones
      </DialogTitle>
      <DialogContent sx={{ px: isMobile ? 1.5 : 3 }}>
        <TextField
          margin="normal"
          name="descripcion"
          label="Tratamiento / Medicamento"
          multiline
          rows={isMobile ? 3 : 4}
          fullWidth
          value={data.descripcion}
          onChange={handleChange}
          autoFocus
          variant="outlined"
          helperText="Ej: Omeprazol 500 mg, Acetaminofén 500 mg, etc. (Usa Enter para saltos de línea)"
          sx={{
            '& .MuiInputBase-root': {
              fontSize: isMobile ? '0.875rem' : '1rem',
            },
            '& .MuiInputLabel-root': {
              fontSize: isMobile ? '0.875rem' : '1rem',
            },
            '& .MuiFormHelperText-root': {
              fontSize: isMobile ? '0.7rem' : '0.75rem',
            },
          }}
        />
        <TextField
          margin="normal"
          name="indicaciones"
          label="Indicaciones"
          multiline
          rows={isMobile ? 3 : 4}
          fullWidth
          value={data.indicaciones || ''}
          onChange={handleChange}
          variant="outlined"
          helperText="Ej: Tomar 1 tableta cada 8 horas, En ayunas, etc. (Usa Enter para saltos de línea)"
          sx={{
            '& .MuiInputBase-root': {
              fontSize: isMobile ? '0.875rem' : '1rem',
            },
            '& .MuiInputLabel-root': {
              fontSize: isMobile ? '0.875rem' : '1rem',
            },
            '& .MuiFormHelperText-root': {
              fontSize: isMobile ? '0.7rem' : '0.75rem',
            },
          }}
        />
        <TextField
          margin="normal"
          name="duracion_dias"
          label="Duración (días)"
          type="number"
          fullWidth
          value={data.duracion_dias || ''}
          onChange={handleChange}
          variant="outlined"
          sx={{
            '& .MuiInputBase-root': {
              fontSize: isMobile ? '0.875rem' : '1rem',
            },
            '& .MuiInputLabel-root': {
              fontSize: isMobile ? '0.875rem' : '1rem',
            },
          }}
        />
        <TextField
          margin="normal"
          name="fecha_inicio"
          label="Fecha de inicio"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={data.fecha_inicio}
          onChange={handleChange}
          variant="outlined"
          sx={{
            '& .MuiInputBase-root': {
              fontSize: isMobile ? '0.875rem' : '1rem',
            },
            '& .MuiInputLabel-root': {
              fontSize: isMobile ? '0.875rem' : '1rem',
            },
          }}
        />
        <input type="hidden" name="diagnostico" value={data.diagnostico} />
      </DialogContent>
      <DialogActions sx={{ p: isMobile ? 1.5 : 2 }}>
        <Button onClick={onClose} color="error" size={isMobile ? 'small' : 'medium'}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="secondary"
          disabled={!data.descripcion.trim()}
          size={isMobile ? 'small' : 'medium'}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TratamientoModal;