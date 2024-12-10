import React from 'react';
import { Slider, TextField, Box, Button } from '@mui/material';

interface ControlsProps {
  message: string;
  noiseLevel: number;
  onMessageChange: (message: string) => void;
  onNoiseLevelChange: (level: number) => void;
  onModulate: () => void;
}

export function Controls({ message, noiseLevel, onMessageChange, onNoiseLevelChange, onModulate }: ControlsProps) {
  return (
    <Box sx={{ width: '100%', maxWidth: 500, p: 2 }}>
      <TextField
        fullWidth
        label="Message"
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Box sx={{ width: '100%', mb: 2 }}>
        <p>Noise Level: {noiseLevel.toFixed(2)}</p>
        <Slider
          value={noiseLevel}
          onChange={(_, value) => onNoiseLevelChange(value as number)}
          min={0}
          max={1}
          step={0.01}
          aria-label="Noise Level"
        />
      </Box>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={onModulate}
        fullWidth
      >
        Modulate
      </Button>
    </Box>
  );
}