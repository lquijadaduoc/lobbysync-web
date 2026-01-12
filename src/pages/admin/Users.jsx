import { useEffect, useState, useRef } from 'react';
import { Card, Table, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { adminUsers } from '../../api/adminService';
import { DataLoader } from '../../components/LoaderComponents';
import AddUserModal from '../../components/AddUserModal';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const mountTimeRef = useRef(performance.now());

  const loadUsers = async () => {
    const requestStart = performance.now();
    try {
      setLoading(true);
      setError('');
      const { data } = await adminUsers.list({ limit: 100 });
      const requestEnd = performance.now();
      console.log(`📊 Users API response: ${(requestEnd - requestStart).toFixed(2)}ms`);

      // Manejo flexible del response
      const userList = Array.isArray(data) ? data : data?.content || data?.users || [];
      setUsers(userList);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al cargar usuarios.';
      setError(msg);
      console.error('Error en adminUsers.list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const renderTime = performance.now() - mountTimeRef.current;
    console.log(`🎨 AdminUsers component render: ${renderTime.toFixed(2)}ms`);
  });

  const getStatusBadge = (status) => {
    const statusLower = String(status || '').toLowerCase();
    if (statusLower === 'active' || statusLower === 'activo')
      return <Badge bg="success">Activo</Badge>;
    if (statusLower === 'pending' || statusLower === 'pendiente')
      return <Badge bg="warning" text="dark">Pendiente</Badge>;
    if (statusLower === 'inactive' || statusLower === 'inactivo')
      return <Badge bg="secondary">Inactivo</Badge>;
    return <Badge bg="secondary">{status || 'N/A'}</Badge>;
  };

  const getRoleBadge = (role) => {
    const roleLower = String(role || '').toUpperCase();
    if (roleLower.includes('ADMIN'))
      return <Badge bg="danger">ADMIN</Badge>;
    if (roleLower.includes('CONCIERGE'))
      return <Badge bg="info">CONCIERGE</Badge>;
    if (roleLower.includes('RESIDENT'))
      return <Badge bg="primary">RESIDENT</Badge>;
    return <Badge bg="secondary">{role}</Badge>;
  };

  return (
    <>
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Card.Title className="mb-0">Gestión de usuarios</Card.Title>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => setShowAddModal(true)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Cargando...
                </>
              ) : (
                '🔥 + Nuevo usuario'
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
            <div className="text-muted">Cargando usuarios...</div>
          </div>
        ) : users.length === 0 ? (
          <Alert variant="info" className="mb-0">
            No hay usuarios disponibles
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th style={{ width: '100px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id || user.userId}>
                    <td>
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.name || 'N/A'}
                    </td>
                    <td>{user.email || user.username || 'N/A'}</td>
                    <td>{getRoleBadge(user.role || user.rol)}</td>
                    <td>{getStatusBadge(user.status || user.active)}</td>
                    <td>
                      <Button variant="sm" size="sm" className="me-1">
                        Editar
                      </Button>
                      <Button variant="danger" size="sm">
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
        </Card.Body>
        {users.length > 0 && (
          <Card.Footer className="bg-light text-muted small">
            Total: {users.length} usuarios
          </Card.Footer>
        )}
      </Card>

      <AddUserModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onUserAdded={loadUsers}
      />
    </>
  );
};

export default AdminUsers;
