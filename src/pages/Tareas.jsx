import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import './styles/Tareas.css';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAuth } from "../utils/AuthContext";
import { hasPermission } from "../utils/Permissions";
import { useModal } from "../components/MainLayout";

const ESTADOS = {
    PENDIENTE: 'Pendiente',
    EN_CURSO: 'En curso',
    RESUELTO: 'Resuelto',
};
const ESTADO_KEYS = Object.values(ESTADOS);

const TarjetaIncidencia = ({ incidencia, onSelect, index }) => {
    const [usuario, setUsuario] = useState(null);
    const getPriorityClass = (prioridad) => `priority-tag tag-${prioridad}`; 

    useEffect(() => {
        if (!incidencia.responsable_id) return;
        const fetchUsuario = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/usuarios/${incidencia.responsable_id}`);
                setUsuario(response.data);
            } catch (error) {
                console.error('Error al obtener el usuario:', error);
            }
        };
        fetchUsuario();
    }, [incidencia.responsable_id]);

    return (
        <Draggable draggableId={String(incidencia.id)} index={index}>
            {(provided, snapshot) => (
                <div 
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`incidencia-card card-priority-${incidencia.prioridad} ${snapshot.isDragging ? 'is-dragging' : ''}`}
                    onClick={() => onSelect(incidencia)}
                >
                    <div className="card-header">
                        <span className="incidencia-id">#{incidencia.id}</span>
                        <span className={getPriorityClass(incidencia.prioridad)}>
                            {incidencia.prioridad.toUpperCase()}
                        </span>
                    </div>
                    <p className="incidencia-area">Área: {incidencia.area}</p>
                    <p className="incidencia-area">Tipo: {incidencia.modulo}</p>
                    <p className="incidencia-detail">{incidencia.descripcion.substring(0, 70)}...</p>
                    <div className="card-footer">
                        <span className="responsable">Resp: {usuario ? usuario.nombre : 'Cargando...'}</span>
                        <span className="fecha">Creada: {new Date(incidencia.fecha_creacion).toLocaleDateString()}</span>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

const ColumnaTareas = ({ droppableId, titulo, tareas, onSelectIncidencia }) => {
    return (
        <Droppable droppableId={droppableId}>
            {(provided) => (
                <div 
                    className="kanban-column"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                >
                    <h2 className="column-title">{titulo} <span className="task-count">({tareas.length})</span></h2>
                    <div className="task-list">
                        {tareas.map((incidencia, index) => (
                            <TarjetaIncidencia 
                                key={incidencia.id} 
                                incidencia={incidencia} 
                                onSelect={onSelectIncidencia}
                                index={index}
                            />
                        ))}
                        {provided.placeholder}
                        {tareas.length === 0 && (<p className="no-tasks">No hay tareas aquí.</p>)}
                    </div>
                </div>
            )}
        </Droppable>
    );
};

const Tareas = () => {
    const { user } = useAuth();
    const { handleOpenIncidenciaDetail } = useModal(); 
    const [incidencias, setIncidencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchIncidencias = async () => {
            if (!user) return;

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/incidencias`);
                const todasLasIncidencias = response.data;

                // Filter incidents based on user role permissions
                const canViewAll = hasPermission(user.rol, 'puedeVerTodasLasIncidencias');
                const incidenciasFiltradas = canViewAll
                    ? todasLasIncidencias // Admins, Gestores, and Lectores see all
                    : todasLasIncidencias.filter(inc => inc.responsable_id === user.id); // Reportadores see only their own
                
                setIncidencias(incidenciasFiltradas);
                setError(null);
            } catch (err) {
                console.error("Error al obtener incidencias:", err);
                setError("Error al cargar las tareas.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchIncidencias();
    }, [user]);
    
    const tareasAgrupadas = useMemo(() => {
        const grupos = ESTADO_KEYS.reduce((acc, key) => ({ ...acc, [key]: [] }), {});
        incidencias.forEach(incidencia => {
            if (grupos[incidencia.estado]) {
                grupos[incidencia.estado].push(incidencia);
            }
        });
        return grupos;
    }, [incidencias]);
    
    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;

        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
            return;
        }

        // Check if user has permission to change status
        if (!hasPermission(user.rol, 'puedeCambiarEstadoIncidencia')) {
            alert("No tienes permiso para cambiar el estado de una incidencia.");
            return; // Do not update state or call backend
        }

        const incidenciaId = parseInt(draggableId);
        const nuevoEstado = destination.droppableId;
        
        const nuevasIncidencias = incidencias.map(i => 
            i.id === incidenciaId ? { ...i, estado: nuevoEstado } : i
        );
        setIncidencias(nuevasIncidencias);

        try {
            await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/incidencias/${incidenciaId}/estado`,
                { estado: nuevoEstado }
            );
        } catch (error) {
            console.error('Error al actualizar el estado en el backend:', error);
            setIncidencias(incidencias);
            alert('Error al guardar el cambio.');
        }
    };

    if (error) return <div className="error-state">{error}</div>;

    return (
        <>
            {loading && (<div className="loading-state">Cargando tablero...</div>)}
            
            <div className="tasks-container">
                <h1 className="board-title">Tablero de Seguimiento de Incidencias</h1>
                <p className="board-subtitle">Arrastra y suelta las tarjetas para cambiar el estado de la tarea.</p>
                
                <DragDropContext onDragEnd={onDragEnd} isDragDisabled={!hasPermission(user.rol, 'puedeCambiarEstadoIncidencia')}>
                    <div className="kanban-board">
                        {ESTADO_KEYS.map(estado => (
                            <ColumnaTareas
                                key={estado}
                                droppableId={estado}
                                titulo={estado}
                                tareas={tareasAgrupadas[estado] || []}
                                onSelectIncidencia={handleOpenIncidenciaDetail}
                            />
                        ))}
                    </div>
                </DragDropContext>
            </div>
        </>
    );
};

export default Tareas;