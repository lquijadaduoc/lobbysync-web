import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { adminBuildings } from '../../api/adminService';

const EditBuildingModal = ({ show, onHide, building, onBuildingUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    floors: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar datos del edificio cuando se abre el modal
  useEffect(() => {
    if (building && show) {
      setFormData({
        name: building.name || '',
        address: building.address || '',
        floors: building.floors || '',
        isActive: building.isActive !== undefined ? building.isActive : true,
      });
    }
  }, [building, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.name.trim()) {
      setError('El nombre del edificio es obligatorio');
      return;
    }
    if (!formData.address.trim()) {
      setError('La dirección es obligatoria');
      return;
    }
    if (!formData.floors || formData.floors < 1) {
      setError('El número de pisos debe ser mayor a 0');
      return;
    }

    setLoading(true);
    try {
      const buildingData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        floors: parseInt(formData.floors),
        isActive: formData.isActive,
      };

      console.log('📤 Actualizando edificio:', buildingData);
      const response = await adminBuildings.update(building.id, buildingData);
      console.log('✅ Edificio actualizado:', response.data);

      // Notificar al componente padre
      if (onBuildingUpdated) {
        onBuildingUpdated(response.data);
      }

      // Cerrar modal
      onHide();
    } catch (err) {
      console.error('❌ Error actualizando edificio:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Error al actualizar el edificio. Por favor intenta nuevamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      onHide();
    }
  };

  if (!building) return null;

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>✏️ Editar Edificio</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>
              Nombre del Edificio <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Torre Central"
              disabled={loading}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Dirección <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Ej: Av. Principal 123"
              disabled={loading}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Número de Pisos <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="number"
              name="floors"
              value={formData.floors}
              onChange={handleChange}
              placeholder="Ej: 10"
              min="1"
              disabled={loading}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="isActive"
              label="Edificio activo"
              checked={formData.isActive}
              onChange={handleChange}
              disabled={loading}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              Guardando...
            </>
          ) : (
            '✓ Guardar Cambios'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditBuildingModal;
