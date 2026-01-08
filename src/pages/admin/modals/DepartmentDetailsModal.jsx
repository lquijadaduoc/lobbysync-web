import { Modal, Button, Row, Col, Badge, ListGroup } from 'react-bootstrap';

const DepartmentDetailsModal = ({ show, unit, onHide, buildingName }) => {
  if (!unit) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          📋 Detalles del Departamento {unit.number || 'N/A'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          {/* Información General */}
          <Col md={6}>
            <div className="p-3 bg-light rounded">
              <h6 className="fw-bold mb-3">📍 Información General</h6>
              <ListGroup variant="flush">
                <ListGroup.Item className="border-0 px-0 py-2">
                  <strong>Edificio:</strong> {buildingName}
                </ListGroup.Item>
                <ListGroup.Item className="border-0 px-0 py-2">
                  <strong>Departamento:</strong> {unit.number || 'N/A'}
                </ListGroup.Item>
                <ListGroup.Item className="border-0 px-0 py-2">
                  <strong>Piso:</strong> {unit.floor || 'N/A'}
                </ListGroup.Item>
                <ListGroup.Item className="border-0 px-0 py-2">
                  <strong>Estado:</strong>
                  <Badge
                    bg={
                      unit.occupancyStatus === 'occupied' || unit.status === 'occupied'
                        ? 'success'
                        : 'warning'
                    }
                    className="ms-2"
                  >
                    {unit.occupancyStatus || unit.status || 'Disponible'}
                  </Badge>
                </ListGroup.Item>
              </ListGroup>
            </div>
          </Col>

          {/* Información del Responsable */}
          <Col md={6}>
            <div className="p-3 bg-light rounded">
              <h6 className="fw-bold mb-3">👤 Morador / Responsable</h6>
              <ListGroup variant="flush">
                <ListGroup.Item className="border-0 px-0 py-2">
                  <strong>Nombre:</strong> {unit.tenantName || unit.resident || unit.ownerName || 'Sin asignar'}
                </ListGroup.Item>
                <ListGroup.Item className="border-0 px-0 py-2">
                  <strong>Email:</strong> {unit.tenantEmail || unit.ownerEmail || 'N/A'}
                </ListGroup.Item>
                <ListGroup.Item className="border-0 px-0 py-2">
                  <strong>Teléfono:</strong> {unit.tenantPhone || unit.ownerPhone || 'N/A'}
                </ListGroup.Item>
                <ListGroup.Item className="border-0 px-0 py-2">
                  <strong>Identificación:</strong> {unit.tenantId || unit.ownerId || 'N/A'}
                </ListGroup.Item>
              </ListGroup>
            </div>
          </Col>

          {/* Información Financiera */}
          <Col md={12}>
            <div className="p-3 bg-light rounded">
              <h6 className="fw-bold mb-3">💰 Información Financiera</h6>
              <Row className="g-3">
                <Col md={4}>
                  <div className="text-center">
                    <div className="text-muted small">Cuota Mensual</div>
                    <div className="fs-5 fw-bold text-primary">
                      ${unit.monthlyFee || '0'}
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center">
                    <div className="text-muted small">Meses Atrasados</div>
                    <Badge
                      bg={unit.pendingMonths > 0 ? 'danger' : 'success'}
                      className="fs-6 p-2"
                    >
                      {unit.pendingMonths || 0}
                    </Badge>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center">
                    <div className="text-muted small">Saldo</div>
                    <div className={`fs-5 fw-bold ${unit.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                      ${unit.balance || '0'}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>

          {/* Notas */}
          {unit.notes && (
            <Col md={12}>
              <div className="p-3 bg-light rounded">
                <h6 className="fw-bold mb-2">📝 Notas</h6>
                <p className="mb-0 text-muted">{unit.notes}</p>
              </div>
            </Col>
          )}
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button variant="primary">Editar Detalles</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DepartmentDetailsModal;
