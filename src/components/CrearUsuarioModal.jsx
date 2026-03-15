import React, { useState } from 'react';
import './styles/CrearUsuarioModal.css';

const ROLES_DISPONIBLES = ['administrador', 'gestor', 'reportante', 'lector'];

const CrearUsuarioModal = ({ onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        rol: 'lector'
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImageUrl, setPreviewImageUrl] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

    const handleCancel = () => {
        setFormData({
            nombre: '',
            email: '',
            password: '',
            rol: 'lector'
        });
        setSelectedFile(null);
        setPreviewImageUrl(null);

        setError('');
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.nombre.trim()) {
            setError('El nombre es obligatorio');
            setLoading(false);
            return;
        }

        if (!formData.email.trim()) {
            setError('El email es obligatorio');
            setLoading(false);
            return;
        }

        if (!formData.password || !formData.password.trim()) {
            setError('La contraseña es obligatoria');
            setLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('El formato del email no es válido');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setLoading(false);
            return;
        }

        try {
            const dataToSubmit = new FormData();
            
            dataToSubmit.append('nombre', formData.nombre.trim());
            dataToSubmit.append('email', formData.email.trim());
            dataToSubmit.append('password', formData.password.trim());
            dataToSubmit.append('rol', formData.rol);

            if (selectedFile) {
                dataToSubmit.append('foto', selectedFile);
            }
            
            await onCreate(dataToSubmit);
            handleCancel();
        } catch (error) {
            setError('Error al crear el usuario');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleCancel();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>            
            <div className="modal-container crear-usuario-modal">
                <div className="modal-header">
                    <h2>Crear Nuevo Usuario</h2>
                    <button className="modal-close-button" onClick={handleCancel}>
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    
                    <div className="form-group">
                        <label className="form-label">
                            Foto de perfil (opcional)
                        </label>
                        
                        <div className="image-uploader">
                            
                            <div className="image-preview">
                                {previewImageUrl ? (
                                    <img src={previewImageUrl} alt="Vista previa de perfil" />
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
                        <label htmlFor="nombre" className="form-label">
                            Nombre <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Ingresa el nombre completo"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email <span className="required">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="usuario@ejemplo.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Contraseña <span className="required">*</span>
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Mínimo 6 caracteres"
                            required
                        />
                        <div className="password-hint">
                            Mínimo 6 caracteres
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="rol" className="form-label">
                            Rol del Usuario <span className="required">*</span>
                        </label>
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

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="modal-actions">
                        <button 
                            type="button" 
                            className="cancel-button"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="create-button"
                            disabled={loading}
                        >
                            {loading ? 'Creando...' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearUsuarioModal;