import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { LanguageProvider } from './LanguageContext';
import Home from './pages/Home';
import Laboratory from './pages/Laboratory';
import Earn from './pages/Earn';
import LobbyRoom from './pages/LobbyRoom';
import HistoryPage from './pages/HistoryPage';
import { EnhancedFxProvider } from './context/EnhancedFxContext';
import NavBar from './components/NavBar';
import AppBar from './components/AppBar';

// Determine manifest URL for TON Connect. In production it should be hosted publicly.
const manifestUrl = import.meta.env.VITE_TONCONNECT_MANIFEST || '/tonconnect-manifest.json';
const twaReturnUrl = import.meta.env.VITE_TWA_RETURN_URL || (import.meta.env.VITE_BOT_NAME ? `https://t.me/${import.meta.env.VITE_BOT_NAME}` : undefined);

declare global {
  interface Window {
    Telegram?: any;
  }
}

export default function App() {
  const navigate = useNavigate();
  // Prepare Telegram Mini App on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  // Handle invite deep links via Telegram start_param or URL query
  useEffect(() => {
    try {
      const startParam = (window as any).Telegram?.WebApp?.initDataUnsafe?.start_param as string | undefined;
      if (startParam && startParam.startsWith('lobby_')) {
        const payload = startParam.replace('lobby_', '');
        const [id, pwd] = payload.split('-');
        const query = pwd ? `?pwd=${encodeURIComponent(pwd)}` : '';
        navigate(`/lobby/${id}${query}`);
        return;
      }
      if (startParam && startParam.startsWith('invite_')) {
        const token = startParam.replace('invite_', '');
        const backend = (import.meta as any).env.VITE_BACKEND_URL || '';
        fetch(`${backend.replace(/\/$/, '')}/api/invites/${encodeURIComponent(token)}`)
          .then((r) => r.json())
          .then((j) => { if (j?.lobbyId) navigate(`/lobby/${j.lobbyId}`); });
        return;
      }
    } catch {}
    const params = new URLSearchParams(window.location.search);
    const lobbyId = params.get('lobbyId');
    const pwd = params.get('pwd');
    if (lobbyId) navigate(`/lobby/${lobbyId}${pwd ? `?pwd=${encodeURIComponent(pwd)}` : ''}`);
    const invite = params.get('invite');
    if (invite) {
      const backend = (import.meta as any).env.VITE_BACKEND_URL || '';
      fetch(`${backend.replace(/\/$/, '')}/api/invites/${encodeURIComponent(invite)}`)
        .then((r) => r.json())
        .then((j) => { if (j?.lobbyId) navigate(`/lobby/${j.lobbyId}`); });
    }
  }, [navigate]);

  return (
    <LanguageProvider>
      <TonConnectUIProvider manifestUrl={manifestUrl} actionsConfiguration={twaReturnUrl ? { twaReturnUrl } : undefined}>
        {/* EnhancedFxProvider provides a toggleable state for heavy visual effects */}
        <EnhancedFxProvider>
          <AppBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/laboratory" element={<Laboratory />} />
            <Route path="/earn" element={<Earn />} />
            <Route path="/lobby/:id" element={<LobbyRoom />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
          <NavBar />
        </EnhancedFxProvider>
      </TonConnectUIProvider>
    </LanguageProvider>
  );
}
