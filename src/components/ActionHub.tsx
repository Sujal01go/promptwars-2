import React, { useState } from 'react';
import { GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { 
  Award, 
  Leaf, 
  MapPin, 
  DollarSign, 
  Compass,
  CheckCircle,
  ShieldAlert
} from 'lucide-react';
import type { CarbonLog } from '../utils/carbonCalculator';

interface ActionHubProps {
  carbonLogs: CarbonLog[];
  onAddLog: (log: Omit<CarbonLog, 'id'>) => void;
  mapsApiKey: string;
  isDemoMode: boolean;
  isLoaded: boolean;
}

interface OffsetProject {
  id: string;
  name: string;
  category: 'forestry' | 'wind' | 'solar' | 'capture';
  location: string;
  costPerTon: number; // in USD
  lat: number;
  lng: number;
  description: string;
}

const OFFSET_PROJECTS: OffsetProject[] = [
  {
    id: 'amazon',
    name: 'Amazon Canopy Reforestation',
    category: 'forestry',
    location: 'Amazon Basin, Brazil',
    costPerTon: 15,
    lat: -3.4653,
    lng: -62.2159,
    description: 'Protects critical old-growth rainforest corridors from cattle ranching and supports local community nurseries to replant native species.'
  },
  {
    id: 'wind_texas',
    name: 'West Texas Wind Grid Expansion',
    category: 'wind',
    location: 'Abilene, Texas, USA',
    costPerTon: 9,
    lat: 32.4487,
    lng: -99.7331,
    description: 'Installs state-of-the-art wind turbines to supply clean energy to the ERCOT grid, displacing fossil-fuel burning power stations.'
  },
  {
    id: 'solar_india',
    name: 'Rajasthan Solar Parks',
    category: 'solar',
    location: 'Bhadla, Rajasthan, India',
    costPerTon: 11,
    lat: 27.5396,
    lng: 71.9167,
    description: 'Develops vast solar PV infrastructure in arid desert zones to boost clean energy access for regional grids.'
  },
  {
    id: 'oregon_capture',
    name: 'Oregon Direct Air Carbon Capture',
    category: 'capture',
    location: 'Klamath Falls, Oregon, USA',
    costPerTon: 28,
    lat: 42.2249,
    lng: -121.7817,
    description: 'Utilizes geothermal power to pull ambient carbon dioxide from the air and store it permanently underground in basalt mineral formations.'
  }
];

export const ActionHub: React.FC<ActionHubProps> = ({ carbonLogs, onAddLog, mapsApiKey, isDemoMode, isLoaded }) => {
  const [activeProject, setActiveProject] = useState<OffsetProject | null>(OFFSET_PROJECTS[0]);
  const [offsetAmount, setOffsetAmount] = useState<number>(1); // tons to offset
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 20, lng: 0 });
  const [mapZoom, setMapZoom] = useState(2);
  const [selectedMarker, setSelectedMarker] = useState<OffsetProject | null>(null);

  // Challenges list
  const [challenges, setChallenges] = useState([
    { id: '1', title: 'Meatless Monday', desc: 'Swap all meals for plant-based choices today.', points: 50, completed: false, category: 'food' },
    { id: '2', title: 'Unplug Vampire Loads', desc: 'Unplug chargers and appliances when leaving.', points: 30, completed: false, category: 'energy' },
    { id: '3', title: 'Active Commute Mile', desc: 'Walk or bicycle for a trip instead of driving.', points: 75, completed: false, category: 'travel' },
    { id: '4', title: 'Recycling Sort Audit', desc: 'Separate cardboard, plastics, and glass from landfill trash.', points: 40, completed: false, category: 'waste' },
  ]);

  // Load Google Maps API client-side
  const useRealMap = mapsApiKey && !isDemoMode;

  // Dynamic Badges unlock verification
  const totalLogs = carbonLogs.length;
  const hasTravel = carbonLogs.some(l => l.category === 'travel');
  const hasFood = carbonLogs.some(l => l.category === 'food');
  const hasEnergy = carbonLogs.some(l => l.category === 'energy');
  const hasWasteOffset = carbonLogs.some(l => l.category === 'waste' && l.emissions < 0);
  const hasOffsetPurchased = carbonLogs.some(l => l.description.includes('Offset Purchase'));

  const badges = [
    { id: 'starter', name: 'Green Starter', desc: 'Logged first activity', icon: '🌱', unlocked: totalLogs >= 1 },
    { id: 'transit', name: 'Transit Guardian', desc: 'Logged travel behavior', icon: '🚲', unlocked: hasTravel },
    { id: 'diet', name: 'Eco Gastronomer', desc: 'Logged dietary habits', icon: '🥗', unlocked: hasFood },
    { id: 'energy', name: 'Grid Master', desc: 'Logged energy stats', icon: '⚡', unlocked: hasEnergy },
    { id: 'waste', name: 'Circular Hero', desc: 'Logged recycling credit', icon: '♻️', unlocked: hasWasteOffset },
    { id: 'neutralist', name: 'Carbon Neutralist', desc: 'Purchased offset credits', icon: '🌍', unlocked: hasOffsetPurchased }
  ];

  // Handle challenge completion
  const handleCompleteChallenge = (id: string, challengeCategory: string) => {
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, completed: true } : c));
    
    // Automatically log positive offset to dashboard
    let offsetValue = 0;
    let description = '';
    let category: 'travel' | 'food' | 'energy' | 'waste' = 'energy';

    if (challengeCategory === 'food') {
      offsetValue = -2.5; // offsets 1 day omnivore footprint
      description = `Completed Challenge: Meatless Monday plant-based diet credit`;
      category = 'food';
    } else if (challengeCategory === 'energy') {
      offsetValue = -5.0; // offsets 12 kWh power
      description = `Completed Challenge: Unplugged standby appliances carbon credit`;
      category = 'energy';
    } else if (challengeCategory === 'travel') {
      offsetValue = -8.0; // offsets ~30 miles driving sedan
      description = `Completed Challenge: Active Commuting bicycle transit credit`;
      category = 'travel';
    } else if (challengeCategory === 'waste') {
      offsetValue = -3.0; // offsets 2 bags landfill
      description = `Completed Challenge: Rigorous recycling separation credit`;
      category = 'waste';
    }

    onAddLog({
      date: new Date().toISOString().split('T')[0],
      category,
      description,
      value: 1,
      unit: 'challenge',
      emissions: offsetValue
    });
  };

  // Handle offset purchasing
  const handlePurchaseOffset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || offsetAmount <= 0) return;

    const kgOffset = offsetAmount * 1000; // 1 ton = 1000 kg

    onAddLog({
      date: new Date().toISOString().split('T')[0],
      category: 'energy',
      description: `Carbon Offset Purchase: ${offsetAmount} Ton(s) via ${activeProject.name}`,
      value: offsetAmount,
      unit: 'Tons CO2',
      emissions: -kgOffset
    });

    setPurchaseSuccess(true);
    setTimeout(() => {
      setPurchaseSuccess(false);
      setOffsetAmount(1);
    }, 3000);
  };

  const handleMapMarkerClick = (proj: OffsetProject) => {
    setSelectedMarker(proj);
    setActiveProject(proj);
    setMapCenter({ lat: proj.lat, lng: proj.lng });
    setMapZoom(6);
  };

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#060a0f' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#060a0f' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
      { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#10b981' }] },
      { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#14b8a6' }] },
      { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0c1821' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#131b23' }] },
      { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#0c1821' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#061324' }] },
    ]
  };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 className="text-gradient" style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
          Action Hub & Offset Market
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Embark on weekly eco-challenges, track your achievement badges, and offset footprint totals via global projects.
        </p>
      </div>

      {/* Grid containing Badges and Challenges */}
      <div className="charts-grid" style={{ marginBottom: '25px' }}>
        {/* Gamified Badges */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '12px', marginBottom: '15px' }}>
            <Award size={18} className="text-gradient" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>Your Eco Badges</h3>
          </div>

          <div className="achievement-grid">
            {badges.map((b) => (
              <div key={b.id} className={`achievement-card ${b.unlocked ? 'unlocked' : 'locked'}`} title={b.desc}>
                <div className="achievement-icon">
                  {b.icon}
                </div>
                <span className="achievement-title">{b.name}</span>
                <span className="achievement-desc">{b.unlocked ? 'Unlocked' : b.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Challenges */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(52, 211, 153, 0.15)', paddingBottom: '12px', marginBottom: '15px' }}>
            <Compass size={18} className="text-gradient" />
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Weekly Sustainability Tasks</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {challenges.map((c) => (
              <div 
                key={c.id} 
                style={{
                  display: 'flex', alignItems: 'center', justifyItems: 'space-between',
                  padding: '12px 16px', borderRadius: '10px',
                  background: c.completed ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.02)',
                  border: c.completed ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <div style={{ flexGrow: 1, textAlign: 'left' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', display: 'block', color: c.completed ? 'var(--text-emerald)' : 'var(--text-primary)' }}>{c.title}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{c.desc}</span>
                </div>
                
                {c.completed ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-emerald)', fontWeight: 600 }}>
                    <CheckCircle size={14} /> Completed
                  </div>
                ) : (
                  <button 
                    className="btn-primary" 
                    style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '6px' }}
                    onClick={() => handleCompleteChallenge(c.id, c.category)}
                  >
                    Done
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Carbon Offset Market Section */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '12px', marginBottom: '20px' }}>
          <Leaf size={18} className="text-gradient" />
          <h3 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Global Carbon Offset Exchange</h3>
        </div>

        <div className="transit-layout" style={{ height: 'auto', minHeight: '380px' }}>
          {/* Buying control interface */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Selected Project</label>
              <select 
                className="form-select" 
                value={activeProject?.id}
                onChange={(e) => {
                  const proj = OFFSET_PROJECTS.find(p => p.id === e.target.value);
                  if (proj) {
                    setActiveProject(proj);
                    setMapCenter({ lat: proj.lat, lng: proj.lng });
                    setMapZoom(4);
                  }
                }}
              >
                {OFFSET_PROJECTS.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (${p.costPerTon}/Ton)</option>
                ))}
              </select>
            </div>

            {activeProject && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Location:</span>
                <span style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>{activeProject.location}</span>
                
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Project Summary:</span>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{activeProject.description}</p>
              </div>
            )}

            <form onSubmit={handlePurchaseOffset}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="slider-label">Credits to Purchase (Metric Tons)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <input 
                    type="number" 
                    className="form-group-input" 
                    min={1} 
                    max={100}
                    value={offsetAmount}
                    onChange={(e) => setOffsetAmount(Math.max(1, Number(e.target.value)))}
                    style={{ width: '100px' }}
                  />
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Total Cost: <strong style={{ color: 'var(--text-primary)', fontSize: '16px' }}>${(offsetAmount * (activeProject?.costPerTon || 0)).toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {purchaseSuccess ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(52,211,153,0.1)', color: 'var(--text-emerald)', borderRadius: '8px', fontSize: '13px', justifyContent: 'center', marginTop: '16px' }}>
                  <CheckCircle size={16} /> Offset successfully logged! Check your dashboard.
                </div>
              ) : (
                <button type="submit" className="btn-primary w-full" style={{ justifyContent: 'center', marginTop: '20px' }}>
                  <DollarSign size={16} /> Purchase Offsets (Reduce CO₂)
                </button>
              )}
            </form>
          </div>

          {/* Offset Map Display */}
          <div className="glass-card" style={{ height: '400px', overflow: 'hidden', position: 'relative' }}>
            {useRealMap ? (
              isLoaded ? (
                <GoogleMap
                  mapContainerClassName="actual-map"
                  center={mapCenter}
                  zoom={mapZoom}
                  options={mapOptions}
                >
                  {OFFSET_PROJECTS.map((proj) => (
                    <MarkerF 
                      key={proj.id}
                      position={{ lat: proj.lat, lng: proj.lng }}
                      onClick={() => handleMapMarkerClick(proj)}
                      icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        fillColor: '#10b981',
                        fillOpacity: 1,
                        strokeColor: '#fff',
                        strokeWeight: 2,
                        scale: 8
                      }}
                    />
                  ))}

                  {selectedMarker && (
                    <InfoWindowF
                      position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                      onCloseClick={() => setSelectedMarker(null)}
                    >
                      <div style={{ color: '#060a0f', padding: '5px', maxWidth: '200px' }}>
                        <strong style={{ display: 'block', fontSize: '12px' }}>{selectedMarker.name}</strong>
                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block', margin: '3px 0' }}>{selectedMarker.location}</span>
                        <span style={{ fontSize: '11px', color: '#047857', fontWeight: 600 }}>${selectedMarker.costPerTon}/Ton Offset</span>
                      </div>
                    </InfoWindowF>
                  )}
                </GoogleMap>
              ) : (
                <div className="flex-center w-full" style={{ height: '100%' }}>
                  <span className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid var(--accent-emerald)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                </div>
              )
            ) : (
              /* Custom Global Map Visualizer in Demo Mode */
              <div className="actual-map flex-center" style={{ background: '#060a0f', height: '100%', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: 'radial-gradient(rgba(16,185,129,0.05) 1px, transparent 0)',
                  backgroundSize: '30px 30px', opacity: 0.6
                }} />

                {/* Radar Sweep Effect */}
                <div style={{
                  position: 'absolute', width: '280px', height: '280px', borderRadius: '50%',
                  border: '1px solid rgba(52, 211, 153, 0.1)',
                  boxShadow: 'inset 0 0 40px rgba(52, 211, 153, 0.02)',
                  animation: 'pingRadar 4s ease-out infinite'
                }} />

                <div style={{
                  position: 'absolute', top: '15px', right: '15px', padding: '6px 10px',
                  background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: '6px', color: '#fbbf24', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '5px', zIndex: 2
                }}>
                  <ShieldAlert size={12} /> Map Radar (Simulated View)
                </div>

                {/* Simulated Radar Markers */}
                <div style={{ position: 'absolute', zIndex: 1, width: '100%', height: '100%' }}>
                  {OFFSET_PROJECTS.map((proj) => {
                    // map lat/long simple coordinate projections to local percentages
                    // Lat is roughly -90 to +90. Lng is roughly -180 to +180.
                    // Scale Brazilian amazon (-3, -62) to center-left
                    // Scale West Texas (32, -99) to top-left
                    // Scale Rajasthan India (27, 72) to top-right
                    // Scale Oregon (42, -121) to top-left-mid
                    
                    let topPct = 50;
                    let leftPct = 50;

                    if (proj.id === 'amazon') { topPct = 68; leftPct = 35; }
                    else if (proj.id === 'wind_texas') { topPct = 42; leftPct = 25; }
                    else if (proj.id === 'solar_india') { topPct = 45; leftPct = 70; }
                    else if (proj.id === 'oregon_capture') { topPct = 35; leftPct = 18; }

                    const isActive = activeProject?.id === proj.id;

                    return (
                      <div 
                        key={proj.id}
                        onClick={() => {
                          setActiveProject(proj);
                          setMapCenter({ lat: proj.lat, lng: proj.lng });
                        }}
                        style={{
                          position: 'absolute', top: `${topPct}%`, left: `${leftPct}%`,
                          transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: isActive ? 10 : 5
                        }}
                      >
                        <div style={{
                          width: '12px', height: '12px', borderRadius: '50%',
                          background: isActive ? 'var(--accent-teal)' : 'var(--accent-emerald)',
                          boxShadow: isActive ? '0 0 15px var(--accent-teal)' : '0 0 10px var(--accent-emerald)',
                          border: '2px solid white', transition: 'all 0.3s'
                        }} />
                        <span style={{
                          position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)',
                          fontSize: '9px', whiteSpace: 'nowrap', background: 'rgba(6,10,15,0.85)',
                          padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)',
                          color: isActive ? 'var(--text-emerald)' : 'var(--text-secondary)'
                        }}>
                          {proj.name.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ zIndex: 1, marginTop: '140px', textAlign: 'center', padding: '20px' }}>
                  <MapPin size={28} className="text-gradient animate-bounce" style={{ marginBottom: '10px' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>
                    Offset Program Location Plotter
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Showing {activeProject?.name} coordinates: [{activeProject?.lat.toFixed(4)}°, {activeProject?.lng.toFixed(4)}°]
                  </span>
                </div>

                <style>{`
                  @keyframes pingRadar {
                    from { transform: scale(0.6); opacity: 0.8; }
                    to { transform: scale(1.4); opacity: 0; }
                  }
                `}</style>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
