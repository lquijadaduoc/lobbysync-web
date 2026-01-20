import { useState } from 'react';
import { Modal, Form, Button, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { adminUsers } from '../api/adminService';

const ChangePasswordModal = ({ show, onHide, user }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await adminUsers.changePassword(user.id, newPassword);

      setSuccess('✅ Contraseña cambiada exitosamente');
      
      // Limpiar formulario y cerrar después de 1.5 segundos
      setTimeout(() => {
        setNewPassword('');
        setConfirmPassword('');
        setSuccess('');
        onHide();
      }, 1500);

    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Error al cambiar contraseña';
      setError(errorMsg);
      console.error('Error changing password:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    onHide();
  };

  const getPasswordStrength = (password) => {
    if (!password) return { text: '', color: '', width: '0%' };
    
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;

    if (strength <= 25) return { text: 'Débil', color: 'danger', width: '25%' };
    if (strength <= 50) return { text: 'Regular', color: 'warning', width: '50%' };
    if (strength <= 75) return { text: 'Buena', color: 'info', width: '75%' };
    return { text: 'Fuerte', color: 'success', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>🔐 Cambiar Contraseña</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <div className="mb-3 p-3 bg-light rounded">
          <strong>Usuario:</strong> {user?.email}
          <br />
          <strong>Nombre:</strong> {user?.firstName} {user?.lastName}
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nueva Contraseña *</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                disabled={loading || success}
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading || success}
              >
                {showPassword ? '🙈' : '👁️'}
              </Button>
            </InputGroup>
            
            {newPassword && (
              <div className="mt-2">
                <div className="d-flex justify-content-between mb-1">
                  <small className="text-muted">Fortaleza:</small>
                  <small className={`text-${passwordStrength.color}`}>
                    {passwordStrength.text}
                  </small>
                </div>
                <div className="progress" style={{ height: '5px' }}>
                  <div
                    className={`progress-bar bg-${passwordStrength.color}`}
                    style={{ width: passwordStrength.width }}
                  />
                </div>
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirmar Contraseña *</Form.Label>
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              required
              disabled={loading || success}
              isInvalid={confirmPassword && newPassword !== confirmPassword}
              isValid={confirmPassword && newPassword === confirmPassword}
            />
            <Form.Control.Feedback type="invalid">
              Las contraseñas no coinciden
            </Form.Control.Feedback>
            <Form.Control.Feedback type="valid">
              Las contraseñas coinciden ✓
            </Form.Control.Feedback>
          </Form.Group>

          <Alert variant="info" className="mb-0">
            <small>
              <strong>💡 Recomendaciones:</strong>
              <ul className="mb-0 mt-1">
                <li>Mínimo 6 caracteres (recomendado 8+)</li>
                <li>Incluir letras mayúsculas y números</li>
                <li>Evitar información personal</li>
              </ul>
            </small>
          </Alert>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading || success || newPassword !== confirmPassword || newPassword.length < 6}
            >
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Cambiando...
                </>
              ) : (
                '🔒 Cambiar Contraseña'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ChangePasswordModal;
