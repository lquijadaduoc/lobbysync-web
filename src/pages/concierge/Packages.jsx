import { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, Row, Col, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { conciergePackages } from '../../api/conciergeService';

const ConciergePackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('RECEIVED'); // RECEIVED, DELIVERED, ALL
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('unit'); // unit, carrier, date
  const [selectedPackages, setSelectedPackages] = useState([]);

  useEffect(() => {
    loadPackages();
  }, [filter]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (filter === 'ALL') {
        response = await conciergePackages.list();
      } else {
        response = await conciergePackages.listByStatus(filter);
      }
      
      const packagesList = Array.isArray(response.data) ? response.data : 
                          response.data?.content || [];
      
      setPackages(packagesList);
      setSelectedPackages([]); // Limpiar selección al cambiar filtro
    } catch (err) {
      setError(err.message || 'Error al cargar paquetes');
      console.error('Error cargando paquetes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverPackage = async (packageId) => {
    try {
      await conciergePackages.updateStatus(packageId, 'DELIVERED');
      loadPackages(); // Recargar lista
    } catch (err) {
      setError(err.message || 'Error al marcar paquete como entregado');
      console.error('Error actualizando paquete:', err);
    }
  };

  const handleDeliverMultiple = async () => {
    if (selectedPackages.length === 0) {
      alert('Por favor seleccione al menos un paquete');
      return;
    }

    if (!confirm(`¿Desea marcar ${selectedPackages.length} paquete(s) como entregado(s)?`)) {
      return;
    }

    try {
      // Entregar todos los seleccionados en paralelo
      await Promise.all(
        selectedPackages.map(pkgId => conciergePackages.updateStatus(pkgId, 'DELIVERED'))
      );
      
      alert(`✅ ${selectedPackages.length} paquete(s) marcado(s) como entregado(s)`);
      loadPackages();
    } catch (err) {
      setError('Error en entrega múltiple: ' + err.message);
    }
  };

  const togglePackageSelection = (packageId) => {
    setSelectedPackages(prev => 
      prev.includes(packageId) 
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPackages.length === filteredPackages.length) {
      setSelectedPackages([]);
    } else {
      setSelectedPackages(filteredPackages.map(pkg => pkg.id));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RECEIVED':
        return <Badge bg="warning" text="dark">📦 En bodega</Badge>;
      case 'DELIVERED':
        return <Badge bg="success">✅ Entregado</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Filtrar paquetes según búsqueda
  const filteredPackages = packages.filter(pkg => {
    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    
    switch (searchBy) {
      case 'unit':
        return String(pkg.unitNumber || pkg.unit || pkg.userId || '').toLowerCase().includes(term);
      case 'carrier':
        return (pkg.carrier || '').toLowerCase().includes(term);
      case 'date':
        const pkgDate = new Date(pkg.receivedDate || pkg.createdAt);
        return pkgDate.toLocaleDateString('es-CL').includes(term);
      default:
        return true;
    }
  });

  const receivedCount = packages.filter(p => p.status === 'RECEIVED').length;
  const deliveredCount = packages.filter(p => p.status === 'DELIVERED').length;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold text-primary mb-0">📦 Gestión de Paquetería</h3>
        {selectedPackages.length > 0 && (
          <Button variant="success" size="lg" onClick={handleDeliverMultiple}>
            <i className="bi bi-check-all me-2"></i>
            Entregar Seleccionados ({selectedPackages.length})
          </Button>
        )}
      </div>

      {/* Estadísticas */}
      <Row className="mb-3">
        <Col md={4}>
          <Card className="text-center border-warning">
            <Card.Body className="py-2">
              <h3 className="mb-0 text-warning">{receivedCount}</h3>
              <small className="text-muted">En Bodega</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-success">
            <Card.Body className="py-2">
              <h3 className="mb-0 text-success">{deliveredCount}</h3>
              <small className="text-muted">Entregados Hoy</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-info">
            <Card.Body className="py-2">
              <h3 className="mb-0 text-info">{packages.length}</h3>
              <small className="text-muted">Total</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          {/* Barra de búsqueda avanzada */}
          <Row className="mb-3">
            <Col md={3}>
              <Form.Select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="RECEIVED">📦 Pendientes</option>
                <option value="DELIVERED">✅ Entregados</option>
                <option value="ALL">📋 Todos</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value)}
              >
                <option value="unit">🏠 Por Depto</option>
                <option value="carrier">🚚 Por Empresa</option>
                <option value="date">📅 Por Fecha</option>
              </Form.Select>
            </Col>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder={
                    searchBy === 'unit' ? 'Buscar por departamento (ej: 101)' :
                    searchBy === 'carrier' ? 'Buscar por empresa (ej: Chilexpress)' :
                    'Buscar por fecha (ej: 12/01/2026)'
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                    <i className="bi bi-x"></i>
                  </Button>
                )}
              </InputGroup>
            </Col>
          </Row>

          {error && <Alert variant="danger">{error}</Alert>}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Cargando paquetes...</p>
            </div>
          ) : filteredPackages.length === 0 ? (
            <Alert variant="info">
              {searchTerm ? 'No se encontraron paquetes con ese criterio' : 'No hay paquetes para mostrar'}
            </Alert>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>
                    <Form.Check
                      type="checkbox"
                      checked={selectedPackages.length === filteredPackages.length && filteredPackages.length > 0}
                      onChange={toggleSelectAll}
                      disabled={filter !== 'RECEIVED'}
                    />
                  </th>
                  <th>Fecha Recepción</th>
                  <th>Depto</th>
                  <th>Tracking</th>
                  <th>Transportista</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPackages.map((pkg) => (
                  <tr key={pkg.id} className={selectedPackages.includes(pkg.id) ? 'table-active' : ''}>
                    <td>
                      {pkg.status === 'RECEIVED' && (
                        <Form.Check
                          type="checkbox"
                          checked={selectedPackages.includes(pkg.id)}
                          onChange={() => togglePackageSelection(pkg.id)}
                        />
                      )}
                    </td>
                    <td className="text-nowrap">
                      {pkg.receivedDate ? new Date(pkg.receivedDate).toLocaleDateString('es-CL') : 'N/A'}
                    </td>
                    <td>
                      <strong>#{pkg.unitNumber || pkg.unit || pkg.userId || 'N/A'}</strong>
                    </td>
                    <td>
                      <code className="text-primary">{pkg.trackingNumber || 'S/N'}</code>
                    </td>
                    <td>{pkg.carrier || 'N/A'}</td>
                    <td>
                      <Badge bg="secondary" className="text-uppercase">
                        {pkg.location || 'Recepción'}
                      </Badge>
                    </td>
                    <td>{getStatusBadge(pkg.status)}</td>
                    <td>
                      {pkg.status === 'RECEIVED' && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleDeliverPackage(pkg.id)}
                        >
                          <i className="bi bi-check-circle me-1"></i>
                          Entregar
                        </Button>
                      )}
                      {pkg.status === 'DELIVERED' && (
                        <span className="text-success">
                          <i className="bi bi-check-circle-fill me-1"></i>
                          Completado
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {filteredPackages.length > 0 && (
            <div className="text-muted small mt-3">
              <i className="bi bi-info-circle me-1"></i>
              Mostrando {filteredPackages.length} de {packages.length} paquetes
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ConciergePackages;
