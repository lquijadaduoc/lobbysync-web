import { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button, Table, Spinner, Alert, Modal } from 'react-bootstrap';
import { conciergeVisitors } from '../../api/conciergeService';
import { unitsService, buildingsService } from '../../api/conciergeService';

const ConciergeVisitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    buildingId: '',
    unitId: '',
    purpose: 'Visita',
    entryTime: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    loadData();
  }, []);

  // Cargar edificios y unidades
  useEffect(() => {
    loadUnitsForBuilding();
  }, [formData.buildingId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [buildingsRes, unitsRes, visitorsRes] = await Promise.all([
        buildingsService.list(),
        unitsService.list(),
        conciergeVisitors.list({ limit: 20 })
      ]);

      console.log('🏢 Edificios response:', buildingsRes);
      console.log('🏘️ Unidades response:', unitsRes);
      console.log('👥 Visitantes response:', visitorsRes);

      const buildingsList = Array.isArray(buildingsRes.data) ? buildingsRes.data : 
                            Array.isArray(buildingsRes) ? buildingsRes : buildingsRes.data?.content || [];
      const unitsList = Array.isArray(unitsRes.data) ? unitsRes.data : 
                        Array.isArray(unitsRes) ? unitsRes : unitsRes.data?.content || [];
      const visitorsList = Array.isArray(visitorsRes.data) ? visitorsRes.data : visitorsRes.data?.content || [];

      console.log('✅ Edificios cargados:', buildingsList.length);
      console.log('✅ Unidades cargadas:', unitsList.length);
      console.log('✅ Visitantes cargados:', visitorsList.length);

      setBuildings(buildingsList);
      setUnits(unitsList);
      setVisitors(visitorsList);
    } catch (err) {
      setError(err.message || 'Error al cargar datos');
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUnitsForBuilding = () => {
    if (!formData.buildingId) {
      setFilteredUnits([]);
      return;
    }
    const filtered = units.filter(u => 
      u.buildingId === parseInt(formData.buildingId) || 
      u.building?.id === parseInt(formData.buildingId)
    );
    setFilteredUnits(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.document || !formData.buildingId || !formData.unitId) {
      setError('Todos los campos son requeridos');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      // Obtener nombre del edificio y departamento
      const building = buildings.find(b => b.id === parseInt(formData.buildingId));
      const unit = units.find(u => u.id === parseInt(formData.unitId));

      const visitorData = {
        name: formData.name,
        document: formData.document,
        buildingId: parseInt(formData.buildingId),
        buildingName: building?.name || 'N/A',
        unitId: parseInt(formData.unitId),
        unitNumber: unit?.number || 'N/A',
        purpose: formData.purpose,
        entryTime: new Date(formData.entryTime).toISOString(),
        status: 'ACTIVE'
      };

      // Crear visita
      await conciergeVisitors.create(visitorData);
      
      setSuccess(`✅ Visita de ${formData.name} registrada correctamente`);
      
      // Limpiar formulario
      setFormData({
        name: '',
        document: '',
        buildingId: '',
        unitId: '',
        purpose: 'Visita',
        entryTime: new Date().toISOString().slice(0, 16),
      });
      setFilteredUnits([]);
      
      // Recargar visitantes
      setTimeout(() => loadData(), 1000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al registrar visita';
      setError(msg);
      console.error('Error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-CL') + ' ' + date.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRemoveVisitor = async (visitorId) => {
    if (window.confirm('¿Desea registrar la salida del visitante?')) {
      try {
        await conciergeVisitors.delete(visitorId);
        setVisitors(prev => prev.filter(v => v.id !== visitorId));
        setSuccess('Visitante eliminado del registro');
      } catch (err) {
        setError(err.message || 'Error al eliminar visitante');
      }
    }
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <div className="text-muted">Cargando datos...</div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Card.Title className="mb-3">
            <i className="bi bi-person-plus me-2"></i>
            Registrar Visita Manual
          </Card.Title>

          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" onClose={() => setSuccess('')} dismissible>
              {success}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">Nombre del Visitante *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Ej: Juan Pérez"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={submitting}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">Documento de Identidad *</Form.Label>
                  <Form.Control
                    type="text"
                    name="document"
                    placeholder="RUT / Pasaporte"
                    value={formData.document}
                    onChange={handleInputChange}
                    disabled={submitting}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">Edificio *</Form.Label>
                  <Form.Select
                    name="buildingId"
                    value={formData.buildingId}
                    onChange={handleInputChange}
                    disabled={submitting}
                    required
                  >
                    <option value="">Seleccione edificio</option>
                    {buildings.map(building => (
                      <option key={building.id} value={building.id}>
                        {building.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">Departamento *</Form.Label>
                  <Form.Select
                    name="unitId"
                    value={formData.unitId}
                    onChange={handleInputChange}
                    disabled={submitting || !formData.buildingId}
                    required
                  >
                    <option value="">Seleccione departamento</option>
                    {filteredUnits.length > 0 ? (
                      filteredUnits.map(unit => (
                        <option key={unit.id} value={unit.id}>
                          {unit.number}
                        </option>
                      ))
                    ) : (
                      <option disabled>No hay departamentos disponibles</option>
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">Motivo de la Visita</Form.Label>
                  <Form.Select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    disabled={submitting}
                  >
                    <option value="Visita">Visita Personal</option>
                    <option value="Entrega">Entrega de Paquete</option>
                    <option value="Reparacion">Reparación / Mantenimiento</option>
                    <option value="Servicio">Servicio Profesional</option>
                    <option value="Otro">Otro</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">Hora de Entrada</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="entryTime"
                    value={formData.entryTime}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </Form.Group>
              </Col>

              <Col md={12} className="d-flex gap-2">
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={submitting || !formData.buildingId || !formData.unitId}
                  className="flex-grow-1"
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Registrar Visitante
                    </>
                  )}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Tabla de visitantes activos */}
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="mb-3">
            <i className="bi bi-list-check me-2"></i>
            Visitantes Registrados ({visitors.length})
          </Card.Title>

          {visitors.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <p>No hay visitantes registrados</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Hora de Entrada</th>
                    <th>Nombre</th>
                    <th>Documento</th>
                    <th>Edificio</th>
                    <th>Departamento</th>
                    <th>Motivo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map(visitor => (
                    <tr key={visitor.id}>
                      <td className="text-nowrap small">
                        {formatDateTime(visitor.entryTime || visitor.createdAt)}
                      </td>
                      <td className="fw-bold">{visitor.name || 'N/A'}</td>
                      <td>{visitor.document || 'N/A'}</td>
                      <td>{visitor.buildingName || visitor.building?.name || 'N/A'}</td>
                      <td>
                        <strong>#{visitor.unitNumber || visitor.unit?.number || 'N/A'}</strong>
                      </td>
                      <td>
                        <small className="text-muted">{visitor.purpose || 'Visita'}</small>
                      </td>
                      <td>
                        <Button
                          variant="sm"
                          size="sm"
                          onClick={() => handleRemoveVisitor(visitor.id)}
                          title="Registrar salida"
                        >
                          <i className="bi bi-x-circle"></i> Salida
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default ConciergeVisitors;
