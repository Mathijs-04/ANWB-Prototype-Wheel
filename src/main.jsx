import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import '@fontsource/nunito/900.css';
import './styles/base.css';
import './styles/home.css';
import './styles/activities.css';
import './styles/admin.css';
import App from './App';
import { DataProvider } from './data/store';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DataProvider>
      <App />
    </DataProvider>
  </StrictMode>,
);
