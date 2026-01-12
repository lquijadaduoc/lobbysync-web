import { useState, useEffect } from 'react';
import { Card, Table, Badge, Form, Row, Col, Spinner, Alert, InputGroup, Tabs, Tab } from 'react-bootstrap';
import { conciergeLogbook, conciergeVisitors } from '../../api/conciergeService';
import axios from 'axios';

const AdminAudit = () => {
  const [accessLogs, setAccessLogs] = useState([]);
  const [logbookEntries, setLogbookEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('access'); // access, logbook
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('today'); // today, week, month, all
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadAuditData();
  }, [dateFilter]);

  const loadAuditData = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar logs de acceso (visitas)
      const accessResp = await conciergeVisitors.list().catch(() => ({ data: [] }));
      let accessList = Array.isArray(accessResp.data) ? accessResp.data : accessResp.data?.content || [];

      // Filtrar por fecha
      if (dateFilter !== 'all') {
        const now = new Date();
        const filterDate = new Date();
        
        if (dateFilter === 'today') {
          filterDate.setHours(0, 0, 0, 0);
        } else if (dateFilter === 'week') {
          filterDate.setDate(now.getDate() - 7);
        } else if (dateFilter === 'month') {
          filterDate.setMonth(now.getMonth() - 1);
        }

        accessList = accessList.filter(log => {
          const logDate = new Date(log.entryTime || log.createdAt);
          return logDate >= filterDate;
        });
      }

      // Cargar bitácora de conserjería
      const logbookResp = await conciergeLogbook.list({ limit: 100 }).catch(() => ({ data: [] }));
      const logbookList = Array.isArray(logbookResp.data) ? logbookResp.data : logbookResp.data?.content || [];

      setAccessLogs(accessList);
      setLogbookEntries(logbookList);

    } catch (err) {
      setError(err.message || 'Error al cargar datos de auditoría');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge bg="warning">Pendiente</Badge>;
      case 'ENTERED':
        return <Badge bg="success">Ingresó</Badge>;
      case 'EXITED':
        return <Badge bg="info">Salió</Badge>;
      case 'EXPIRED':
        return <Badge bg="danger">Expirado</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category) => {
    const categoryMap = {
      'general': { bg: 'secondary', label: 'General' },
      'maintenance': { bg: 'warning', label: 'Mantención' },
      'security': { bg: 'danger', label: 'Seguridad' },
      'incident': { bg: 'danger', label: 'Incidente' },
      'visitor': { bg: 'info', label: 'Visitas' }
    };

    const config = categoryMap[category?.toLowerCase()] || { bg: 'secondary', label: category || 'N/A' };
    return <Badge bg={config.bg}>{config.label}</Badge>;
  };

  // Filtrar logs de acceso
  const filteredAccessLogs = accessLogs.filter(log => {
    const matchesSearch = searchTerm === '' ||
      (log.guestName || log.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.guestRut || log.rut || '').includes(searchTerm) ||
      String(log.unitNumber || log.unit || '').includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filtrar entradas de bitácora
  const filteredLogbook = logbookEntries.filter(entry => {
    return searchTerm === '' ||
      (entry.note || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.user || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Estadísticas
  const stats = {
    totalAccess: accessLogs.length,
    entered: accessLogs.filter(l => l.status === 'ENTERED').length,
    exited: accessLogs.filter(l => l.status === 'EXITED').length,
    logbookEntries: logbookEntries.length
  };

  return (
    <div>
      <h3 className="fw-bold text-primary mb-4">🛡️ Auditoría y Registros</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Estadísticas */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="text-center border-primary">
            <Card.Body className="py-2">
              <h3 className="mb-0 text-primary">{stats.totalAccess}</h3>
              <small className="text-muted">Registros de Acceso</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-success">
            <Card.Body className="py-2">
              <h3 className="mb-0 text-success">{stats.entered}</h3>
              <small className="text-muted">Ingresos Registrados</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-info">
            <Card.Body className="py-2">
              <h3 className="mb-0 text-info">{stats.exited}</h3>
              <small className="text-muted">Salidas Registradas</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-secondary">
            <Card.Body className="py-2">
              <h3 className="mb-0 text-secondary">{stats.logbookEntries}</h3>
              <small className="text-muted">Entradas de Bitácora</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          {/* Filtros */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                <option value="today">📅 Hoy</option>
                <option value="week">📆 Última Semana</option>
                <option value="month">🗓️ Último Mes</option>
                <option value="all">📋 Todo el Historial</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              {activeTab === 'access' && (
                <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">Todos los Estados</option>
                  <option value="ENTERED">Solo Ingresos</option>
                  <option value="EXITED">Solo Salidas</option>
                  <option value="PENDING">Pendientes</option>
                </Form.Select>
              )}
            </Col>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar por nombre, RUT o unidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>

          {/* Tabs de contenido */}
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
            {/* Tab de Accesos */}
            <Tab eventKey="access" title={`🚪 Registro de Accesos (${filteredAccessLogs.length})`}>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Cargando registros...</p>
                </div>
              ) : filteredAccessLogs.length === 0 ? (
                <Alert variant="info">No hay registros de acceso para mostrar</Alert>
              ) : (
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>Fecha/Hora</th>
                      <th>Visitante</th>
                      <th>RUT</th>
                      <th>Unidad</th>
                      <th>Estado</th>
                      <th>Autorizado Por</th>
                      <th>Salida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccessLogs.map((log, idx) => (
                      <tr key={idx}>
                        <td className="text-nowrap">
                          {log.entryTime || log.createdAt ? 
                            new Date(log.entryTime || log.createdAt).toLocaleString('es-CL', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'N/A'}
                        </td>
                        <td><strong>{log.guestName || log.name || 'N/A'}</strong></td>
                        <td>{log.guestRut || log.rut || '-'}</td>
                        <td>
                          <Badge bg="secondary">Depto #{log.unitNumber || log.unit || 'N/A'}</Badge>
                        </td>
                        <td>{getStatusBadge(log.status)}</td>
                        <td className="small text-muted">
                          {log.authorizedBy || log.createdBy || 'Sistema'}
                        </td>
                        <td className="text-nowrap">
                          {log.exitTime ? 
                            new Date(log.exitTime).toLocaleTimeString('es-CL', {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab>

            {/* Tab de Bitácora */}
            <Tab eventKey="logbook" title={`📖 Bitácora de Conserjería (${filteredLogbook.length})`}>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Cargando bitácora...</p>
                </div>
              ) : filteredLogbook.length === 0 ? (
                <Alert variant="info">No hay entradas de bitácora para mostrar</Alert>
              ) : (
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>Fecha/Hora</th>
                      <th>Categoría</th>
                      <th>Descripción</th>
                      <th>Registrado Por</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogbook.map((entry, idx) => (
                      <tr key={idx}>
                        <td className="text-nowrap">
                          {entry.timestamp || entry.createdAt ?
                            new Date(entry.timestamp || entry.createdAt).toLocaleString('es-CL', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'N/A'}
                        </td>
                        <td>{getCategoryBadge(entry.category)}</td>
                        <td>
                          <div className="small" style={{ maxWidth: '400px' }}>
                            {entry.note || entry.description || 'Sin descripción'}
                          </div>
                        </td>
                        <td className="small text-muted">
                          {entry.user || entry.createdBy || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
        <Card.Footer className="bg-light text-muted small">
          <i className="bi bi-shield-check me-2"></i>
          Los registros de auditoría se almacenan de forma permanente y no pueden ser modificados
        </Card.Footer>
      </Card>

      {/* Alertas de seguridad */}
      <Alert variant="warning" className="mt-4">
        <Alert.Heading className="h6">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Recomendaciones de Seguridad
        </Alert.Heading>
        <ul className="mb-0 small">
          <li>Revise diariamente los registros de acceso para detectar patrones inusuales</li>
          <li>Verifique que todas las visitas tengan autorización válida</li>
          <li>Supervise los ingresos fuera del horario habitual</li>
          <li>Asegúrese de que el personal de conserjería registre todas las novedades en la bitácora</li>
        </ul>
      </Alert>
    </div>
  );
};

export default AdminAudit;
