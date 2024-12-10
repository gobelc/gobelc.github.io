import React from 'react';
import Plot from 'react-plotly.js';

interface ConstellationProps {
  data: {
    real: number[];
    imag: number[];
  };
}

export function Constellation({ data }: ConstellationProps) {
  const trace = {
    x: data.real,
    y: data.imag,
    mode: 'markers',
    type: 'scatter',
    marker: {
      size: 10,
      opacity: 0.5,
      color: 'blue'
    }
  };

  const layout = {
    title: 'Constellation Diagram',
    xaxis: { title: 'In-Phase' },
    yaxis: { title: 'Quadrature' },
    width: 500,
    height: 500
  };

  return <Plot data={[trace]} layout={layout} />;
}