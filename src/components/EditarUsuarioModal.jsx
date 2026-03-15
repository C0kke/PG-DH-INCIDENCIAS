import React, { useState, useEffect } from 'react';
import './styles/EditarUsuarioModal.css';

const ROLES_DISPONIBLES = ['administrador', 'gestor', 'reportante', 'lector'];

const EditarUsuarioModal = ({ usuario, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        rol: 'lector',
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImageUrl, setPreviewImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (usuario) {
            setFormData({
                nombre: usuario.nombre || '',
                email: usuario.email || '',
                password: '',
                rol: ROLES_DISPONIBLES.includes(usuario.rol) ? usuario.rol : 'lector',
            });
            setPreviewImageUrl(usuario.foto_perfil || null);
        }
    }, [usuario]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImageUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.nombre.trim() || !formData.email.trim()) {
            setError('El nombre y el correo son obligatorios');
            setLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('El formato del correo no es válido');
            setLoading(false);
            return;
        }

        try {
            const dataToSend = new FormData();
            dataToSend.append('id', usuario.id);
            dataToSend.append('nombre', formData.nombre.trim());
            dataToSend.append('email', formData.email.trim());
            dataToSend.append('rol', formData.rol);

            if (formData.password && formData.password.trim() !== '') {
                if (formData.password.length < 6) {
                    setError('La contraseña debe tener al menos 6 caracteres');
                    setLoading(false);
                    return;
                }
                dataToSend.append('password', formData.password.trim());
            }

            if (selectedFile) {
                dataToSend.append('foto', selectedFile);
            }

            await onUpdate(dataToSend);
            onClose();
        } catch (error) {
            setError('Error al actualizar el usuario');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="modal-container usuario-modal">
                <div className="modal-header">
                    <h2>Editar Usuario</h2>
                    <button className="modal-close-button" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label className="form-label">Foto de perfil</label>
                        <div className="image-uploader">
                            <div className="image-preview">
                                {previewImageUrl ? (
                                    <img src={previewImageUrl} alt="Vista previa" />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="placeholder-icon">
                                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                )}
                            </div>

                            <input
                                type="file"
                                id="foto"
                                accept="image/png, image/jpeg"
                                onChange={handleFileChange}
                                className="file-input"
                            />
                            <label htmlFor="foto" className="file-upload-label">
                                {previewImageUrl ? 'Cambiar foto' : 'Subir foto'}
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="nombre" className="form-label">Nombre</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Nueva Contraseña <span className="field-hint">(opcional)</span>
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Dejar vacío para mantener la actual"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="rol" className="form-label">Rol del Usuario</label>
                        <select
                            id="rol"
                            name="rol"
                            value={formData.rol}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        >
                            {ROLES_DISPONIBLES.map(rol => (
                                <option key={rol} value={rol}>
                                    {rol.charAt(0).toUpperCase() + rol.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="save-button" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditarUsuarioModal;