import { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { adminBuildings } from '../../api/adminService';

const AddBuildingModal = ({ show, onHide, onBuildingAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    floors: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      console.log('📤 Creando edificio:', buildingData);
      const response = await adminBuildings.create(buildingData);
      console.log('✅ Edificio creado:', response.data);

      // Limpiar formulario
      setFormData({
        name: '',
        address: '',
        floors: '',
        isActive: true,
      });

      // Notificar al componente padre
      if (onBuildingAdded) {
        onBuildingAdded(response.data);
      }

      // Cerrar modal
      onHide();
    } catch (err) {
      console.error('❌ Error creando edificio:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Error al crear el edificio. Por favor intenta nuevamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        address: '',
        floors: '',
        isActive: true,
      });
      setError('');
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>🏢 Agregar Nuevo Edificio</Modal.Title>
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
            <Form.Text className="text-muted">
              Indica el número total de pisos del edificio
            </Form.Text>
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
            <Form.Text className="text-muted">
              Los edificios inactivos no aparecerán en listados generales
            </Form.Text>
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
              Creando...
            </>
          ) : (
            '✓ Crear Edificio'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddBuildingModal;
