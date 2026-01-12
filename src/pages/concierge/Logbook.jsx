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
  const [category, setCategory] = useState('general');
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
        category: category,
        timestamp: new Date().toISOString(),
        user: user?.email || user?.name || 'Usuario desconocido',
      });
      const requestEnd = performance.now();
      console.log(`✅ Create logbook entry: ${(requestEnd - requestStart).toFixed(2)}ms`);
      setNote('');
      setCategory('general');
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

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }) + ' ' + date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold text-primary mb-0">Bitácora Digital</h3>
        <span className="text-muted">
          <i className="bi bi-book me-2"></i>
          Libro de Novedades
        </span>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="mb-3">Registrar Novedad del Turno</Card.Title>
          {error && (
            <Alert variant="danger" className="d-flex justify-content-between align-items-center">
              <span>{error}</span>
              <Button size="sm" variant="outline-danger" onClick={loadEntries}>
                Reintentar
              </Button>
            </Alert>
          )}
          <Form className="mb-3">
            <Form.Group className="mb-2">
              <Form.Label>Categoría</Form.Label>
              <Form.Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={posting || loading}
              >
                <option value="general">General</option>
                <option value="ruido">Ruido / Molestia</option>
                <option value="reclamo">Reclamo</option>
                <option value="reparacion">Reparación / Mantenimiento</option>
                <option value="seguridad">Seguridad</option>
                <option value="entrega_turno">Entrega de Turno</option>
                <option value="emergencia">Emergencia</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Detalle de la Novedad</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Describa el suceso del turno de forma detallada (ruidos, reclamos, reparaciones, entrega de turno al relevo, etc.)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={posting || loading}
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddEntry}
                disabled={posting || !note.trim() || loading}
              >
                {posting ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-journal-plus me-2"></i>
                    Agregar a Bitácora
                  </>
                )}
              </Button>
            </div>
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
            <div className="mt-4">
              <h5 className="mb-3">Historial de Novedades</h5>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Fecha/Hora</th>
                    <th>Categoría</th>
                    <th>Detalle</th>
                    <th>Responsable</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">
                        No hay entradas en la bitácora
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => (
                      <tr key={entry.id || entry.entryId}>
                        <td className="text-nowrap">{formatDateTime(entry.timestamp || entry.createdAt)}</td>
                        <td>
                          <span className="badge bg-secondary">
                            {entry.category || 'General'}
                          </span>
                        </td>
                        <td>{entry.note || entry.description || 'N/A'}</td>
                        <td>{entry.user || entry.createdBy || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ConciergeLogbook;
