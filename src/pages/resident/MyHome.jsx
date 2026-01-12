import { useState, useEffect } from 'react';
import { Card, Alert, Spinner, Row, Col, Form, Button, Table, Badge, Modal } from 'react-bootstrap';
import { residentsService } from '../../api/residentService';

const ResidentMyHome = () => {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [pets, setPets] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('family'); // family, pets, vehicles
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError('');

      // Nota: Los endpoints /api/home/* no están implementados en el backend aún
      // Por ahora se muestran datos de ejemplo o vacíos
      const [familyResp, petsResp, vehiclesResp] = await Promise.all([
        residentsService.getFamilyMembers().catch(err => {
          if (err.response?.status === 404) {
            console.log('Endpoint /api/home/family no disponible');
            return { data: [] };
          }
          throw err;
        }),
        residentsService.getPets().catch(err => {
          if (err.response?.status === 404) {
            console.log('Endpoint /api/home/pets no disponible');
            return { data: [] };
          }
          throw err;
        }),
        residentsService.getVehicles().catch(err => {
          if (err.response?.status === 404) {
            console.log('Endpoint /api/home/vehicles no disponible');
            return { data: [] };
          }
          throw err;
        })
      ]);

      setFamilyMembers(Array.isArray(familyResp.data) ? familyResp.data : familyResp.data?.content || []);
      setPets(Array.isArray(petsResp.data) ? petsResp.data : petsResp.data?.content || []);
      setVehicles(Array.isArray(vehiclesResp.data) ? vehiclesResp.data : vehiclesResp.data?.content || []);
    } catch (err) {
      // Si no es un error 404, mostrar el error
      if (err.response?.status !== 404) {
        setError(err.message || 'Error al cargar datos del hogar');
      }
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData(item);
    } else {
      setFormData({});
    }
    setActiveTab(type);
    setShowModal(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      if (activeTab === 'family') {
        if (editingItem?.id) {
          await residentsService.updateFamilyMember(editingItem.id, formData);
        } else {
          await residentsService.createFamilyMember(formData);
        }
      } else if (activeTab === 'pets') {
        if (editingItem?.id) {
          await residentsService.updatePet(editingItem.id, formData);
        } else {
          await residentsService.createPet(formData);
        }
      } else if (activeTab === 'vehicles') {
        if (editingItem?.id) {
          await residentsService.updateVehicle(editingItem.id, formData);
        } else {
          await residentsService.createVehicle(formData);
        }
      }
      setShowModal(false);
      loadHomeData();
    } catch (err) {
      setError(err.message || 'Error al guardar');
      console.error('Error:', err);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('¿Estás seguro?')) return;
    try {
      if (type === 'family') {
        await residentsService.deleteFamilyMember(id);
      } else if (type === 'pets') {
        await residentsService.deletePet(id);
      } else if (type === 'vehicles') {
        await residentsService.deleteVehicle(id);
      }
      loadHomeData();
    } catch (err) {
      setError(err.message || 'Error al eliminar');
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando datos del hogar...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4">👥 Mi Hogar</h3>

      <Alert variant="info" className="mb-3">
        <i className="bi bi-info-circle me-2"></i>
        <strong>Funcionalidad en desarrollo:</strong> La gestión de familia, mascotas y vehículos requiere endpoints backend adicionales (/api/home/*) que aún no están implementados.
      </Alert>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Tabs */}
      <div className="mb-4">
        <Button
          variant={activeTab === 'family' ? 'primary' : 'outline-primary'}
          className="me-2"
          onClick={() => setActiveTab('family')}
        >
          Grupo Familiar
        </Button>
        <Button
          variant={activeTab === 'pets' ? 'primary' : 'outline-primary'}
          className="me-2"
          onClick={() => setActiveTab('pets')}
        >
          Mascotas
        </Button>
        <Button
          variant={activeTab === 'vehicles' ? 'primary' : 'outline-primary'}
          onClick={() => setActiveTab('vehicles')}
        >
          Vehículos
        </Button>
      </div>

      {/* Contenido por Tab */}
      {activeTab === 'family' && (
        <Card className="shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Card.Title className="mb-0">Grupo Familiar</Card.Title>
              <Button variant="success" size="sm" onClick={() => openModal('family')}>
                ➕ Agregar Persona
              </Button>
            </div>
            {familyMembers.length === 0 ? (
              <Alert variant="info">No hay miembros registrados</Alert>
            ) : (
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Relación</th>
                    <th>RUT</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {familyMembers.map(member => (
                    <tr key={member.id}>
                      <td>{member.firstName} {member.lastName}</td>
                      <td>{member.relationship || 'Residente'}</td>
                      <td>{member.rut || '-'}</td>
                      <td>
                        <Badge bg="success">Activo</Badge>
                      </td>
                      <td>
                        <Button size="sm" variant="info" className="me-2" onClick={() => openModal('family', member)}>
                          ✏️
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete('family', member.id)}>
                          🗑️
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}

      {activeTab === 'pets' && (
        <Card className="shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Card.Title className="mb-0">Mascotas</Card.Title>
              <Button variant="success" size="sm" onClick={() => openModal('pets')}>
                ➕ Agregar Mascota
              </Button>
            </div>
            {pets.length === 0 ? (
              <Alert variant="info">No hay mascotas registradas</Alert>
            ) : (
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Raza</th>
                    <th>Color/Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pets.map(pet => (
                    <tr key={pet.id}>
                      <td>{pet.name}</td>
                      <td>{pet.type}</td>
                      <td>{pet.breed || '-'}</td>
                      <td>{pet.description || '-'}</td>
                      <td>
                        <Button size="sm" variant="info" className="me-2" onClick={() => openModal('pets', pet)}>
                          ✏️
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete('pets', pet.id)}>
                          🗑️
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}

      {activeTab === 'vehicles' && (
        <Card className="shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Card.Title className="mb-0">Vehículos</Card.Title>
              <Button variant="success" size="sm" onClick={() => openModal('vehicles')}>
                ➕ Agregar Vehículo
              </Button>
            </div>
            {vehicles.length === 0 ? (
              <Alert variant="info">No hay vehículos registrados</Alert>
            ) : (
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Patente</th>
                    <th>Marca</th>
                    <th>Modelo</th>
                    <th>Año</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map(vehicle => (
                    <tr key={vehicle.id}>
                      <td><strong>{vehicle.plate}</strong></td>
                      <td>{vehicle.brand}</td>
                      <td>{vehicle.model}</td>
                      <td>{vehicle.year || '-'}</td>
                      <td>
                        <Button size="sm" variant="info" className="me-2" onClick={() => openModal('vehicles', vehicle)}>
                          ✏️
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete('vehicles', vehicle.id)}>
                          🗑️
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Modal para agregar/editar */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {activeTab === 'family' && (editingItem ? 'Editar Persona' : 'Agregar Persona')}
            {activeTab === 'pets' && (editingItem ? 'Editar Mascota' : 'Agregar Mascota')}
            {activeTab === 'vehicles' && (editingItem ? 'Editar Vehículo' : 'Agregar Vehículo')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {activeTab === 'family' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Nombre"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Apellido</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Apellido"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>RUT</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.rut || ''}
                  onChange={(e) => handleInputChange('rut', e.target.value)}
                  placeholder="ej: 12345678-9"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Relación</Form.Label>
                <Form.Select
                  value={formData.relationship || ''}
                  onChange={(e) => handleInputChange('relationship', e.target.value)}
                >
                  <option value="">Selecciona relación</option>
                  <option value="SPOUSE">Cónyuge</option>
                  <option value="CHILD">Hijo/a</option>
                  <option value="PARENT">Padre/Madre</option>
                  <option value="OTHER">Otro</option>
                </Form.Select>
              </Form.Group>
            </>
          )}
          {activeTab === 'pets' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nombre de la mascota"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Tipo</Form.Label>
                <Form.Select
                  value={formData.type || ''}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                >
                  <option value="">Selecciona tipo</option>
                  <option value="DOG">Perro</option>
                  <option value="CAT">Gato</option>
                  <option value="BIRD">Pájaro</option>
                  <option value="OTHER">Otro</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Raza</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.breed || ''}
                  onChange={(e) => handleInputChange('breed', e.target.value)}
                  placeholder="Raza"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Descripción/Color</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe físicamente a la mascota"
                />
              </Form.Group>
            </>
          )}
          {activeTab === 'vehicles' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Patente</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.plate || ''}
                  onChange={(e) => handleInputChange('plate', e.target.value.toUpperCase())}
                  placeholder="ej: ABCD-12"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Marca</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.brand || ''}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="ej: Toyota"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Modelo</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.model || ''}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="ej: Corolla"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Año</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.year || ''}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  placeholder="2020"
                />
              </Form.Group>
            </>
          )}
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

export default ResidentMyHome;
