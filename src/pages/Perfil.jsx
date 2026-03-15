import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/Perfil.css';
import { useAuth } from '../utils/AuthContext';
import EditarUsuarioModal from '../components/EditarUsuarioModal';

const Perfil = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');

    const handleUpdatePerfil = async (formData) => {
        try {
            const userId = formData instanceof FormData ? formData.get("id") : formData.id;
            await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/usuarios/${userId}`,
                formData,
                formData instanceof FormData
                    ? { headers: { "Content-Type": "multipart/form-data" } }
                    : { headers: { "Content-Type": "application/json" } }
            );

            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/usuarios/${userId}`);
            const updatedUser = response.data;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setMessage("Perfil actualizado correctamente");
            setIsEditing(false);
            setTimeout(() => setMessage(""), 2500);
        } catch (error) {
            console.error("Error al actualizar perfil:", error);
            setMessage("Error al actualizar el perfil.");
        }
    };

    if (!user) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Cargando perfil...</p>
            </div>
        );
    }

    return (
        <>
            <div className="profile-container">
                <div className="profile-header">
                    <h1 className="profile-title">   
                    <div className="profile-picture">
                        {user.foto_perfil ? (
                            <img src={user.foto_perfil} alt={`Foto de ${user.nombre}`} className="profile-avatar" />
                        ) : (
                            <svg className="profile-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>
                        Mi Perfil
                    </h1>
                    <button onClick={() => setIsEditing(true)} className="btn-edit">
                        <svg className="edit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar Perfil
                    </button>
                </div>

                {message && (
                    <div className={`message-box ${message.includes('Error') ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}

                <div className="profile-details-grid">
                    <div className="info-group">
                        <p className="info-label">Nombre</p>
                        <p className="info-value">{user.nombre}</p>
                    </div>
                    <div className="info-group">
                        <p className="info-label">Correo Electrónico</p>
                        <p className="info-value">{user.email}</p>
                    </div>
                    <div className="info-group">
                        <p className="info-label">Rol</p>
                        <span className={`role-badge role-${user.rol}`}>{user.rol}</span>
                    </div>
                </div>
            </div>

            {isEditing && (
                <EditarUsuarioModal
                    usuario={user}
                    onClose={() => setIsEditing(false)}
                    onUpdate={handleUpdatePerfil}
                />
            )}
        </>
    );
};

export default Perfil;