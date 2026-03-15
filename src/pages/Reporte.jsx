import React, { useEffect, useState } from "react";
import './styles/Reporte.css';
import axios from "axios";
import { useAuth } from "../utils/AuthContext";
import { hasPermission } from "../utils/Permissions";
import { downloadFileFromResponse } from "../utils/DownloadReporte";
import { Navigate } from "react-router-dom";

const areas = ["Pasillo industrial 3", "Planta eléctrica"];
const modulos = ["Eléctrica", "Mecánica", "Civil", "Estructural"];
const PRIORITIES = [
    { id: 'baja', label: 'Baja' },
    { id: 'media', label: 'Media' },
    { id: 'alta', label: 'Alta' },
];

const Reporte = () => {
    const { user } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [area, setArea] = useState(areas[0]);
    const [modulo, setModulo] = useState(modulos[0]);
    const [detalle, setDetalle] = useState('');
    const [hora, setHora] = useState(() => {
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset() * 60000;
        const localISOTime = new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16);
        return localISOTime;
    });
    const [prioridad, setPrioridad] = useState(PRIORITIES[0].id);
    const [responsable, setResponsable] = useState('');
    const [foto, setFoto] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState('');

    const canAssignUser = user && (user.rol === 'administrador' || user.rol === 'gestor');

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/usuarios`);
                const activeUsers = response.data.filter(u => u.estado === 'activo');
                setUsuarios(activeUsers);
                if (activeUsers.length > 0) {
                    setResponsable(activeUsers[0].id);
                }
            } catch (error) {
                console.error("Error al obtener usuarios: " + error);
                setMensaje("Error al cargar la lista de usuarios.");
            }
        };

        if (canAssignUser) {
            fetchUsuarios();
        } else if (user) {
            setResponsable(user.id);
        }
    }, [user, canAssignUser]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            const now = new Date();
            const timezoneOffset = now.getTimezoneOffset() * 60000;
            const localISOTime = new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16);
            setHora(localISOTime);
        }, 350000);

        return () => clearInterval(intervalId);
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFoto(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleResetInputs = () => {
        setArea(areas[0]);
        setModulo(modulos[0]);
        setDetalle('');
        setPrioridad(PRIORITIES[0].id);
        if (canAssignUser) {
            setResponsable(usuarios.length > 0 ? usuarios[0].id : '');
        } else if (user) {
            setResponsable(user.id);
        }
        setFoto(null);
        setPreviewUrl(null);
    };

    const prepareFormData = () => {
        const formData = new FormData();
        formData.append('area', area);
        formData.append('modulo', modulo);
        formData.append('detalle', detalle);
        formData.append('hora', hora);
        formData.append('prioridad', prioridad);
        formData.append('responsable_id', canAssignUser ? responsable : user.id);
        if (foto) formData.append('foto', foto);
        return formData;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensaje('');
        try {
            const formData = prepareFormData();
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/incidencias`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMensaje('¡Reporte generado correctamente!');
            handleResetInputs();
        } catch (error) {
            console.error(error);
            setMensaje('Error: No se pudo registrar la incidencia.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAndDownload = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensaje('');
        try {
            const formData = prepareFormData();
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/incidencias/registrar-y-descargar`, {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                await downloadFileFromResponse(response, 'reporte_incidencia.docx');
                setMensaje('¡Incidencia registrada y reporte descargado!');
                handleResetInputs();
            } else {
                const errorText = await response.text();
                throw new Error(errorText || "Error en el servidor.");
            }
        } catch (error) {
            console.error(error);
            setMensaje(`Error: ${error.message || 'No se pudo completar la operación.'}`);
        } finally {
            setLoading(false);
        }
    };

    if (!user || !hasPermission(user.rol, 'puedeCrearIncidencias')) {
        return <Navigate to="/tareas" replace />;
    }

    return (
        <div className="report-container">
            <h1 className="report-title">Reporte de Incidencias</h1>
            <p className="report-subtitle">Utiliza este formulario para registrar un nuevo incidente en la planta.</p>

            <form className="form-card form-reporte" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Área de la Incidencia</label>
                    <select className="form-input" value={area} onChange={(e) => setArea(e.target.value)} required>
                        {areas.map((a) => (<option key={a} value={a}>{a}</option>))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Tipo de la Incidencia</label>
                    <select className="form-input" value={modulo} onChange={(e) => setModulo(e.target.value)} required>
                        {modulos.map((m) => (<option key={m} value={m}>{m}</option>))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Detalle de la Incidencia</label>
                    <textarea placeholder="Describe el incidente (qué pasó, dónde, cuándo)." className="form-input textarea" value={detalle} onChange={(e) => setDetalle(e.target.value)} rows="4" required></textarea>
                </div>

                <div className="form-group">
                    <label className="form-label">Hora de la Incidencia</label>
                    <input type="datetime-local" className="form-input" value={hora} onChange={(e) => setHora(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label className="form-label">Prioridad</label>
                    <div className="priority-selector">
                        {PRIORITIES.map(p => (
                            <div key={p.id} className="radio-group">
                                <input id={`prioridad-${p.id}`} type="radio" name="prioridad" value={p.id} checked={prioridad === p.id} onChange={() => setPrioridad(p.id)} className="radio-input" />
                                <label htmlFor={`prioridad-${p.id}`} className={`radio-label priority-${p.id}`}>{p.label}</label>
                            </div>
                        ))}
                    </div>
                </div>

                {canAssignUser && (
                    <div className="form-group">
                        <label className="form-label">Responsable</label>
                        <select className="form-input" value={responsable} onChange={(e) => setResponsable(e.target.value)} required>
                            <option value="" disabled>{usuarios.length > 0 ? "Selecciona un usuario..." : "Cargando..."}</option>
                            {usuarios.map((usuario) => (<option key={usuario.id} value={usuario.id}>{usuario.nombre}</option>))}
                        </select>
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">Foto de la Incidencia (opcional)</label>
                    <div className="image-uploader">
                        <div className="image-preview">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Vista previa de incidencia" />
                            ) : (
                                <svg fill="#000000" height="200px" width="200px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 297 297" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M286.837,101.407h-33.58l-98.774-71.912c-3.565-2.594-8.397-2.596-11.965,0l-98.774,71.912h-33.58 C4.551,101.407,0,105.955,0,111.571v147.719c0,5.611,4.551,10.162,10.163,10.162h276.674c5.612,0,10.163-4.551,10.163-10.162 V111.571C297,105.955,292.449,101.407,286.837,101.407z M148.5,50.284l70.221,51.123H78.279L148.5,50.284z M276.673,121.735v67.074 c-8.491-2.988-20.256-6.449-34.276-8.789c-0.358-0.061-0.714-0.111-1.069-0.17c-2.768-23.344-22.654-41.514-46.715-41.514 c-25.943,0-47.051,21.125-47.051,47.09c0,1.199,0.221,2.348,0.601,3.416c-4.567,1.783-9.05,3.768-13.436,5.963 c-54.138,27.098-97.997,22.705-114.398,19.549v-92.619H276.673z M220.172,177.596c-17.945-0.924-35.461,0.734-52.12,4.904 c1.459-13.385,12.813-23.836,26.561-23.836C206.63,158.664,216.817,166.649,220.172,177.596z M20.327,249.123v-14.061 c6.733,1.123,15.799,2.121,26.788,2.121c24.366,0,58.15-4.9,96.708-24.201c28.442-14.236,60.259-18.617,94.568-13.021 c17.389,2.836,31.067,7.664,38.281,10.578v38.584H20.327z"></path> </g></svg>
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
                            {previewUrl ? 'Cambiar foto' : 'Subir foto'}
                        </label>
                    </div>
                </div>

                {mensaje && (
                    <p className={`message-box ${mensaje.includes('Error') ? 'error' : 'success'}`}>{mensaje}</p>
                )}

                <div className="button-group">
                    <button type="button" onClick={handleGenerateAndDownload} className="form-button secondary-button" disabled={loading}>
                        {loading ? 'Generando...' : 'Generar y Descargar Reporte'}
                    </button>
                    <button type="submit" className="form-button primary-button" disabled={loading}>
                        {loading ? 'Enviando...' : 'Registrar Incidencia'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Reporte;