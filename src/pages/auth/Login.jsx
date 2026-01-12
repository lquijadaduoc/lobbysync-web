import { useState } from 'react';
import { Button, Card, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Usuarios de prueba en Firebase Authentication
  const testUsers = [
    { label: '👑 Super Admin', email: 'superadmin@lobbysync.com', desc: 'Ver TODO', pw: 'admin123' },
    { label: '🔑 Admin', email: 'admin@lobbysync.com', desc: 'Gestión', pw: 'admin123' },
    { label: '📋 Conserje', email: 'concierge@lobbysync.com', desc: 'Operaciones', pw: 'admin123' },
    { label: '👤 Residente', email: 'resident@lobbysync.com', desc: 'Personal', pw: 'admin123' },
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const getHomeForRole = (role) => {
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return '/admin';
    if (role === 'CONCIERGE') return '/concierge';
    return '/resident';
  };

  const quickLogin = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const userData = await login({ email, password });
      const destination = getHomeForRole(userData?.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión con Firebase');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!form.email || !form.password) {
      setError('Por favor ingresa correo y contraseña');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const userData = await login({
        email: form.email,
        password: form.password,
      });
      const destination = getHomeForRole(userData?.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm login-card">
      <Card.Body className="p-4">
        <div className="mb-4 text-center">
          <div className="fw-bold text-primary fs-4">LobbySync</div>
          <div className="text-muted small">Sistema de gestión inmobiliaria</div>
        </div>

        {error && (
          <Alert variant="danger" className="py-2 mb-3">
            {error}
          </Alert>
        )}

        <div className="mb-4">
          <div className="text-muted small mb-2">⚡ Acceso Rápido (Firebase Auth):</div>
          <Row className="g-2">
            {testUsers.map((user) => (
              <Col xs={6} key={user.email}>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="w-100 text-start"
                  onClick={() => quickLogin(user.email, user.pw)}
                  disabled={loading}
                  title={`Usuario: ${user.email}\nContraseña: ${user.pw}`}
                >
                  <div className="fw-bold">{user.label}</div>
                  <div className="small text-muted">{user.desc}</div>
                </Button>
              </Col>
            ))}
          </Row>
        </div>

        <hr className="my-3" />

        <div className="text-muted small mb-3">O ingresa manualmente:</div>
        <Form onSubmit={handleSubmit} className="d-grid gap-3">
          <Form.Group controlId="email">
            <Form.Label>Correo o usuario</Form.Label>
            <Form.Control
              type="text"
              placeholder="admin@lobbysync.com"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="password">
            <Form.Label>Contraseña</Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <Button
                variant="link"
                size="sm"
                className="position-absolute end-0 top-50 translate-middle-y text-muted"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                {showPassword ? '🙈' : '👁️'}
              </Button>
            </div>
          </Form.Group>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : 'Ingresar con Firebase'}
          </Button>
        </Form>

        <div className="mt-3 p-2 bg-light rounded small text-muted">
          <strong>🔥 Firebase Auth:</strong> Usuarios deben existir en Firebase Authentication con Email/Password habilitado.
        </div>
      </Card.Body>
      <Card.Footer className="bg-white border-0 text-center text-muted small">
        Seguridad inmobiliaria centralizada
      </Card.Footer>
    </Card>
  );
};

export default Login;
