import { useState, useEffect } from 'react';
import { Card, Alert, Spinner, Button, Form, Table, Badge, Modal } from 'react-bootstrap';
import { residentsService } from '../../api/residentService';

const ResidentTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'GENERAL',
    description: '',
    attachments: []
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await residentsService.getTickets();
      const ticketsList = Array.isArray(response.data) ? response.data : 
                         response.data?.content || [];
      setTickets(ticketsList);
    } catch (err) {
      setError(err.message || 'Error al cargar solicitudes');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateTicket = async () => {
    try {
      if (!formData.title || !formData.description) {
        setError('Por favor completa título y descripción');
        return;
      }
      await residentsService.createTicket(formData);
      setShowModal(false);
      setFormData({ title: '', category: 'GENERAL', description: '', attachments: [] });
      loadTickets();
    } catch (err) {
      setError(err.message || 'Error al crear solicitud');
      console.error('Error:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return <Badge bg="primary">Abierto</Badge>;
      case 'IN_PROGRESS':
        return <Badge bg="warning">En Proceso</Badge>;
      case 'RESOLVED':
        return <Badge bg="success">Resuelto</Badge>;
      case 'CLOSED':
        return <Badge bg="secondary">Cerrado</Badge>;
      default:
        return <Badge bg="light">{status}</Badge>;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'MAINTENANCE':
        return '🔧';
      case 'COMPLAINT':
        return '⚠️';
      case 'REQUEST':
        return '📝';
      default:
        return '📋';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando solicitudes...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>🔧 Solicitudes de Mantención/PQR</h3>
        <Button variant="success" onClick={() => setShowModal(true)}>
          ➕ Nueva Solicitud
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {tickets.length === 0 ? (
        <Alert variant="info">No hay solicitudes registradas</Alert>
      ) : (
        <Card className="shadow-sm">
          <Card.Body>
            <Table hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Categoría</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket.id}>
                    <td>#{ticket.id}</td>
                    <td><strong>{ticket.title}</strong></td>
                    <td>
                      {getCategoryIcon(ticket.category)} {ticket.category}
                    </td>
                    <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td>{getStatusBadge(ticket.status)}</td>
                    <td>
                      <small>{ticket.description?.substring(0, 50)}...</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Modal Nueva Solicitud */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nueva Solicitud</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Título</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Ampolleta quemada en pasillo piso 4"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
            >
              <option value="MAINTENANCE">Mantención</option>
              <option value="COMPLAINT">Reclamo</option>
              <option value="REQUEST">Solicitud</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descripción Detallada</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Describe en detalle el problema..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCreateTicket}>
            Crear Solicitud
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ResidentTickets;
