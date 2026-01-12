import { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { adminUsers } from '../api/adminService';

const AddUserModal = ({ show, onHide, onUserAdded }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'RESIDENT',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roles = [
    { value: 'SUPER_ADMIN', label: '👑 Super Admin', desc: 'Acceso total' },
    { value: 'ADMIN', label: '🔑 Admin', desc: 'Gestión completa' },
    { value: 'CONCIERGE', label: '📋 Conserje', desc: 'Operaciones diarias' },
    { value: 'RESIDENT', label: '👤 Residente', desc: 'Acceso personal' }
  ];

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
      
      // Llamar al endpoint que crea usuario en Firebase y PostgreSQL
      const response = await adminUsers.create({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        phone: formData.phone
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
        phone: ''
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
          <Form.Group className="mb-3">
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

          <Form.Group className="mb-3">
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

          <Form.Group className="mb-3">
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

          <Form.Group className="mb-3">
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

          <Form.Group className="mb-3">
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

          <Form.Group className="mb-3">
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
