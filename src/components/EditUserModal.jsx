import { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { adminUsers, adminUnits } from '../api/adminService';

const EditUserModal = ({ show, onHide, user, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'RESIDENT',
    unitId: '',
    isActive: true
  });
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingUnits, setLoadingUnits] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'RESIDENT',
        unitId: user.unitId || '',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    }
  }, [user]);

  useEffect(() => {
    if (show) {
      loadUnits();
    }
  }, [show]);

  const loadUnits = async () => {
    try {
      setLoadingUnits(true);
      const { data } = await adminUnits.list({ limit: 500 });
      const unitList = Array.isArray(data) ? data : data?.content || [];
      setUnits(unitList);
    } catch (err) {
      console.error('Error loading units:', err);
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      setLoading(true);
      setError('');

      // Preparar datos para actualizar
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: formData.role,
        isActive: formData.isActive
      };

      // Solo incluir unitId si es RESIDENT y tiene valor
      if (formData.role === 'RESIDENT' && formData.unitId) {
        updateData.unitId = parseInt(formData.unitId);
      }

      await adminUsers.update(user.id, updateData);

      if (onUserUpdated) {
        onUserUpdated({ ...user, ...updateData, id: user.id });
      }

      onHide();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Error al actualizar usuario';
      setError(errorMsg);
      console.error('Error updating user:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleName = (role) => {
    const roles = {
      'SUPER_ADMIN': 'Super Administrador',
      'ADMIN': 'Administrador',
      'CONCIERGE': 'Conserje',
      'RESIDENT': 'Residente'
    };
    return roles[role] || role;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>✏️ Editar Usuario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Apellido *</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Correo Electrónico</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-light"
                />
                <Form.Text className="text-muted">
                  El correo no se puede modificar
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+56912345678"
                  disabled={loading}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Rol *</Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="SUPER_ADMIN">👑 Super Administrador</option>
                  <option value="ADMIN">🔑 Administrador</option>
                  <option value="CONCIERGE">📋 Conserje</option>
                  <option value="RESIDENT">👤 Residente</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {formData.role === 'RESIDENT' && (
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Departamento *</Form.Label>
                  {loadingUnits ? (
                    <div className="text-center py-2">
                      <Spinner size="sm" animation="border" />
                      <span className="ms-2">Cargando departamentos...</span>
                    </div>
                  ) : (
                    <Form.Select
                      name="unitId"
                      value={formData.unitId}
                      onChange={handleChange}
                      required={formData.role === 'RESIDENT'}
                      disabled={loading}
                    >
                      <option value="">Seleccionar departamento...</option>
                      {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.unitNumber || unit.number} - Piso {unit.floor || 'N/A'}
                          {unit.buildingId && ` (Edificio ${unit.buildingId})`}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                  <Form.Text className="text-muted">
                    Selecciona el departamento al que pertenece este residente
                  </Form.Text>
                </Form.Group>
              </Col>
            )}

            <Col md={12}>
              <Form.Group>
                <Form.Check
                  type="checkbox"
                  name="isActive"
                  label="Usuario activo"
                  checked={formData.isActive}
                  onChange={handleChange}
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  Desmarcar para desactivar el acceso del usuario
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={onHide} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Actualizando...
                </>
              ) : (
                '💾 Guardar Cambios'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditUserModal;
