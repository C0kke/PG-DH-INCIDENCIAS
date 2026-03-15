import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from '../utils/AuthContext';
import { hasPermission } from "../utils/Permissions";
import './styles/Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    
    const handleLogout = () => {
        logout(); 
    }   

    // Si no hay usuario, no mostramos nada (o un estado de carga/vacío)
    if (!user) {
        return null;
    }

    return (
        <nav className="sidebar-nav">
            <div className="nav-menu">
                <Link to="/inicio" className="nav-button">Inicio</Link>
                {hasPermission(user.rol, 'puedeCrearIncidencias') && (
                    <Link to="/reporte" className="nav-button">Reportar Incidente</Link>
                )}
                <Link to="/tareas" className="nav-button">Ver Tareas</Link>
                <Link to="/perfil" className="nav-button">Gestionar Perfil</Link>
                {hasPermission(user.rol, 'puedeVerEstadisticas') && (
                    <Link to="/estadisticas" className="nav-button">Ver Estadísticas</Link>
                )}
                {hasPermission(user.rol, 'puedeGestionarUsuarios') && (
                    <>
                        <Link to="/gestion-usuarios" className="nav-button">Gestionar Usuarios</Link>
                        <Link to="/gestion-incidencias" className="nav-button">Gestionar Incidencias</Link>
                    </>
                )}
            </div>

            <div className="nav-footer">
                <button className="nav-button logout-button" onClick={handleLogout}>
                    Cerrar Sesión
                </button>
            </div>
        </nav>
    );
};

export default Navbar;