import { useState, useEffect, useRef } from 'react';
import {
  Card,
  Container,
  Row,
  Col,
  ListGroup,
  Badge,
  Button,
  Spinner,
  Alert,
  Modal,
  Table,
  Tabs,
  Tab,
  Form,
  InputGroup,
} from 'react-bootstrap';
import { adminBuildings, adminUnits, adminFinance } from '../../api/adminService';
import DepartmentDetailsModal from './modals/DepartmentDetailsModal';
import PackagesModal from './modals/PackagesModal';
import AccessModal from './modals/AccessModal';
import InvoicesModal from './modals/InvoicesModal';
import MaintenanceModal from './modals/MaintenanceModal';
import './DepartmentsAndBuildings.css';

const DepartmentsAndBuildings = () => {
  const [buildings, setBuildings] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('all');

  // Modales
  const [detailsModal, setDetailsModal] = useState({ show: false, unit: null });
  const [packagesModal, setPackagesModal] = useState({ show: false, unit: null });
  const [accessModal, setAccessModal] = useState({ show: false, unit: null });
  const [invoicesModal, setInvoicesModal] = useState({ show: false, unit: null });
  const [maintenanceModal, setMaintenanceModal] = useState({ show: false, unit: null });

  const mountTimeRef = useRef(performance.now());

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      const requestStart = performance.now();
      try {
        setLoading(true);
        setError('');
        console.log('🔄 Cargando departamentos y edificios...');
        console.log('📍 Endpoints:', {
          buildings: '/api/v1/buildings',
          units: '/api/v1/units'
        });

        // Intentar cargar buildings y units
        let buildingsResponse;
        let unitsResponse;
        
        try {
          [buildingsResponse, unitsResponse] = await Promise.all([
            adminBuildings.list({ limit: 100 }),
            adminUnits.list({ limit: 1000 }),
          ]);
        } catch (apiError) {
          console.error('❌ Error en API calls:', apiError);
          // Si falla, lanzar el error para que se maneje en el catch principal
          throw apiError;
        }

        console.log('🏢 Buildings Response:', buildingsResponse);
        console.log('🏠 Units Response:', unitsResponse);

        const buildingList = Array.isArray(buildingsResponse.data)
          ? buildingsResponse.data
          : buildingsResponse.data?.content || buildingsResponse.data?.buildings || [];

        const unitList = Array.isArray(unitsResponse.data)
          ? unitsResponse.data
          : unitsResponse.data?.content || unitsResponse.data?.units || [];

        console.log('📊 Buildings parsed:', buildingList.length, buildingList);
        console.log('📊 Units parsed:', unitList.length, unitList);

        setBuildings(buildingList);
        setUnits(unitList);

        const requestEnd = performance.now();
        console.log(
          `✅ Departments & Buildings cargados en: ${(requestEnd - requestStart).toFixed(2)}ms`,
        );
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Error al cargar datos de departamentos y edificios.';
        setError(msg);
        console.error('❌ Error cargando datos:', err);
        console.error('Detalles del error:', {
          message: err.message,
          code: err.code,
          response: err.response,
          stack: err.stack,
        });
        
        // Si es timeout o error de red, informar al usuario
        if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
          setError('El servidor está tardando demasiado en responder. Los datos se cargarán automáticamente.');
        } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
          setError('No se puede conectar al servidor. Verifica que el backend esté corriendo.');
        }
      } finally {
        setLoading(false);
        console.log('🏁 Loading finalizado');
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const renderTime = performance.now() - mountTimeRef.current;
    console.log(`🎨 DepartmentsAndBuildings component render: ${renderTime.toFixed(2)}ms`);
  });

  // Filtrar departamentos
  const filteredUnits = units.filter((unit) => {
    const matchesSearch =
      (unit.unitNumber && unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (unit.resident &&
        unit.resident.toLowerCase &&
        unit.resident.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (unit.ownerName &&
        unit.ownerName.toLowerCase &&
        unit.ownerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (unit.tenantName &&
        unit.tenantName.toLowerCase &&
        unit.tenantName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesBuilding = filterBuilding === 'all' || unit.buildingId === filterBuilding;

    return matchesSearch && matchesBuilding;
  });

  // Obtener nombre del edificio
  const getBuildingName = (buildingId) => {
    const building = buildings.find((b) => b.id === buildingId || b.buildingId === buildingId);
    return building?.name || building?.address || 'Edificio no especificado';
  };

  // Obtener información del morador/responsable del departamento
  const getResponsibleInfo = (unit) => {
    // Prioridad: inquilino > propietario > residente genérico > sin asignar
    return unit.tenantName || unit.resident || unit.ownerName || 'Sin morador asignado';
  };

  // Obtener contacto del morador
  const getResponsibleContact = (unit) => {
    return unit.tenantPhone || unit.ownerPhone || unit.residentPhone || null;
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <div className="text-muted">Cargando departamentos y edificios...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-primary mb-1">
          Gestión de Departamentos y Edificios
        </h2>
        <p className="text-muted">
          Vista completa de todos los departamentos con sus moradores. Filtra por edificio o busca por nombre.
        </p>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <strong>Error:</strong> {error}
          <div className="mt-2 small">
            <strong>Posibles soluciones:</strong>
            <ul className="mb-0 mt-1">
              <li>Verifica que el backend esté corriendo en http://168.197.50.14:8080</li>
              <li>Revisa la consola (F12) para más detalles del error</li>
              <li>Si el backend no está disponible, se cargarán datos de prueba automáticamente</li>
            </ul>
          </div>
        </Alert>
      )}

      {/* Mensaje informativo si no hay datos */}
      {!loading && units.length === 0 && !error && (
        <Alert variant="warning" className="mb-4">
          <strong>⚠️ No se encontraron departamentos</strong>
          <p className="mb-0 mt-2">
            Parece que no hay departamentos registrados. Por favor:
          </p>
          <ul className="mb-0 mt-2">
            <li>Verifica que existan departamentos en la sección <strong>Deptos</strong></li>
            <li>Asegúrate de que los departamentos estén asignados a edificios</li>
            <li>Revisa la consola del navegador (F12) para más detalles</li>
          </ul>
        </Alert>
      )}

      {/* Controles de búsqueda y filtro */}
      <Card className="shadow-sm mb-4 filter-section">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por nº departamento o nombre del morador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6}>
              <Form.Select
                value={filterBuilding}
                onChange={(e) => setFilterBuilding(e.target.value)}
              >
                <option value="all">🏢 Todos los edificios ({buildings.length})</option>
                {buildings.map((building) => (
                  <option
                    key={building.id || building.buildingId}
                    value={building.id || building.buildingId}
                  >
                    {building.name || building.address || 'Edificio sin nombre'}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
          <div className="mt-3 d-flex justify-content-between align-items-center">
            <small className="text-muted">
              <strong>Mostrando:</strong> {filteredUnits.length} de {units.length} departamentos
              {filterBuilding !== 'all' && (
                <span className="ms-2">
                  📍 Filtrado por: <strong>{getBuildingName(filterBuilding)}</strong>
                </span>
              )}
            </small>
            {(searchTerm || filterBuilding !== 'all') && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterBuilding('all');
                }}
              >
                🔄 Limpiar filtros
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Listado de departamentos */}
      {filteredUnits.length === 0 ? (
        <Alert variant="info">
          {units.length === 0 ? (
            <div>
              <strong>No hay departamentos registrados en el sistema.</strong>
              <p className="mb-0 mt-2">
                Por favor, registra departamentos primero en la sección de <strong>Deptos</strong>.
              </p>
            </div>
          ) : searchTerm || filterBuilding !== 'all' ? (
            'No se encontraron departamentos con los criterios de búsqueda.'
          ) : (
            'No hay departamentos disponibles.'
          )}
        </Alert>
      ) : (
        <Card className="shadow-sm">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Departamentos y Responsables</h5>
          </Card.Header>
          <Table responsive hover className="mb-0 table-modern">
            <thead className="table-light">
              <tr>
                <th>Edificio</th>
                <th>Departamento</th>
                <th>Morador / Responsable</th>
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnits.map((unit) => (
                <tr key={unit.id || unit.unitId} className="align-middle fade-in">
                  <td>
                    <strong>{getBuildingName(unit.buildingId)}</strong>
                  </td>
                  <td>
                    <Badge bg="info" className="p-2">
                      {unit.unitNumber || 'N/A'}
                    </Badge>
                  </td>
                  <td>
                    <div className="fw-500">{getResponsibleInfo(unit)}</div>
                    {getResponsibleContact(unit) && (
                      <small className="text-muted d-block">📞 {getResponsibleContact(unit)}</small>
                    )}
                  </td>
                  <td>
                    <Badge
                      bg={
                        unit.occupancyStatus === 'occupied' ||
                        unit.status === 'occupied'
                          ? 'success'
                          : 'warning'
                      }
                    >
                      {unit.occupancyStatus || unit.status || 'Disponible'}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-2 justify-content-center flex-wrap btn-action-group">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        title="Ver detalles"
                        onClick={() => setDetailsModal({ show: true, unit })}
                      >
                        👁️ Detalles
                      </Button>
                      <Button
                        variant="outline-info"
                        size="sm"
                        title="Ver paquetes"
                        onClick={() => setPackagesModal({ show: true, unit })}
                      >
                        📦 Paquetes
                      </Button>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        title="Controlar accesos"
                        onClick={() => setAccessModal({ show: true, unit })}
                      >
                        🚪 Accesos
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        title="Ver facturas"
                        onClick={() => setInvoicesModal({ show: true, unit })}
                      >
                        💰 Facturas
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        title="Mantenimiento"
                        onClick={() => setMaintenanceModal({ show: true, unit })}
                      >
                        🔧 Mantenimiento
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Modales */}
      <DepartmentDetailsModal
        show={detailsModal.show}
        unit={detailsModal.unit}
        onHide={() => setDetailsModal({ show: false, unit: null })}
        buildingName={detailsModal.unit ? getBuildingName(detailsModal.unit.buildingId) : ''}
      />

      <PackagesModal
        show={packagesModal.show}
        unit={packagesModal.unit}
        onHide={() => setPackagesModal({ show: false, unit: null })}
      />

      <AccessModal
        show={accessModal.show}
        unit={accessModal.unit}
        onHide={() => setAccessModal({ show: false, unit: null })}
      />

      <InvoicesModal
        show={invoicesModal.show}
        unit={invoicesModal.unit}
        onHide={() => setInvoicesModal({ show: false, unit: null })}
      />

      <MaintenanceModal
        show={maintenanceModal.show}
        unit={maintenanceModal.unit}
        onHide={() => setMaintenanceModal({ show: false, unit: null })}
      />
    </Container>
  );
};

export default DepartmentsAndBuildings;
