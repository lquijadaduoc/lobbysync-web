import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { adminUnits, adminBuildings } from '../../api/adminService';

const AddUnitModal = ({ show, onHide, onUnitAdded, selectedBuildingId = null }) => {
  const [buildings, setBuildings] = useState([]);
  const [loadingBuildings, setLoadingBuildings] = useState(true);
  const [formData, setFormData] = useState({
    unitNumber: '',
    buildingId: selectedBuildingId || '',
    floor: '',
    surfaceArea: '',
    aliquot: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar edificios disponibles
  useEffect(() => {
    const loadBuildings = async () => {
      try {
        setLoadingBuildings(true);
        const { data } = await adminBuildings.list({ limit: 100 });
        const buildingList = Array.isArray(data) ? data : data?.content || data?.buildings || [];
        setBuildings(buildingList);
      } catch (err) {
        console.error('Error cargando edificios:', err);
      } finally {
        setLoadingBuildings(false);
      }
    };

    if (show) {
      loadBuildings();
    }
  }, [show]);

  // Actualizar buildingId si se proporciona desde props
  useEffect(() => {
    if (selectedBuildingId) {
      setFormData((prev) => ({ ...prev, buildingId: selectedBuildingId }));
    }
  }, [selectedBuildingId]);

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
    if (!formData.unitNumber.trim()) {
      setError('El número de departamento es obligatorio');
      return;
    }
    if (!formData.buildingId) {
      setError('Debes seleccionar un edificio');
      return;
    }
    if (!formData.floor || formData.floor < 1) {
      setError('El número de piso debe ser mayor a 0');
      return;
    }

    setLoading(true);
    try {
      const unitData = {
        unitNumber: formData.unitNumber.trim(),
        buildingId: parseInt(formData.buildingId),
        floor: parseInt(formData.floor),
        surfaceArea: formData.surfaceArea ? parseFloat(formData.surfaceArea) : null,
        aliquot: formData.aliquot ? parseFloat(formData.aliquot) : null,
        ownerName: formData.ownerName.trim() || null,
        ownerPhone: formData.ownerPhone.trim() || null,
        ownerEmail: formData.ownerEmail.trim() || null,
        isActive: formData.isActive,
      };

      console.log('📤 Creando departamento:', unitData);
      const response = await adminUnits.create(unitData);
      console.log('✅ Departamento creado:', response.data);

      // Limpiar formulario
      setFormData({
        unitNumber: '',
        buildingId: selectedBuildingId || '',
        floor: '',
        surfaceArea: '',
        aliquot: '',
        ownerName: '',
        ownerPhone: '',
        ownerEmail: '',
        isActive: true,
      });

      // Notificar al componente padre
      if (onUnitAdded) {
        onUnitAdded(response.data);
      }

      // Cerrar modal
      onHide();
    } catch (err) {
      console.error('❌ Error creando departamento:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Error al crear el departamento. Por favor intenta nuevamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        unitNumber: '',
        buildingId: selectedBuildingId || '',
        floor: '',
        surfaceArea: '',
        aliquot: '',
        ownerName: '',
        ownerPhone: '',
        ownerEmail: '',
        isActive: true,
      });
      setError('');
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>🏠 Agregar Nuevo Departamento</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Número de Departamento <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="unitNumber"
                  value={formData.unitNumber}
                  onChange={handleChange}
                  placeholder="Ej: 101, 201, A-1"
                  disabled={loading}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Edificio <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="buildingId"
                  value={formData.buildingId}
                  onChange={handleChange}
                  disabled={loading || loadingBuildings}
                  required
                >
                  <option value="">Seleccionar edificio...</option>
                  {buildings.map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.name || building.address}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Piso <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  placeholder="1"
                  min="1"
                  disabled={loading}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Superficie (m²)</Form.Label>
                <Form.Control
                  type="number"
                  name="surfaceArea"
                  value={formData.surfaceArea}
                  onChange={handleChange}
                  placeholder="65"
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Alícuota (%)</Form.Label>
                <Form.Control
                  type="number"
                  name="aliquot"
                  value={formData.aliquot}
                  onChange={handleChange}
                  placeholder="1.5"
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </Form.Group>
            </Col>
          </Row>

          <hr className="my-3" />
          <h6 className="mb-3">Información del Propietario (Opcional)</h6>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre del Propietario</Form.Label>
                <Form.Control
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="Ej: Juan Pérez"
                  disabled={loading}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="tel"
                  name="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={handleChange}
                  placeholder="+56912345678"
                  disabled={loading}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleChange}
                  placeholder="propietario@email.com"
                  disabled={loading}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="isActive"
              label="Departamento activo"
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
              Creando...
            </>
          ) : (
            '✓ Crear Departamento'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddUnitModal;
