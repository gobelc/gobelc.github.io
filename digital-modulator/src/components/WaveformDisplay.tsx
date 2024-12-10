import Plot from 'react-plotly.js';

interface WaveformDisplayProps {
  data: {
    real: number[];
    imag: number[];
  };
}

export function WaveformDisplay({ data }: WaveformDisplayProps) {
  const trace1 = {
    y: data.real,
    name: 'Real',
    type: 'scatter',
    mode: 'lines',
    line: { color: 'blue' }
  };

  const trace2 = {
    y: data.imag,
    name: 'Imaginary',
    type: 'scatter',
    mode: 'lines',
    line: { color: 'red' }
  };

  const layout = {
    title: 'Signal Waveform',
    xaxis: { title: 'Sample' },
    yaxis: { title: 'Amplitude' },
    width: 500,
    height: 300
  };

  return <Plot data={[trace1, trace2]} layout={layout} />;
} 