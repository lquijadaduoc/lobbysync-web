import { Card, ListGroup } from 'react-bootstrap';

const ConciergeDashboard = () => (
  <div>
    <h3 className="mb-3 fw-bold text-primary">Bitácora rápida</h3>
    <Card className="shadow-sm mb-3">
      <Card.Body>
        <Card.Title className="mb-3">Turno actual</Card.Title>
        <ListGroup variant="flush">
          <ListGroup.Item>Entrega de paquetes Torre Norte - 10:00</ListGroup.Item>
          <ListGroup.Item>Visita agendada: Depto 402 - 11:30</ListGroup.Item>
          <ListGroup.Item>Revisión CCTV piso 6 - 12:00</ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title>Alertas rápidas</Card.Title>
        <div className="d-flex gap-2 flex-wrap">
          <span className="badge bg-warning text-dark">Visita en espera</span>
          <span className="badge bg-danger">Paquete retrasado</span>
          <span className="badge bg-info text-dark">Reserva próxima</span>
        </div>
      </Card.Body>
    </Card>
  </div>
);

export default ConciergeDashboard;
