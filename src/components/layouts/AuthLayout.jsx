import { Container, Row, Col } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => (
  <div className="auth-background">
    <Container fluid className="vh-100 d-flex align-items-center justify-content-center">
      <Row className="w-100 justify-content-center px-3">
        <Col md={5} lg={4}>
          <Outlet />
        </Col>
      </Row>
    </Container>
  </div>
);

export default AuthLayout;
