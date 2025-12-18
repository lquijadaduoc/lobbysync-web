import { Spinner, Alert } from 'react-bootstrap';

/**
 * Componente para mostrar loader de datos
 */
export function DataLoader({ loading, error, children, noDataMessage = 'No hay datos disponibles' }) {
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" className="mb-3" />
        <div className="text-muted">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mb-0">
        <strong>Error:</strong> {error}
      </Alert>
    );
  }

  if (!children || (Array.isArray(children) && children.length === 0)) {
    return (
      <Alert variant="info" className="mb-0">
        <strong>Info:</strong> {noDataMessage}
      </Alert>
    );
  }

  return children;
}

/**
 * Componente para mostrar estado de operación
 */
export function OperationState({ loading, error, success, successMessage, errorMessage }) {
  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2 text-muted">
        <Spinner animation="border" size="sm" /> Procesando...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mb-0">
        {errorMessage || error}
      </Alert>
    );
  }

  if (success) {
    return (
      <Alert variant="success" className="mb-0">
        {successMessage || 'Operación completada exitosamente'}
      </Alert>
    );
  }

  return null;
}
