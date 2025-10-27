import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Global styles including tailwind
import './styles/index.css';

// Extend Chakra theme for glass effect if needed
const theme = extendTheme({
  colors: {
    ton: {
      primary: '#0098EA',
      accent: '#15A1FF',
      glow: '#63E2FF',
      surface: 'rgba(255,255,255,0.08)',
      text: 'rgba(255,255,255,0.92)',
      secondaryText: 'rgba(255,255,255,0.64)',
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        color: 'ton.text',
        minH: '100vh',
        margin: 0,
        padding: 0,
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        _hover: { transform: 'scale(1.02)' },
        _active: { transform: 'scale(0.98)' },
        transition: 'all 0.2s ease',
      },
    },
    Card: {
      baseStyle: {
        borderRadius: 'lg',
        backdropFilter: 'blur(24px)',
        bg: 'ton.surface',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        overflow: 'hidden',
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);