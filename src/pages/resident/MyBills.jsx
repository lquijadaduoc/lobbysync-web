import { useEffect, useState, useRef } from 'react';
import { Card, Table, Badge, Spinner, Alert, Button, Modal, Form } from 'react-bootstrap';
import { residentBills } from '../../api/residentService';

const MyBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [paying, setPaying] = useState(false);
  const mountTimeRef = useRef(performance.now());

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    const requestStart = performance.now();
    try {
      setLoading(true);
      setError('');
      const { data } = await residentBills.list({ page: 0, size: 10 });
      const requestEnd = performance.now();
      console.log(`💰 Bills API response: ${(requestEnd - requestStart).toFixed(2)}ms`);
      
      const billList = Array.isArray(data) ? data : data?.content || data?.bills || [];
      setBills(billList);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al cargar facturas.';
      setError(msg);
      console.error('Error en residentBills.list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const renderTime = performance.now() - mountTimeRef.current;
    console.log(`🎨 MyBills component render: ${renderTime.toFixed(2)}ms`);
  });

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'paid' || statusLower === 'pagado')
      return <Badge bg="success">Pagado</Badge>;
    if (statusLower === 'pending' || statusLower === 'pendiente')
      return <Badge bg="warning" text="dark">Pendiente</Badge>;
    if (statusLower === 'overdue' || statusLower === 'vencido')
      return <Badge bg="danger">Vencido</Badge>;
    return <Badge bg="secondary">{status || 'N/A'}</Badge>;
  };

  const handlePayClick = (bill) => {
    setSelectedBill(bill);
    setShowPayModal(true);
  };

  const handlePaySubmit = async () => {
    if (!selectedBill) return;
    
    try {
      setPaying(true);
      const paymentData = {
        amount: selectedBill.amount,
        paymentMethod: paymentMethod,
        reference: `PAY-${Date.now()}`
      };
      
      await residentBills.pay(selectedBill.id, paymentData);
      
      console.log('✅ Pago exitoso');
      setShowPayModal(false);
      setPaymentMethod('transfer');
      await loadBills();
    } catch (err) {
      console.error('Error al procesar pago:', err);
      alert(err.response?.data?.message || 'Error al procesar el pago');
    } finally {
      setPaying(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="mb-3">Mis facturas</Card.Title>
        {error && (
          <Alert variant="danger" className="mb-3">
            <strong>Error:</strong> {error}
          </Alert>
        )}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <div className="text-muted">Cargando facturas...</div>
          </div>
        ) : (
          <Table hover responsive>
            <thead>
              <tr>
                <th>ID Factura</th>
                <th>Mes</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    No hay facturas disponibles
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id}>
                    <td className="fw-bold">{bill.id}</td>
                    <td>{bill.month || bill.billingPeriod || 'N/A'}</td>
                    <td>${bill.amount?.toLocaleString() || '0'}</td>
                    <td>{getStatusBadge(bill.status)}</td>
                    <td>
                      {bill.status?.toLowerCase() !== 'paid' && bill.status?.toLowerCase() !== 'pagado' ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handlePayClick(bill)}
                        >
                          Pagar
                        </Button>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </Card.Body>

      <Modal show={showPayModal} onHide={() => setShowPayModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Pagar factura</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBill && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Factura:</Form.Label>
                <div className="fw-bold">{selectedBill.id}</div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Monto:</Form.Label>
                <div className="fw-bold">${selectedBill.amount?.toLocaleString()}</div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Método de pago:</Form.Label>
                <Form.Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="transfer">Transferencia bancaria</option>
                  <option value="card">Tarjeta de crédito</option>
                  <option value="cash">Efectivo</option>
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPayModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handlePaySubmit}
            disabled={paying}
          >
            {paying ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Procesando...
              </>
            ) : (
              'Confirmar pago'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default MyBills;
