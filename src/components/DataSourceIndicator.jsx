import { useState, useEffect } from 'react';
import { Badge } from 'react-bootstrap';
import './DataSourceIndicator.css';

// Función para verificar modo mock
const isMockMode = () => {
  return window.__LOBBYSYNC_MOCK_MODE__ === true;
};

/**
 * Indicador visual del origen de datos
 * Muestra si se están usando datos REALES del backend o datos MOCK de fallback
 */
const DataSourceIndicator = () => {
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [lastRealDataTime, setLastRealDataTime] = useState(null);

  useEffect(() => {
    // Verificar estado inicial
    setIsUsingMock(isMockMode());

    // Obtener última vez que se guardaron datos reales
    const lastCache = localStorage.getItem('last_real_data_cache_time');
    if (lastCache) {
      setLastRealDataTime(new Date(lastCache));
    }

    // Verificar periódicamente el estado
    const interval = setInterval(() => {
      const mockStatus = isMockMode();
      setIsUsingMock(mockStatus);

      // Si acabamos de cambiar a mock, actualizar el tiempo de caché
      if (mockStatus) {
        const cached = localStorage.getItem('last_real_data_cache_time');
        if (cached) {
          setLastRealDataTime(new Date(cached));
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatCacheTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // segundos

    if (diff < 60) return `hace ${diff}s`;
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    return date.toLocaleString('es-CL');
  };

  return (
    <div className="data-source-indicator">
      {isUsingMock ? (
        <Badge bg="warning" className="data-source-badge animate-pulse">
          <i className="bi bi-exclamation-triangle-fill me-1"></i>
          <strong>MODO OFFLINE</strong> - Datos Mock
          {lastRealDataTime && (
            <small className="d-block mt-1" style={{ fontSize: '0.7em', opacity: 0.9 }}>
              Últimos datos reales: {formatCacheTime(lastRealDataTime)}
            </small>
          )}
        </Badge>
      ) : (
        <Badge bg="success" className="data-source-badge">
          <i className="bi bi-cloud-check-fill me-1"></i>
          <strong>DATOS REALES</strong> - Backend Conectado
        </Badge>
      )}
    </div>
  );
};

export default DataSourceIndicator;
