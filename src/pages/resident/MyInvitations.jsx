import { useEffect, useState } from 'react';
import { Card, Table, Badge, Spinner, Alert, Modal, Button } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import { residentInvitations } from '../../api/residentService';

const MyInvitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await residentInvitations.listMyInvitations();
      const invitationsList = Array.isArray(data) ? data : data?.content || data?.invitations || [];
      setInvitations(invitationsList);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al cargar invitaciones.';
      setError(msg);
      console.error('Error en residentInvitations.listMyInvitations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status, validUntil) => {
    const now = new Date();
    const expirationDate = new Date(validUntil);
    
    if (status === 'USED') {
      return <Badge bg="secondary">Usado</Badge>;
    }
    if (status === 'EXPIRED' || now > expirationDate) {
      return <Badge bg="danger">Expirado</Badge>;
    }
    if (status === 'ACTIVE' && now < expirationDate) {
      return <Badge bg="success">Activo</Badge>;
    }
    return <Badge bg="warning">{status || 'N/A'}</Badge>;
  };

  const handleShowQR = (invitation) => {
    setSelectedInvitation(invitation);
    setShowQRModal(true);
  };

  const handleCloseQR = () => {
    setShowQRModal(false);
    setSelectedInvitation(null);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="mb-3">Mis Invitaciones</Card.Title>
          {error && (
            <Alert variant="danger" className="mb-3">
              <strong>Error:</strong> {error}
            </Alert>
          )}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <div className="text-muted">Cargando invitaciones...</div>
            </div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Invitado</th>
                  <th>Válido hasta</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {invitations.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">
                      No hay invitaciones creadas
                    </td>
                  </tr>
                ) : (
                  invitations.map((invitation) => (
                    <tr key={invitation.id}>
                      <td>{invitation.guestName || 'N/A'}</td>
                      <td>{formatDateTime(invitation.validUntil)}</td>
                      <td>{getStatusBadge(invitation.status, invitation.validUntil)}</td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleShowQR(invitation)}
                          disabled={invitation.status === 'USED' || invitation.status === 'EXPIRED'}
                        >
                          <i className="bi bi-qr-code me-1"></i>
                          Ver QR
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
        {invitations.length > 0 && (
          <Card.Footer className="bg-light text-muted small">
            Total: {invitations.length} invitaciones
          </Card.Footer>
        )}
      </Card>

      {/* Modal para mostrar QR */}
      {selectedInvitation && (
        <Modal show={showQRModal} onHide={handleCloseQR} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Código QR - {selectedInvitation.guestName}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center py-4">
            {/* Código QR */}
            <div className="d-flex justify-content-center mb-4">
              <div className="p-4 bg-white rounded shadow-sm border">
                <QRCodeSVG 
                  value={selectedInvitation.qrToken} 
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>
            
            {/* Información de la invitación */}
            <div className="text-start mb-3">
              <p className="mb-2"><strong>Invitado:</strong> {selectedInvitation.guestName}</p>
              <p className="mb-2"><strong>Válido hasta:</strong> {formatDateTime(selectedInvitation.validUntil)}</p>
              <p className="mb-2"><strong>Estado:</strong> {getStatusBadge(selectedInvitation.status, selectedInvitation.validUntil)}</p>
            </div>

            {/* Token */}
            <div className="mb-3">
              <small className="text-muted d-block mb-2">Token de invitación:</small>
              <div className="p-2 bg-light rounded border">
                <code className="text-primary small" style={{ wordBreak: 'break-all' }}>
                  {selectedInvitation.qrToken}
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
            <Button variant="secondary" onClick={handleCloseQR}>
              Cerrar
            </Button>
            <Button 
              variant="outline-primary" 
              onClick={() => {
                navigator.clipboard.writeText(selectedInvitation.qrToken);
                alert('Token copiado al portapapeles');
              }}
            >
              <i className="bi bi-clipboard me-2"></i>
              Copiar token
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                const svg = document.querySelector('.modal svg');
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
                    downloadLink.download = `invitacion-${selectedInvitation.guestName}-${Date.now()}.png`;
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
      )}
    </>
  );
};

export default MyInvitations;
