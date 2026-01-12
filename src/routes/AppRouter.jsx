import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import AuthLayout from '../components/layouts/AuthLayout';
import DashboardLayout from '../components/layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/auth/Login';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ConciergeDashboard from '../pages/concierge/ConciergeDashboard';
import ResidentDashboard from '../pages/resident/ResidentDashboard';
import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';
import AdminUsers from '../pages/admin/Users';
import AdminBuildings from '../pages/admin/Buildings';
import AdminUnits from '../pages/admin/Units';
import AdminMetrics from '../pages/admin/Metrics';
import DepartmentsAndBuildings from '../pages/admin/DepartmentsAndBuildings';
import ReservationManagement from '../pages/admin/ReservationManagement';
import ConciergeLogbook from '../pages/concierge/Logbook';
import ConciergePackages from '../pages/concierge/Packages';
import ConciergeVisitors from '../pages/concierge/Visitors';
import VisitsMonitor from '../pages/concierge/VisitsMonitor';
import ResidentsViewer from '../pages/concierge/ResidentsViewer';
import CommonAreasCalendar from '../pages/concierge/CommonAreasCalendar';
import ResidentPackages from '../pages/resident/MyPackages';
import ResidentBills from '../pages/resident/MyBills';
import ResidentAccess from '../pages/resident/MyAccess';
import ResidentInvitation from '../pages/resident/CreateInvitation';
import ResidentReservation from '../pages/resident/ReserveAmenity';
import MyInvitations from '../pages/resident/MyInvitations';
import ResidentFinances from '../pages/resident/Finances';
import ResidentMyHome from '../pages/resident/MyHome';
import ResidentTickets from '../pages/resident/Tickets';
import ResidentDocuments from '../pages/resident/Documents';
import ResidentWhitelist from '../pages/resident/Whitelist';
import AdminFinances from '../pages/admin/Finances';
import AdminBroadcast from '../pages/admin/Broadcast';
import AdminAudit from '../pages/admin/Audit';

const RoleRedirect = () => {
  const { role } = useAuth();
  if (role === 'SUPER_ADMIN') return <Navigate to="/admin" replace />;
  if (role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (role === 'CONCIERGE') return <Navigate to="/concierge" replace />;
  if (role === 'RESIDENT') return <Navigate to="/resident" replace />;
  return <Navigate to="/login" replace />;
};

const AppRouter = () => (
  <Routes>
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <RoleRedirect />
        </ProtectedRoute>
      }
    />

    <Route element={<AuthLayout />}>
      <Route path="/login" element={<Login />} />
    </Route>

    <Route
      path="/admin/*"
      element={
        <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<AdminDashboard />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="buildings" element={<AdminBuildings />} />
      <Route path="units" element={<AdminUnits />} />
      <Route path="departments-buildings" element={<DepartmentsAndBuildings />} />
      <Route path="reservations" element={<ReservationManagement />} />
      <Route path="finances" element={<AdminFinances />} />
      <Route path="broadcast" element={<AdminBroadcast />} />
      <Route path="audit" element={<AdminAudit />} />
      <Route path="metrics" element={<AdminMetrics />} />
    </Route>

    <Route
      path="/concierge/*"
      element={
        <ProtectedRoute allowedRoles={['CONCIERGE', 'SUPER_ADMIN']}>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<VisitsMonitor />} />
      <Route path="logbook" element={<ConciergeLogbook />} />
      <Route path="packages" element={<ConciergePackages />} />
      <Route path="visitors" element={<ConciergeVisitors />} />
      <Route path="residents" element={<ResidentsViewer />} />
      <Route path="calendar" element={<CommonAreasCalendar />} />
    </Route>

    <Route
      path="/resident/*"
      element={
        <ProtectedRoute allowedRoles={['RESIDENT', 'SUPER_ADMIN']}>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<ResidentDashboard />} />
      <Route path="finances" element={<ResidentFinances />} />
      <Route path="amenities" element={<ResidentReservation />} />
      <Route path="packages" element={<ResidentPackages />} />
      <Route path="tickets" element={<ResidentTickets />} />
      <Route path="my-home" element={<ResidentMyHome />} />
      <Route path="documents" element={<ResidentDocuments />} />
      <Route path="whitelist" element={<ResidentWhitelist />} />
      <Route path="bills" element={<ResidentBills />} />
      <Route path="access" element={<ResidentAccess />} />
      <Route path="invitations" element={<ResidentInvitation />} />
      <Route path="my-invitations" element={<MyInvitations />} />
    </Route>

    <Route path="/unauthorized" element={<Unauthorized />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRouter;
