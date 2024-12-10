import { useState, useEffect } from 'react';
import type { PyodideInterface } from 'pyodide';
import { initializePython } from '../utils/pythonInitializer';
import { initializeSignalProcessing, processSignal } from '../utils/signalProcessing';
import { Controls } from './Controls';
import { WaveformPlot } from './WaveformPlot';
import { Constellation } from './Constellation';
import { Box, CircularProgress, Alert } from '@mui/material';
import { Spectrogram } from './Spectrogram';

export const ModulationDemo = () => {
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [message, setMessage] = useState('');
  const [noiseLevel, setNoiseLevel] = useState(0.1);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waveformData, setWaveformData] = useState<any>(null);
  const [constellationData, setConstellationData] = useState<any>(null);

  useEffect(() => {
    const setup = async () => {
      try {
        const pyodideInstance = await initializePython();
        await initializeSignalProcessing(pyodideInstance);
        setPyodide(pyodideInstance);
      } catch (err) {
        setError('Failed to initialize Python environment');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    setup();
  }, []);

  const handleModulate = async () => {
    if (!pyodide || !message) return;

    setProcessing(true);
    setError(null);

    try {
      const result = await processSignal(pyodide, message, noiseLevel);
      
      setWaveformData({
        real: result.waveform.real,
        imag: result.waveform.imag
      });
      
      setConstellationData({
        real: result.constellation.real,
        imag: result.constellation.imag
      });
    } catch (err) {
      setError('Error processing signal');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Controls 
        message={message}
        noiseLevel={noiseLevel}
        onMessageChange={setMessage}
        onNoiseLevelChange={setNoiseLevel}
        onModulate={handleModulate}
        disabled={processing}
      />

      {processing && (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress size={24} />
        </Box>
      )}

      {waveformData && (
        <>
          <WaveformPlot data={waveformData} />
          <Constellation data={constellationData} />
          <Spectrogram data={waveformData} />
        </>
      )}
    </Box>
  );
};