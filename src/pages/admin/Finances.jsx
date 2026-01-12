import { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, Row, Col, Spinner, Alert, Modal, InputGroup } from 'react-bootstrap';
import { adminFinances } from '../../api/adminService';
import { useAuth } from '../../auth/AuthProvider';
import axios from 'axios';

const AdminFinances = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [moroseUnits, setMoroseUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED, ALL
  const [searchTerm, setSearchTerm] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generateData, setGenerateData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    baseAmount: ''
  });

  useEffect(() => {
    loadFinancialData();
  }, [filter]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar pagos reportados por residentes usando el servicio
      const paymentsResp = await adminFinances.getPaymentReports(
        filter !== 'ALL' ? { status: filter } : {}
      ).catch(() => ({ data: [] }));

      // Cargar unidades morosas usando el servicio
      const moroseResp = await adminFinances.getMoroseUnits().catch(() => ({ data: [] }));

      setPayments(Array.isArray(paymentsResp.data) ? paymentsResp.data : paymentsResp.data?.content || []);
      setMoroseUnits(Array.isArray(moroseResp.data) ? moroseResp.data : moroseResp.data?.content || []);

    } catch (err) {
      setError(err.message || 'Error al cargar datos financieros');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (paymentId, approved) => {
    try {
      await adminFinances.reviewPayment(paymentId, approved, user?.email || 'admin');

      alert(approved ? '✅ Pago aprobado' : '❌ Pago rechazado');
      loadFinancialData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al revisar pago');
    }
  };

  const handleGenerateCharges = async () => {
    if (!generateData.baseAmount || generateData.baseAmount <= 0) {
      alert('Por favor ingrese un monto válido');
      return;
    }

    try {
      setGenerating(true);

      await adminFinances.generateMonthlyCharges(
        generateData.month,
        generateData.year,
        parseFloat(generateData.baseAmount)
      );

      alert('✅ Gastos comunes generados exitosamente');
      setShowGenerateModal(false);
      setGenerateData({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), baseAmount: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar cobros');
    } finally {
      setGenerating(false);
    }
  };

  const viewProof = (payment) => {
    setSelectedPayment(payment);
    setShowProofModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge bg="warning">⏳ Pendiente Revisión</Badge>;
      case 'APPROVED':
        return <Badge bg="success">✅ Aprobado</Badge>;
      case 'REJECTED':
        return <Badge bg="danger">❌ Rechazado</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const filteredPayments = payments.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      String(p.unitNumber || '').includes(term) ||
      String(p.amount || '').includes(term) ||
      (p.transactionDate || '').includes(term)
    );
  });

  const totalPending = payments.filter(p => p.status === 'PENDING').length;
  const totalApproved = payments.filter(p => p.status === 'APPROVED').length;
  const totalAmount = payments
    .filter(p => p.status === 'APPROVED')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold text-primary mb-0">💰 Gestión de Finanzas</h3>
        <Button variant="success" onClick={() => setShowGenerateModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>
          Generar Gasto Común
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Estadísticas */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="text-center border-warning">
            <Card.Body className="py-2">
              <h3 className="mb-0 text-warning">{totalPending}</h3>
              <small className="text-muted">Pagos Pendientes</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-success">
            <Card.Body className="py-2">
              <h3 className="mb-0 text-success">{totalApproved}</h3>
              <small className="text-muted">Pagos Aprobados</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-primary">
            <Card.Body className="py-2">
              <h3 className="mb-0 text-primary">${totalAmount.toLocaleString()}</h3>
              <small className="text-muted">Total Recaudado</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-danger">
            <Card.Body className="py-2">
              <h3 className="mb-0 text-danger">{moroseUnits.length}</h3>
              <small className="text-muted">Unidades Morosas</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de conciliación de pagos */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title className="mb-3">Conciliación de Pagos</Card.Title>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="PENDING">⏳ Pendientes de Revisión</option>
                <option value="APPROVED">✅ Aprobados</option>
                <option value="REJECTED">❌ Rechazados</option>
                <option value="ALL">📋 Todos</option>
              </Form.Select>
            </Col>
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar por unidad, monto o fecha..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Cargando pagos...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <Alert variant="info">No hay pagos para mostrar</Alert>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Unidad</th>
                  <th>Monto</th>
                  <th>Método</th>
                  <th>Estado</th>
                  <th>Comprobante</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="text-nowrap">
                      {payment.transactionDate ? new Date(payment.transactionDate).toLocaleDateString('es-CL') : 'N/A'}
                    </td>
                    <td><strong>Depto #{payment.unitNumber || payment.unit}</strong></td>
                    <td className="fw-bold text-success">${payment.amount?.toLocaleString() || 0}</td>
                    <td>
                      <Badge bg="secondary">{payment.paymentMethod || 'N/A'}</Badge>
                    </td>
                    <td>{getStatusBadge(payment.status)}</td>
                    <td>
                      {payment.proofFileUrl ? (
                        <Button variant="link" size="sm" onClick={() => viewProof(payment)}>
                          <i className="bi bi-file-earmark-image me-1"></i>Ver
                        </Button>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {payment.status === 'PENDING' && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            className="me-1"
                            onClick={() => handleApprovePayment(payment.id, true)}
                          >
                            <i className="bi bi-check-circle me-1"></i>Aprobar
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleApprovePayment(payment.id, false)}
                          >
                            <i className="bi bi-x-circle me-1"></i>Rechazar
                          </Button>
                        </>
                      )}
                      {payment.status === 'APPROVED' && (
                        <span className="text-success">
                          <i className="bi bi-check-circle-fill me-1"></i>Validado
                        </span>
                      )}
                      {payment.status === 'REJECTED' && (
                        <span className="text-danger">
                          <i className="bi bi-x-circle-fill me-1"></i>Rechazado
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Reporte de morosidad */}
      {moroseUnits.length > 0 && (
        <Card className="shadow-sm border-danger">
          <Card.Body>
            <Card.Title className="text-danger mb-3">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Reporte de Morosidad
            </Card.Title>
            <Table hover responsive size="sm">
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Residente</th>
                  <th>Meses Adeudados</th>
                  <th>Deuda Total</th>
                  <th>Último Pago</th>
                </tr>
              </thead>
              <tbody>
                {moroseUnits.map((unit) => (
                  <tr key={unit.id}>
                    <td><strong>Depto #{unit.number}</strong></td>
                    <td>{unit.ownerName || 'N/A'}</td>
                    <td>
                      <Badge bg="danger">{unit.monthsOverdue || 1} mes(es)</Badge>
                    </td>
                    <td className="fw-bold text-danger">${unit.totalDebt?.toLocaleString() || 0}</td>
                    <td className="text-muted">
                      {unit.lastPaymentDate ? new Date(unit.lastPaymentDate).toLocaleDateString('es-CL') : 'Nunca'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Modal de generación de gastos comunes */}
      <Modal show={showGenerateModal} onHide={() => setShowGenerateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Generar Gasto Común Mensual</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Mes</Form.Label>
                  <Form.Select
                    value={generateData.month}
                    onChange={(e) => setGenerateData({ ...generateData, month: parseInt(e.target.value) })}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>
                        {new Date(2026, m - 1).toLocaleDateString('es-CL', { month: 'long' })}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Año</Form.Label>
                  <Form.Control
                    type="number"
                    value={generateData.year}
                    onChange={(e) => setGenerateData({ ...generateData, year: parseInt(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Monto Base</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>$</InputGroup.Text>
                    <Form.Control
                      type="number"
                      placeholder="Ej: 125000"
                      value={generateData.baseAmount}
                      onChange={(e) => setGenerateData({ ...generateData, baseAmount: e.target.value })}
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Este monto se aplicará a todas las unidades. Puede ajustarse individualmente después.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Form>

          <Alert variant="info" className="mt-3">
            <small>
              ℹ️ Se generará un cargo para cada unidad ocupada. Los residentes recibirán una notificación.
            </small>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleGenerateCharges} disabled={generating}>
            {generating ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Generando...
              </>
            ) : (
              'Generar Cobros'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de visualización de comprobante */}
      <Modal show={showProofModal} onHide={() => setShowProofModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Comprobante de Pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <>
              <div className="mb-3">
                <strong>Unidad:</strong> Depto #{selectedPayment.unitNumber}<br />
                <strong>Monto:</strong> ${selectedPayment.amount?.toLocaleString()}<br />
                <strong>Fecha:</strong> {new Date(selectedPayment.transactionDate).toLocaleDateString('es-CL')}<br />
                <strong>Notas:</strong> {selectedPayment.notes || 'Sin notas'}
              </div>

              {selectedPayment.proofFileUrl ? (
                <div className="text-center">
                  <img 
                    src={selectedPayment.proofFileUrl} 
                    alt="Comprobante" 
                    className="img-fluid rounded border"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
              ) : (
                <Alert variant="secondary">No hay comprobante adjunto</Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProofModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminFinances;
