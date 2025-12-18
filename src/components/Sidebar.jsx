import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Sidebar = ({ items = [], currentPath, role }) => (
  <aside className="sidebar text-white d-flex flex-column">
    <div className="p-3 border-bottom border-secondary">
      <div className="fw-bold">Panel {role || ''}</div>
      <small className="text-light opacity-75">LobbySync</small>
    </div>
    <Nav className="flex-column p-3 gap-1">
      {items.map((item) => {
        const isActive =
          currentPath === item.path || currentPath.startsWith(`${item.path}/`);
        return (
          <Nav.Link
            as={Link}
            key={item.path}
            to={item.path}
            className={`sidebar-link ${isActive ? 'active' : ''}`}
          >
            {item.label}
          </Nav.Link>
        );
      })}
    </Nav>
  </aside>
);

export default Sidebar;
