import { useEffect, useState } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { conciergeVisitors } from '../../api/conciergeService';
import { residentInvitations } from '../../api/residentService';
import { useAuth } from '../../auth/AuthProvider';

const VisitsMonitor = () => {
  const { user } = useAuth();
  const [visits, setVisits] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [manualEntryForm, setManualEntryForm] = useState({
    rut: '',
    name: '',
    unit: '',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadVisitsAndInvitations();
  }, []);

  const loadVisitsAndInvitations = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar invitaciones (no hay endpoint específico de visitas separado)
      const invitationsResponse = await conciergeVisitors.list();
      
      const invitationsList = Array.isArray(invitationsResponse.data) ? invitationsResponse.data : 
                             invitationsResponse.data?.content || [];
      
      // Filtrar solo las del día actual
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayInvitations = invitationsList.filter(inv => {
        const createdDate = new Date(inv.createdAt || inv.validUntil);
        createdDate.setHours(0, 0, 0, 0);
        return createdDate.getTime() === today.getTime();
      });
      
      setInvitations(todayInvitations);
    } catch (err) {
      setError(err.message || 'Error al cargar visitas');
      console.error('Error cargando visitas:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { bg: 'warning', text: 'dark', label: '⏳ Pendiente' },
      'ENTERED': { bg: 'success', text: 'white', label: '🟢 En Recinto' },
      'EXITED': { bg: 'info', text: 'white', label: '🔵 Finalizada' },
      'EXPIRED': { bg: 'danger', text: 'white', label: '🚫 Expirada' },
      'ACTIVE': { bg: 'warning', text: 'dark', label: '⏳ Pendiente' }
    };
    
    const config = statusMap[status] || { bg: 'secondary', text: 'white', label: status || 'N/A' };
    return <Badge bg={config.bg} text={config.text}>{config.label}</Badge>;
  };

  const handleManualEntry = () => {
    setShowManualEntryModal(true);
    setManualEntryForm({ rut: '', name: '', unit: '', reason: '' });
  };

  const handleCloseManualEntry = () => {
    setShowManualEntryModal(false);
    setManualEntryForm({ rut: '', name: '', unit: '', reason: '' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setManualEntryForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitManualEntry = async (e) => {
    e.preventDefault();
    
    if (!manualEntryForm.rut || !manualEntryForm.name || !manualEntryForm.unit) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      setSubmitting(true);
      
      // Crear invitación manual (el backend usa el modelo de Invitation)
      await conciergeVisitors.create({
        guestName: manualEntryForm.name,
        guestRut: manualEntryForm.rut,
        unitId: parseInt(manualEntryForm.unit) || 1,
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Válido por 24 horas
        status: 'ACTIVE',
        notes: `Ingreso manual: ${manualEntryForm.reason || 'Sin motivo especificado'}`
      });
      
      alert('Visita registrada exitosamente');
      handleCloseManualEntry();
      loadVisitsAndInvitations();
    } catch (err) {
      alert('Error al registrar visita: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkEntry = async (visitId) => {
    try {
      await conciergeVisitors.markEntry(visitId);
      console.log('✅ Entrada registrada para visita:', visitId);
      loadVisitsAndInvitations();
    } catch (err) {
      console.error('❌ Error:', err);
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleMarkExit = async (visitId) => {
    try {
      await conciergeVisitors.markExit(visitId);
      console.log('✅ Salida registrada para visita:', visitId);
      loadVisitsAndInvitations();
    } catch (err) {
      console.error('❌ Error:', err);
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Combinar visitas e invitaciones
  const allVisits = [
    ...visits.map(v => ({ ...v, type: 'visit' })),
    ...invitations.map(i => ({
      id: i.id,
      name: i.guestName,
      rut: i.guestRut,
      unitNumber: i.unitId,
      status: i.status,
      type: 'invitation',
      validUntil: i.validUntil,
      createdAt: i.createdAt,
      entryTime: i.entryTime || i.usedAt
    }))
  ];

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold text-primary mb-0">Monitor de Visitas</h3>
        <Button variant="success" size="lg" onClick={handleManualEntry}>
          <i className="bi bi-person-plus-fill me-2"></i>
          Ingreso Manual (Sin QR)
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="mb-3">
            Visitas del día
            <span className="text-muted ms-2 fs-6">
              ({allVisits.length} total)
            </span>
          </Card.Title>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <div className="text-muted">Cargando visitas...</div>
            </div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Nombre</th>
                  <th>RUT/ID</th>
                  <th>Unidad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {allVisits.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No hay visitas registradas hoy
                    </td>
                  </tr>
                ) : (
                  allVisits.map((visit) => (
                    <tr key={`${visit.type}-${visit.id}`}>
                      <td>{formatDateTime(visit.entryTime || visit.createdAt)}</td>
                      <td>{visit.name || visit.visitorName || 'N/A'}</td>
                      <td>{visit.rut || visit.visitorRut || '-'}</td>
                      <td>#{visit.unitNumber || visit.unit || 'N/A'}</td>
                      <td>{getStatusBadge(visit.status)}</td>
                      <td>
                        {(visit.status === 'PENDING' || visit.status === 'ACTIVE') && (
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => handleMarkEntry(visit.id)}
                          >
                            Marcar Entrada
                          </Button>
                        )}
                        {visit.status === 'ENTERED' && (
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => handleMarkExit(visit.id)}
                          >
                            Marcar Salida
                          </Button>
                        )}
                        {visit.status === 'EXITED' && (
                          <span className="text-success fw-bold">
                            <i className="bi bi-check-circle-fill me-1"></i>Completado
                          </span>
                        )}
                        {visit.status === 'EXPIRED' && (
                          <span className="text-danger fw-bold">
                            <i className="bi bi-exclamation-circle-fill me-1"></i>Expirada
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
        <Card.Footer className="bg-light">
          <Row className="text-center">
            <Col>
              <div className="fw-bold text-warning">{allVisits.filter(v => v.status === 'PENDING').length}</div>
              <small className="text-muted">⏳ Pendientes</small>
            </Col>
            <Col>
              <div className="fw-bold text-success">{allVisits.filter(v => v.status === 'ENTERED').length}</div>
              <small className="text-muted">🟢 En Recinto</small>
            </Col>
            <Col>
              <div className="fw-bold text-info">{allVisits.filter(v => v.status === 'EXITED').length}</div>
              <small className="text-muted">🔵 Finalizadas</small>
            </Col>
            <Col>
              <div className="fw-bold text-danger">{allVisits.filter(v => v.status === 'EXPIRED').length}</div>
              <small className="text-muted">🚫 Expiradas</small>
            </Col>
          </Row>
        </Card.Footer>
      </Card>

      {/* Modal de Ingreso Manual */}
      <Modal show={showManualEntryModal} onHide={handleCloseManualEntry} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Ingreso Manual de Visita</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitManualEntry}>
          <Modal.Body>
            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              Use este formulario para registrar visitas que NO tienen celular o código QR
            </Alert>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>RUT o Documento <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="rut"
                    placeholder="12.345.678-9"
                    value={manualEntryForm.rut}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Nombre Completo <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Juan Pérez"
                    value={manualEntryForm.name}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Unidad/Depto <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="unit"
                    placeholder="101, 402, etc."
                    value={manualEntryForm.unit}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Motivo de Visita</Form.Label>
                  <Form.Control
                    type="text"
                    name="reason"
                    placeholder="Ej: Familiar, Técnico, Delivery"
                    value={manualEntryForm.reason}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseManualEntry}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Registrando...
                </>
              ) : (
                'Registrar Entrada'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default VisitsMonitor;
