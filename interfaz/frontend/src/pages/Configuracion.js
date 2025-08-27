// components/Login.js
import React from 'react';
import Button from '@mui/material/Button';

export default function Configuracion({ onLogin }) {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Iniciar Sesión</h2>
      <Button variant="contained" color="primary" onClick={onLogin}>
        Ingresar
      </Button>
    </div>
  );
}