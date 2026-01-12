import { useEffect, useState } from 'react';
import { Card, Table, Badge, Spinner, Alert, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import { residentAmenities } from '../../api/residentService';
import { unitsService, commonAreasService } from '../../api/conciergeService';
import axios from 'axios';

const CommonAreasCalendar = () => {
  const [reservations, setReservations] = useState([]);
  const [commonAreas, setCommonAreas] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedArea, setSelectedArea] = useState('all');
  
  // Estado para crear nueva reserva
  const [showNewReservationModal, setShowNewReservationModal] = useState(false);
  const [newReservation, setNewReservation] = useState({
    commonAreaId: '',
    unitNumber: '',
    startTime: '',
    endTime: '',
    notes: '',
  });
  const [creating, setCreating] = useState(false);

  // Estados para check-in/out
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [selectedReservationForCheckOut, setSelectedReservationForCheckOut] = useState(null);
  const [checkOutData, setCheckOutData] = useState({
    requiresCleaning: false,
    cleaningNotes: ''
  });

  useEffect(() => {
    loadReservations();
    loadUnits();
  }, [selectedDate, selectedArea]);

  const loadUnits = async () => {
    try {
      const response = await unitsService.list();
      const unitsList = Array.isArray(response.data) ? response.data : response.data?.content || [];
      setUnits(unitsList);
    } catch (err) {
      console.error('Error cargando unidades:', err);
    }
  };

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar datos reales del backend
      const [areasResponse, reservationsResponse] = await Promise.all([
        commonAreasService.list(),
        residentAmenities.myReservations()
      ]);
      
      console.log('📍 Áreas comunes response:', areasResponse);
      console.log('📅 Reservas response:', reservationsResponse);
      
      const areasList = Array.isArray(areasResponse.data) ? areasResponse.data : 
                       Array.isArray(areasResponse) ? areasResponse : areasResponse.data?.content || [];
      const reservationsList = Array.isArray(reservationsResponse.data) ? reservationsResponse.data : 
                              reservationsResponse.data?.content || [];
      
      console.log('✅ Áreas cargadas:', areasList);
      console.log('✅ Reservas cargadas:', reservationsList);
      
      // Mapear áreas comunes al formato esperado
      const mappedAreas = areasList.map(area => ({
        id: area.id,
        name: area.name
      }));
      
      // Mapear reservas al formato esperado
      const mappedReservations = reservationsList.map(res => ({
        id: res.id,
        commonAreaId: res.commonAreaId,
        commonAreaName: res.commonAreaName || 'N/A',
        unitNumber: res.unitNumber || res.unitId,
        residentName: res.residentName || res.user?.firstName + ' ' + res.user?.lastName || 'N/A',
        startTime: res.startTime,
        endTime: res.endTime,
        status: res.status || 'CONFIRMED',
        notes: res.notes || '',
        keyDelivered: res.keyDelivered || false
      }));
      
      setCommonAreas(mappedAreas);
      setReservations(mappedReservations);
    } catch (err) {
      setError(err.message || 'Error al cargar reservas');
      console.error('❌ Error cargando reservas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDelivery = (reservationId) => {
    setReservations(prev => 
      prev.map(r => 
        r.id === reservationId 
          ? { ...r, keyDelivered: !r.keyDelivered }
          : r
      )
    );
  };

  const handleCreateReservation = async () => {
    if (!newReservation.commonAreaId || !newReservation.unitNumber || !newReservation.startTime || !newReservation.endTime) {
      setError('Todos los campos son requeridos');
      return;
    }

    try {
      setCreating(true);
      setError('');
      
      const reservationData = {
        commonAreaId: parseInt(newReservation.commonAreaId),
        unitNumber: newReservation.unitNumber,
        startTime: new Date(newReservation.startTime).toISOString(),
        endTime: new Date(newReservation.endTime).toISOString(),
        notes: newReservation.notes,
        status: 'CONFIRMED'
      };

      await residentAmenities.reserve(reservationData);
      
      // Limpiar formulario y cerrar modal
      setNewReservation({
        commonAreaId: '',
        unitNumber: '',
        startTime: '',
        endTime: '',
        notes: '',
      });
      setShowNewReservationModal(false);
      
      // Recargar reservas
      await loadReservations();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al crear reserva');
      console.error('Error creando reserva:', err);
    } finally {
      setCreating(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCheckIn = async (reservationId) => {
    try {
      await axios.post(`/api/reservations/${reservationId}/check-in`);
      await loadReservations();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al hacer check-in');
      console.error(err);
    }
  };

  const handleCheckOut = async () => {
    try {
      await axios.post(`/api/reservations/${selectedReservationForCheckOut.id}/check-out`, checkOutData);
      setShowCheckOutModal(false);
      setCheckOutData({ requiresCleaning: false, cleaningNotes: '' });
      await loadReservations();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al hacer check-out');
      console.error(err);
    }
  };

  const getStatusBadge = (reservation) => {
    switch (reservation.status) {
      case 'PENDING':
        return <Badge bg="warning">⏳ Pendiente Aprobación</Badge>;
      case 'APPROVED':
        return <Badge bg="success">✅ Aprobada</Badge>;
      case 'REJECTED':
        return <Badge bg="danger">❌ Rechazada</Badge>;
      case 'IN_USE':
        return <Badge bg="info">🔑 En Uso</Badge>;
      case 'COMPLETED':
        return <Badge bg="secondary">✓ Completada</Badge>;
      case 'CANCELLED':
        return <Badge bg="dark">🚫 Cancelada</Badge>;
      default:
        return <Badge bg="secondary">{reservation.status}</Badge>;
    }
  };

  const filteredReservations = reservations.filter(r => {
    if (selectedArea === 'all') return true;
    return r.commonAreaId === parseInt(selectedArea);
  });

  const upcomingReservations = filteredReservations.filter(r => {
    const now = new Date();
    const startTime = new Date(r.startTime);
    return startTime > now;
  });

  const activeReservations = filteredReservations.filter(r => {
    const now = new Date();
    const startTime = new Date(r.startTime);
    const endTime = new Date(r.endTime);
    return now >= startTime && now <= endTime;
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold text-primary mb-0">Calendario de Áreas Comunes</h3>
        <Button 
          variant="success" 
          onClick={() => setShowNewReservationModal(true)}
          disabled={loading}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nueva Reserva
        </Button>
      </div>

      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Form>
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Área Común</Form.Label>
                  <Form.Select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                  >
                    <option value="all">Todas las áreas</option>
                    {commonAreas.map(area => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>

          {/* Resumen */}
          <Row className="mb-3">
            <Col md={4}>
              <Card className="text-center border-warning">
                <Card.Body className="py-2">
                  <h3 className="mb-0 text-warning">{upcomingReservations.length}</h3>
                  <small className="text-muted">Próximas</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center border-success">
                <Card.Body className="py-2">
                  <h3 className="mb-0 text-success">{activeReservations.length}</h3>
                  <small className="text-muted">En Curso</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center border-info">
                <Card.Body className="py-2">
                  <h3 className="mb-0 text-info">{filteredReservations.filter(r => !r.keyDelivered).length}</h3>
                  <small className="text-muted">Llaves Pendientes</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {error && (
            <Alert variant="danger">{error}</Alert>
          )}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <div className="text-muted">Cargando reservas...</div>
            </div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Área Común</th>
                  <th>Unidad</th>
                  <th>Residente</th>
                  <th>Notas</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No hay reservas para esta fecha
                    </td>
                  </tr>
                ) : (
                  filteredReservations
                    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                    .map((reservation) => (
                      <tr key={reservation.id}>
                        <td className="text-nowrap">
                          {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                        </td>
                        <td>
                          <strong>{reservation.commonAreaName}</strong>
                        </td>
                        <td>#{reservation.unitNumber}</td>
                        <td>{reservation.residentName}</td>
                        <td>
                          {reservation.notes ? (
                            <small className="text-muted">{reservation.notes}</small>
                          ) : (
                            <small className="text-muted fst-italic">Sin notas</small>
                          )}
                        </td>
                        <td>{getStatusBadge(reservation)}</td>
                        <td>
                          {reservation.status === 'APPROVED' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleCheckIn(reservation.id)}
                            >
                              <i className="bi bi-box-arrow-in-right me-1"></i>
                              Check-in
                            </Button>
                          )}
                          {reservation.status === 'IN_USE' && (
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => {
                                setSelectedReservationForCheckOut(reservation);
                                setShowCheckOutModal(true);
                              }}
                            >
                              <i className="bi bi-box-arrow-left me-1"></i>
                              Check-out
                            </Button>
                          )}
                          {(reservation.status === 'COMPLETED' || reservation.status === 'CANCELLED' || reservation.status === 'REJECTED') && (
                            <span className="text-muted small">-</span>
                          )}
                          {reservation.status === 'PENDING' && (
                            <span className="text-muted small">Esperando aprobación</span>
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
          <Row className="text-muted small">
            <Col>
              <i className="bi bi-info-circle me-2"></i>
              Use este calendario para controlar entregas de llaves y verificar limpieza post-uso
            </Col>
          </Row>
        </Card.Footer>
      </Card>

      {/* Modal para crear nueva reserva */}
      <Modal show={showNewReservationModal} onHide={() => setShowNewReservationModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Nueva Reserva de Área Común</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Área Común</Form.Label>
              <Form.Select
                value={newReservation.commonAreaId}
                onChange={(e) => setNewReservation({ ...newReservation, commonAreaId: e.target.value })}
                disabled={creating}
              >
                <option value="">Seleccione un área</option>
                {commonAreas.map(area => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Departamento</Form.Label>
              <Form.Select
                value={newReservation.unitNumber}
                onChange={(e) => setNewReservation({ ...newReservation, unitNumber: e.target.value })}
                disabled={creating}
              >
                <option value="">Seleccione un departamento</option>
                {units.map(unit => (
                  <option key={unit.id} value={unit.unitNumber}>
                    Depto {unit.unitNumber} - Edificio {unit.buildingId}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Inicio</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={newReservation.startTime}
                    onChange={(e) => setNewReservation({ ...newReservation, startTime: e.target.value })}
                    disabled={creating}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fin</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={newReservation.endTime}
                    onChange={(e) => setNewReservation({ ...newReservation, endTime: e.target.value })}
                    disabled={creating}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Notas (opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Observaciones adicionales..."
                value={newReservation.notes}
                onChange={(e) => setNewReservation({ ...newReservation, notes: e.target.value })}
                disabled={creating}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewReservationModal(false)} disabled={creating}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCreateReservation} disabled={creating}>
            {creating ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Creando...
              </>
            ) : (
              'Crear Reserva'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Check-out */}
      <Modal 
        show={showCheckOutModal} 
        onHide={() => setShowCheckOutModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Check-out de Reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReservationForCheckOut && (
            <div className="mb-3">
              <p className="mb-2">
                <strong>Área:</strong> {selectedReservationForCheckOut.commonAreaName}
              </p>
              <p className="mb-3">
                <strong>Residente:</strong> {selectedReservationForCheckOut.residentName} (Unidad #{selectedReservationForCheckOut.unitNumber})
              </p>
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="¿Requiere limpieza?"
              checked={checkOutData.requiresCleaning}
              onChange={(e) => setCheckOutData({ 
                ...checkOutData, 
                requiresCleaning: e.target.checked 
              })}
            />
          </Form.Group>

          {checkOutData.requiresCleaning && (
            <Form.Group className="mb-3">
              <Form.Label>Notas de limpieza</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Describa el estado del área y observaciones..."
                value={checkOutData.cleaningNotes}
                onChange={(e) => setCheckOutData({ 
                  ...checkOutData, 
                  cleaningNotes: e.target.value 
                })}
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowCheckOutModal(false);
              setCheckOutData({ requiresCleaning: false, cleaningNotes: '' });
            }}
          >
            Cancelar
          </Button>
          <Button variant="warning" onClick={handleCheckOut}>
            <i className="bi bi-check-circle me-1"></i>
            Confirmar Check-out
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CommonAreasCalendar;
