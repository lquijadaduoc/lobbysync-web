import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, Row, Col, Tab, Tabs } from 'react-bootstrap';
import { adminUnits } from '../../api/adminService';

const EditUnitModal = ({ show, onHide, unit, onUnitUpdated }) => {
  const [formData, setFormData] = useState({
    unitNumber: '',
    floor: '',
    surfaceArea: '',
    aliquot: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    tenantName: '',
    tenantPhone: '',
    tenantEmail: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  // Cargar datos del departamento cuando se abre el modal
  useEffect(() => {
    if (unit && show) {
      setFormData({
        unitNumber: unit.unitNumber || unit.number || '',
        floor: unit.floor || '',
        surfaceArea: unit.surfaceArea || '',
        aliquot: unit.aliquot || '',
        ownerName: unit.ownerName || '',
        ownerPhone: unit.ownerPhone || '',
        ownerEmail: unit.ownerEmail || '',
        tenantName: unit.tenantName || '',
        tenantPhone: unit.tenantPhone || '',
        tenantEmail: unit.tenantEmail || '',
        isActive: unit.isActive !== undefined ? unit.isActive : true,
      });
    }
  }, [unit, show]);

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

    if (!formData.unitNumber.trim()) {
      setError('El número de departamento es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        unitNumber: formData.unitNumber.trim(),
        floor: formData.floor ? parseInt(formData.floor) : unit.floor,
        surfaceArea: formData.surfaceArea ? parseFloat(formData.surfaceArea) : unit.surfaceArea,
        aliquot: formData.aliquot ? parseFloat(formData.aliquot) : unit.aliquot,
        ownerName: formData.ownerName.trim() || null,
        ownerPhone: formData.ownerPhone.trim() || null,
        ownerEmail: formData.ownerEmail.trim() || null,
        tenantName: formData.tenantName.trim() || null,
        tenantPhone: formData.tenantPhone.trim() || null,
        tenantEmail: formData.tenantEmail.trim() || null,
        isActive: formData.isActive,
        buildingId: unit.buildingId, // Mantener el edificio original
      };

      console.log('📤 Actualizando departamento:', updateData);
      const response = await adminUnits.update(unit.id, updateData);
      console.log('✅ Departamento actualizado:', response.data);

      // Notificar al componente padre
      if (onUnitUpdated) {
        onUnitUpdated(response.data);
      }

      // Cerrar modal
      onHide();
    } catch (err) {
      console.error('❌ Error actualizando departamento:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Error al actualizar el departamento. Por favor intenta nuevamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      setActiveTab('basic');
      onHide();
    }
  };

  if (!unit) return null;

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          ✏️ Editar Departamento {unit.unitNumber || unit.number}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
        >
          <Tab eventKey="basic" title="📋 Info Básica">
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
                      disabled={loading}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Piso</Form.Label>
                    <Form.Control
                      type="number"
                      name="floor"
                      value={formData.floor}
                      onChange={handleChange}
                      min="1"
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Superficie (m²)</Form.Label>
                    <Form.Control
                      type="number"
                      name="surfaceArea"
                      value={formData.surfaceArea}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Alícuota (%)</Form.Label>
                    <Form.Control
                      type="number"
                      name="aliquot"
                      value={formData.aliquot}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
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
          </Tab>

          <Tab eventKey="owner" title="👤 Propietario">
            <Form>
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

              <Alert variant="info" className="small">
                <strong>ℹ️ Propietario:</strong> Persona que tiene la propiedad legal del departamento
              </Alert>
            </Form>
          </Tab>

          <Tab eventKey="tenant" title="🏠 Arrendatario">
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nombre del Arrendatario</Form.Label>
                <Form.Control
                  type="text"
                  name="tenantName"
                  value={formData.tenantName}
                  onChange={handleChange}
                  placeholder="Ej: María González"
                  disabled={loading}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control
                      type="tel"
                      name="tenantPhone"
                      value={formData.tenantPhone}
                      onChange={handleChange}
                      placeholder="+56923456789"
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="tenantEmail"
                      value={formData.tenantEmail}
                      onChange={handleChange}
                      placeholder="arrendatario@email.com"
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Alert variant="info" className="small">
                <strong>ℹ️ Arrendatario:</strong> Persona que arrienda y vive actualmente en el departamento.
                Si no hay arrendatario, la información del propietario se usará como responsable.
              </Alert>
            </Form>
          </Tab>
        </Tabs>
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

export default EditUnitModal;
