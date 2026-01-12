import { useState, useEffect } from 'react';
import { Card, Alert, Spinner, Row, Col, Button, Table, Badge, Modal, Form } from 'react-bootstrap';
import { residentsService } from '../../api/residentService';
import { useAuth } from '../../auth/AuthProvider';
import axios from 'axios';

const ResidentFinances = () => {
  const { user } = useAuth();
  const [currentDues, setCurrentDues] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'TRANSFERENCIA',
    transactionDate: '',
    notes: ''
  });
  const [proofFile, setProofFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      setError('');

      // Nota: Se requiere unitId del usuario autenticado
      const unitId = user?.unitId || user?.unit?.id;
      
      if (!unitId) {
        setError('No se pudo obtener la unidad del usuario. Por favor contacte al administrador.');
        setLoading(false);
        return;
      }

      // Cargar deuda actual y historial de pagos usando endpoints reales
      const [duesResponse, historyResponse] = await Promise.all([
        residentsService.getCurrentDues(unitId).catch(err => {
          console.log('Error obteniendo deuda:', err);
          return { data: { totalDebt: 0, unpaidBills: [] } };
        }),
        residentsService.getPaymentHistory(unitId, new Date().getFullYear()).catch(err => {
          console.log('Error obteniendo historial:', err);
          return { data: [] };
        })
      ]);

      setCurrentDues(duesResponse.data);
      const history = Array.isArray(historyResponse.data) ? historyResponse.data : 
                     historyResponse.data?.content || [];
      setPaymentHistory(history);
    } catch (err) {
      setError(err.message || 'Error al cargar finanzas');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadDuesPDF = async (billId) => {
    try {
      if (!billId) {
        setError('No hay boleta seleccionada para descargar');
        return;
      }
      const response = await residentsService.downloadDuesPDF(billId);
      // Crear blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Gasto-Com\u00fan-${billId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (err) {
      setError('Error descargando PDF. Funcionalidad a\u00fan no disponible en el backend.');
      console.error('Error:', err);
    }
  };

  const openPaymentModal = () => {
    setPaymentData({
      amount: currentDues?.totalDebt || '',
      paymentMethod: 'TRANSFERENCIA',
      transactionDate: new Date().toISOString().split('T')[0],
      notes: '',
      billId: currentDues?.unpaidBills?.[0]?.id || null
    });
    setProofFile(null);
    setShowPaymentModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        setError('El archivo no debe superar 5MB');
        return;
      }
      setProofFile(file);
    }
  };

  const handleSubmitPayment = async () => {
    try {
      setSubmitting(true);
      setError('');

      if (!paymentData.amount || !paymentData.transactionDate || !paymentData.billId) {
        setError('Por favor completa todos los campos requeridos');
        return;
      }

      // Primero subir el archivo si existe
      let proofFilePath = null;
      if (proofFile) {
        const formData = new FormData();
        formData.append('file', proofFile);
        
        try {
          const uploadResp = await axios.post('/api/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          proofFilePath = uploadResp.data.filepath;
        } catch (uploadErr) {
          console.error('Error subiendo archivo:', uploadErr);
          setError('Error al subir el comprobante de pago');
          return;
        }
      }

      // Registrar el pago usando el endpoint correcto
      await residentsService.reportPayment({
        billId: paymentData.billId,
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        transactionDate: paymentData.transactionDate,
        notes: paymentData.notes,
        proofFilePath: proofFilePath
      });

      setShowPaymentModal(false);
      loadFinancialData();
      alert('✅ Pago registrado exitosamente.');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reportar pago');
      console.error('Error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando finanzas...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4">💰 Mis Finanzas</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Sección: Deuda Actual */}
      {currentDues && (
        <Row className="mb-4">
          <Col lg={6}>
            <Card className="shadow-sm border-warning">
              <Card.Body>
                <Card.Title className="text-warning">Gasto Común Actual</Card.Title>
                <h2 className="text-warning">${currentDues.totalDebt?.toLocaleString() || 0}</h2>
                <p className="mb-1">
                  <strong>Boletas Impagas:</strong> {currentDues.unpaidBills?.length || 0}
                </p>
                <p className="mb-1">
                  <small className="text-muted">La deuda incluye todos los gastos comunes pendientes</small>
                </p>
                <div className="mt-3">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="me-2"
                    onClick={() => downloadDuesPDF(currentDues.unpaidBills?.[0]?.id)}
                    disabled={!currentDues.unpaidBills || currentDues.unpaidBills.length === 0}
                  >
                    📥 Descargar PDF
                  </Button>
                  <Button 
                    variant="success" 
                    size="sm"
                    onClick={openPaymentModal}
                    disabled={!currentDues.unpaidBills || currentDues.unpaidBills.length === 0}
                  >
                    💳 Reportar Pago
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Resumen Financiero</Card.Title>
                <Table size="sm" className="mb-0">
                  <tbody>
                    <tr>
                      <td><strong>Total Pagado YTD:</strong></td>
                      <td className="text-success">
                        ${paymentHistory
                          .filter(p => p.status === 'APPROVED')
                          .reduce((sum, p) => sum + (p.amount || 0), 0)
                          .toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Pendientes de Validar:</strong></td>
                      <td className="text-warning">
                        {paymentHistory.filter(p => p.status === 'PENDING').length}
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Meses Atrasados:</strong></td>
                      <td className="text-danger">
                        {paymentHistory.filter(p => p.status === 'OVERDUE').length}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Sección: Historial de Pagos */}
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="mb-3">Historial de Pagos (últimos 12 meses)</Card.Title>
          {paymentHistory.length === 0 ? (
            <Alert variant="info">No hay pagos registrados</Alert>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Período</th>
                  <th>Monto</th>
                  <th>Fecha Pago</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.period || 'N/A'}</td>
                    <td>${payment.amount?.toLocaleString() || 0}</td>
                    <td>{payment.paymentDate || '-'}</td>
                    <td>
                      <Badge 
                        bg={
                          payment.status === 'APPROVED' ? 'success' :
                          payment.status === 'PENDING' ? 'warning' :
                          'danger'
                        }
                      >
                        {payment.status === 'APPROVED' ? 'Aprobado' :
                         payment.status === 'PENDING' ? 'Pendiente' :
                         'Vencido'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Reportar Pago */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>💳 Reportar Pago de Gasto Común</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Monto Pagado *</Form.Label>
              <Form.Control
                type="number"
                placeholder="Ej: 125000"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Método de Pago *</Form.Label>
              <Form.Select
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
              >
                <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                <option value="DEPOSITO">Depósito en Efectivo</option>
                <option value="CHEQUE">Cheque</option>
                <option value="TARJETA">Tarjeta de Crédito/Débito</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fecha de Transacción *</Form.Label>
              <Form.Control
                type="date"
                value={paymentData.transactionDate}
                onChange={(e) => setPaymentData({ ...paymentData, transactionDate: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Comprobante de Pago (Opcional)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
              <Form.Text className="text-muted">
                Sube una foto o PDF del comprobante (máx. 5MB)
              </Form.Text>
              {proofFile && (
                <div className="mt-2 text-success">
                  ✅ Archivo seleccionado: {proofFile.name}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notas (Opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Ej: Pago correspondiente a Enero 2026"
                value={paymentData.notes}
                onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
              />
            </Form.Group>
          </Form>

          {error && <Alert variant="danger" className="mt-2">{error}</Alert>}

          <Alert variant="info" className="mt-3">
            <small>
              ℹ️ Tu pago será revisado por administración y notificarás cuando sea validado.
            </small>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleSubmitPayment} disabled={submitting}>
            {submitting ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Enviando...
              </>
            ) : (
              'Reportar Pago'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ResidentFinances;
