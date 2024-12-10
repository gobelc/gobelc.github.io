import { loadPyodide } from 'pyodide';

let pyodideInstance: any = null;

export async function initializePython() {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  const pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
    fullStdLib: false
  });
  
  await pyodide.loadPackage(['numpy', 'scipy']);
  
  // Initialize only the functions we need
  await pyodide.runPythonAsync(`
    from numpy import array, zeros, sin, cos, pi, sqrt, real, imag, power, sum, mean, abs
    from scipy.signal import resample_poly, convolve
  `);
  
  pyodideInstance = pyodide;
  return pyodide;
}