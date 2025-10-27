import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import Home from './pages/Home';
import Laboratory from './pages/Laboratory';
import Earn from './pages/Earn';
import NavBar from './components/NavBar';

// Determine manifest URL for TON Connect. In production it should be hosted publicly.
const manifestUrl = import.meta.env.VITE_TONCONNECT_MANIFEST || '/tonconnect-manifest.json';

declare global {
  interface Window {
    Telegram?: any;
  }
}

export default function App() {
  // Prepare Telegram Mini App on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/laboratory" element={<Laboratory />} />
        <Route path="/earn" element={<Earn />} />
      </Routes>
      <NavBar />
    </TonConnectUIProvider>
  );
}