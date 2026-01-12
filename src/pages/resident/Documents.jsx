import { useState, useEffect } from 'react';
import { Card, Alert, Spinner, Row, Col, Button } from 'react-bootstrap';
import { residentsService } from '../../api/residentService';

const ResidentDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await residentsService.getDocuments().catch(err => {
        if (err.response?.status === 404) {
          console.log('Endpoint /api/documents no disponible');
          return { data: [] };
        }
        throw err;
      });
      const docList = Array.isArray(response.data) ? response.data : 
                     response.data?.content || [];
      setDocuments(docList);
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(err.message || 'Error al cargar documentos');
      }
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (docId) => {
    try {
      const response = await residentsService.downloadDocument(docId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `documento-${docId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (err) {
      setError('Error descargando documento');
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando documentos...</p>
      </div>
    );
  }

  const docCategories = {
    REGLAMENTO: { icon: '📋', title: 'Reglamento de Copropiedad' },
    ACTAS: { icon: '📖', title: 'Actas de Asamblea' },
    COMUNICADOS: { icon: '📢', title: 'Comunicados Oficiales' },
    OTROS: { icon: '📄', title: 'Otros Documentos' }
  };

  return (
    <div>
      <h3 className="mb-4">📄 Biblioteca de Documentos</h3>

      <Alert variant="info" className="mb-3">
        <i className="bi bi-info-circle me-2"></i>
        <strong>Funcionalidad en desarrollo:</strong> La biblioteca de documentos requiere el endpoint backend /api/documents que aún no está implementado. Los documentos se pueden gestionar a través de /api/files cuando esté disponible.
      </Alert>

      {error && <Alert variant="danger">{error}</Alert>}

      {documents.length === 0 ? (
        <Alert variant="warning">No hay documentos disponibles en este momento</Alert>
      ) : (
        <>
          {Object.entries(docCategories).map(([category, { icon, title }]) => {
            const categoryDocs = documents.filter(d => d.category === category);
            if (categoryDocs.length === 0) return null;

            return (
              <div key={category} className="mb-4">
                <h5 className="mb-3">{icon} {title}</h5>
                <Row>
                  {categoryDocs.map(doc => (
                    <Col lg={6} key={doc.id} className="mb-3">
                      <Card className="shadow-sm h-100">
                        <Card.Body>
                          <Card.Title className="fs-6">{doc.title}</Card.Title>
                          <Card.Text className="text-muted small">
                            {doc.description}
                          </Card.Text>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-secondary">
                              {new Date(doc.uploadedDate).toLocaleDateString()}
                            </small>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleDownload(doc.id)}
                            >
                              📥 Descargar
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default ResidentDocuments;
