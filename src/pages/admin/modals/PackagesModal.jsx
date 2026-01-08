import { useState, useEffect } from 'react';
import { Modal, Button, ListGroup, Badge, Spinner, Alert, Form, Row, Col } from 'react-bootstrap';

const PackagesModal = ({ show, unit, onHide }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simulamos la carga de paquetes
  useEffect(() => {
    if (show && unit) {
      setLoading(true);
      // Simulamos API call
      setTimeout(() => {
        const mockPackages = [
          {
            id: 1,
            trackingNumber: 'PKG001234567',
            carrier: 'DHL',
            sender: 'Amazon',
            receivedDate: '2024-12-20',
            status: 'Delivered',
            description: 'Paquete electrónica',
          },
          {
            id: 2,
            trackingNumber: 'PKG001234568',
            carrier: 'Fedex',
            sender: 'Mercado Libre',
            receivedDate: '2024-12-19',
            status: 'Pending',
            description: 'Envío especial',
          },
          {
            id: 3,
            trackingNumber: 'PKG001234569',
            carrier: 'Correos',
            sender: 'Banco de Chile',
            receivedDate: '2024-12-18',
            status: 'Delivered',
            description: 'Documentación',
          },
        ];
        setPackages(mockPackages);
        setLoading(false);
      }, 500);
    }
  }, [show, unit]);

  if (!unit) return null;

  const getStatusBadge = (status) => {
    const variants = {
      Delivered: 'success',
      Pending: 'warning',
      'In Transit': 'info',
      Lost: 'danger',
    };
    return variants[status] || 'secondary';
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-info text-white">
        <Modal.Title>📦 Paquetes - Depto {unit.number || 'N/A'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="info" className="mb-2" />
            <div className="text-muted">Cargando paquetes...</div>
          </div>
        ) : packages.length === 0 ? (
          <Alert variant="info" className="mb-0">
            No hay paquetes registrados para este departamento
          </Alert>
        ) : (
          <div className="space-y-3">
            {packages.map((pkg) => (
              <div key={pkg.id} className="border rounded p-3 mb-3">
                <Row className="g-3">
                  <Col md={8}>
                    <h6 className="mb-2 fw-bold">📍 {pkg.sender}</h6>
                    <div className="text-muted small mb-2">
                      <strong>Tracking:</strong> {pkg.trackingNumber}
                    </div>
                    <div className="text-muted small mb-2">
                      <strong>Transportista:</strong> {pkg.carrier}
                    </div>
                    <div className="text-muted small">
                      <strong>Descripción:</strong> {pkg.description}
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-end">
                      <Badge bg={getStatusBadge(pkg.status)} className="mb-2 d-inline-block p-2">
                        {pkg.status}
                      </Badge>
                      <div className="text-muted small mt-2">
                        <strong>Recibido:</strong> {pkg.receivedDate}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        )}

        {/* Formulario para registrar nuevo paquete */}
        <div className="mt-4 pt-3 border-top">
          <h6 className="fw-bold mb-3">➕ Registrar Nuevo Paquete</h6>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Número de Seguimiento</Form.Label>
              <Form.Control type="text" placeholder="Ej: PKG123456789" />
            </Form.Group>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Remitente</Form.Label>
                  <Form.Control type="text" placeholder="Ej: Amazon" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Transportista</Form.Label>
                  <Form.Select>
                    <option>DHL</option>
                    <option>Fedex</option>
                    <option>Correos</option>
                    <option>Otra</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mt-3">
              <Form.Label className="small fw-bold">Descripción</Form.Label>
              <Form.Control as="textarea" rows={2} placeholder="Describa el contenido del paquete" />
            </Form.Group>
          </Form>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button variant="info">Guardar Paquete</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PackagesModal;
