import { Card, ProgressBar, Row, Col } from 'react-bootstrap';

const AdminMetrics = () => (
  <Card className="shadow-sm">
    <Card.Body>
      <Card.Title className="mb-4">Métricas globales</Card.Title>
      <Row className="g-3">
        <Col md={6}>
          <div className="d-flex justify-content-between mb-1">
            <span>Ocupación</span>
            <span className="fw-semibold">86%</span>
          </div>
          <ProgressBar now={86} variant="primary" />
        </Col>
        <Col md={6}>
          <div className="d-flex justify-content-between mb-1">
            <span>Visitantes hoy</span>
            <span className="fw-semibold">74</span>
          </div>
          <ProgressBar now={55} variant="info" />
        </Col>
        <Col md={6}>
          <div className="d-flex justify-content-between mb-1 mt-3">
            <span>Tickets resueltos</span>
            <span className="fw-semibold">92%</span>
          </div>
          <ProgressBar now={92} variant="success" />
        </Col>
        <Col md={6}>
          <div className="d-flex justify-content-between mb-1 mt-3">
            <span>Entregas a tiempo</span>
            <span className="fw-semibold">81%</span>
          </div>
          <ProgressBar now={81} variant="warning" />
        </Col>
      </Row>
    </Card.Body>
  </Card>
);

export default AdminMetrics;
