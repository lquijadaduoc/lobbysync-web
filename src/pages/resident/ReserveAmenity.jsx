import { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner, Modal, Table, Badge, Row, Col } from 'react-bootstrap';
import { residentAmenities } from '../../api/residentService';

const ResidentReservation = () => {
  const [formData, setFormData] = useState({
    amenityId: '',
    date: '',
    time: ''
  });
  const [amenities, setAmenities] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAmenities, setLoadingAmenities] = useState(true);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [reservationDetails, setReservationDetails] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedAmenityForCalendar, setSelectedAmenityForCalendar] = useState(null);

  // Cargar amenidades disponibles al montar el componente
  useEffect(() => {
    loadAmenities();
    loadMyReservations();
  }, []);

  const loadAmenities = async () => {
    try {
      setLoadingAmenities(true);
      const response = await residentAmenities.listAvailable();
      const amenitiesList = Array.isArray(response.data) ? response.data : 
                           response.data?.content || response.data?.amenities || [];
      setAmenities(amenitiesList);
    } catch (err) {
      console.error('Error al cargar amenidades:', err);
      // Si falla el API, usar datos de ejemplo
      setAmenities([
        { id: '1', name: 'Salón Comunal', available: true, maxHours: 4, rules: 'Máximo 4 horas por reserva' },
        { id: '2', name: 'Terraza', available: true, maxHours: 3, rules: 'Sin ruido después de 22:00' },
        { id: '3', name: 'Gimnasio', available: true, maxHours: 2, rules: 'Solo de 6:00 a 22:00' },
        { id: '4', name: 'Piscina', available: true, maxHours: 3, rules: 'Supervisión de menores requerida' },
        { id: '5', name: 'Sala de Juegos', available: true, maxHours: 3, rules: 'Máximo 10 personas' }
      ]);
    } finally {
      setLoadingAmenities(false);
    }
  };

  const loadMyReservations = async () => {
    try {
      setLoadingReservations(true);
      const response = await residentAmenities.myReservations();
      const reservationsList = Array.isArray(response.data) ? response.data : 
                              response.data?.content || response.data?.reservations || [];
      setMyReservations(reservationsList);
    } catch (err) {
      console.error('Error al cargar reservas:', err);
      setMyReservations([]);
    } finally {
      setLoadingReservations(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validaciones
    if (!formData.amenityId) {
      setError('Debe seleccionar un espacio');
      return;
    }
    if (!formData.date) {
      setError('La fecha es requerida');
      return;
    }
    if (!formData.time) {
      setError('La hora es requerida');
      return;
    }

    try {
      setLoading(true);
      
      // Preparar datos para el API - formato que espera el backend
      const startDateTime = `${formData.date}T${formData.time}:00`;
      // Por defecto, reserva de 1 hora
      const startDate = new Date(startDateTime);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      const endDateTime = endDate.toISOString().slice(0, 19);
      
      const reservationData = {
        commonAreaId: parseInt(formData.amenityId),
        unitId: 1, // TODO: Obtener del usuario autenticado
        startTime: startDateTime,
        endTime: endDateTime,
        notes: ''
      };

      const response = await residentAmenities.reserve(reservationData);
      
      // Obtener detalles de la reserva
      const selectedAmenity = amenities.find(a => a.id === formData.amenityId || a.id === parseInt(formData.amenityId));
      setReservationDetails({
        amenityName: selectedAmenity?.name || 'Espacio',
        date: formData.date,
        time: formData.time,
        confirmationCode: response.data?.id ? `RES-${response.data.id}` : `RES-${Date.now().toString(36).toUpperCase()}`
      });
      
      setShowSuccessModal(true);
      
      // Limpiar formulario
      setFormData({
        amenityId: '',
        date: '',
        time: ''
      });
      
      // Recargar reservas
      loadMyReservations();
      
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al crear la reserva';
      setError(msg);
      console.error('Error al crear reserva:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!confirm('¿Está seguro que desea cancelar esta reserva?')) {
      return;
    }

    try {
      await residentAmenities.cancelReservation(reservationId);
      alert('Reserva cancelada exitosamente');
      loadMyReservations();
    } catch (err) {
      alert('Error al cancelar la reserva: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setReservationDetails(null);
  };

  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Días vacíos antes del primer día del mes
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<td key={`empty-${i}`} className="text-muted bg-light"></td>);
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const isToday = dateObj.toDateString() === today.toDateString();
      const isPast = dateObj < today;
      const isSelected = formData.date === dateObj.toISOString().split('T')[0];
      
      days.push(
        <td 
          key={day}
          onClick={() => {
            if (!isPast) {
              setFormData(prev => ({
                ...prev,
                date: dateObj.toISOString().split('T')[0]
              }));
            }
          }}
          className={`text-center py-2 ${isPast ? 'text-muted' : 'cursor-pointer'} ${isSelected ? 'bg-primary text-white' : ''} ${isToday ? 'border-2 border-warning' : ''}`}
          style={{ cursor: isPast ? 'default' : 'pointer' }}
        >
          {day}
        </td>
      );
    }
    
    return days;
  };

  if (loadingAmenities) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando espacios disponibles...</p>
      </div>
    );
  }

  const selectedAmenity = amenities.find(a => a.id === formData.amenityId || a.id === parseInt(formData.amenityId));

  return (
    <>
      <h3 className="mb-4">📅 Reservas de Espacios Comunes</h3>

      <Row className="mb-4">
        <Col lg={6}>
          {/* Formulario de Reserva */}
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="mb-3">Nueva Reserva</Card.Title>
              
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  <strong>Error:</strong> {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit} className="d-grid gap-3">
                <Form.Group>
                  <Form.Label>Espacio</Form.Label>
                  <Form.Select 
                    name="amenityId"
                    value={formData.amenityId}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  >
                    <option value="">Seleccione un espacio...</option>
                    {amenities.map(amenity => (
                      <option key={amenity.id} value={amenity.id}>
                        {amenity.name}
                      </option>
                    ))}
                  </Form.Select>
                  {selectedAmenity && (
                    <Form.Text className="d-block mt-2">
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0"
                        onClick={() => setShowRulesModal(true)}
                      >
                        📋 Ver reglamento
                      </Button>
                    </Form.Text>
                  )}
                </Form.Group>
                
                <Form.Group>
                  <Form.Label>Hora</Form.Label>
                  <Form.Control 
                    type="time" 
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={loading || !formData.date}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Reservando...
                    </>
                  ) : (
                    '✓ Confirmar Reserva'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          {/* Calendario Mini */}
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="mb-3">Selecciona una fecha</Card.Title>
              
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Button 
                  variant="sm" 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                >
                  &lt;
                </Button>
                <span className="fw-bold">{currentMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</span>
                <Button 
                  variant="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                >
                  &gt;
                </Button>
              </div>
              
              <table className="w-100 text-center small">
                <thead>
                  <tr>
                    <th>Do</th><th>Lu</th><th>Ma</th><th>Mi</th><th>Ju</th><th>Vi</th><th>Sa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>{renderCalendarDays().slice(0, 7)}</tr>
                  <tr>{renderCalendarDays().slice(7, 14)}</tr>
                  <tr>{renderCalendarDays().slice(14, 21)}</tr>
                  <tr>{renderCalendarDays().slice(21, 28)}</tr>
                  {renderCalendarDays().length > 28 && <tr>{renderCalendarDays().slice(28)}</tr>}
                </tbody>
              </table>
              
              {formData.date && (
                <Alert variant="info" className="mt-3 mb-0">
                  <small>📍 Fecha seleccionada: <strong>{new Date(formData.date).toLocaleDateString('es-ES')}</strong></small>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Mis reservas */}
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="mb-3">Mis reservas activas</Card.Title>
          
          {loadingReservations ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" className="me-2" />
              <span>Cargando reservas...</span>
            </div>
          ) : myReservations.length === 0 ? (
            <Alert variant="info">
              No tiene reservas activas
            </Alert>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Espacio</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {myReservations.map((reservation) => {
                  // Función para obtener el badge del estado
                  const getStatusBadge = (status) => {
                    switch (status) {
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
                      case 'CONFIRMED':
                        return <Badge bg="success">✓ Confirmada</Badge>;
                      default:
                        return <Badge bg="secondary">{status || 'N/A'}</Badge>;
                    }
                  };

                  const canCancel = ['PENDING', 'APPROVED'].includes(reservation.status);

                  return (
                  <tr key={reservation.id}>
                    <td>{reservation.commonAreaName || reservation.amenityName || reservation.amenity?.name || 'N/A'}</td>
                    <td>{reservation.date || (reservation.startTime ? new Date(reservation.startTime).toLocaleDateString('es-CL') : 'N/A')}</td>
                    <td>{reservation.time || (reservation.startTime ? new Date(reservation.startTime).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : 'N/A')}</td>
                    <td>{getStatusBadge(reservation.status)}</td>
                    <td>
                      {canCancel ? (
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleCancelReservation(reservation.id)}
                        >
                          ✕ Cancelar
                        </Button>
                      ) : (
                        <span className="text-muted small">-</span>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal de reglamento */}
      <Modal show={showRulesModal} onHide={() => setShowRulesModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reglamento de Uso - {selectedAmenity?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <h6>Normas de Uso:</h6>
            <ul className="mb-0">
              <li>{selectedAmenity?.rules || 'No hay restricciones especiales'}</li>
              <li>Máximo de horas por reserva: {selectedAmenity?.maxHours || 3}</li>
              <li>Debe respetar el horario de funcionamiento establecido</li>
              <li>Responsable del cuidado y limpieza del espacio</li>
            </ul>
          </div>
          <Alert variant="warning" className="mb-0">
            <small>El incumplimiento de las normas puede resultar en la cancelación de futuras reservas.</small>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowRulesModal(false)}>
            Entendido
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de éxito */}
      <Modal show={showSuccessModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>¡Reserva confirmada!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="mb-3">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
          </div>
          {reservationDetails && (
            <>
              <h5 className="mb-3">{reservationDetails.amenityName}</h5>
              <div className="text-start">
                <p><strong>Fecha:</strong> {new Date(reservationDetails.date).toLocaleDateString()}</p>
                <p><strong>Hora:</strong> {reservationDetails.time}</p>
                <p><strong>Código de confirmación:</strong></p>
                <div className="p-2 bg-light rounded border text-center">
                  <code className="text-primary">{reservationDetails.confirmationCode}</code>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseModal}>
            Aceptar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ResidentReservation;
