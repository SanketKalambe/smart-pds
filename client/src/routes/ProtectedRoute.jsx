import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token } = useSelector((state) => state.auth);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate workspace home
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'distributor') return <Navigate to="/distributor" replace />;
    return <Navigate to="/consumer" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
