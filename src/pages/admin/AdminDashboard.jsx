import { useState, useEffect } from 'react';
import { Card, Col, Row, Spinner, Alert, Table, Badge, ProgressBar } from 'react-bootstrap';
import { adminUsers, adminUnits, adminReservations, adminPackages, adminTickets, adminFinances } from '../../api/adminService';
import { conciergeVisitors } from '../../api/conciergeService';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalResidents: 0,
    morosityRate: 0,
    occupancy: 0,
    monthlyVisits: 0,
    activeUsers: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    pendingTickets: 0,
    pendingReservations: 0,
    packagesInStorage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentActivities, setRecentActivities] = useState([]);
  const [visitsByHour, setVisitsByHour] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar datos en paralelo desde endpoints reales
      const [usersResp, unitsResp, visitsResp, reservationsResp, packagesResp, ticketsResp, financeStatsResp] = await Promise.all([
        adminUsers.list({ limit: 1000 }).catch(() => ({ data: [] })),
        adminUnits.list({ limit: 1000 }).catch(() => ({ data: [] })),
        conciergeVisitors.list().catch(() => ({ data: [] })),
        adminReservations.list({ status: 'PENDING' }).catch(() => ({ data: [] })),
        adminPackages.listByStatus('RECEIVED').catch(() => ({ data: [] })),
        adminTickets.list({ status: 'OPEN' }).catch(() => ({ data: [] })),
        adminFinances.getFinancialStats().catch(() => ({ data: { morosityRate: 0 } }))
      ]);

      const usersList = Array.isArray(usersResp.data) ? usersResp.data : usersResp.data?.content || [];
      const unitsList = Array.isArray(unitsResp.data) ? unitsResp.data : unitsResp.data?.content || [];
      const visitsList = Array.isArray(visitsResp.data) ? visitsResp.data : visitsResp.data?.content || [];
      const reservationsList = Array.isArray(reservationsResp.data) ? reservationsResp.data : reservationsResp.data?.content || [];
      const packagesList = Array.isArray(packagesResp.data) ? packagesResp.data : packagesResp.data?.content || [];
      const ticketsList = Array.isArray(ticketsResp.data) ? ticketsResp.data : ticketsResp.data?.content || [];
      const financeStats = financeStatsResp.data || {};

      // Calcular residentes (usuarios con rol RESIDENT)
      const residents = usersList.filter(u => u.role === 'RESIDENT' || u.role?.includes('RESIDENT'));
      
      // Calcular unidades ocupadas (que tienen residentes asignados)
      const occupiedUnits = unitsList.filter(u => u.occupied || u.residents?.length > 0).length;
      
      // Obtener morosidad desde endpoint real
      const morosityRate = financeStats.morosityRate || 0;

      // Calcular visitas del mes
      const currentMonth = new Date().getMonth();
      const monthlyVisits = visitsList.filter(v => {
        const visitMonth = new Date(v.createdAt || v.validUntil).getMonth();
        return visitMonth === currentMonth;
      }).length;

      // Analizar visitas por hora (horas pico)
      const hourCounts = Array(24).fill(0);
      visitsList.forEach(visit => {
        const hour = new Date(visit.entryTime || visit.createdAt).getHours();
        if (hour >= 0 && hour < 24) {
          hourCounts[hour]++;
        }
      });

      setStats({
        totalResidents: residents.length,
        morosityRate: morosityRate,
        occupancy: unitsList.length > 0 ? ((occupiedUnits / unitsList.length) * 100).toFixed(1) : 0,
        monthlyVisits: monthlyVisits,
        activeUsers: usersList.filter(u => u.status === 'ACTIVE' || u.status === 'active').length,
        totalUnits: unitsList.length,
        occupiedUnits: occupiedUnits,
        pendingTickets: ticketsList.length,
        pendingReservations: reservationsList.length,
        packagesInStorage: packagesList.length
      });

      setVisitsByHour(hourCounts);

      // Actividades recientes desde datos reales
      const activities = [];
      
      // Últimas reservaciones
      if (reservationsList.length > 0) {
        const latest = reservationsList[0];
        activities.push({
          type: 'reservation',
          text: `Nueva reserva pendiente de aprobación`,
          time: 'Reciente'
        });
      }
      
      // Últimos paquetes
      if (packagesList.length > 0) {
        activities.push({
          type: 'package',
          text: `${packagesList.length} paquetes en almacén`,
          time: 'Actualizado'
        });
      }
      
      // Últimos tickets
      if (ticketsList.length > 0) {
        activities.push({
          type: 'ticket',
          text: `${ticketsList.length} tickets abiertos`,
          time: 'Actualizado'
        });
      }
      
      // Últimas visitas
      if (visitsList.length > 0) {
        activities.push({
          type: 'user',
          text: `${monthlyVisits} visitas este mes`,
          time: 'Actualizado'
        });
      }
      
      setRecentActivities(activities);

    } catch (err) {
      setError(err.message || 'Error al cargar datos del dashboard');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPeakHours = () => {
    const peakHours = visitsByHour
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    
    return peakHours.map(p => `${p.hour}:00 (${p.count} visitas)`).join(', ');
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4 fw-bold text-primary">📊 Dashboard Ejecutivo</h3>
      
      {error && <Alert variant="danger">{error}</Alert>}

      {/* KPIs Principales */}
      <Row className="g-3 mb-4">
        <Col md={3} sm={6}>
          <Card className="shadow-sm h-100 border-primary">
            <Card.Body>
              <div className="text-muted small mb-2">
                <i className="bi bi-people-fill me-2"></i>
                Total Residentes
              </div>
              <div className="fs-2 fw-bold text-primary">{stats.totalResidents}</div>
              <small className="text-muted">Usuarios activos: {stats.activeUsers}</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card className="shadow-sm h-100 border-danger">
            <Card.Body>
              <div className="text-muted small mb-2">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                % Morosidad
              </div>
              <div className="fs-2 fw-bold text-danger">{stats.morosityRate}%</div>
              <ProgressBar 
                variant="danger" 
                now={stats.morosityRate} 
                className="mt-2" 
                style={{ height: '5px' }}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card className="shadow-sm h-100 border-success">
            <Card.Body>
              <div className="text-muted small mb-2">
                <i className="bi bi-building-fill me-2"></i>
                Ocupación Actual
              </div>
              <div className="fs-2 fw-bold text-success">{stats.occupancy}%</div>
              <small className="text-muted">{stats.occupiedUnits}/{stats.totalUnits} unidades</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card className="shadow-sm h-100 border-info">
            <Card.Body>
              <div className="text-muted small mb-2">
                <i className="bi bi-calendar-event-fill me-2"></i>
                Visitas del Mes
              </div>
              <div className="fs-2 fw-bold text-info">{stats.monthlyVisits}</div>
              <small className="text-muted">Enero 2026</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Estadísticas Secundarias */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <Badge bg="warning" className="mb-2 fs-6">{stats.pendingReservations}</Badge>
              <div className="small text-muted">Reservas Pendientes de Aprobación</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <Badge bg="info" className="mb-2 fs-6">{stats.packagesInStorage}</Badge>
              <div className="small text-muted">Paquetes en Bodega</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <Badge bg="secondary" className="mb-2 fs-6">{stats.pendingTickets}</Badge>
              <div className="small text-muted">Tickets de Mantención Abiertos</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        {/* Gráfico de horas pico */}
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="fw-semibold mb-3">
                <i className="bi bi-graph-up me-2"></i>
                Flujo de Visitas (Horas Pico)
              </Card.Title>
              <div className="mb-3">
                <div className="text-muted small mb-2">Horarios con mayor actividad:</div>
                <div className="fw-bold text-primary">{getPeakHours() || 'Sin datos suficientes'}</div>
              </div>
              <div className="d-flex align-items-end" style={{ height: '150px', gap: '4px' }}>
                {visitsByHour.slice(6, 23).map((count, idx) => {
                  const hour = idx + 6;
                  const maxCount = Math.max(...visitsByHour);
                  const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={hour} className="flex-fill" style={{ minWidth: '10px' }}>
                      <div 
                        className="bg-primary rounded-top"
                        style={{ 
                          height: `${heightPercent}%`, 
                          minHeight: count > 0 ? '5px' : '0',
                          transition: 'height 0.3s'
                        }}
                        title={`${hour}:00 - ${count} visitas`}
                      ></div>
                      {hour % 3 === 0 && (
                        <small className="d-block text-center text-muted" style={{ fontSize: '9px' }}>
                          {hour}h
                        </small>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="text-muted small mt-2 text-center">
                Rango: 6:00 - 22:00 hrs
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Actividades recientes */}
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="fw-semibold mb-3">
                <i className="bi bi-clock-history me-2"></i>
                Actividad Reciente
              </Card.Title>
              <Table size="sm" className="mb-0">
                <tbody>
                  {recentActivities.map((activity, idx) => (
                    <tr key={idx}>
                      <td style={{ width: '30px' }}>
                        {activity.type === 'user' && <i className="bi bi-person-plus text-primary"></i>}
                        {activity.type === 'payment' && <i className="bi bi-cash-coin text-success"></i>}
                        {activity.type === 'reservation' && <i className="bi bi-calendar-check text-info"></i>}
                        {activity.type === 'ticket' && <i className="bi bi-wrench text-warning"></i>}
                      </td>
                      <td>
                        <div className="small">{activity.text}</div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>{activity.time}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Accesos rápidos */}
      <Card className="shadow-sm mt-4">
        <Card.Body>
          <Card.Title className="fw-semibold mb-3">Acciones Rápidas</Card.Title>
          <Row className="g-2">
            <Col md={3}>
              <Button variant="outline-primary" className="w-100" href="#/admin/users">
                <i className="bi bi-people me-2"></i>Gestionar Usuarios
              </Button>
            </Col>
            <Col md={3}>
              <Button variant="outline-success" className="w-100" href="#/admin/reservations">
                <i className="bi bi-calendar-check me-2"></i>Aprobar Reservas
              </Button>
            </Col>
            <Col md={3}>
              <Button variant="outline-warning" className="w-100" href="#/admin/finances">
                <i className="bi bi-cash-stack me-2"></i>Gestionar Finanzas
              </Button>
            </Col>
            <Col md={3}>
              <Button variant="outline-info" className="w-100" href="#/admin/broadcast">
                <i className="bi bi-megaphone me-2"></i>Enviar Comunicado
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminDashboard;
