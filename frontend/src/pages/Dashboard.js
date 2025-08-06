// pages/Consultas.js
import React from 'react';
import {
    Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {

  const navigate = useNavigate();
  return <div>Bienvenido a Consultas
    {/* En Dashboard.js si userType === 'paciente' */}
<Button 
  variant="contained" 
  color="primary" 
  onClick={() => navigate('/paciente/agendar-consulta')}
  sx={{ mt: 2 }}
>
  Agendar Nueva Consulta
</Button>
  </div>;

}