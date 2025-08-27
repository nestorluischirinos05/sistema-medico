// components/SubirArchivo.js
import React from 'react';
import {
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const SubirArchivo = ({ onFileSelect }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      onFileSelect(file);
    } else {
      alert('Por favor, sube un archivo PDF o imagen (JPG, PNG).');
    }
  };

  return (
    <Box sx={{ mt: 2, mb: 1 }}>
      <input
        accept="application/pdf, image/*"
        style={{ display: 'none' }}
        id="upload-file"
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="upload-file">
        <Button
          component="span"
          startIcon={<CloudUploadIcon />}
          variant="outlined"
          fullWidth
        >
          Subir archivo (PDF o imagen)
        </Button>
      </label>
      {false && <Alert severity="info" sx={{ mt: 1 }}>Ningún archivo seleccionado</Alert>}
    </Box>
  );
};

export default SubirArchivo;