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
    { label: '� Monitor Visitas', path: '/concierge' },
    { label: '📋 Bitácora', path: '/concierge/logbook' },
    { label: '📦 Paquetería', path: '/concierge/packages' },
    { label: '👥 Residentes', path: '/concierge/residents' },
    { label: '📅 Calendario Áreas', path: '/concierge/calendar' },
    { label: '─────────────', path: '#separator-2' },
    // RESIDENT
    { label: '👨 Mi Perfil', path: '/resident' },
    { label: '📮 Mis Paquetes', path: '/resident/packages' },
    { label: '💵 Mis Facturas', path: '/resident/bills' },
    { label: '🚪 Mi Acceso', path: '/resident/access' },
    { label: '✋ Crear Invitación', path: '/resident/invitations' },
    { label: '📋 Mis Invitaciones', path: '/resident/my-invitations' },
    { label: '🏊 Amenidades', path: '/resident/amenities' },
  ],
  ADMIN: [
    { label: '📊 Dashboard', path: '/admin' },
    { label: '👥 Usuarios', path: '/admin/users' },
    { label: '🏢 Config. Edificio', path: '/admin/departments-buildings' },
    { label: '📅 Reservaciones', path: '/admin/reservations' },
    { label: '💰 Finanzas', path: '/admin/finances' },
    { label: '📢 Comunicación', path: '/admin/broadcast' },
    { label: '🛡️ Auditoría', path: '/admin/audit' },
    { label: '📈 Métricas', path: '/admin/metrics' },
  ],
  CONCIERGE: [
    { label: 'Monitor de Visitas', path: '/concierge' },
    { label: 'Bitácora Digital', path: '/concierge/logbook' },
    { label: 'Paquetería', path: '/concierge/packages' },
    { label: 'Residentes', path: '/concierge/residents' },
    { label: 'Calendario Áreas', path: '/concierge/calendar' },
  ],
  RESIDENT: [
    { label: '🏠 Inicio', path: '/resident' },
    { label: '💰 Mis Finanzas', path: '/resident/finances' },
    { label: '📅 Reservas', path: '/resident/amenities' },
    { label: '📦 Mis Paquetes', path: '/resident/packages' },
    { label: '🔧 Solicitudes', path: '/resident/tickets' },
    { label: '👥 Mi Hogar', path: '/resident/my-home' },
    { label: '📄 Documentos', path: '/resident/documents' },
    { label: '🛡️ Visitas Frecuentes', path: '/resident/whitelist' },
    { label: '─────────────', path: '#separator' },
    { label: '✋ Crear Invitación', path: '/resident/invitations' },
    { label: '📋 Mis Invitaciones', path: '/resident/my-invitations' },
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
