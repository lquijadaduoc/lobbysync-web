/**
 * Utilidad para medir performance de APIs
 * Registra tiempos de request, response y renderizado
 */

const timers = new Map();

export function startTimer(label) {
  timers.set(label, performance.now());
}

export function endTimer(label, logToConsole = true) {
  const start = timers.get(label);
  if (!start) {
    console.warn(`⏱️  Timer "${label}" no iniciado`);
    return 0;
  }

  const duration = performance.now() - start;
  timers.delete(label);

  if (logToConsole) {
    if (duration < 100) {
      console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`);
    } else if (duration < 500) {
      console.warn(`⏱️  ${label}: ${duration.toFixed(2)}ms`);
    } else {
      console.error(`🐢 ${label}: ${duration.toFixed(2)}ms (LENTO)`);
    }
  }

  return duration;
}

export function measureAsync(label, asyncFn) {
  return async function measureWrapper(...args) {
    startTimer(label);
    try {
      const result = await asyncFn(...args);
      endTimer(label);
      return result;
    } catch (error) {
      endTimer(`${label} (ERROR)`);
      throw error;
    }
  };
}

/**
 * Hook para medir tiempo de renderizado en React
 */
export function useRenderTimer(componentName) {
  const startRef = React.useRef(performance.now());

  React.useEffect(() => {
    const renderTime = performance.now() - startRef.current;
    console.log(`🎨 ${componentName} render: ${renderTime.toFixed(2)}ms`);
  });
}
