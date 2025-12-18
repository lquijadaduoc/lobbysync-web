import { Card, Col, Row } from 'react-bootstrap';

const AdminDashboard = () => (
  <div>
    <h3 className="mb-4 fw-bold text-primary">Resumen general</h3>
    <Row className="g-3">
      {['Usuarios activos', 'Edificios', 'Deptos ocupados', 'Incidencias'].map(
        (label, index) => (
          <Col key={label} md={3} sm={6}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="text-muted small">{label}</div>
                <div className="fs-3 fw-bold text-dark">
                  {index === 0 ? '128' : index === 1 ? '12' : index === 2 ? '342' : '3'}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ),
      )}
    </Row>
    <Card className="shadow-sm mt-4">
      <Card.Body>
        <Card.Title className="fw-semibold">Tareas recientes</Card.Title>
        <ul className="mb-0 text-muted">
          <li>Validar solicitudes de alta de residentes.</li>
          <li>Revisar reportes de control de acceso del día.</li>
          <li>Confirmar inventario de cámaras y sensores.</li>
        </ul>
      </Card.Body>
    </Card>
  </div>
);

export default AdminDashboard;
