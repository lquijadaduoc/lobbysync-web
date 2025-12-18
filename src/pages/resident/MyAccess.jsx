import { useEffect, useState, useRef } from 'react';
import { Card, Table, Badge, Spinner, Alert, Form } from 'react-bootstrap';
import { residentAccess } from '../../api/residentService';

const MyAccess = () => {
  const [accessLogs, setAccessLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState('');
  const mountTimeRef = useRef(performance.now());

  useEffect(() => {
    loadAccessLogs();
  }, []);

  const loadAccessLogs = async () => {
    const requestStart = performance.now();
    try {
      setLoading(true);
      setError('');
      
      let params = { page: 0, size: 50 };
      if (filterDate) {
        params.date = filterDate;
      }
      if (filterType) {
        params.type = filterType;
      }
      
      const { data } = await residentAccess.listLogs(params);
      const requestEnd = performance.now();
      console.log(`🚪 Access logs API response: ${(requestEnd - requestStart).toFixed(2)}ms`);
      
      const logList = Array.isArray(data) ? data : data?.content || data?.logs || [];
      setAccessLogs(logList);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al cargar accesos.';
      setError(msg);
      console.error('Error en residentAccess.listLogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const renderTime = performance.now() - mountTimeRef.current;
    console.log(`🎨 MyAccess component render: ${renderTime.toFixed(2)}ms`);
  });

  const getTypeBadge = (type) => {
    const typeLower = type?.toLowerCase();
    if (typeLower === 'entry' || typeLower === 'entrada')
      return <Badge bg="success">Entrada</Badge>;
    if (typeLower === 'exit' || typeLower === 'salida')
      return <Badge bg="danger">Salida</Badge>;
    if (typeLower === 'denied' || typeLower === 'denegado')
      return <Badge bg="secondary">Denegado</Badge>;
    return <Badge bg="info">{type || 'N/A'}</Badge>;
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    try {
      const date = new Date(dateTime);
      return date.toLocaleString('es-ES');
    } catch {
      return dateTime;
    }
  };

  const handleFilterChange = () => {
    loadAccessLogs();
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="mb-3">Mi acceso</Card.Title>
        
        {/* Filtros */}
        <div className="mb-3 p-3 bg-light rounded">
          <div className="row g-2">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="small fw-bold">Filtrar por fecha:</Form.Label>
                <Form.Control
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="small fw-bold">Tipo de evento:</Form.Label>
                <Form.Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="entry">Entrada</option>
                  <option value="exit">Salida</option>
                  <option value="denied">Denegado</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>
          <div className="mt-2">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={handleFilterChange}
            >
              Aplicar filtros
            </button>
            <button
              className="btn btn-sm btn-outline-secondary ms-2"
              onClick={() => {
                setFilterDate('');
                setFilterType('');
              }}
            >
              Limpiar
            </button>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="mb-3">
            <strong>Error:</strong> {error}
          </Alert>
        )}
        
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <div className="text-muted">Cargando registros de acceso...</div>
          </div>
        ) : (
          <Table hover responsive>
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Tipo</th>
                <th>Ubicación</th>
                <th>Método</th>
              </tr>
            </thead>
            <tbody>
              {accessLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No hay registros de acceso disponibles
                  </td>
                </tr>
              ) : (
                accessLogs.map((log, idx) => (
                  <tr key={log.id || idx}>
                    <td>{formatDateTime(log.timestamp || log.dateTime)}</td>
                    <td>{getTypeBadge(log.type)}</td>
                    <td>{log.location || log.buildingName || 'N/A'}</td>
                    <td className="small text-muted">
                      {log.method || log.accessMethod || 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default MyAccess;
