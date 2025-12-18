import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="py-5 text-center">
    <h2 className="fw-bold text-primary mb-3">Página no encontrada</h2>
    <p className="text-muted mb-4">
      La página que buscas no existe o fue movida.
    </p>
    <Button as={Link} to="/login" variant="outline-primary">
      Ir al inicio
    </Button>
  </div>
);

export default NotFound;
