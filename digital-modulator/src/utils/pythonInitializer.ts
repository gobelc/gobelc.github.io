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
  
  await pyodide.loadPackage(['numpy', 'scipy']);  // Removed matplotlib
  
  pyodideInstance = pyodide;
  return pyodide;
}