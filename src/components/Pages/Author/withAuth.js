import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


const withAuth = (allowedRoles) => (WrappedComponent) => {
  return (props) => {
    const token = localStorage.getItem('SEPtoken');
    
    if (!token) {
      return <Navigate to="/authentication" />;
    }

    try {
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      if (allowedRoles.includes(userRole)) {
        return <WrappedComponent {...props} />;
      } else {
        return <Navigate to="/" />;
      }
    } catch (error) {
      console.error('Invalid token:', error);
      return <Navigate to="/authentication" />;
    }
  };
};

export default withAuth;