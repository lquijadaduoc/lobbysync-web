import { useState, useEffect } from 'react';
import { Card, Alert, Spinner, Button, Form, Table, Badge, Modal } from 'react-bootstrap';
import { residentsService } from '../../api/residentService';

const ResidentWhitelist = () => {
  const [whitelistContacts, setWhitelistContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rut: '',
    relationship: '',
    hasPermaAccess: false,
    notes: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadWhitelist();
  }, []);

  const loadWhitelist = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await residentsService.getWhitelist().catch(err => {
        if (err.response?.status === 404) {
          console.log('Endpoint /api/whitelist no disponible');
          return { data: [] };
        }
        throw err;
      });
      const whitelistList = Array.isArray(response.data) ? response.data : 
                           response.data?.content || [];
      setWhitelistContacts(whitelistList);
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(err.message || 'Error al cargar lista blanca');
      }
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const openModal = (contact = null) => {
    if (contact) {
      setEditingId(contact.id);
      setFormData(contact);
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        rut: '',
        relationship: '',
        hasPermaAccess: false,
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.rut) {
        setError('Por favor completa nombre y RUT');
        return;
      }

      if (editingId) {
        await residentsService.updateWhitelistContact(editingId, formData);
      } else {
        await residentsService.createWhitelistContact(formData);
      }

      setShowModal(false);
      loadWhitelist();
    } catch (err) {
      setError(err.message || 'Error al guardar');
      console.error('Error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este contacto?')) return;
    try {
      await residentsService.deleteWhitelistContact(id);
      loadWhitelist();
    } catch (err) {
      setError(err.message || 'Error al eliminar');
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando lista blanca...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>🛡️ Visitas Frecuentes (Lista Blanca)</h3>
        <Button variant="success" onClick={() => openModal()}>
          ➕ Agregar Contacto
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title className="mb-3">¿Qué es la Lista Blanca?</Card.Title>
          <p className="text-muted mb-0">
            Agrega aquí a las personas que visitan regularmente tu hogar (nana, jardinero, repartidor, 
            padres, etc.). Puedes marcara como "Acceso Permanente" para que el conserje no les pida 
            autorización cada vez que entren.
          </p>
        </Card.Body>
      </Card>

      {whitelistContacts.length === 0 ? (
        <Alert variant="info">No hay contactos en la lista blanca</Alert>
      ) : (
        <Card className="shadow-sm">
          <Card.Body>
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>RUT</th>
                  <th>Relación/Rol</th>
                  <th>Acceso Permanente</th>
                  <th>Notas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {whitelistContacts.map(contact => (
                  <tr key={contact.id}>
                    <td><strong>{contact.name}</strong></td>
                    <td>{contact.rut}</td>
                    <td>{contact.relationship || '-'}</td>
                    <td>
                      {contact.hasPermaAccess ? (
                        <Badge bg="success">✓ Sí</Badge>
                      ) : (
                        <Badge bg="secondary">No</Badge>
                      )}
                    </td>
                    <td>
                      <small>{contact.notes || '-'}</small>
                    </td>
                    <td>
                      <Button 
                        size="sm" 
                        variant="info" 
                        className="me-2"
                        onClick={() => openModal(contact)}
                      >
                        ✏️
                      </Button>
                      <Button 
                        size="sm" 
                        variant="danger"
                        onClick={() => handleDelete(contact.id)}
                      >
                        🗑️
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? 'Editar Contacto' : 'Agregar Contacto a Lista Blanca'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre Completo</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: María García López"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>RUT</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: 12345678-9"
              value={formData.rut}
              onChange={(e) => handleInputChange('rut', e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Relación/Rol</Form.Label>
            <Form.Select
              value={formData.relationship}
              onChange={(e) => handleInputChange('relationship', e.target.value)}
            >
              <option value="">Selecciona...</option>
              <option value="NANNY">Nana</option>
              <option value="GARDENER">Jardinero</option>
              <option value="DELIVERY">Repartidor</option>
              <option value="PARENT">Padre/Madre</option>
              <option value="FRIEND">Amigo/a</option>
              <option value="FAMILY">Familia</option>
              <option value="OTHER">Otro</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="✅ Acceso Permanente (no requiere aviso previo)"
              checked={formData.hasPermaAccess}
              onChange={(e) => handleInputChange('hasPermaAccess', e.target.checked)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notas Adicionales</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Ej: Viene lunes y viernes en la tarde"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ResidentWhitelist;
