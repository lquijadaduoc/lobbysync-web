import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div className="py-5 text-center">
    <h2 className="fw-bold text-danger mb-3">No autorizado</h2>
    <p className="text-muted mb-4">
      No tienes permisos para acceder a esta sección. Contacta al
      administrador si crees que es un error.
    </p>
    <Button as={Link} to="/login" variant="primary">
      Volver al inicio de sesión
    </Button>
  </div>
);

export default Unauthorized;
