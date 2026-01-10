import { useEffect, useState, useRef } from 'react';
import { Card, Form, Button, Table, Spinner, Alert, Badge } from 'react-bootstrap';
import { conciergeLogbook } from '../../api/conciergeService';
import { useAuth } from '../../auth/AuthProvider';

const ConciergeLogbook = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [posting, setPosting] = useState(false);
  const mountTimeRef = useRef(performance.now());

  const loadEntries = async () => {
    const requestStart = performance.now();
    try {
      setLoading(true);
      setError('');
      const { data } = await conciergeLogbook.list({ limit: 50 });
      const requestEnd = performance.now();
      console.log(`📝 Logbook API response: ${(requestEnd - requestStart).toFixed(2)}ms`);

      const entryList = Array.isArray(data) ? data : data?.content || data?.entries || [];
      setEntries(entryList);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al cargar bitácora.';
      setError(msg);
      console.error('Error en conciergeLogbook.list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    const renderTime = performance.now() - mountTimeRef.current;
    console.log(`🎨 ConciergeLogbook component render: ${renderTime.toFixed(2)}ms`);
  });

  const handleAddEntry = async () => {
    if (!note.trim()) return;
    const requestStart = performance.now();
    try {
      setPosting(true);
      setError('');
      await conciergeLogbook.create({
        note: note.trim(),
        timestamp: new Date().toISOString(),
        user: user?.email || user?.name || 'Usuario desconocido',
      });
      const requestEnd = performance.now();
      console.log(`✅ Create logbook entry: ${(requestEnd - requestStart).toFixed(2)}ms`);
      setNote('');
      // Reload entries to avoid duplicates
      await loadEntries();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al crear entrada.';
      setError(msg);
      console.error('Error en conciergeLogbook.create:', err);
    } finally {
      setPosting(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="mb-3">Bitácora</Card.Title>
        {error && (
          <Alert variant="danger" className="d-flex justify-content-between align-items-center">
            <span>{error}</span>
            <Button size="sm" variant="outline-danger" onClick={loadEntries}>
              Reintentar
            </Button>
          </Alert>
        )}
        <Form className="d-flex gap-2 mb-3">
          <Form.Control
            placeholder="Escribe una nota rápida"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={posting || loading}
          />
          <Button
            variant="primary"
            onClick={handleAddEntry}
            disabled={posting || !note.trim() || loading}
          >
            {posting ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Agregando...
              </>
            ) : (
              'Agregar'
            )}
          </Button>
        </Form>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <div className="text-muted">Cargando bitácora...</div>
          </div>
        ) : error && entries.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <div className="mb-2">⚠️ No se pudo cargar la bitácora</div>
            <Button size="sm" variant="primary" onClick={loadEntries}>
              Intentar nuevamente
            </Button>
          </div>
        ) : (
          <Table hover responsive>
            <thead>
              <tr>
                <th>Hora</th>
                <th>Detalle</th>
                <th>Responsable</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center text-muted">
                    No hay entradas en la bitácora
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id || entry.entryId}>
                    <td>{formatTime(entry.timestamp || entry.createdAt)}</td>
                    <td>{entry.note || entry.description || 'N/A'}</td>
                    <td>{entry.user || entry.createdBy || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default ConciergeLogbook;
