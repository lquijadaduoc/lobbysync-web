import { Card, Form, Button } from 'react-bootstrap';

const ResidentReservation = () => (
  <Card className="shadow-sm">
    <Card.Body>
      <Card.Title className="mb-3">Reservar espacio común</Card.Title>
      <Form className="d-grid gap-3">
        <Form.Group>
          <Form.Label>Espacio</Form.Label>
          <Form.Select>
            <option>Salón Comunal</option>
            <option>Terraza</option>
            <option>Gimnasio</option>
          </Form.Select>
        </Form.Group>
        <Form.Group>
          <Form.Label>Fecha</Form.Label>
          <Form.Control type="date" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Hora</Form.Label>
          <Form.Control type="time" />
        </Form.Group>
        <Button variant="outline-primary">Reservar</Button>
      </Form>
    </Card.Body>
  </Card>
);

export default ResidentReservation;
