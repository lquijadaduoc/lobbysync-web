import { Card, Table, Badge } from 'react-bootstrap';

const ConciergePackages = () => (
  <Card className="shadow-sm">
    <Card.Body>
      <Card.Title className="mb-3">Recepción de paquetes</Card.Title>
      <Table hover responsive>
        <thead>
          <tr>
            <th>Paquete</th>
            <th>Departamento</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Amazon #9821</td>
            <td>402</td>
            <td>
              <Badge bg="warning" text="dark">
                En espera
              </Badge>
            </td>
          </tr>
          <tr>
            <td>MercadoLibre #7733</td>
            <td>305</td>
            <td>
              <Badge bg="success">Entregado</Badge>
            </td>
          </tr>
        </tbody>
      </Table>
    </Card.Body>
  </Card>
);

export default ConciergePackages;
