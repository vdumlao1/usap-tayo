import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ProgressProvider } from './context/ProgressContext.jsx';
import { SpeechProvider } from './context/SpeechContext.jsx';
import { RecordingsProvider } from './context/RecordingsContext.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProgressProvider>
      <SpeechProvider>
        <RecordingsProvider>
          <App />
        </RecordingsProvider>
      </SpeechProvider>
    </ProgressProvider>
  </StrictMode>,
);
