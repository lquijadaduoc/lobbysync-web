import { useState, useEffect } from 'react';
import { Modal, Button, ListGroup, Badge, Spinner, Alert, Form, Row, Col, Table } from 'react-bootstrap';

const AccessModal = ({ show, unit, onHide }) => {
  const [accesses, setAccesses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simulamos la carga de accesos
  useEffect(() => {
    if (show && unit) {
      setLoading(true);
      // Simulamos API call
      setTimeout(() => {
        const mockAccesses = [
          {
            id: 1,
            person: 'Juan Pérez (Propietario)',
            cardId: 'CARD-001',
            type: 'Tarjeta',
            accessLevel: 'Full',
            lastAccess: '2024-12-20 14:32',
            status: 'Active',
          },
          {
            id: 2,
            person: 'María García (Inquilina)',
            cardId: 'CARD-002',
            type: 'Tarjeta',
            accessLevel: 'Resident',
            lastAccess: '2024-12-20 09:15',
            status: 'Active',
          },
          {
            id: 3,
            person: 'Servicio de Limpieza',
            cardId: 'CARD-003',
            type: 'Temporal',
            accessLevel: 'Limited',
            lastAccess: '2024-12-19 10:00',
            status: 'Active',
          },
          {
            id: 4,
            person: 'Mantenimiento General',
            cardId: 'CARD-004',
            type: 'Tarjeta',
            accessLevel: 'Limited',
            lastAccess: '2024-12-15 11:20',
            status: 'Inactive',
          },
        ];
        setAccesses(mockAccesses);
        setLoading(false);
      }, 500);
    }
  }, [show, unit]);

  if (!unit) return null;

  const getStatusBadge = (status) => {
    return status === 'Active' ? 'success' : 'secondary';
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className="bg-warning text-dark">
        <Modal.Title>🚪 Control de Accesos - Depto {unit.number || 'N/A'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="warning" className="mb-2" />
            <div className="text-muted">Cargando registros de acceso...</div>
          </div>
        ) : accesses.length === 0 ? (
          <Alert variant="info" className="mb-0">
            No hay registros de acceso para este departamento
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table hover bordered className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Persona</th>
                  <th>ID Tarjeta</th>
                  <th>Tipo</th>
                  <th>Nivel de Acceso</th>
                  <th>Último Acceso</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {accesses.map((access) => (
                  <tr key={access.id} className="align-middle">
                    <td className="fw-500">{access.person}</td>
                    <td>
                      <code className="text-muted small">{access.cardId}</code>
                    </td>
                    <td>
                      <Badge bg="secondary">{access.type}</Badge>
                    </td>
                    <td>{access.accessLevel}</td>
                    <td className="text-muted small">{access.lastAccess}</td>
                    <td>
                      <Badge bg={getStatusBadge(access.status)}>{access.status}</Badge>
                    </td>
                    <td className="text-center">
                      <Button variant="outline-danger" size="sm">
                        🗑️
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {/* Formulario para otorgar nuevo acceso */}
        <div className="mt-4 pt-3 border-top">
          <h6 className="fw-bold mb-3">➕ Otorgar Nuevo Acceso</h6>
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Nombre de la Persona</Form.Label>
                  <Form.Control type="text" placeholder="Ej: Carlos López" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Tipo de Acceso</Form.Label>
                  <Form.Select>
                    <option>Tarjeta Permanente</option>
                    <option>Acceso Temporal (7 días)</option>
                    <option>Acceso Temporal (30 días)</option>
                    <option>Acceso Limitado</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Nivel de Acceso</Form.Label>
                  <Form.Select>
                    <option>Full (Completo)</option>
                    <option>Resident (Residente)</option>
                    <option>Limited (Limitado)</option>
                    <option>Guest (Visitante)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Relación</Form.Label>
                  <Form.Control type="text" placeholder="Ej: Familia, Empleado, Visita" />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button variant="warning">Crear Acceso</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AccessModal;
