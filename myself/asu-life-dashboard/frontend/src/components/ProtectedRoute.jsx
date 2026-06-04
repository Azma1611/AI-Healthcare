import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const savedUser = localStorage.getItem('authUser');

  if (!savedUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const parsedUser = JSON.parse(savedUser);
    if (!parsedUser || !parsedUser.email) {
      localStorage.removeItem('authUser');
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  } catch (error) {
    localStorage.removeItem('authUser');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};