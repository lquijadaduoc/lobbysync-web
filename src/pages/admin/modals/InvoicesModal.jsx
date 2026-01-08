import { useState, useEffect } from 'react';
import { Modal, Button, Badge, Spinner, Alert, Form, Row, Col, Table } from 'react-bootstrap';

const InvoicesModal = ({ show, unit, onHide }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simulamos la carga de facturas
  useEffect(() => {
    if (show && unit) {
      setLoading(true);
      // Simulamos API call
      setTimeout(() => {
        const mockInvoices = [
          {
            id: 1,
            period: 'Diciembre 2024',
            amount: 150000,
            dueDate: '2024-12-31',
            paidDate: null,
            status: 'Pending',
            concept: 'Cuota condominio',
          },
          {
            id: 2,
            period: 'Noviembre 2024',
            amount: 150000,
            dueDate: '2024-11-30',
            paidDate: '2024-12-05',
            status: 'Paid',
            concept: 'Cuota condominio',
          },
          {
            id: 3,
            period: 'Octubre 2024',
            amount: 150000,
            dueDate: '2024-10-31',
            paidDate: '2024-11-02',
            status: 'Paid',
            concept: 'Cuota condominio',
          },
          {
            id: 4,
            period: 'Septiembre 2024',
            amount: 150000,
            dueDate: '2024-09-30',
            paidDate: null,
            status: 'Overdue',
            concept: 'Cuota condominio',
          },
          {
            id: 5,
            period: 'Servicio Especial',
            amount: 50000,
            dueDate: '2024-12-15',
            paidDate: null,
            status: 'Pending',
            concept: 'Reparación de ascensor',
          },
        ];
        setInvoices(mockInvoices);
        setLoading(false);
      }, 500);
    }
  }, [show, unit]);

  if (!unit) return null;

  const getStatusBadge = (status) => {
    const variants = {
      Paid: 'success',
      Pending: 'warning',
      Overdue: 'danger',
      Cancelled: 'secondary',
    };
    return variants[status] || 'secondary';
  };

  const totalPending = invoices
    .filter((inv) => inv.status !== 'Paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>💰 Facturas y Pagos - Depto {unit.number || 'N/A'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Resumen financiero */}
        <Row className="g-3 mb-4">
          <Col md={4}>
            <div className="p-3 bg-light rounded text-center">
              <div className="text-muted small fw-bold">Total Pagado (último mes)</div>
              <div className="fs-5 fw-bold text-success">$150.000</div>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-3 bg-light rounded text-center">
              <div className="text-muted small fw-bold">Pendiente de Pago</div>
              <div className="fs-5 fw-bold text-warning">${totalPending.toLocaleString()}</div>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-3 bg-light rounded text-center">
              <div className="text-muted small fw-bold">Total Deuda</div>
              <div className="fs-5 fw-bold text-danger">$200.000</div>
            </div>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" className="mb-2" />
            <div className="text-muted">Cargando facturas...</div>
          </div>
        ) : invoices.length === 0 ? (
          <Alert variant="info" className="mb-0">
            No hay facturas registradas para este departamento
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table hover bordered className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Período</th>
                  <th>Concepto</th>
                  <th className="text-end">Monto</th>
                  <th>Vencimiento</th>
                  <th>Pagado</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="align-middle">
                    <td className="fw-500">{invoice.period}</td>
                    <td className="text-muted small">{invoice.concept}</td>
                    <td className="text-end fw-bold">${invoice.amount.toLocaleString()}</td>
                    <td className="text-muted small">{invoice.dueDate}</td>
                    <td className="text-muted small">
                      {invoice.paidDate ? (
                        <span className="text-success">✓ {invoice.paidDate}</span>
                      ) : (
                        <span className="text-danger">-</span>
                      )}
                    </td>
                    <td>
                      <Badge bg={getStatusBadge(invoice.status)}>{invoice.status}</Badge>
                    </td>
                    <td className="text-center">
                      {invoice.status !== 'Paid' && (
                        <Button variant="outline-success" size="sm" title="Registrar pago">
                          💳 Pagar
                        </Button>
                      )}
                      {invoice.status === 'Paid' && (
                        <Button variant="outline-secondary" size="sm" disabled title="Ya pagado">
                          📄 Ver
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {/* Formulario para registrar pago manual */}
        <div className="mt-4 pt-3 border-top">
          <h6 className="fw-bold mb-3">💳 Registrar Pago Manual</h6>
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Factura a Pagar</Form.Label>
                  <Form.Select>
                    {invoices
                      .filter((inv) => inv.status !== 'Paid')
                      .map((inv) => (
                        <option key={inv.id}>
                          {inv.period} - ${inv.amount.toLocaleString()}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Monto a Pagar</Form.Label>
                  <Form.Control type="number" placeholder="Ej: 150000" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Método de Pago</Form.Label>
                  <Form.Select>
                    <option>Transferencia Bancaria</option>
                    <option>Cheque</option>
                    <option>Efectivo</option>
                    <option>Tarjeta Débito</option>
                    <option>Tarjeta Crédito</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Fecha de Pago</Form.Label>
                  <Form.Control type="date" />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Referencia/Comprobante</Form.Label>
                  <Form.Control type="text" placeholder="Ej: Número de transferencia o cheque" />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button variant="success">Registrar Pago</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InvoicesModal;
