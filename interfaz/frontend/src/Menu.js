import React from 'react';
import { Link } from 'react-router-dom';

const Menu = () => {
  const rol = localStorage.getItem('rol');

  return (
    <nav>
      <Link to="/dashboard">Inicio</Link>
      {rol === 'medico' && <Link to="/consultas">Consultas</Link>}
      {rol === 'admin' && <Link to="/usuarios">Usuarios</Link>}
      <Link to="/pacientes">Pacientes</Link>
      <Link to="/logout">Cerrar sesión</Link>
    </nav>
  );
};

export default Menu;