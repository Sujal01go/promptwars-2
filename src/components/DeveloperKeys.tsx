import React, { useState } from 'react';
import { Key, ShieldCheck, RefreshCw, X } from 'lucide-react';

interface DeveloperKeysProps {
  onClose: () => void;
}

export const DeveloperKeys: React.FC<DeveloperKeysProps> = ({ onClose }) => {
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('GREENPULSE_GEMINI_KEY') || '');
  const [mapsKey, setMapsKey] = useState(() => localStorage.getItem('GREENPULSE_MAPS_KEY') || '');
  const [isDemoMode, setIsDemoMode] = useState(() => localStorage.getItem('GREENPULSE_DEMO_MODE') !== 'false');

  const handleSave = () => {
    const isGeminiValid = !geminiKey || /^AIzaSy[A-Za-z0-9_-]{33}$/.test(geminiKey);
    const isMapsValid = !mapsKey || /^AIzaSy[A-Za-z0-9_-]{33}$/.test(mapsKey);

    if (!isGeminiValid || !isMapsValid) {
      const msg = `Warning: One or more of your API keys does not match the standard Google API key format (usually starting with 'AIzaSy' and exactly 39 characters). \n\nAre you sure you want to save anyway?`;
      if (!window.confirm(msg)) {
        return;
      }
    }

    localStorage.setItem('GREENPULSE_GEMINI_KEY', geminiKey.trim());
    localStorage.setItem('GREENPULSE_MAPS_KEY', mapsKey.trim());
    
    // If keys are provided, we can disable demo mode, otherwise enforce demo mode
    const needsDemo = !geminiKey.trim() && !mapsKey.trim();
    const finalDemo = needsDemo ? true : isDemoMode;
    localStorage.setItem('GREENPULSE_DEMO_MODE', String(finalDemo));
    setIsDemoMode(finalDemo);

    alert('Settings saved successfully! The page will reload to apply changes.');
    window.location.reload();
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to reset all keys to default demo settings?')) {
      localStorage.removeItem('GREENPULSE_GEMINI_KEY');
      localStorage.removeItem('GREENPULSE_MAPS_KEY');
      localStorage.setItem('GREENPULSE_DEMO_MODE', 'true');
      setGeminiKey('');
      setMapsKey('');
      setIsDemoMode(true);
      window.location.reload();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Key size={22} className="text-gradient" />
            <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-heading)' }}>API Configuration</h2>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="alert-info-banner" style={{ marginBottom: '24px' }}>
          <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>All keys are saved locally in your browser's <code>localStorage</code> and are never transmitted to external servers.</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className="slider-label" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span>Google Gemini API Key</span>
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'var(--accent-cyan)', fontSize: '11px', textDecoration: 'underline' }}
              >
                Get Key
              </a>
            </label>
            <input 
              type="password" 
              className="form-group-input" 
              placeholder="AIzaSy..." 
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              style={{ borderColor: geminiKey && !/^AIzaSy[A-Za-z0-9_-]{33}$/.test(geminiKey) ? '#fbbf24' : undefined }}
            />
            {geminiKey && !/^AIzaSy[A-Za-z0-9_-]{33}$/.test(geminiKey) && (
              <span style={{ fontSize: '11px', color: '#fbbf24' }}>
                ⚠️ Warning: Format does not match standard 39-character 'AIzaSy...' key.
              </span>
            )}
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Powers the real-time AI Sustainability Coach chatbot and multimodal photo scanning.
            </span>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            <label className="slider-label" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span>Google Maps API Key</span>
              <a 
                href="https://console.cloud.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'var(--accent-cyan)', fontSize: '11px', textDecoration: 'underline' }}
              >
                Get Key
              </a>
            </label>
            <input 
              type="password" 
              className="form-group-input" 
              placeholder="AIzaSy..." 
              value={mapsKey}
              onChange={(e) => setMapsKey(e.target.value)}
              style={{ borderColor: mapsKey && !/^AIzaSy[A-Za-z0-9_-]{33}$/.test(mapsKey) ? '#fbbf24' : undefined }}
            />
            {mapsKey && !/^AIzaSy[A-Za-z0-9_-]{33}$/.test(mapsKey) && (
              <span style={{ fontSize: '11px', color: '#fbbf24' }}>
                ⚠️ Warning: Format does not match standard 39-character 'AIzaSy...' key.
              </span>
            )}
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Powers real Directions routing, distances, map drawing, and place autocompletes.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
            <input 
              type="checkbox" 
              id="demoModeToggle" 
              checked={isDemoMode}
              disabled={!geminiKey && !mapsKey}
              onChange={(e) => setIsDemoMode(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="demoModeToggle" style={{ fontSize: '13px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: '600' }}>Enable Interactive Demo Fallback Mode</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {!geminiKey && !mapsKey 
                  ? "Enforced (Required since API keys are missing)" 
                  : "Check to simulate API operations even with keys configured"}
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button className="btn-primary" onClick={handleSave} style={{ flexGrow: 1, justifyContent: 'center' }}>
              Save Settings
            </button>
            <button className="btn-secondary" onClick={handleClear} title="Clear Keys">
              <RefreshCw size={14} />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
