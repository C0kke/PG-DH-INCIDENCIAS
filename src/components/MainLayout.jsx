import React, { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import NotificationDropdown from './NotificacionDropdown';
import DetalleIncidenciaModal from './DetalleIncidenciaModal';
import { handleDownloadReporteById } from '../utils/DownloadReporte';
import './styles/MainLayout.css';

const MainLayout = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIncidencia, setSelectedIncidencia] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleOpenIncidenciaDetail = async (incidencia) => {
        try {
            if (typeof incidencia === 'object' && incidencia.id) {
                setSelectedIncidencia(incidencia);
            } else {
                 const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/incidencias/${incidencia}`);
                 setSelectedIncidencia(response.data);
            }
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error al cargar la incidencia para el modal:', error);
        }
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedIncidencia(null); 
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="main-layout">
            <Navbar className="navbar-desktop"/>
            <NotificationDropdown onOpenIncidenciaDetail={handleOpenIncidenciaDetail} />
            <main className="content-area">
                <Outlet context={{ handleOpenIncidenciaDetail }} />
            </main>
            {isMobileMenuOpen && (
            <div className="mobile-navbar-overlay" onClick={toggleMobileMenu}>
                <div className="mobile-navbar" onClick={(e) => e.stopPropagation()}>
                    <Navbar />
                </div>
            </div>
            )}
            <button className="mobile-menu-button" onClick={toggleMobileMenu}>
                ☰
            </button>
            {selectedIncidencia && isModalOpen && (
                <DetalleIncidenciaModal 
                    incidencia={selectedIncidencia} 
                    onClose={handleCloseModal}
                    onDownloadReporte={handleDownloadReporteById}
                />
            )}
        </div>
    );
};

export function useModal() {
    return useOutletContext();
}

export default MainLayout;