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
import AddUnitModal from '../../components/modals/AddUnitModal';
import EditUnitModal from '../../components/modals/EditUnitModal';
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
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [editUnitModal, setEditUnitModal] = useState({ show: false, unit: null });
  const [deleteUnitModal, setDeleteUnitModal] = useState({ show: false, unit: null });
  const [deleting, setDeleting] = useState(false);

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
    const unitNum = unit.unitNumber || unit.number || '';
    const matchesSearch =
      (unitNum && unitNum.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
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
    if (unit.tenantName) {
      return { name: unit.tenantName, type: 'Arrendatario', icon: '🏠' };
    }
    if (unit.ownerName) {
      return { name: unit.ownerName, type: 'Propietario', icon: '👤' };
    }
    if (unit.resident) {
      return { name: unit.resident, type: 'Residente', icon: '👥' };
    }
    return { name: 'Sin morador asignado', type: '', icon: '⚠️' };
  };

  // Obtener contacto del morador
  const getResponsibleContact = (unit) => {
    return unit.tenantPhone || unit.ownerPhone || unit.residentPhone || null;
  };

  // Obtener color de fila según edificio (para mejor visualización)
  const getBuildingColor = (buildingId) => {
    const colors = [
      'rgba(13, 110, 253, 0.05)',   // Azul claro
      'rgba(25, 135, 84, 0.05)',    // Verde claro
      'rgba(220, 53, 69, 0.05)',    // Rojo claro
      'rgba(255, 193, 7, 0.05)',    // Amarillo claro
      'rgba(111, 66, 193, 0.05)',   // Púrpura claro
      'rgba(13, 202, 240, 0.05)',   // Cyan claro
    ];
    const index = buildings.findIndex((b) => b.id === buildingId);
    return index >= 0 ? colors[index % colors.length] : 'transparent';
  };

  const handleUnitAdded = (newUnit) => {
    console.log('✅ Departamento agregado, actualizando lista...');
    setUnits((prev) => [...prev, newUnit]);
  };

  const handleUnitUpdated = (updatedUnit) => {
    console.log('✅ Departamento actualizado, actualizando lista...');
    setUnits((prev) =>
      prev.map((unit) => (unit.id === updatedUnit.id ? updatedUnit : unit))
    );
  };

  const handleDeleteUnit = async () => {
    if (!deleteUnitModal.unit) return;

    setDeleting(true);
    try {
      console.log('🗑️ Eliminando departamento:', deleteUnitModal.unit.id);
      await adminUnits.delete(deleteUnitModal.unit.id);
      console.log('✅ Departamento eliminado');

      // Actualizar lista
      setUnits((prev) => prev.filter((u) => u.id !== deleteUnitModal.unit.id));

      // Cerrar modal
      setDeleteUnitModal({ show: false, unit: null });
    } catch (err) {
      console.error('❌ Error eliminando departamento:', err);
      alert(
        err.response?.data?.message ||
          err.message ||
          'Error al eliminar el departamento. Por favor intenta nuevamente.'
      );
    } finally {
      setDeleting(false);
    }
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
      {/* Modales */}
      <AddUnitModal
        show={showAddUnitModal}
        onHide={() => setShowAddUnitModal(false)}
        onUnitAdded={handleUnitAdded}
        selectedBuildingId={filterBuilding !== 'all' ? filterBuilding : null}
      />
      
      <EditUnitModal
        show={editUnitModal.show}
        onHide={() => setEditUnitModal({ show: false, unit: null })}
        unit={editUnitModal.unit}
        onUnitUpdated={handleUnitUpdated}
      />

      <Modal
        show={deleteUnitModal.show}
        onHide={() => !deleting && setDeleteUnitModal({ show: false, unit: null })}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>🗑️ Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <strong>¿Estás seguro de eliminar este departamento?</strong>
          </Alert>
          {deleteUnitModal.unit && (
            <div>
              <p className="mb-2">
                <strong>Departamento:</strong> {deleteUnitModal.unit.unitNumber || deleteUnitModal.unit.number}
              </p>
              <p className="mb-2">
                <strong>Edificio:</strong> {getBuildingName(deleteUnitModal.unit.buildingId)}
              </p>
              <Alert variant="danger" className="small mb-0">
                <strong>⚠️ Advertencia:</strong> Esta acción no se puede deshacer. Se eliminarán
                todos los datos asociados al departamento.
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setDeleteUnitModal({ show: false, unit: null })}
            disabled={deleting}
          >
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteUnit} disabled={deleting}>
            {deleting ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Eliminando...
              </>
            ) : (
              '🗑️ Eliminar'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Header */}
      <div className="mb-4 d-flex justify-content-between align-items-start">
        <div>
          <h2 className="fw-bold text-primary mb-1">
            Gestión de Departamentos y Edificios
          </h2>
          <p className="text-muted mb-0">
            Vista completa de todos los departamentos con sus moradores. Filtra por edificio o busca por nombre.
          </p>
        </div>
        <Button variant="success" onClick={() => setShowAddUnitModal(true)}>
          + Agregar Departamento
        </Button>
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
          <Card.Header className="bg-light d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Departamentos y Responsables</h5>
            {filterBuilding !== 'all' && (
              <Badge bg="primary" className="fs-6">
                🏢 {getBuildingName(filterBuilding)}
              </Badge>
            )}
          </Card.Header>
          <Table responsive hover className="mb-0 table-modern">
            <thead className="table-light">
              <tr>
                <th style={{ width: '20%' }}>🏢 Edificio</th>
                <th style={{ width: '15%' }}>🏠 Departamento</th>
                <th style={{ width: '25%' }}>👤 Morador / Responsable</th>
                <th style={{ width: '12%' }}>📊 Estado</th>
                <th className="text-center" style={{ width: '28%' }}>⚙️ Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnits.map((unit) => (
                <tr 
                  key={unit.id || unit.unitId} 
                  className="align-middle fade-in"
                  style={{ backgroundColor: getBuildingColor(unit.buildingId) }}
                >
                  <td>
                    <div>
                      <strong className="text-primary">🏢 {getBuildingName(unit.buildingId)}</strong>
                      {buildings.find((b) => b.id === unit.buildingId)?.address && (
                        <small className="text-muted d-block">
                          {buildings.find((b) => b.id === unit.buildingId).address}
                        </small>
                      )}
                    </div>
                  </td>
                  <td>
                    <Badge bg="info" className="p-2 fs-6">
                      Depto {unit.unitNumber || unit.number || 'N/A'}
                    </Badge>
                    {unit.floor && (
                      <small className="text-muted d-block mt-1">Piso {unit.floor}</small>
                    )}
                  </td>
                  <td>
                    <div>
                      <div className="fw-500">
                        {getResponsibleInfo(unit).icon} {getResponsibleInfo(unit).name}
                      </div>
                      {getResponsibleInfo(unit).type && (
                        <Badge bg="secondary" className="me-2 mt-1">
                          {getResponsibleInfo(unit).type}
                        </Badge>
                      )}
                      {getResponsibleContact(unit) && (
                        <small className="text-muted d-block">📞 {getResponsibleContact(unit)}</small>
                      )}
                    </div>
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
                        variant="outline-secondary"
                        size="sm"
                        title="Asignar/Editar Morador"
                        onClick={() => setEditUnitModal({ show: true, unit })}
                      >
                        👤 Morador
                      </Button>
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
                      <Button
                        variant="danger"
                        size="sm"
                        title="Eliminar departamento"
                        onClick={() => setDeleteUnitModal({ show: true, unit })}
                      >
                        🗑️ Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filterBuilding === 'all' && buildings.length > 1 && (
            <Card.Footer className="bg-light">
              <small className="text-muted">
                <strong>Leyenda de colores:</strong> Cada edificio tiene un color de fondo distintivo para facilitar la identificación
              </small>
              <div className="d-flex flex-wrap gap-3 mt-2">
                {buildings.map((building, index) => {
                  const colors = [
                    'rgba(13, 110, 253, 0.15)',
                    'rgba(25, 135, 84, 0.15)',
                    'rgba(220, 53, 69, 0.15)',
                    'rgba(255, 193, 7, 0.15)',
                    'rgba(111, 66, 193, 0.15)',
                    'rgba(13, 202, 240, 0.15)',
                  ];
                  const color = colors[index % colors.length];
                  const unitCount = units.filter((u) => u.buildingId === building.id).length;
                  
                  return (
                    <div key={building.id} className="d-flex align-items-center">
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          backgroundColor: color,
                          border: '1px solid #dee2e6',
                          borderRadius: '3px',
                          marginRight: '8px',
                        }}
                      />
                      <small>
                        <strong>{building.name || building.address}</strong>
                        <Badge bg="secondary" className="ms-2" style={{ fontSize: '0.7rem' }}>
                          {unitCount} depto{unitCount !== 1 ? 's' : ''}
                        </Badge>
                      </small>
                    </div>
                  );
                })}
              </div>
            </Card.Footer>
          )}
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
