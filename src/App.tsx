import { useState, useEffect } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { 
  Leaf, 
  LayoutDashboard, 
  Navigation, 
  Bot, 
  Compass, 
  BookOpen, 
  Key, 
  ShieldAlert
} from 'lucide-react';

// Components
import { Dashboard } from './components/Dashboard';
import type { CarbonLog } from './utils/carbonCalculator';
import { TransitCalculator } from './components/TransitCalculator';
import { AICoach } from './components/AICoach';
import { ActionHub } from './components/ActionHub';
import { LearnCenter } from './components/LearnCenter';
import { DeveloperKeys } from './components/DeveloperKeys';

const MAP_LIBRARIES: ("places" | "drawing" | "geometry" | "visualization")[] = ['places'];

// Pre-seeded logs for beautiful initial chart rendering
const PRESEEDED_LOGS: CarbonLog[] = [
  {
    id: 'seed-1',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'travel',
    description: 'Weekly travel commute in gasoline sedan',
    value: 45,
    unit: 'miles',
    emissions: 12.6 // 45 * 0.28
  },
  {
    id: 'seed-2',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'food',
    description: 'Omnivorous daily diet standard log',
    value: 7,
    unit: 'days',
    emissions: 17.5 // 7 * 2.5
  },
  {
    id: 'seed-3',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'energy',
    description: 'Household electricity grid usage meter',
    value: 62,
    unit: 'kWh',
    emissions: 26.04 // 62 * 0.42
  },
  {
    id: 'seed-4',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'waste',
    description: 'Standard household garbage bags sent to landfill',
    value: 3,
    unit: 'bags',
    emissions: 3.75 // 3 * 1.25
  },
  {
    id: 'seed-5',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'waste',
    description: 'Sorted plastic and cardboard recycling credits',
    value: 4,
    unit: 'bags',
    emissions: -1.8 // 4 * -0.45
  }
];

function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showDeveloperKeys, setShowDeveloperKeys] = useState<boolean>(false);

  // API credentials states initialized lazily from localStorage
  const [geminiApiKey] = useState<string>(() => localStorage.getItem('GREENPULSE_GEMINI_KEY') || '');
  const [mapsApiKey] = useState<string>(() => localStorage.getItem('GREENPULSE_MAPS_KEY') || '');
  const [isDemoMode] = useState<boolean>(() => localStorage.getItem('GREENPULSE_DEMO_MODE') !== 'false');

  const [carbonLogs, setCarbonLogs] = useState<CarbonLog[]>(() => {
    const savedLogs = localStorage.getItem('GREENPULSE_CARBON_LOGS');
    if (savedLogs) {
      try {
        return JSON.parse(savedLogs);
      } catch (err) {
        console.error('Error parsing stored carbon logs, loading presets.', err);
      }
    }
    return PRESEEDED_LOGS;
  });

  // Load Google Maps script globally at root to avoid multiple loading warnings
  const { isLoaded: isMapsLoaded, loadError: mapsLoadError } = useJsApiLoader({
    googleMapsApiKey: mapsApiKey || '',
    libraries: MAP_LIBRARIES,
  });

  // Ensure default logs are written to localStorage once
  useEffect(() => {
    if (!localStorage.getItem('GREENPULSE_CARBON_LOGS')) {
      localStorage.setItem('GREENPULSE_CARBON_LOGS', JSON.stringify(PRESEEDED_LOGS));
    }
  }, []);

  // Sync carbon logs to localStorage on changes
  const saveLogs = (newLogs: CarbonLog[]) => {
    setCarbonLogs(newLogs);
    localStorage.setItem('GREENPULSE_CARBON_LOGS', JSON.stringify(newLogs));
  };

  const handleAddLog = (newLog: Omit<CarbonLog, 'id'>) => {
    const logItem: CarbonLog = {
      ...newLog,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    const updated = [logItem, ...carbonLogs];
    saveLogs(updated);
  };


  // Render correct component based on activeTab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'transit':
        return (
          <TransitCalculator 
            onAddLog={handleAddLog} 
            mapsApiKey={mapsApiKey}
            isDemoMode={isDemoMode}
            isLoaded={isMapsLoaded}
            loadError={mapsLoadError}
          />
        );
      case 'coach':
        return (
          <AICoach 
            carbonLogs={carbonLogs} 
            geminiApiKey={geminiApiKey} 
            isDemoMode={isDemoMode} 
          />
        );
      case 'hub':
        return (
          <ActionHub 
            carbonLogs={carbonLogs} 
            onAddLog={handleAddLog} 
            mapsApiKey={mapsApiKey}
            isDemoMode={isDemoMode}
            isLoaded={isMapsLoaded}
          />
        );
      case 'learn':
        return <LearnCenter />;
      default:
        return <Dashboard />;
    }
  };

  const showDemoBanner = isDemoMode || (!geminiApiKey && !mapsApiKey);

  return (
    <div className="app-layout">
      {/* Left-Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand" onClick={() => setActiveTab('dashboard')}>
            <Leaf size={24} style={{ fill: 'currentColor' }} className="text-gradient" />
            <span className="brand-title">GreenPulse</span>
          </div>

          <nav className="sidebar-menu">
            <button 
              className={`sidebar-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
            
            <button 
              className={`sidebar-btn ${activeTab === 'transit' ? 'active' : ''}`}
              onClick={() => setActiveTab('transit')}
            >
              <Navigation size={18} />
              <span>Commute</span>
            </button>

            <button 
              className={`sidebar-btn ${activeTab === 'coach' ? 'active' : ''}`}
              onClick={() => setActiveTab('coach')}
            >
              <Bot size={18} />
              <span>AI Coach</span>
            </button>

            <button 
              className={`sidebar-btn ${activeTab === 'hub' ? 'active' : ''}`}
              onClick={() => setActiveTab('hub')}
            >
              <Compass size={18} />
              <span>Action Hub</span>
            </button>

            <button 
              className={`sidebar-btn ${activeTab === 'learn' ? 'active' : ''}`}
              onClick={() => setActiveTab('learn')}
            >
              <BookOpen size={18} />
              <span>Education</span>
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          {showDemoBanner && (
            <div className="alert-info-banner" style={{ padding: '8px 12px', gap: '6px', fontSize: '11px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
              <ShieldAlert size={14} style={{ flexShrink: 0 }} />
              <span>Demo Presets Active</span>
            </div>
          )}

          <button 
            className="btn-secondary"
            onClick={() => setShowDeveloperKeys(true)}
            style={{ width: '100%', gap: '8px', padding: '10px', marginTop: '12px' }}
          >
            <Key size={14} />
            <span>Configure APIs</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <main style={{ flex: 1 }}>
          {renderTabContent()}
        </main>

        {/* Futuristic footer */}
        <footer style={{
          marginTop: '48px', padding: '24px 0 0 0',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '11px', color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Leaf size={12} className="text-gradient" />
            <span>GreenPulse © 2026 - Powered by Google Services</span>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <span>Google Prompt Wars Submission</span>
            <span>•</span>
            <span style={{ color: 'var(--text-emerald)', fontWeight: '600' }}>Carbon Footprint Awareness Platform</span>
          </div>
        </footer>
      </div>

      {/* Developer keys configure overlay */}
      {showDeveloperKeys && (
        <DeveloperKeys onClose={() => setShowDeveloperKeys(false)} />
      )}
    </div>
  );
}

export default App;
