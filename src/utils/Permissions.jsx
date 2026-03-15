export const ROLES = {
    ADMIN: 'administrador',
    GESTOR: 'gestor',
    REPORTANTE: 'reportante',
    LECTOR: 'lector',
};

export const PERMISSIONS = {
    // Administrador tiene todos los permisos
    [ROLES.ADMIN]: {
        puedeGestionarUsuarios: true,
        puedeVerTodasLasIncidencias: true,
        puedeEditarIncidencias: true,
        puedeCrearIncidencias: true,
        puedeCambiarEstadoIncidencia: true,
        puedeEliminarIncidencias: true,
        puedeVerEstadisticas: true,
    },
    // Gestor es un administrador que no puede eliminar incidencias, mas si todo lo demás
    [ROLES.GESTOR]: {
        puedeGestionarUsuarios: true,
        puedeVerTodasLasIncidencias: true,
        puedeEditarIncidencias: true,
        puedeCrearIncidencias: true,
        puedeCambiarEstadoIncidencia: true,
        puedeEliminarIncidencias: false,
        puedeVerEstadisticas: true,
    },
    // Reportante es un lector que puede reportar incidentes. De momento se le asigna a él la tarea que reporta
    [ROLES.REPORTANTE]: {
        puedeGestionarUsuarios: false,
        puedeVerTodasLasIncidencias: false,
        puedeEditarIncidencias: false,
        puedeCrearIncidencias: true,
        puedeCambiarEstadoIncidencia: false,
        puedeEliminarIncidencias: false,
        puedeVerEstadisticas: false,
    },
    // Lector solo puede gestionar su perfil y ver tareas asignadas a él
    [ROLES.LECTOR]: { 
        puedeGestionarUsuarios: false,
        puedeVerTodasLasIncidencias: false,
        puedeEditarIncidencias: false,
        puedeCrearIncidencias: false,
        puedeCambiarEstadoIncidencia: false,
        puedeEliminarIncidencias: false,
        puedeVerEstadisticas: false,
    }
};

export const hasPermission = (userRole, permissionKey) => {
    if (!userRole || !PERMISSIONS[userRole]) {
        return false;
    }
    return !!PERMISSIONS[userRole][permissionKey];
};
