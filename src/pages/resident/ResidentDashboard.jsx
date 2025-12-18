import { Card, Col, Row, Button } from 'react-bootstrap';

const ResidentDashboard = () => (
  <div>
    <h3 className="mb-3 fw-bold text-primary">Hola, residente</h3>
    <Row className="g-3">
      <Col md={4} sm={6}>
        <Card className="shadow-sm h-100">
          <Card.Body>
            <Card.Title>Mis paquetes</Card.Title>
            <Card.Text className="text-muted">
              2 paquetes en recepción listos para recoger.
            </Card.Text>
            <Button variant="primary" size="sm">
              Ver detalle
            </Button>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4} sm={6}>
        <Card className="shadow-sm h-100">
          <Card.Body>
            <Card.Title>Invitar visita</Card.Title>
            <Card.Text className="text-muted">
              Genera un código de acceso temporal para tus invitados.
            </Card.Text>
            <Button variant="outline-primary" size="sm">
              Crear invitación
            </Button>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4} sm={12}>
        <Card className="shadow-sm h-100">
          <Card.Body>
            <Card.Title>Reservas</Card.Title>
            <Card.Text className="text-muted">
              Próxima reserva: Salón Comunal, viernes 19:00.
            </Card.Text>
            <Button variant="outline-secondary" size="sm">
              Administrar
            </Button>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </div>
);

export default ResidentDashboard;
