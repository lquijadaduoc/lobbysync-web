import { Navbar, Container, Button, Dropdown } from 'react-bootstrap';

const AppNavbar = ({ user, onLogout }) => (
  <Navbar expand="lg" className="shadow-sm bg-white">
    <Container fluid className="px-3">
      <Navbar.Brand className="fw-bold text-primary">LobbySync</Navbar.Brand>
      <div className="d-flex align-items-center gap-3">
        <div className="text-end">
          <div className="fw-semibold text-dark">
            {user?.name || user?.sub || 'Usuario'}
          </div>
          <small className="text-muted">{user?.role || 'N/R'}</small>
        </div>
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="outline-secondary"
            size="sm"
            className="rounded-pill"
          >
            Perfil
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item disabled>{user?.email || 'Perfil'}</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={onLogout}>Cerrar sesión</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Button variant="outline-danger" size="sm" onClick={onLogout}>
          Salir
        </Button>
      </div>
    </Container>
  </Navbar>
);

export default AppNavbar;
