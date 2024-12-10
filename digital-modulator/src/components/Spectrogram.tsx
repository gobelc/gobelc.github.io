import Plot from 'react-plotly.js';

interface SpectrogramProps {
  data: {
    data: number[][];
    freqs: number[];
  };
}

export function Spectrogram({ data }: SpectrogramProps) {
  const trace = {
    z: data.data,
    type: 'heatmap',
    colorscale: 'Viridis',
    zmin: -60,  // dB range
    zmax: 0
  };

  const layout = {
    title: 'Signal Spectrogram',
    xaxis: { title: 'Time (samples)' },
    yaxis: { 
      title: 'Frequency (normalized)',
      ticktext: data.freqs.map(f => f.toFixed(2)),
      tickvals: data.freqs
    },
    width: 500,
    height: 300
  };

  return <Plot data={[trace]} layout={layout} />;
} 