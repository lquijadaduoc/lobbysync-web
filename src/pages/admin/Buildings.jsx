import { useEffect, useState, useRef } from 'react';
import { Card, ListGroup, Spinner, Alert, Badge, Button } from 'react-bootstrap';
import { adminBuildings } from '../../api/adminService';

const AdminBuildings = () => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mountTimeRef = useRef(performance.now());

  useEffect(() => {
    const loadBuildings = async () => {
      const requestStart = performance.now();
      try {
        setLoading(true);
        setError('');
        const { data } = await adminBuildings.list({ limit: 100 });
        const requestEnd = performance.now();
        console.log(`🏢 Buildings API response: ${(requestEnd - requestStart).toFixed(2)}ms`);

        const buildingList = Array.isArray(data) ? data : data?.content || data?.buildings || [];
        setBuildings(buildingList);
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Error al cargar edificios.';
        setError(msg);
        console.error('Error en adminBuildings.list:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBuildings();
  }, []);

  useEffect(() => {
    const renderTime = performance.now() - mountTimeRef.current;
    console.log(`🎨 AdminBuildings component render: ${renderTime.toFixed(2)}ms`);
  });

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="mb-0">Edificios</Card.Title>
          <Button variant="primary" size="sm" disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Cargando...
              </>
            ) : (
              '+ Nuevo edificio'
            )}
          </Button>
        </div>

        {error && (
          <Alert variant="danger" className="mb-3">
            <strong>Error:</strong> {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <div className="text-muted">Cargando edificios...</div>
          </div>
        ) : buildings.length === 0 ? (
          <Alert variant="info" className="mb-0">
            No hay edificios disponibles
          </Alert>
        ) : (
          <ListGroup variant="flush">
            {buildings.map((building) => (
              <ListGroup.Item
                key={building.id || building.buildingId}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <h6 className="mb-1">{building.name || building.address || 'N/A'}</h6>
                  <small className="text-muted">
                    {building.address && building.name && building.address !== building.name
                      ? building.address
                      : ''}
                  </small>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  <Badge bg="primary" className="me-2">
                    {building.floors || '?'} pisos
                  </Badge>
                  <Badge bg="secondary">
                    {building.totalUnits || '?'} unidades
                  </Badge>
                  <div className="ms-3">
                    <Button variant="sm" size="sm" className="me-1">
                      Editar
                    </Button>
                    <Button variant="danger" size="sm">
                      Eliminar
                    </Button>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
      {buildings.length > 0 && (
        <Card.Footer className="bg-light text-muted small">
          Total: {buildings.length} edificios
        </Card.Footer>
      )}
    </Card>
  );
};

export default AdminBuildings;
