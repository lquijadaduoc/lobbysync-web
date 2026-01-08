import { Container } from 'react-bootstrap';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar';
import AppNavbar from '../AppNavbar';
import DataSourceIndicator from '../DataSourceIndicator';
import { useAuth } from '../../auth/AuthProvider';

const navItemsByRole = {
  SUPER_ADMIN: [
    // ADMIN
    { label: '👑 Panel Admin', path: '/admin' },
    { label: '👥 Usuarios', path: '/admin/users' },
    { label: '🏢 Edificios', path: '/admin/buildings' },
    { label: '🏠 Deptos', path: '/admin/units' },
    { label: '� Deptos y Edificios', path: '/admin/departments-buildings' },
    { label: '📈 Métricas', path: '/admin/metrics' },
    { label: '─────────────', path: '#separator-1' },
    // CONCIERGE
    { label: '📋 Bitácora', path: '/concierge/logbook' },
    { label: '📦 Paquetería', path: '/concierge/packages' },
    { label: '👤 Visitas', path: '/concierge/visitors' },
    { label: '─────────────', path: '#separator-2' },
    // RESIDENT
    { label: '👨 Mi Perfil', path: '/resident' },
    { label: '📮 Mis Paquetes', path: '/resident/packages' },
    { label: '💵 Mis Facturas', path: '/resident/bills' },
    { label: '🚪 Mi Acceso', path: '/resident/access' },
    { label: '✋ Invitaciones', path: '/resident/invitations' },
    { label: '🏊 Amenidades', path: '/resident/amenities' },
  ],
  ADMIN: [
    { label: 'Inicio', path: '/admin' },
    { label: 'Usuarios', path: '/admin/users' },
    { label: 'Edificios', path: '/admin/buildings' },
    { label: 'Deptos', path: '/admin/units' },
    { label: '📊 Deptos y Edificios', path: '/admin/departments-buildings' },
    { label: 'Métricas', path: '/admin/metrics' },
  ],
  CONCIERGE: [
    { label: 'Bitácora', path: '/concierge/logbook' },
    { label: 'Paquetería', path: '/concierge/packages' },
    { label: 'Visitas', path: '/concierge/visitors' },
  ],
  RESIDENT: [
    { label: 'Inicio', path: '/resident' },
    { label: 'Mis Paquetes', path: '/resident/packages' },
    { label: 'Invitaciones', path: '/resident/invitations' },
    { label: 'Reservas', path: '/resident/amenities' },
  ],
};

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const role = user?.role;
  const navItems = navItemsByRole[role] || [];

  return (
    <div className="dashboard-shell d-flex">
      <Sidebar items={navItems} currentPath={location.pathname} role={role} />
      <div className="content-area flex-grow-1">
        <AppNavbar user={user} onLogout={logout} />
        <DataSourceIndicator />
        <Container fluid className="py-4 px-4">
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default DashboardLayout;
