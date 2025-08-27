// components/DiagnosticoModal.js
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';

const DiagnosticoModal = ({
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
          backgroundColor: 'primary.main',
          color: 'white',
          fontSize: isMobile ? '1.25rem' : '1.5rem',
        }}
      >
        Registrar Diagnóstico
      </DialogTitle>
      <DialogContent
        sx={{
          pt: 2,
          px: isMobile ? 1.5 : 3,
        }}
      >
        <TextField
          margin="normal"
          name="descripcion"
          label="Descripción del diagnóstico"
          multiline
          rows={isMobile ? 3 : 4}
          fullWidth
          value={data.descripcion}
          onChange={handleChange}
          autoFocus
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
      </DialogContent>
      <DialogActions sx={{ p: isMobile ? 1.5 : 2 }}>
        <Button onClick={onClose} color="error" size={isMobile ? 'small' : 'medium'}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!data.descripcion.trim()}
          size={isMobile ? 'small' : 'medium'}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DiagnosticoModal;