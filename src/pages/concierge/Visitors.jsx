import { Card, Form, Row, Col, Button } from 'react-bootstrap';

const ConciergeVisitors = () => (
  <Card className="shadow-sm">
    <Card.Body>
      <Card.Title className="mb-3">Control de visitas</Card.Title>
      <Form className="mb-3">
        <Row className="g-2 align-items-end">
          <Col md={4}>
            <Form.Label>Nombre</Form.Label>
            <Form.Control placeholder="Nombre del visitante" />
          </Col>
          <Col md={3}>
            <Form.Label>Depto</Form.Label>
            <Form.Control placeholder="402" />
          </Col>
          <Col md={3}>
            <Form.Label>Documento</Form.Label>
            <Form.Control placeholder="ID / Pasaporte" />
          </Col>
          <Col md={2}>
            <Button variant="primary" className="w-100">
              Registrar
            </Button>
          </Col>
        </Row>
      </Form>
      <div className="text-muted">Últimos ingresos registrados</div>
      <ul className="mt-2 mb-0">
        <li>10:20 - Carla Gómez - Torre Norte 602</li>
        <li>10:45 - Pedro Silva - Torre Central 405</li>
      </ul>
    </Card.Body>
  </Card>
);

export default ConciergeVisitors;
