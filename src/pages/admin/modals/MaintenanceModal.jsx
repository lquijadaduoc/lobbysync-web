import { useState, useEffect } from 'react';
import { Modal, Button, Badge, Spinner, Alert, Form, Row, Col, Table } from 'react-bootstrap';

const MaintenanceModal = ({ show, unit, onHide }) => {
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simulamos la carga de solicitudes de mantenimiento
  useEffect(() => {
    if (show && unit) {
      setLoading(true);
      // Simulamos API call
      setTimeout(() => {
        const mockMaintenance = [
          {
            id: 1,
            title: 'Fuga de agua en cocina',
            description: 'Hay fuga de agua bajo la pileta',
            priority: 'High',
            status: 'In Progress',
            createdDate: '2024-12-18',
            assignedTo: 'Pedro Martínez (Plomero)',
          },
          {
            id: 2,
            title: 'Puerta de entrada con mal cierre',
            description: 'La puerta del departamento no cierra bien',
            priority: 'Medium',
            status: 'Pending',
            createdDate: '2024-12-17',
            assignedTo: 'Sin asignar',
          },
          {
            id: 3,
            title: 'Reparación de luminaria',
            description: 'Foco dañado en la sala',
            priority: 'Low',
            status: 'Completed',
            createdDate: '2024-12-10',
            assignedTo: 'Juan García (Electricista)',
          },
          {
            id: 4,
            title: 'Sellado de grieta en muro',
            description: 'Pequeña grieta en pared del dormitorio',
            priority: 'Low',
            status: 'Completed',
            createdDate: '2024-12-05',
            assignedTo: 'Carlos López',
          },
        ];
        setMaintenance(mockMaintenance);
        setLoading(false);
      }, 500);
    }
  }, [show, unit]);

  if (!unit) return null;

  const getStatusBadge = (status) => {
    const variants = {
      Completed: 'success',
      'In Progress': 'info',
      Pending: 'warning',
      Cancelled: 'danger',
    };
    return variants[status] || 'secondary';
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      High: 'danger',
      Medium: 'warning',
      Low: 'success',
    };
    return variants[priority] || 'secondary';
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title>🔧 Mantenimiento - Depto {unit.number || 'N/A'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="danger" className="mb-2" />
            <div className="text-muted">Cargando solicitudes de mantenimiento...</div>
          </div>
        ) : maintenance.length === 0 ? (
          <Alert variant="info" className="mb-0">
            No hay solicitudes de mantenimiento para este departamento
          </Alert>
        ) : (
          <div>
            {maintenance.map((item) => (
              <div key={item.id} className="border rounded p-3 mb-3">
                <Row className="g-3">
                  <Col md={8}>
                    <div className="d-flex gap-2 align-items-start mb-2">
                      <h6 className="mb-0 fw-bold flex-grow-1">{item.title}</h6>
                      <Badge bg={getPriorityBadge(item.priority)}>{item.priority}</Badge>
                      <Badge bg={getStatusBadge(item.status)}>{item.status}</Badge>
                    </div>
                    <p className="text-muted small mb-2">{item.description}</p>
                    <div className="text-muted small">
                      <div>
                        <strong>Solicitado:</strong> {item.createdDate}
                      </div>
                      <div>
                        <strong>Asignado a:</strong> {item.assignedTo}
                      </div>
                    </div>
                  </Col>
                  <Col md={4} className="text-end">
                    <Button variant="outline-primary" size="sm" className="mb-2 w-100">
                      Ver Detalles
                    </Button>
                    {item.status !== 'Completed' && (
                      <Button variant="outline-danger" size="sm" className="w-100">
                        Cancelar
                      </Button>
                    )}
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        )}

        {/* Formulario para crear nueva solicitud */}
        <div className="mt-4 pt-3 border-top">
          <h6 className="fw-bold mb-3">➕ Nueva Solicitud de Mantenimiento</h6>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Título del Problema</Form.Label>
              <Form.Control type="text" placeholder="Ej: Fuga de agua" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Descripción Detallada</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Describa el problema en detalle"
              />
            </Form.Group>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Prioridad</Form.Label>
                  <Form.Select>
                    <option>Baja</option>
                    <option>Media</option>
                    <option>Alta</option>
                    <option>Emergencia</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Tipo de Mantenimiento</Form.Label>
                  <Form.Select>
                    <option>Fontanería</option>
                    <option>Electricidad</option>
                    <option>Albañilería</option>
                    <option>Carpintería</option>
                    <option>Pintura</option>
                    <option>Otro</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mt-3">
              <Form.Check
                type="checkbox"
                label="Permitir acceso al departamento para inspección"
                id="allowAccess"
              />
            </Form.Group>
          </Form>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button variant="danger">Crear Solicitud</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MaintenanceModal;
