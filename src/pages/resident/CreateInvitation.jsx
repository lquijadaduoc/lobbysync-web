import { Card, Form, Button } from 'react-bootstrap';

const ResidentInvitation = () => (
  <Card className="shadow-sm">
    <Card.Body>
      <Card.Title className="mb-3">Crear invitación</Card.Title>
      <Form className="d-grid gap-3">
        <Form.Group>
          <Form.Label>Nombre del invitado</Form.Label>
          <Form.Control placeholder="Ej. Ana Pérez" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Fecha y hora</Form.Label>
          <Form.Control type="datetime-local" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Notas</Form.Label>
          <Form.Control as="textarea" rows={3} placeholder="Indicaciones especiales" />
        </Form.Group>
        <Button variant="primary">Generar código</Button>
      </Form>
    </Card.Body>
  </Card>
);

export default ResidentInvitation;
