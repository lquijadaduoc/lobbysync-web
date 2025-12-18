import { Navigate, Outlet } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useAuth } from '../auth/AuthProvider';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { isAuthenticated, role, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center text-primary">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (children) {
    return children;
  }

  return <Outlet />;
};

export default ProtectedRoute;
