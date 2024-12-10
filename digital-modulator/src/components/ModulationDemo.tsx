import React, { useState } from 'react';
import { Controls } from './Controls';
import { Constellation } from './Constellation';
import { Spectrogram } from './Spectrogram';
import { initializePython } from '../utils/pythonInitializer';
import { processSignal } from '../utils/signalProcessing';

export function ModulationDemo() {
  const [message, setMessage] = useState('test');
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [waveform, setWaveform] = useState(null);
  const [constellation, setConstellation] = useState(null);
  const [spectrogram, setSpectrogram] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleModulate = async () => {
    setProcessing(true);
    try {
      const pyodide = await initializePython();
      const result = await processSignal(pyodide, message, noiseLevel);
      setWaveform(result.waveform);
      setConstellation(result.constellation);
      setSpectrogram(result.spectrogram);
    } catch (error) {
      console.error('Modulation error:', error);
    }
    setProcessing(false);
  };

  return (
    <div>
      <Controls
        message={message}
        noiseLevel={noiseLevel}
        onMessageChange={setMessage}
        onNoiseLevelChange={setNoiseLevel}
        onModulate={handleModulate}
        disabled={processing}
      />
      {constellation && <Constellation data={constellation} />}
      {spectrogram && <Spectrogram data={spectrogram} />}
    </div>
  );
}