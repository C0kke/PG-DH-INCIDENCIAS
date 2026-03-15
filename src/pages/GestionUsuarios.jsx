import React, { useEffect, useState } from "react";
import './styles/GestionUsuarios.css';
import axios from "axios";
import EditarUsuarioModal from "../components/EditarUsuarioModal";
import CrearUsuarioModal from "../components/CrearUsuarioModal";
import { useAuth } from "../utils/AuthContext";
import { hasPermission } from "../utils/Permissions";
import { Navigate } from "react-router-dom";

const GestionUsuarios = () => {
    const { user } = useAuth();
    const defaultSvg = <svg className="profile-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [sortField, setSortField] = useState('nombre');
    const [sortDirection, setSortDirection] = useState('asc');
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        if (!user || !hasPermission(user.rol, 'puedeGestionarUsuarios')) {
            setLoading(false);
            return;
        }
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/usuarios`);
            setUsuarios(response.data);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            setMensaje('Error al cargar los usuarios. Consulta la consola.');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field) => {
        setSortDirection(prevDirection => (sortField === field && prevDirection === 'asc' ? 'desc' : 'asc'));
        setSortField(field);
    };

    const sortedUsuarios = [...usuarios].sort((a, b) => {
        const aValue = a[sortField]?.toString().toLowerCase() || '';
        const bValue = b[sortField]?.toString().toLowerCase() || '';
        
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

    const handleOpenCreateModal = () => setIsCreateModalOpen(true);
    const handleCloseCreateModal = () => setIsCreateModalOpen(false);

    const handleOpenEditModal = (usuario) => {
        setSelectedUsuario(usuario);
        setIsEditModalOpen(true);
    };
    
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedUsuario(null);
    };

    const handleUpdateUsuario = async (updatedUsuario) => {
        let userId;
        
        if (updatedUsuario instanceof FormData) {
            userId = updatedUsuario.get("id");
        } else {
            userId = updatedUsuario.id;
        }

        try {
            await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/usuarios/${userId}`,
                updatedUsuario,
                updatedUsuario instanceof FormData
                    ? { headers: { "Content-Type": "multipart/form-data" } }
                    : { headers: { "Content-Type": "application/json" } }
            );
            setMensaje('Usuario actualizado correctamente');
            handleCloseEditModal();
            fetchUsuarios();
            setTimeout(() => setMensaje(''), 3000);
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            setMensaje('Error al actualizar el usuario.');
        }
    };

    const handleCreateUsuario = async (newUsuario) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/usuarios`, newUsuario);
            setMensaje('Usuario creado correctamente');
            handleCloseCreateModal();
            fetchUsuarios();
            setTimeout(() => setMensaje(''), 3000);
        } catch (error) {
            console.error("Error al crear usuario:", error);
            if (error.response?.status === 409) {
                setMensaje('Error: Ya existe un usuario con ese email.');
            } else {
                setMensaje('Error al crear el usuario.');
            }
        }
    };

    const handleActivarUsuario = async (id) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/usuarios/activar/${id}`);
            setMensaje("Usuario activado correctamente");
            fetchUsuarios();
            setTimeout(() => setMensaje(""), 3000);
        } catch (error) {
            console.error("Error al activar usuario:", error);
            setMensaje("Error al activar el usuario.");
        }
    };

    const handleDesactivarUsuario = async (id) => {
        if (!window.confirm("¿Seguro que deseas desactivar esta cuenta?")) return;
        try {
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/usuarios/desactivar/${id}`);
            setMensaje("Usuario desactivado correctamente");
            fetchUsuarios();
            setTimeout(() => setMensaje(""), 3000);
        } catch (error) {
            console.error("Error al desactivar usuario:", error);
            setMensaje("Error al desactivar el usuario.");
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return '';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    const getRoleBadge = (rol) => {
        const roleClasses = {
            'administrador': 'admin-badge',
            'gestor' : 'manager-badge',
            'reportador' : 'reporter-badge',
            'lector': 'lector-badge'
        };
        return roleClasses[rol] || 'lector-badge';
    };

    if (!user || !hasPermission(user.rol, 'puedeGestionarUsuarios')) {
        return <Navigate to="/tareas" replace />;
    }

    return (
        <>
            <div className="usuarios-container">
                <div className="usuarios-header">
                    <div className="header-text">
                        <h1 className="usuarios-title">Gestión de Usuarios</h1>
                        <p className="usuarios-subtitle">
                            Administra los usuarios del sistema. Usa los botones para editar o eliminar datos.
                        </p>
                    </div>
                </div>

                {mensaje && (
                    <div className={`message-box ${mensaje.includes('Error') ? 'error' : 'success'}`}>
                        {mensaje}
                    </div>
                )}

                {loading ? (
                    <div className="loading-container">
                        <p>Cargando usuarios...</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="usuarios-table">
                            <thead>
                                <tr>
                                    <th className="sortable-header" onClick={() => handleSort('nombre')}>
                                        Nombre {getSortIcon('nombre')}
                                    </th>
                                    <th className="sortable-header" onClick={() => handleSort('foto_perfil')}>
                                        Foto de Perfil {getSortIcon('foto_perfil')}
                                    </th>
                                    <th className="sortable-header" onClick={() => handleSort('email')}>
                                        Email {getSortIcon('email')}
                                    </th>
                                    <th className="sortable-header" onClick={() => handleSort('rol')}>
                                        Rol {getSortIcon('rol')}
                                    </th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedUsuarios.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="no-data">
                                            No hay usuarios registrados
                                        </td>
                                    </tr>
                                ) : (
                                    sortedUsuarios.map((usuario) => (
                                        <tr key={usuario.id} className="usuario-row">
                                            <td className="usuario-nombre">{usuario.nombre}</td>
                                            <td className="usuario_foto">
                                                {usuario.foto_perfil ? (
                                                    <img src={usuario.foto_perfil} alt={`Foto de ${usuario.nombre}`} />
                                                ) : (
                                                    defaultSvg
                                                )}
                                            </td>
                                            <td className="usuario-email">{usuario.email}</td>
                                            <td>
                                                <span className={`role-badge ${getRoleBadge(usuario.rol)}`}>
                                                    {usuario.rol}
                                                </span>
                                            </td>
                                            <td className="actions-container">
                                                <button 
                                                    className="edit-button action-button"
                                                    onClick={() => handleOpenEditModal(usuario)}
                                                >
                                                    Editar
                                                </button>
                                                {usuario.estado === 'inactivo' ? (
                                                    <button 
                                                        className="activate-button action-button"
                                                        onClick={() => handleActivarUsuario(usuario.id)}
                                                    >
                                                        Activar
                                                    </button>
                                                ) : (
                                                    <button 
                                                        className="deactivate-button action-button"
                                                        onClick={() => handleDesactivarUsuario(usuario.id)}
                                                    >
                                                        Desactivar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="table-footer">
                    <button className="create-user-button" onClick={handleOpenCreateModal}>
                        <span className="button-icon">+</span>
                        Nuevo Usuario
                    </button>
                </div>
            </div>

            {isEditModalOpen && (
                <EditarUsuarioModal 
                    usuario={selectedUsuario} 
                    onClose={handleCloseEditModal}
                    onUpdate={handleUpdateUsuario}
                />
            )}

            {isCreateModalOpen && (
                <CrearUsuarioModal 
                    onClose={handleCloseCreateModal}
                    onCreate={handleCreateUsuario}
                />
            )}
        </>
    );
};

export default GestionUsuarios;