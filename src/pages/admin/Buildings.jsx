import { useEffect, useState, useRef } from 'react';
import { Card, ListGroup, Spinner, Alert, Badge, Button, Modal } from 'react-bootstrap';
import { adminBuildings } from '../../api/adminService';
import AddBuildingModal from '../../components/modals/AddBuildingModal';
import EditBuildingModal from '../../components/modals/EditBuildingModal';

const AdminBuildings = () => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editModal, setEditModal] = useState({ show: false, building: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, building: null });
  const [deleting, setDeleting] = useState(false);
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

  const handleBuildingAdded = (newBuilding) => {
    console.log('✅ Edificio agregado, recargando lista...');
    setBuildings((prev) => [...prev, newBuilding]);
  };

  const handleBuildingUpdated = (updatedBuilding) => {
    console.log('✅ Edificio actualizado, actualizando lista...');
    setBuildings((prev) =>
      prev.map((building) => (building.id === updatedBuilding.id ? updatedBuilding : building))
    );
  };

  const handleDeleteBuilding = async () => {
    if (!deleteModal.building) return;

    setDeleting(true);
    try {
      console.log('🗑️ Eliminando edificio:', deleteModal.building.id);
      await adminBuildings.delete(deleteModal.building.id);
      console.log('✅ Edificio eliminado');

      // Actualizar lista
      setBuildings((prev) => prev.filter((b) => b.id !== deleteModal.building.id));

      // Cerrar modal
      setDeleteModal({ show: false, building: null });
    } catch (err) {
      console.error('❌ Error eliminando edificio:', err);
      alert(
        err.response?.data?.message ||
          err.message ||
          'Error al eliminar el edificio. Puede tener departamentos asociados.'
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <AddBuildingModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onBuildingAdded={handleBuildingAdded}
      />

      <EditBuildingModal
        show={editModal.show}
        onHide={() => setEditModal({ show: false, building: null })}
        building={editModal.building}
        onBuildingUpdated={handleBuildingUpdated}
      />

      <Modal
        show={deleteModal.show}
        onHide={() => !deleting && setDeleteModal({ show: false, building: null })}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>🗑️ Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <strong>¿Estás seguro de eliminar este edificio?</strong>
          </Alert>
          {deleteModal.building && (
            <div>
              <p className="mb-2">
                <strong>Edificio:</strong> {deleteModal.building.name}
              </p>
              <p className="mb-2">
                <strong>Dirección:</strong> {deleteModal.building.address}
              </p>
              <Alert variant="danger" className="small mb-0">
                <strong>⚠️ Advertencia:</strong> Esta acción no se puede deshacer. Si el edificio
                tiene departamentos asociados, no podrá ser eliminado.
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ show: false, building: null })}
            disabled={deleting}
          >
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteBuilding} disabled={deleting}>
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
      
      <Card className="shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="mb-0">Edificios</Card.Title>
          <Button 
            variant="primary" 
            size="sm" 
            disabled={loading}
            onClick={() => setShowAddModal(true)}
          >
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
                    <Button
                      variant="primary"
                      size="sm"
                      className="me-1"
                      onClick={() => setEditModal({ show: true, building })}
                      title="Editar edificio"
                    >
                      ✏️ Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteModal({ show: true, building })}
                      title="Eliminar edificio"
                    >
                      🗑️ Eliminar
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
    </>
  );
};

export default AdminBuildings;
