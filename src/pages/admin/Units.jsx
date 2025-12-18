import { Card, Badge, Row, Col } from 'react-bootstrap';

const AdminUnits = () => (
  <Card className="shadow-sm">
    <Card.Body>
      <Card.Title className="mb-3">Departamentos</Card.Title>
      <Row className="g-3">
        {['101', '202', '305', '402', '510', '612'].map((unit, index) => (
          <Col key={unit} md={4}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="fw-semibold">Depto {unit}</div>
                  <Badge bg={index % 2 === 0 ? 'success' : 'warning'}>
                    {index % 2 === 0 ? 'Ocupado' : 'Disponible'}
                  </Badge>
                </div>
                <div className="text-muted small mt-2">Torre Central</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Card.Body>
  </Card>
);

export default AdminUnits;
