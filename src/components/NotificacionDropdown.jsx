import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './styles/NotificacionDropdown.css'; 
import { useAuth } from '../utils/AuthContext';

const NotificacionDropdown = ({ onOpenIncidenciaDetail }) => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const userId = user?.id;
    const navigate = useNavigate();

    const fetchNotifications = useCallback(async () => {
        if (!userId) return;

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/notificaciones/usuario/${userId}`
            );
            
            const sortedNotifications = response.data.sort((a, b) => a.leida - b.leida);
            setNotifications(sortedNotifications);
        } catch (error) {
            console.error("Error al obtener notificaciones:", error);
        }
    }, [userId]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); 
        return () => clearInterval(interval);
    }, [fetchNotifications]);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && event.target.closest('.notification-wrapper') === null) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleNotificationClick = async (notification) => {
        setIsOpen(false); 
        try {
            await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/notificaciones/${notification.id}/leida`
            );

            setNotifications(prev => 
                prev.map(n => n.id === notification.id ? { ...n, leida: 1 } : n)
            );

            if (onOpenIncidenciaDetail) {
                onOpenIncidenciaDetail(notification.incidencia_id);
            } else {
                navigate(`/tareas`);
            }

        } catch (error) {
            console.error("Error al procesar notificación:", error);
        }
    };
    
    const unreadCount = useMemo(() => 
        notifications.filter(n => n.leida === 0).length, 
        [notifications]
    );

    return (
        <div className="notification-wrapper">
            <button 
                className={`notification-icon ${unreadCount > 0 ? 'has-unread' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label="Notificaciones"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9zm-4.72 9.27A3.001 3.001 0 0012 21a3 3 0 00-1.28-2.73" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            
            {isOpen && (
                <div className="notification-dropdown">
                    <div className="dropdown-header">Notificaciones ({unreadCount} nuevas)</div>
                    <div className="dropdown-list">
                        {notifications.length === 0 ? (
                            <div className="empty-state">No tienes notificaciones.</div>
                        ) : (
                            notifications.map(n => (
                                <div 
                                    key={n.id} 
                                    className={`notification-item ${n.leida === 0 ? 'unread' : 'read'}`}
                                    onClick={() => handleNotificationClick(n)}
                                >
                                    <p className="message-text">{n.mensaje}</p>
                                    <span className="timestamp">
                                        {new Date(n.fecha_creacion).toLocaleString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificacionDropdown;