import { useEffect, useState } from 'react';
import { Card, Badge, Row, Col, Spinner, Alert, Button, Table } from 'react-bootstrap';
import { adminUnits, adminBuildings } from '../../api/adminService';
import AddUnitModal from '../../components/modals/AddUnitModal';
import EditUnitModal from '../../components/modals/EditUnitModal';

const AdminUnits = () => {
  const [units, setUnits] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editModal, setEditModal] = useState({ show: false, unit: null });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const [buildingsResponse, unitsResponse] = await Promise.all([
          adminBuildings.list({ limit: 100 }),
          adminUnits.list({ limit: 1000 }),
        ]);

        const buildingList = Array.isArray(buildingsResponse.data)
          ? buildingsResponse.data
          : buildingsResponse.data?.content || buildingsResponse.data?.buildings || [];

        const unitList = Array.isArray(unitsResponse.data)
          ? unitsResponse.data
          : unitsResponse.data?.content || unitsResponse.data?.units || [];

        setBuildings(buildingList);
        setUnits(unitList);
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Error al cargar departamentos.';
        setError(msg);
        console.error('Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getBuildingName = (buildingId) => {
    const building = buildings.find((b) => b.id === buildingId);
    return building?.name || building?.address || 'N/A';
  };

  const handleUnitAdded = (newUnit) => {
    setUnits((prev) => [...prev, newUnit]);
  };

  const handleUnitUpdated = (updatedUnit) => {
    setUnits((prev) =>
      prev.map((unit) => (unit.id === updatedUnit.id ? updatedUnit : unit))
    );
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <Card.Body>
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <div className="text-muted">Cargando departamentos...</div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <AddUnitModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onUnitAdded={handleUnitAdded}
      />

      <EditUnitModal
        show={editModal.show}
        onHide={() => setEditModal({ show: false, unit: null })}
        unit={editModal.unit}
        onUnitUpdated={handleUnitUpdated}
      />

      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Card.Title className="mb-0">Departamentos</Card.Title>
            <Button variant="success" size="sm" onClick={() => setShowAddModal(true)}>
              + Agregar Departamento
            </Button>
          </div>

          {error && (
            <Alert variant="danger" className="mb-3">
              <strong>Error:</strong> {error}
            </Alert>
          )}

          {units.length === 0 ? (
            <Alert variant="info" className="mb-0">
              No hay departamentos registrados. Haz clic en "Agregar Departamento" para crear uno.
            </Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Edificio</th>
                  <th>Departamento</th>
                  <th>Piso</th>
                  <th>Propietario</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr key={unit.id}>
                    <td>
                      <strong className="text-primary">
                        🏢 {getBuildingName(unit.buildingId)}
                      </strong>
                    </td>
                    <td>
                      <Badge bg="info" className="p-2">
                        {unit.unitNumber || unit.number || 'N/A'}
                      </Badge>
                    </td>
                    <td>
                      {unit.floor ? `Piso ${unit.floor}` : '-'}
                    </td>
                    <td>
                      {unit.ownerName || unit.tenantName || '-'}
                      {unit.ownerPhone && (
                        <small className="text-muted d-block">📞 {unit.ownerPhone}</small>
                      )}
                    </td>
                    <td>
                      <Badge bg={unit.isActive ? 'success' : 'secondary'}>
                        {unit.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setEditModal({ show: true, unit })}
                      >
                        ✏️ Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
        {units.length > 0 && (
          <Card.Footer className="bg-light text-muted small">
            Total: {units.length} departamento{units.length !== 1 ? 's' : ''} en {buildings.length} edificio{buildings.length !== 1 ? 's' : ''}
          </Card.Footer>
        )}
      </Card>
    </>
  );
};

export default AdminUnits;
