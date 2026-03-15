import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/DetalleIncidenciaModal.css';

const DetalleIncidenciaModal = ({ incidencia, onClose, onDownloadReporte }) => {
    const [responsable, setResponsable] = useState(null);
    const [loadingResponsable, setLoadingResponsable] = useState(true);
    const [errorResponsable, setErrorResponsable] = useState(null);

    useEffect(() => {
        const fetchResponsable = async () => {
            setLoadingResponsable(true);
            setErrorResponsable(null);
            
            const url = `${import.meta.env.VITE_API_BASE_URL}/usuarios/${incidencia.responsable_id}`;
            try {
                const response = await axios.get(url);
                setResponsable(response.data);
            } catch (error) {
                console.error("Error al obtener datos del responsable:", error);
                setErrorResponsable("No se pudo cargar la información del responsable.");
            } finally {
                setLoadingResponsable(false);
            }
        };

        if (incidencia.responsable_id) {
            fetchResponsable();
        } else {
            setLoadingResponsable(false);
            setResponsable({ nombre: "No asignado / Eliminado" });
        }
    }, [incidencia.responsable_id]);

    const getCorrectedLocalTime = (isoDateString) => {
        const date = new Date(isoDateString);
        date.setMinutes(date.getMinutes() - 180);
        
        return date.toLocaleString();
    };

    const handleDownloadClick = () => {
        if (onDownloadReporte && incidencia.id) {
            onDownloadReporte(incidencia.id);
        } else {
            console.warn("La función de descarga no fue proporcionada al modal.");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Incidencia #{incidencia.id}</h2>
                    <button className="modal-close-button" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="detail-section">
                        <h4>Detalles Principales</h4>
                        <p><strong>Área:</strong> {incidencia.area}</p>
                        <p><strong>Estado:</strong> <span className={`status-tag status-${incidencia.estado.replace(' ', '-').toLowerCase()}`}>{incidencia.estado}</span></p>
                        <p><strong>Prioridad:</strong> <span className={`priority-tag tag-${incidencia.prioridad}`}>{incidencia.prioridad.toUpperCase()}</span></p>
                        <p><strong>Fecha de Creación: </strong>{getCorrectedLocalTime(incidencia.fecha_creacion)}</p>
                    </div>

                    <div className="detail-section">
                        <h4>Descripción Completa</h4>
                        <p>{incidencia.descripcion}</p>
                    </div>

                    <div className="detail-section user-section">
                        <h4>Responsable Asignado</h4>
                        {loadingResponsable ? (
                            <p>Cargando responsable...</p>
                        ) : errorResponsable ? (
                            <p className="error">{errorResponsable}</p>
                        ) : (
                            responsable && (
                                <>
                                    <p><strong>Nombre:</strong> {responsable.nombre || 'N/A'}</p>
                                    <p><strong>Email:</strong> {responsable.email || 'N/A'}</p>
                                </>
                            )
                        )}
                    </div>
                    
                    {incidencia.url_foto && (
                        <div className="detail-section photo-section">
                            <h4>Evidencia Fotográfica</h4>
                            <img src={incidencia.url_foto} alt={`Evidencia de la incidencia ${incidencia.id}`} className="incidencia-photo" />
                        </div>
                    )}

                    <button 
                        onClick={handleDownloadClick} 
                        className="modal-download-button"
                        style={{
                            marginTop: '20px', 
                            padding: '10px 15px', 
                            backgroundColor: '#28a745', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '5px', 
                            cursor: 'pointer', 
                            fontWeight: 'bold'
                        }}
                    >
                        Descargar Informe Word
                    </button>

                </div>
            </div>
        </div>
    );
};

export default DetalleIncidenciaModal;