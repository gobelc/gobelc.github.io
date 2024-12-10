import { PyodideInterface } from 'pyodide';

export async function initializeSignalProcessing(pyodide: PyodideInterface) {
  // Load your existing Python signal processing code
  await pyodide.runPythonAsync(`
    import numpy as np
    import scipy.signal as sig

    def str2binary(msg_str):
        return bin(int.from_bytes(msg_str.encode(), 'big'))

    def bits2symbols_qpsk(bit0,bit1):
        if bit0=='0':
            if bit1=='0':
                symbol = -1-1j
            else:
                symbol = 1-1j
        else:
            if bit1=='0':
                symbol = 1+1j
            else:
                symbol = -1+1j
        return symbol / np.sqrt(2)

    def rrcosfilter(N, alpha, Ts, Fs):
        T_delta = 1/float(Fs)
        time_idx = ((np.arange(N)-N/2))*T_delta
        sample_num = np.arange(N)
        h_rrc = np.zeros(N, dtype=float)

        for x in sample_num:
            t = (x-N/2)*T_delta
            if t == 0.0:
                h_rrc[x] = 1.0 - alpha + (4*alpha/np.pi)
            elif alpha != 0 and t == Ts/(4*alpha):
                h_rrc[x] = (alpha/np.sqrt(2))*(((1+2/np.pi)* \
                (np.sin(np.pi/(4*alpha)))) + ((1-2/np.pi)*(np.cos(np.pi/(4*alpha)))))
            elif alpha != 0 and t == -Ts/(4*alpha):
                h_rrc[x] = (alpha/np.sqrt(2))*(((1+2/np.pi)* \
                        (np.sin(np.pi/(4*alpha)))) + ((1-2/np.pi)*(np.cos(np.pi/(4*alpha)))))
            else:
                h_rrc[x] = (np.sin(np.pi*t*(1-alpha)/Ts) +  \
                        4*alpha*(t/Ts)*np.cos(np.pi*t*(1+alpha)/Ts))/ \
                        (np.pi*t*(1-(4*alpha*t/Ts)*(4*alpha*t/Ts))/Ts)

        return time_idx, h_rrc/np.sum(np.power(h_rrc,2))

    def symbols2wave(bin_msg, len_sym_srrc=11, sps=10, rate=9600, samp_rate=48000):
        symbols = []
        t_rrc, rrc = rrcosfilter(int(len_sym_srrc * samp_rate / rate), alpha=.25, Ts=1/rate, Fs=samp_rate)
        interp = sps
        
        for i in range(0, len(bin_msg)-1, 2):
            symbols.append(bits2symbols_qpsk(bin_msg[i], bin_msg[i+1]))
            
        symbols_upsampled = sig.resample_poly(symbols, interp, 1)
        waveform_i = np.convolve(np.real(symbols_upsampled), rrc, 'same')
        waveform_q = np.convolve(np.imag(symbols_upsampled), rrc, 'same')
        
        return {
            'waveform': waveform_i + 1j*waveform_q,
            'symbols': symbols,
            'rrc': rrc.tolist()
        }
  `);
}

export async function processSignal(pyodide: PyodideInterface, message: string, noiseLevel: number) {
  try {
    const result = await pyodide.runPythonAsync(`
      import json
      from numpy.fft import fft
      from numpy import hanning
      
      def process_message(msg, noise_voltage):
        try:
          print(f"Python received message: {msg}")
          
          binary = str2binary(msg)[2:]
          print(f"Binary string: {binary}")
          
          if len(binary) % 2 != 0:
              binary = '0' + binary
              
          result = symbols2wave(binary)
          print("Symbols generated successfully")
          
          waveform = result['waveform']
          symbols = result['symbols']
          rrc = result['rrc']
          
          # Add noise with amplitude between 0 and 1 volt
          noise = noise_voltage * (np.random.normal(0, 1, len(waveform)) + 1j * np.random.normal(0, 1, len(waveform)))
          noisy_waveform = waveform + noise
          
          # Add same noise level to constellation
          symbol_noise = noise_voltage * (np.random.normal(0, 1, len(symbols)) + 1j * np.random.normal(0, 1, len(symbols)))
          noisy_symbols = np.array(symbols) + symbol_noise
          
          # Calculate spectrogram
          nfft = 256
          noverlap = nfft // 2
          window = hanning(nfft)
          
          # Prepare signal
          signal = waveform
          nseg = (len(signal) - noverlap) // (nfft - noverlap)
          
          # Calculate spectrogram
          spect = []
          for i in range(nseg):
              start = i * (nfft - noverlap)
              segment = signal[start:start + nfft]
              windowed = segment * window
              spectrum = fft(windowed)
              power = 20 * np.log10(np.abs(spectrum[:nfft//2]))
              spect.append(power.tolist())
          
          result_dict = {
            'waveform': {
              'real': np.real(noisy_waveform).tolist(),
              'imag': np.imag(noisy_waveform).tolist()
            },
            'constellation': {
              'real': np.real(noisy_symbols).tolist(),
              'imag': np.imag(noisy_symbols).tolist()
            },
            'spectrogram': {
              'data': spect,
              'freqs': np.linspace(0, 0.5, nfft//2).tolist()
            },
            'rrc': rrc
          }
          
          print(f"Noise voltage: {noise_voltage} V")
          return json.dumps(result_dict)
        except Exception as e:
          print(f"Python error: {str(e)}")
          raise

      process_message("${message}", ${noiseLevel})
    `);
    
    console.log('Received result:', result);
    return JSON.parse(result);
  } catch (err) {
    console.error('Signal processing error:', err);
    throw err;
  }
}