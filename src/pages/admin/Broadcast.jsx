import { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner, Table, Badge, Row, Col, Modal } from 'react-bootstrap';
import { adminBroadcasts } from '../../api/adminService';
import { useAuth } from '../../auth/AuthProvider';

const AdminBroadcast = () => {
  const { user } = useAuth();
  const [broadcasts, setBroadcasts] = useState([]);
  const [stats, setStats] = useState({
    deliveryRate: 0,
    readRate: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [messageData, setMessageData] = useState({
    type: 'ANNOUNCEMENT', // ANNOUNCEMENT, ALERT, NEWS
    title: '',
    message: '',
    targetAudience: 'ALL', // ALL, RESIDENTS, CONCIERGES
    priority: 'NORMAL', // LOW, NORMAL, HIGH, URGENT
    expiresAt: ''
  });
  const [sending, setSending] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    loadBroadcasts();
  }, []);

  const loadBroadcasts = async () => {
    try {
      setLoading(true);
      const [broadcastsResp, statsResp] = await Promise.all([
        adminBroadcasts.list().catch(() => ({ data: [] })),
        adminBroadcasts.getStats().catch(() => ({ data: { deliveryRate: 0, readRate: 0 } }))
      ]);
      
      const broadcastsList = Array.isArray(broadcastsResp.data) ? broadcastsResp.data : broadcastsResp.data?.content || [];
      setBroadcasts(broadcastsList);
      setStats(statsResp.data || { deliveryRate: 0, readRate: 0 });
    } catch (err) {
      console.error('Error cargando broadcasts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!messageData.title || !messageData.message) {
      setError('Por favor complete título y mensaje');
      return;
    }

    try {
      setSending(true);
      setError('');
      setSuccess('');

      await adminBroadcasts.create({
        ...messageData,
        sentBy: user?.email || 'admin',
        sentAt: new Date().toISOString(),
        expiresAt: messageData.expiresAt || null
      });

      setSuccess('✅ Mensaje enviado exitosamente a ' + getAudienceLabel(messageData.targetAudience));
      
      // Limpiar formulario
      setMessageData({
        type: 'ANNOUNCEMENT',
        title: '',
        message: '',
        targetAudience: 'ALL',
        priority: 'NORMAL',
        expiresAt: ''
      });

      loadBroadcasts();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  const handlePreview = () => {
    if (!messageData.title || !messageData.message) {
      alert('Complete título y mensaje para previsualizar');
      return;
    }
    setShowPreviewModal(true);
  };

  const getAudienceLabel = (audience) => {
    switch (audience) {
      case 'ALL': return 'Todos los usuarios';
      case 'RESIDENTS': return 'Solo residentes';
      case 'CONCIERGES': return 'Solo conserjes';
      default: return audience;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ANNOUNCEMENT': return '📢';
      case 'ALERT': return '⚠️';
      case 'NEWS': return '📰';
      default: return '📝';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return <Badge bg="danger">🚨 Urgente</Badge>;
      case 'HIGH':
        return <Badge bg="warning">⚡ Alta</Badge>;
      case 'NORMAL':
        return <Badge bg="info">📋 Normal</Badge>;
      case 'LOW':
        return <Badge bg="secondary">💤 Baja</Badge>;
      default:
        return <Badge bg="secondary">{priority}</Badge>;
    }
  };

  const getCharacterCount = () => {
    const count = messageData.message.length;
    const maxLength = 500;
    const color = count > maxLength * 0.9 ? 'text-danger' : count > maxLength * 0.7 ? 'text-warning' : 'text-muted';
    return <small className={color}>{count}/{maxLength} caracteres</small>;
  };

  return (
    <div>
      <h3 className="fw-bold text-primary mb-4">📢 Comunicación Masiva</h3>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Row className="g-4">
        {/* Formulario de envío */}
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="mb-3">Nuevo Mensaje</Card.Title>
              
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Mensaje</Form.Label>
                  <Form.Select
                    value={messageData.type}
                    onChange={(e) => setMessageData({ ...messageData, type: e.target.value })}
                  >
                    <option value="ANNOUNCEMENT">📢 Anuncio General</option>
                    <option value="ALERT">⚠️ Alerta Importante</option>
                    <option value="NEWS">📰 Noticia del Edificio</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Destinatarios</Form.Label>
                  <Form.Select
                    value={messageData.targetAudience}
                    onChange={(e) => setMessageData({ ...messageData, targetAudience: e.target.value })}
                  >
                    <option value="ALL">👥 Todos los usuarios</option>
                    <option value="RESIDENTS">🏠 Solo residentes</option>
                    <option value="CONCIERGES">👮 Solo conserjes</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Prioridad</Form.Label>
                  <Form.Select
                    value={messageData.priority}
                    onChange={(e) => setMessageData({ ...messageData, priority: e.target.value })}
                  >
                    <option value="LOW">💤 Baja</option>
                    <option value="NORMAL">📋 Normal</option>
                    <option value="HIGH">⚡ Alta</option>
                    <option value="URGENT">🚨 Urgente</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Título *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej: Corte de agua programado"
                    value={messageData.title}
                    onChange={(e) => setMessageData({ ...messageData, title: e.target.value })}
                    maxLength={100}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mensaje *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder="Escriba el contenido del mensaje aquí..."
                    value={messageData.message}
                    onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                    maxLength={500}
                  />
                  <div className="d-flex justify-content-between mt-1">
                    {getCharacterCount()}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Expiración (Opcional)</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={messageData.expiresAt}
                    onChange={(e) => setMessageData({ ...messageData, expiresAt: e.target.value })}
                  />
                  <Form.Text className="text-muted">
                    Si especifica, el mensaje se ocultará automáticamente después de esta fecha
                  </Form.Text>
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button variant="outline-secondary" onClick={handlePreview}>
                    <i className="bi bi-eye me-2"></i>Previsualizar
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleSendBroadcast} 
                    disabled={sending || !messageData.title || !messageData.message}
                    size="lg"
                  >
                    {sending ? (
                      <>
                        <Spinner size="sm" animation="border" className="me-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send-fill me-2"></i>
                        Enviar Mensaje
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Historial de mensajes */}
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="mb-3">Mensajes Recientes</Card.Title>

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" size="sm" />
                  <p className="mt-2 small text-muted">Cargando historial...</p>
                </div>
              ) : broadcasts.length === 0 ? (
                <Alert variant="info">No hay mensajes enviados aún</Alert>
              ) : (
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {broadcasts.slice(0, 10).map((broadcast, idx) => (
                    <Card key={idx} className="mb-2 border">
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <span className="me-2">{getTypeIcon(broadcast.type)}</span>
                            <strong>{broadcast.title}</strong>
                          </div>
                          {getPriorityBadge(broadcast.priority)}
                        </div>
                        <p className="mb-2 small">{broadcast.message}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <Badge bg="secondary" className="small">
                            {getAudienceLabel(broadcast.targetAudience)}
                          </Badge>
                          <small className="text-muted">
                            {broadcast.sentAt ? new Date(broadcast.sentAt).toLocaleString('es-CL') : 'N/A'}
                          </small>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Estadísticas de alcance */}
      <Card className="shadow-sm mt-4">
        <Card.Body>
          <Card.Title className="mb-3">Estadísticas de Comunicación</Card.Title>
          <Row className="text-center">
            <Col md={3}>
              <div className="p-3 border rounded">
                <h4 className="mb-0 text-primary">{broadcasts.length}</h4>
                <small className="text-muted">Mensajes Enviados</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="p-3 border rounded">
                <h4 className="mb-0 text-success">
                  {stats.deliveryRate ? `${stats.deliveryRate}%` : 'N/A'}
                </h4>
                <small className="text-muted">Tasa de Entrega</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="p-3 border rounded">
                <h4 className="mb-0 text-info">
                  {stats.readRate ? `${stats.readRate}%` : 'N/A'}
                </h4>
                <small className="text-muted">Tasa de Lectura</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="p-3 border rounded">
                <h4 className="mb-0 text-warning">{broadcasts.filter(b => b.priority === 'URGENT').length}</h4>
                <small className="text-muted">Alertas Urgentes</small>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Modal de previsualización */}
      <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Previsualización del Mensaje</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant={messageData.priority === 'URGENT' ? 'danger' : messageData.priority === 'HIGH' ? 'warning' : 'info'}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <strong className="d-block">{getTypeIcon(messageData.type)} {messageData.title}</strong>
              </div>
              {getPriorityBadge(messageData.priority)}
            </div>
            <p className="mb-2">{messageData.message}</p>
            <hr />
            <small className="text-muted">
              Enviado a: {getAudienceLabel(messageData.targetAudience)}<br />
              {messageData.expiresAt && `Expira: ${new Date(messageData.expiresAt).toLocaleString('es-CL')}`}
            </small>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminBroadcast;
