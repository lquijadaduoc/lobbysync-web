import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { adminUsers, adminUnits } from '../api/adminService';

const AddUserModal = ({ show, onHide, onUserAdded }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'RESIDENT',
    phone: '',
    unitId: ''
  });
  const [units, setUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roles = [
    { value: 'SUPER_ADMIN', label: '👑 Super Admin', desc: 'Acceso total' },
    { value: 'ADMIN', label: '🔑 Admin', desc: 'Gestión completa' },
    { value: 'CONCIERGE', label: '📋 Conserje', desc: 'Operaciones diarias' },
    { value: 'RESIDENT', label: '👤 Residente', desc: 'Acceso personal' }
  ];

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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Creating user with Firebase...', formData);
      
      // Validar que residente tenga departamento
      if (formData.role === 'RESIDENT' && !formData.unitId) {
        setError('Los residentes deben tener un departamento asignado');
        return;
      }
      
      // Llamar al endpoint que crea usuario en Firebase y PostgreSQL
      const response = await adminUsers.create({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        phone: formData.phone,
        unitId: formData.role === 'RESIDENT' && formData.unitId ? parseInt(formData.unitId) : null
      });

      console.log('User created successfully:', response);
      setSuccess(`Usuario ${formData.email} creado exitosamente en Firebase y PostgreSQL`);
      
      // Limpiar formulario
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'RESIDENT',
        phone: '',
        unitId: ''
      });

      // Notificar al padre
      if (onUserAdded) {
        setTimeout(() => {
          onUserAdded();
          onHide();
        }, 1500);
      }
    } catch (err) {
      console.error('Error creating user:', err);
      const message = err.response?.data?.message || err.message || 'Error al crear usuario';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'RESIDENT',
        unitId: '',
        phone: ''
      });
      setError('');
      setSuccess('');
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop={loading ? 'static' : true}>
      <Modal.Header closeButton={!loading}>
        <Modal.Title>🔥 Crear Usuario en Firebase</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Correo electrónico *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="usuario@ejemplo.com"
                  required
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  Se usará para autenticación en Firebase
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Contraseña *</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  Firebase requiere mínimo 6 caracteres
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Juan"
                  disabled={loading}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Apellido</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Pérez"
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
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.desc}
                    </option>
                  ))}
                </Form.Select>
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
          </Row>

          <div className="d-grid gap-2">
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Creando en Firebase...
                </>
              ) : (
                '🔥 Crear Usuario'
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddUserModal;
