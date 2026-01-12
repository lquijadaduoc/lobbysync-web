import { useEffect, useState } from 'react';
import { Card, Table, Form, InputGroup, Badge, Spinner, Alert, Accordion } from 'react-bootstrap';
import { unitsService, buildingsService, usersService } from '../../api/conciergeService';

const ResidentsViewer = () => {
  const [residents, setResidents] = useState([]);
  const [units, setUnits] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('all');

  useEffect(() => {
    loadResidentsData();
  }, []);

  const loadResidentsData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar datos reales del backend
      const [buildingsResponse, unitsResponse, usersResponse] = await Promise.all([
        buildingsService.list(),
        unitsService.list(),
        usersService.list()
      ]);
      
      console.log('🏢 Buildings response:', buildingsResponse);
      console.log('🏘️ Units response:', unitsResponse);
      console.log('👥 Users response:', usersResponse);
      
      const buildingsList = Array.isArray(buildingsResponse.data) ? buildingsResponse.data : 
                           Array.isArray(buildingsResponse) ? buildingsResponse : buildingsResponse.data?.content || [];
      const unitsList = Array.isArray(unitsResponse.data) ? unitsResponse.data : 
                       Array.isArray(unitsResponse) ? unitsResponse : unitsResponse.data?.content || [];
      const usersList = Array.isArray(usersResponse.data) ? usersResponse.data : 
                       Array.isArray(usersResponse) ? usersResponse : usersResponse.data?.content || [];
      
      console.log('✅ Buildings loaded:', buildingsList.length);
      console.log('✅ Units loaded:', unitsList.length);
      console.log('✅ Users loaded:', usersList.length);
      
      // Mapear unidades con información de residentes
      // Intentar obtener residentes de varias formas según la estructura del backend
      const unitsWithResidents = unitsList.map(unit => {
        let unitResidents = [];
        
        // Forma 1: Si la unidad tiene campo 'residents' directamente
        if (unit.residents && Array.isArray(unit.residents)) {
          unitResidents = unit.residents;
          console.log(`✅ Unit ${unit.number} tiene residents directos:`, unitResidents.length);
        }
        // Forma 2: Si la unidad tiene campo 'users' o 'residents' en otra estructura
        else if (unit.users && Array.isArray(unit.users)) {
          unitResidents = unit.users;
          console.log(`✅ Unit ${unit.number} tiene users:`, unitResidents.length);
        }
        // Forma 3: Si los usuarios están en el array y tienen unitId
        else if (usersList && usersList.length > 0) {
          unitResidents = usersList.filter(user => user.unitId === unit.id || user.unit?.id === unit.id);
          console.log(`✅ Unit ${unit.number} filtrada de usersList:`, unitResidents.length);
        }
        
        // Mapear correctamente los campos de residentes
        const mappedResidents = unitResidents.map(resident => ({
          id: resident.id || resident.userId,
          name: resident.name || `${resident.firstName || ''} ${resident.lastName || ''}`.trim(),
          rut: resident.rut || resident.cedula || 'N/A',
          email: resident.email || 'N/A',
          phone: resident.phone || resident.phoneNumber || 'N/A',
          role: resident.role || 'RESIDENT'
        }));
        
        return {
          id: unit.id,
          number: unit.number || unit.unitNumber || unit.unitId,
          buildingId: unit.buildingId || unit.building?.id,
          buildingName: buildingsList.find(b => b.id === (unit.buildingId || unit.building?.id))?.name || 'N/A',
          residents: mappedResidents,
          vehicles: (unit.vehicles || []).map(v => ({
            plate: v.plate,
            brand: v.brand,
            model: v.model,
            color: v.color || 'N/A'
          })),
          pets: (unit.pets || []).map(p => ({
            name: p.name,
            type: p.type,
            breed: p.breed || 'N/A',
            description: p.description
          }))
        };
      });
      
      setBuildings(buildingsList);
      setUnits(unitsWithResidents);
    } catch (err) {
      setError(err.message || 'Error al cargar datos');
      console.error('❌ Error cargando residentes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUnits = units.filter(unit => {
    const matchesSearch = searchTerm === '' || 
      String(unit.number).toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.residents.some(r => 
        (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.rut || '').includes(searchTerm)
      ) ||
      unit.vehicles.some(v => (v.plate || '').toLowerCase().includes(searchTerm.toLowerCase())) ||
      (unit.buildingName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBuilding = selectedBuilding === 'all' || 
      unit.buildingId === parseInt(selectedBuilding);
    
    return matchesSearch && matchesBuilding;
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold text-primary mb-0">Visualizador de Residentes</h3>
        <Badge bg="info" className="fs-6">Solo Lectura</Badge>
      </div>

      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Form>
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Buscar por nombre, RUT, unidad o patente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Form.Select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                style={{ maxWidth: '200px' }}
              >
                <option value="all">Todos los edificios</option>
                {buildings.map(building => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))}
              </Form.Select>
            </InputGroup>
          </Form>

          {error && (
            <Alert variant="danger">{error}</Alert>
          )}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <div className="text-muted">Cargando información...</div>
            </div>
          ) : (
            <Accordion>
              {filteredUnits.map((unit, index) => (
                <Accordion.Item eventKey={index.toString()} key={unit.id}>
                  <Accordion.Header>
                    <div className="d-flex justify-content-between w-100 pe-3">
                      <span>
                        <strong>{unit.buildingName}</strong> - Unidad {unit.number}
                      </span>
                      <span className="text-muted">
                        {unit.residents.length} residentes • {unit.vehicles.length} vehículos
                      </span>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body>
                    {unit.residents.length === 0 ? (
                      <Alert variant="secondary" className="mb-0">
                        <i className="bi bi-house-x me-2"></i>
                        Unidad desocupada
                      </Alert>
                    ) : (
                      <>
                        {/* Residentes */}
                        <div className="mb-3">
                          <h6 className="fw-bold text-primary mb-2">
                            <i className="bi bi-people-fill me-2"></i>
                            Residentes
                          </h6>
                          <Table size="sm" bordered>
                            <thead>
                              <tr>
                                <th>Nombre</th>
                                <th>RUT</th>
                                <th>Teléfono</th>
                                <th>Email</th>
                                <th>Tipo</th>
                              </tr>
                            </thead>
                            <tbody>
                              {unit.residents.map((resident, idx) => (
                                <tr key={idx}>
                                  <td>{resident.name}</td>
                                  <td>{resident.rut}</td>
                                  <td>{resident.phone}</td>
                                  <td>{resident.email}</td>
                                  <td>
                                    <Badge bg={resident.type === 'Propietario' || resident.type === 'Propietaria' ? 'primary' : 'secondary'}>
                                      {resident.type}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>

                        {/* Vehículos */}
                        {unit.vehicles.length > 0 && (
                          <div className="mb-3">
                            <h6 className="fw-bold text-success mb-2">
                              <i className="bi bi-car-front-fill me-2"></i>
                              Vehículos Registrados
                            </h6>
                            <Table size="sm" bordered>
                              <thead>
                                <tr>
                                  <th>Patente</th>
                                  <th>Marca</th>
                                  <th>Modelo</th>
                                  <th>Color</th>
                                </tr>
                              </thead>
                              <tbody>
                                {unit.vehicles.map((vehicle, idx) => (
                                  <tr key={idx}>
                                    <td><strong>{vehicle.plate}</strong></td>
                                    <td>{vehicle.brand}</td>
                                    <td>{vehicle.model}</td>
                                    <td>{vehicle.color}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        )}

                        {/* Mascotas */}
                        {unit.pets.length > 0 && (
                          <div>
                            <h6 className="fw-bold text-warning mb-2">
                              <i className="bi bi-hearts me-2"></i>
                              Mascotas
                            </h6>
                            <Table size="sm" bordered>
                              <thead>
                                <tr>
                                  <th>Nombre</th>
                                  <th>Tipo</th>
                                  <th>Raza</th>
                                </tr>
                              </thead>
                              <tbody>
                                {unit.pets.map((pet, idx) => (
                                  <tr key={idx}>
                                    <td>{pet.name}</td>
                                    <td>{pet.type}</td>
                                    <td>{pet.breed}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        )}
                      </>
                    )}
                  </Accordion.Body>
                </Accordion.Item>
              ))}

              {filteredUnits.length === 0 && (
                <Alert variant="info" className="mb-0">
                  No se encontraron resultados para la búsqueda
                </Alert>
              )}
            </Accordion>
          )}
        </Card.Body>
        <Card.Footer className="bg-light text-muted small">
          <i className="bi bi-info-circle me-2"></i>
          Información de seguridad interna. No compartir fuera del recinto.
        </Card.Footer>
      </Card>
    </div>
  );
};

export default ResidentsViewer;
