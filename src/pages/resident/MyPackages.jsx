import { useEffect, useState, useRef } from 'react';
import { Card, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { residentPackages } from '../../api/conciergeService';

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
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="mb-3">Mis paquetes</Card.Title>
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
                <th>Referencia</th>
                <th>Proveedor</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {packages.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center text-muted">
                    No hay paquetes disponibles
                  </td>
                </tr>
              ) : (
                packages.map((pkg) => (
                  <tr key={pkg.id || pkg.packageId}>
                    <td>{pkg.reference || pkg.trackingNumber || 'N/A'}</td>
                    <td>{pkg.provider || pkg.carrier || 'N/A'}</td>
                    <td>{getStatusBadge(pkg.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </Card.Body>
      {packages.length > 0 && (
        <Card.Footer className="bg-light text-muted small">
          Total: {packages.length} paquetes
        </Card.Footer>
      )}
    </Card>
  );
};

export default ResidentPackages;
