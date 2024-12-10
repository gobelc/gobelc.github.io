import Plot from 'react-plotly.js';
import { Box } from '@mui/material';

interface WaveformPlotProps {
  data: {
    real: number[];
    imag: number[];
  } | null;
}

export const WaveformPlot = ({ data }: WaveformPlotProps) => {
  if (!data) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Plot
        data={[
          {
            y: data.real,
            type: 'scatter',
            mode: 'lines',
            name: 'I (Real)',
            line: { color: 'blue' }
          },
          {
            y: data.imag,
            type: 'scatter',
            mode: 'lines',
            name: 'Q (Imaginary)',
            line: { color: 'red' }
          }
        ]}
        layout={{
          title: 'Modulated Waveform',
          width: 800,
          height: 400,
          yaxis: { title: 'Amplitude' },
          xaxis: { title: 'Sample' },
          showlegend: true,
          legend: {
            x: 1,
            xanchor: 'right',
            y: 1
          }
        }}
      />
    </Box>
  );
};