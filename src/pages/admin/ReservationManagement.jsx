import { useEffect, useState } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalReason, setApprovalReason] = useState('');
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reservations/all');
      setReservations(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Error cargando reservas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reservationId, approved) => {
    try {
      setApproving(true);
      await axios.post(`/api/reservations/${reservationId}/approve`, {
        approved,
        rejectionReason: approved ? null : approvalReason
      });
      setShowApprovalModal(false);
      setApprovalReason('');
      await loadReservations();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar aprobación');
    } finally {
      setApproving(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { bg: 'warning', text: 'Pendiente', icon: '⏳' },
      APPROVED: { bg: 'success', text: 'Aprobada', icon: '✅' },
      REJECTED: { bg: 'danger', text: 'Rechazada', icon: '❌' },
      IN_USE: { bg: 'info', text: 'En Uso', icon: '🔑' },
      COMPLETED: { bg: 'secondary', text: 'Completada', icon: '✓' },
      CANCELLED: { bg: 'dark', text: 'Cancelada', icon: '🚫' }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg}>{config.icon} {config.text}</Badge>;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingReservations = reservations.filter(r => r.status === 'PENDING');
  const approvedReservations = reservations.filter(r => r.status === 'APPROVED');
  const activeReservations = reservations.filter(r => r.status === 'IN_USE');

  return (
    <div>
      <h3 className="fw-bold text-primary mb-4">Gestión de Reservas</h3>

      {/* Resumen */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center border-warning">
            <Card.Body>
              <h2 className="mb-0 text-warning">{pendingReservations.length}</h2>
              <small>Pendientes de Aprobar</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-success">
            <Card.Body>
              <h2 className="mb-0 text-success">{approvedReservations.length}</h2>
              <small>Aprobadas</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-info">
            <Card.Body>
              <h2 className="mb-0 text-info">{activeReservations.length}</h2>
              <small>En Uso</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-secondary">
            <Card.Body>
              <h2 className="mb-0 text-secondary">{reservations.length}</h2>
              <small>Total</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      {/* Tabla de reservas */}
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">Todas las Reservas</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Área Común</th>
                  <th>Usuario</th>
                  <th>Fecha/Hora</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No hay reservas
                    </td>
                  </tr>
                ) : (
                  reservations
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((reservation) => (
                      <tr key={reservation.id}>
                        <td>#{reservation.id}</td>
                        <td>{reservation.commonAreaId}</td>
                        <td>User #{reservation.userId}</td>
                        <td>
                          <small>{formatDateTime(reservation.startTime)}</small>
                          <br />
                          <small className="text-muted">hasta {formatDateTime(reservation.endTime)}</small>
                        </td>
                        <td>${reservation.totalAmount?.toLocaleString('es-CL')}</td>
                        <td>{getStatusBadge(reservation.status)}</td>
                        <td>
                          {reservation.status === 'PENDING' && (
                            <div className="btn-group btn-group-sm">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleApprove(reservation.id, true)}
                              >
                                ✓ Aprobar
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setSelectedReservation(reservation);
                                  setShowApprovalModal(true);
                                }}
                              >
                                ✗ Rechazar
                              </Button>
                            </div>
                          )}
                          {reservation.status === 'APPROVED' && (
                            <Badge bg="success">Lista para check-in</Badge>
                          )}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal de rechazo */}
      <Modal show={showApprovalModal} onHide={() => setShowApprovalModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Rechazar Reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Motivo del rechazo</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={approvalReason}
              onChange={(e) => setApprovalReason(e.target.value)}
              placeholder="Explique por qué se rechaza esta reserva..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => handleApprove(selectedReservation?.id, false)}
            disabled={approving || !approvalReason.trim()}
          >
            {approving ? 'Rechazando...' : 'Confirmar Rechazo'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReservationManagement;
