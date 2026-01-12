import { useState } from 'react';
import { Card, Form, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import { residentInvitations } from '../../api/residentService';

const ResidentInvitation = () => {
  const [formData, setFormData] = useState({
    guestName: '',
    dateTime: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

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
    if (!formData.guestName.trim()) {
      setError('El nombre del invitado es requerido');
      return;
    }
    if (!formData.dateTime) {
      setError('La fecha y hora son requeridas');
      return;
    }

    try {
      setLoading(true);
      
      // Preparar datos para el API - formato que espera el backend
      const invitationData = {
        guestName: formData.guestName,
        unitId: 1, // TODO: Obtener del usuario autenticado
        validUntil: formData.dateTime,
        notes: formData.notes
      };

      const response = await residentInvitations.create(invitationData);
      
      // El backend genera automáticamente el qrToken
      const code = response.data?.qrToken || `INV-${Date.now().toString(36).toUpperCase()}`;
      
      setGeneratedCode(code);
      setShowSuccessModal(true);
      
      // Limpiar formulario
      setFormData({
        guestName: '',
        dateTime: '',
        notes: ''
      });
      
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al crear la invitación';
      setError(msg);
      console.error('Error al crear invitación:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setGeneratedCode('');
  };

  return (
    <>
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="mb-3">Crear invitación</Card.Title>
          
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              <strong>Error:</strong> {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} className="d-grid gap-3">
            <Form.Group>
              <Form.Label>Nombre del invitado</Form.Label>
              <Form.Control 
                type="text"
                name="guestName"
                placeholder="Ej. Ana Pérez" 
                value={formData.guestName}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </Form.Group>
            
            <Form.Group>
              <Form.Label>Fecha y hora</Form.Label>
              <Form.Control 
                type="datetime-local" 
                name="dateTime"
                value={formData.dateTime}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </Form.Group>
            
            <Form.Group>
              <Form.Label>Notas</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                name="notes"
                placeholder="Indicaciones especiales" 
                value={formData.notes}
                onChange={handleChange}
                disabled={loading}
              />
            </Form.Group>
            
            <Button 
              variant="primary" 
              type="submit"
              disabled={loading}
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
                  Generando...
                </>
              ) : (
                'Generar código'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Modal de éxito con código QR */}
      <Modal show={showSuccessModal} onHide={handleCloseModal} centered size="lg" id="qr-modal">
        <Modal.Header closeButton>
          <Modal.Title>¡Invitación creada con éxito!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="mb-3">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
          </div>
          <h5 className="mb-4">Código QR de invitación</h5>
          
          {/* Código QR */}
          <div className="d-flex justify-content-center mb-4">
            <div className="p-4 bg-white rounded shadow-sm border">
              <QRCodeSVG 
                value={generatedCode} 
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>
          
          {/* Token debajo del QR */}
          <div className="mb-3">
            <small className="text-muted d-block mb-2">Token de invitación:</small>
            <div className="p-2 bg-light rounded border">
              <code className="text-primary small" style={{ wordBreak: 'break-all' }}>
                {generatedCode}
              </code>
            </div>
          </div>
          
          <Alert variant="info" className="text-start small">
            <strong>Instrucciones:</strong>
            <ul className="mb-0 mt-2">
              <li>Comparte este código QR con tu invitado</li>
              <li>El invitado debe mostrar el QR en la recepción</li>
              <li>El conserje escaneará el código para validar el acceso</li>
            </ul>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={() => {
              navigator.clipboard.writeText(generatedCode);
              alert('Token copiado al portapapeles');
            }}
          >
            <i className="bi bi-clipboard me-2"></i>
            Copiar token
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              // Descargar QR como imagen
              const svg = document.querySelector('#qr-modal svg');
              if (svg) {
                const svgData = new XMLSerializer().serializeToString(svg);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.onload = () => {
                  canvas.width = img.width;
                  canvas.height = img.height;
                  ctx.drawImage(img, 0, 0);
                  const pngFile = canvas.toDataURL('image/png');
                  const downloadLink = document.createElement('a');
                  downloadLink.download = `invitacion-qr-${Date.now()}.png`;
                  downloadLink.href = pngFile;
                  downloadLink.click();
                };
                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
              }
            }}
          >
            <i className="bi bi-download me-2"></i>
            Descargar QR
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ResidentInvitation;
