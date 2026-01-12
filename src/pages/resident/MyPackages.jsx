import { useEffect, useState, useRef } from 'react';
import { Card, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { residentPackages } from '../../api/residentService';

const ResidentPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mountTimeRef = useRef(performance.now());

  useEffect(() => {
    const loadPackages = async () => {
      const requestStart = performance.now();
      try {
        setLoading(true);
        setError('');
        const { data } = await residentPackages.list({ limit: 50 });
        const requestEnd = performance.now();
        console.log(`📦 Packages API response: ${(requestEnd - requestStart).toFixed(2)}ms`);
        
        const packageList = Array.isArray(data) ? data : data?.content || data?.packages || [];
        setPackages(packageList);
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Error al cargar paquetes.';
        setError(msg);
        console.error('Error en residentPackages.list:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPackages();
  }, []);

  useEffect(() => {
    const renderTime = performance.now() - mountTimeRef.current;
    console.log(`🎨 ResidentPackages component render: ${renderTime.toFixed(2)}ms`);
  });

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'received' || statusLower === 'en recepción' || statusLower === 'received')
      return <Badge bg="info" text="dark">En recepción</Badge>;
    if (statusLower === 'delivered' || statusLower === 'entregado')
      return <Badge bg="success">Entregado</Badge>;
    if (statusLower === 'pending' || statusLower === 'pendiente')
      return <Badge bg="warning" text="dark">Pendiente</Badge>;
    return <Badge bg="secondary">{status || 'N/A'}</Badge>;
  };

  return (
    <div>
      <h3 className="mb-4">📦 Historial de Paquetes</h3>
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="mb-3">
            Todos mis paquetes recibidos
            <Badge bg="primary" className="ms-2">{packages.length} total</Badge>
          </Card.Title>
          {error && (
            <Alert variant="danger" className="mb-3">
              <strong>Error:</strong> {error}
            </Alert>
          )}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <div className="text-muted">Cargando paquetes...</div>
            </div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Fecha Recepción</th>
                  <th>Fecha Entrega</th>
                  <th>Referencia</th>
                  <th>Proveedor</th>
                  <th>Estado</th>
                  <th>Recibido por</th>
                </tr>
              </thead>
              <tbody>
                {packages.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No hay paquetes disponibles
                    </td>
                  </tr>
                ) : (
                  packages.map((pkg) => (
                    <tr key={pkg.id}>
                      <td className="text-nowrap">
                        {pkg.receivedDate ? new Date(pkg.receivedDate).toLocaleDateString('es-CL') : '-'}
                      </td>
                      <td className="text-nowrap">
                        {pkg.deliveredDate ? new Date(pkg.deliveredDate).toLocaleDateString('es-CL') : '-'}
                      </td>
                      <td>
                        <code className="text-primary">{pkg.trackingNumber || pkg.referenceNumber || 'N/A'}</code>
                      </td>
                      <td>{pkg.carrier || pkg.provider || 'N/A'}</td>
                      <td>{getStatusBadge(pkg.status)}</td>
                      <td>
                        {pkg.deliveredDate ? (
                          <span className="text-success">
                            <i className="bi bi-person-check me-1"></i>
                            {pkg.deliveredBy || 'Residente'}
                          </span>
                        ) : (
                          <span className="text-muted">En conserjería</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}

          {packages.length > 0 && (
            <div className="text-muted small mt-3">
              <i className="bi bi-info-circle me-1"></i>
              Este historial incluye todos los paquetes recibidos desde tu ingreso al edificio.
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ResidentPackages;
