import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MainLayout from './components/MainLayout'; 
import Login from './pages/Login';
import Inicio from './pages/Inicio';
import Reporte from './pages/Reporte';
import Tareas from './pages/Tareas';
import ProtectedRoute from './components/ProtectedRoute'; 
import Estadisticas from './pages/Estadisticas';
import Perfil from './pages/Perfil';
import GestionUsuarios from './pages/GestionUsuarios';
import GestionIncidencias from './pages/GestionIncidencias';
import { AuthProvider } from './utils/AuthContext';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Inicio />} />
              <Route path="/inicio" element={<Inicio />} />
              <Route path="/reporte" element={<Reporte />} />
              <Route path="/tareas" element={<Tareas />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/estadisticas" element={<Estadisticas />}/>
              <Route element={<ProtectedRoute allowedRoles={['administrador', 'gestor']} />}>
                <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
                <Route path="/gestion-incidencias" element={<GestionIncidencias />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;