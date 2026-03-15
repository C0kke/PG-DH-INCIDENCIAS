import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const ProtectedRoute = ({ allowedRoles, isLoginRoute }) => {
    const { user } = useAuth();
    const isLoggedIn = !!user;
    const userRole = user ? user.rol : null;

    if (isLoginRoute) {
        if (isLoggedIn) {
            return <Navigate to="/inicio" replace />;
        }
        return <Outlet />; 
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/inicio" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;