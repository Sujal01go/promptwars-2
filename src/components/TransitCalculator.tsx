import React, { useState, useRef } from 'react';
import { GoogleMap, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';
import { MapPin, Navigation, Car, Bus, Train, Bike, Award, ShieldAlert, Check } from 'lucide-react';
import type { CarbonLog } from '../utils/carbonCalculator';

interface TransitCalculatorProps {
  onAddLog: (log: Omit<CarbonLog, 'id'>) => void;
  mapsApiKey: string;
  isDemoMode: boolean;
  isLoaded: boolean;
  loadError: Error | undefined;
}

const PRESET_LOCATIONS = [
  { name: 'Googleplex, Mountain View, CA', lat: 37.4220, lng: -122.0841 },
  { name: 'San Francisco Ferry Building, CA', lat: 37.7955, lng: -122.3937 },
  { name: 'Berkeley Green Plaza, CA', lat: 37.8715, lng: -122.2730 },
  { name: 'Stanford Energy Hub, CA', lat: 37.4275, lng: -122.1697 },
  { name: 'San Jose Eco-Transit, CA', lat: 37.3382, lng: -121.8863 },
];

export const TransitCalculator: React.FC<TransitCalculatorProps> = ({ onAddLog, mapsApiKey, isDemoMode, isLoaded, loadError }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  
  // Real Maps API State
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [distanceText, setDistanceText] = useState('');
  const [distanceValue, setDistanceValue] = useState(0); // in miles
  const [durationText, setDurationText] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>('train');
  const [loggedStatus, setLoggedStatus] = useState(false);

  // Autocomplete suggestion dropdowns
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<string[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // Autocomplete refs for Google Places API
  const originAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onOriginLoad = (autocomplete: google.maps.places.Autocomplete) => {
    originAutocompleteRef.current = autocomplete;
  };

  const onDestLoad = (autocomplete: google.maps.places.Autocomplete) => {
    destAutocompleteRef.current = autocomplete;
  };

  const onOriginPlaceChanged = () => {
    if (originAutocompleteRef.current !== null) {
      const place = originAutocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setOrigin(place.formatted_address);
      }
    }
  };

  const onDestPlaceChanged = () => {
    if (destAutocompleteRef.current !== null) {
      const place = destAutocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setDestination(place.formatted_address);
      }
    }
  };

  // Setup JS Api if key is provided and not in simulated demo mode
  const useRealMap = mapsApiKey && !isDemoMode;

  // Simple simulated autocomplete
  const handleOriginChange = (val: string) => {
    setOrigin(val);
    if (val.trim().length > 1) {
      const filtered = PRESET_LOCATIONS.map(l => l.name).filter(name => 
        name.toLowerCase().includes(val.toLowerCase())
      );
      setOriginSuggestions(filtered);
      setShowOriginDropdown(true);
    } else {
      setShowOriginDropdown(false);
    }
  };

  const handleDestChange = (val: string) => {
    setDestination(val);
    if (val.trim().length > 1) {
      const filtered = PRESET_LOCATIONS.map(l => l.name).filter(name => 
        name.toLowerCase().includes(val.toLowerCase())
      );
      setDestSuggestions(filtered);
      setShowDestDropdown(true);
    } else {
      setShowDestDropdown(false);
    }
  };

  // Route Emissions calculation logic
  const getEmissions = (miles: number, mode: string) => {
    switch (mode) {
      case 'suv': return miles * 0.44;
      case 'sedan': return miles * 0.28;
      case 'electric': return miles * 0.08;
      case 'bus': return miles * 0.12;
      case 'train': return miles * 0.06;
      case 'bicycle': return 0;
      case 'walking': return 0;
      default: return 0;
    }
  };

  const handleCalculate = async () => {
    if (!origin || !destination) {
      alert('Please fill out both origin and destination.');
      return;
    }

    setIsLoading(true);
    setShowResults(false);
    setLoggedStatus(false);

    if (useRealMap && isLoaded) {
      // Execute actual Google Maps direction request wrapped in a Promise
      try {
        const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
          const directionsService = new window.google.maps.DirectionsService();
          directionsService.route(
            {
              origin: origin,
              destination: destination,
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (res, status) => {
              if (status === 'OK' && res) resolve(res);
              else reject(new Error(`Google Maps directions error: ${status}`));
            }
          );
        });

        setDirectionsResponse(result);
        const route = result.routes[0];
        if (route && route.legs[0]) {
          const meters = route.legs[0].distance?.value || 0;
          const miles = meters * 0.000621371; // convert to miles
          setDistanceValue(parseFloat(miles.toFixed(1)));
          setDistanceText(route.legs[0].distance?.text || '');
          setDurationText(route.legs[0].duration?.text || '');
          setShowResults(true);
        }
      } catch (err) {
        console.error(err);
        alert('Could not compute routes using Google Maps. Falling back to simulated calculation.');
        runSimulation();
      } finally {
        setIsLoading(false);
      }
    } else {
      // Simulated Demo mode calculation
      setTimeout(() => {
        runSimulation();
        setIsLoading(false);
      }, 1500);
    }
  };

  const runSimulation = () => {
    // Generate static distances for testing
    let simulatedMiles: number;
    
    // Check if user selected one of our preset location pairs to make it feel extremely real
    const oLoc = PRESET_LOCATIONS.find(l => l.name === origin);
    const dLoc = PRESET_LOCATIONS.find(l => l.name === destination);
    if (oLoc && dLoc) {
      // Calculate simple distance formula
      const dx = (oLoc.lat - dLoc.lat) * 69;
      const dy = (oLoc.lng - dLoc.lng) * 55;
      simulatedMiles = parseFloat(Math.sqrt(dx*dx + dy*dy).toFixed(1));
    } else {
      simulatedMiles = parseFloat((Math.random() * 25 + 5).toFixed(1));
    }

    setDistanceValue(simulatedMiles);
    setDistanceText(`${simulatedMiles} mi`);
    
    const minSpeedMph = 35;
    const durationMin = Math.round((simulatedMiles / minSpeedMph) * 60);
    setDurationText(`${durationMin} mins`);
    
    setShowResults(true);
  };

  const handleLogRoute = () => {
    const emissions = getEmissions(distanceValue, selectedMode);
    
    let modeLabel = selectedMode;
    if (selectedMode === 'electric') modeLabel = 'EV';
    
    onAddLog({
      date: new Date().toISOString().split('T')[0],
      category: 'travel',
      description: `Commuted from ${origin.split(',')[0]} to ${destination.split(',')[0]} via ${modeLabel}`,
      value: distanceValue,
      unit: 'miles',
      emissions: parseFloat(emissions.toFixed(2))
    });

    setLoggedStatus(true);
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
      { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#34d399' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#131b23' }] },
      { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: 'rgba(52, 211, 153, 0.1)' }] },
      { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
      { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#17222c' }] },
      { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: 'rgba(52, 211, 153, 0.2)' }] },
      { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#0c1821' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#061324' }] },
    ]
  };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 className="text-gradient" style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
          Google Maps Travel Emissions Simulator
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Compare transportation modalities in real-time, simulate routes, and examine transit carbon footprints.
        </p>
      </div>

      <div className="transit-layout">
        {/* Route Input Sidebar */}
        <div className="glass-card transit-sidebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(52, 211, 153, 0.15)', paddingBottom: '12px' }}>
            <Navigation size={18} className="text-gradient" />
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Transit Scenario Simulation</h3>
          </div>

          <div style={{ position: 'relative' }}>
            <div className="form-group">
              <label htmlFor="origin-input" className="form-label">
                <MapPin size={14} className="text-gradient" /> Starting Point
              </label>
              {useRealMap && isLoaded ? (
                <Autocomplete onLoad={onOriginLoad} onPlaceChanged={onOriginPlaceChanged}>
                  <input 
                    id="origin-input"
                    type="text" 
                    className="form-group-input" 
                    placeholder="Search starting point..." 
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  />
                </Autocomplete>
              ) : (
                <>
                  <input 
                    id="origin-input"
                    type="text" 
                    className="form-group-input" 
                    placeholder="e.g. Stanford Energy Hub, CA" 
                    value={origin}
                    onChange={(e) => handleOriginChange(e.target.value)}
                    onFocus={() => setShowOriginDropdown(true)}
                    onBlur={() => setTimeout(() => setShowOriginDropdown(false), 200)}
                  />
                  {showOriginDropdown && originSuggestions.length > 0 && (
                    <div 
                      role="listbox" 
                      aria-label="Starting point suggestions"
                      style={{
                        position: 'absolute', top: '75px', left: 0, right: 0, 
                        background: 'var(--bg-gradient-end)', border: '1px solid rgba(52,211,153,0.3)',
                        borderRadius: '8px', zIndex: 10, maxHeight: '150px', overflowY: 'auto'
                      }}
                    >
                      {originSuggestions.map((s, idx) => (
                        <div 
                          key={idx} 
                          role="option"
                          aria-selected={origin === s}
                          tabIndex={0}
                          style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', outline: 'none' }}
                          onMouseDown={() => { setOrigin(s); setShowOriginDropdown(false); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { setOrigin(s); setShowOriginDropdown(false); } }}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div className="form-group">
              <label htmlFor="destination-input" className="form-label">
                <MapPin size={14} style={{ color: 'var(--accent-teal)' }} /> Destination
              </label>
              {useRealMap && isLoaded ? (
                <Autocomplete onLoad={onDestLoad} onPlaceChanged={onDestPlaceChanged}>
                  <input 
                    id="destination-input"
                    type="text" 
                    className="form-group-input" 
                    placeholder="Search destination..." 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </Autocomplete>
              ) : (
                <>
                  <input 
                    id="destination-input"
                    type="text" 
                    className="form-group-input" 
                    placeholder="e.g. Googleplex, Mountain View, CA" 
                    value={destination}
                    onChange={(e) => handleDestChange(e.target.value)}
                    onFocus={() => setShowDestDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDestDropdown(false), 200)}
                  />
                  {showDestDropdown && destSuggestions.length > 0 && (
                    <div 
                      role="listbox" 
                      aria-label="Destination suggestions"
                      style={{
                        position: 'absolute', top: '75px', left: 0, right: 0, 
                        background: 'var(--bg-gradient-end)', border: '1px solid rgba(52,211,153,0.3)',
                        borderRadius: '8px', zIndex: 10, maxHeight: '150px', overflowY: 'auto'
                      }}
                    >
                      {destSuggestions.map((s, idx) => (
                        <div 
                          key={idx} 
                          role="option"
                          aria-selected={destination === s}
                          tabIndex={0}
                          style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', outline: 'none' }}
                          onMouseDown={() => { setDestination(s); setShowDestDropdown(false); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { setDestination(s); setShowDestDropdown(false); } }}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <button 
            className="btn-primary w-full" 
            onClick={handleCalculate} 
            disabled={isLoading}
            style={{ justifyContent: 'center' }}
          >
            {isLoading ? (
              <span className="flex-center gap-10">
                <span className="animate-spin" style={{ width: '14px', height: '14px', border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%' }} />
                Simulating routes...
              </span>
            ) : 'Analyze Transit Impact'}
          </button>

          {/* Preset Helper Panel */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: '500' }}>Quick Presets (Educational Mode):</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <button 
                className="btn-secondary" 
                style={{ padding: '4px 8px', fontSize: '10px' }}
                onClick={() => { setOrigin('Stanford Energy Hub, CA'); setDestination('Googleplex, Mountain View, CA'); }}
              >
                Stanford ➔ Googleplex
              </button>
              <button 
                className="btn-secondary" 
                style={{ padding: '4px 8px', fontSize: '10px' }}
                onClick={() => { setOrigin('San Francisco Ferry Building, CA'); setDestination('Berkeley Green Plaza, CA'); }}
              >
                SF ➔ Berkeley
              </button>
            </div>
          </div>

          {/* Results Analysis */}
          {showResults && (
            <div className="route-comparison animate-fadeIn">
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Distance: <strong style={{ color: 'var(--text-primary)' }}>{distanceText}</strong> | Duration: <strong style={{ color: 'var(--text-primary)' }}>{durationText}</strong>
              </div>

              <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Simulated Footprint Comparison:</span>
              
              <div 
                className={`route-option ${selectedMode === 'suv' ? 'best' : ''}`} 
                style={{ cursor: 'pointer' }} 
                onClick={() => setSelectedMode('suv')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedMode('suv'); } }}
                role="button"
                tabIndex={0}
                aria-pressed={selectedMode === 'suv'}
                aria-label="Gasoline SUV emissions profile"
              >
                <div className="route-mode"><Car size={16} style={{ color: '#ef4444' }} /> Gasoline SUV</div>
                <div className="route-emission">
                  <div className="em-val">+{getEmissions(distanceValue, 'suv').toFixed(1)} kg</div>
                  <div className="em-lbl">0.44 kg/mi</div>
                </div>
              </div>

              <div 
                className={`route-option ${selectedMode === 'sedan' ? 'best' : ''}`} 
                style={{ cursor: 'pointer' }} 
                onClick={() => setSelectedMode('sedan')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedMode('sedan'); } }}
                role="button"
                tabIndex={0}
                aria-pressed={selectedMode === 'sedan'}
                aria-label="Gasoline Sedan emissions profile"
              >
                <div className="route-mode"><Car size={16} style={{ color: '#fbbf24' }} /> Gasoline Sedan</div>
                <div className="route-emission">
                  <div className="em-val">+{getEmissions(distanceValue, 'sedan').toFixed(1)} kg</div>
                  <div className="em-lbl">0.28 kg/mi</div>
                </div>
              </div>

              <div 
                className={`route-option ${selectedMode === 'electric' ? 'best' : ''}`} 
                style={{ cursor: 'pointer' }} 
                onClick={() => setSelectedMode('electric')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedMode('electric'); } }}
                role="button"
                tabIndex={0}
                aria-pressed={selectedMode === 'electric'}
                aria-label="Electric Car emissions profile"
              >
                <div className="route-mode"><Car size={16} style={{ color: '#34d399' }} /> Electric Car</div>
                <div className="route-emission">
                  <div className="em-val">+{getEmissions(distanceValue, 'electric').toFixed(1)} kg</div>
                  <div className="em-lbl">0.08 kg/mi</div>
                </div>
              </div>

              <div 
                className={`route-option ${selectedMode === 'bus' ? 'best' : ''}`} 
                style={{ cursor: 'pointer' }} 
                onClick={() => setSelectedMode('bus')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedMode('bus'); } }}
                role="button"
                tabIndex={0}
                aria-pressed={selectedMode === 'bus'}
                aria-label="Transit Bus emissions profile"
              >
                <div className="route-mode"><Bus size={16} style={{ color: '#60a5fa' }} /> Transit Bus</div>
                <div className="route-emission">
                  <div className="em-val">+{getEmissions(distanceValue, 'bus').toFixed(1)} kg</div>
                  <div className="em-lbl">0.12 kg/mi</div>
                </div>
              </div>

              <div 
                className={`route-option ${selectedMode === 'train' ? 'best' : ''}`} 
                style={{ cursor: 'pointer' }} 
                onClick={() => setSelectedMode('train')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedMode('train'); } }}
                role="button"
                tabIndex={0}
                aria-pressed={selectedMode === 'train'}
                aria-label="Eco-Train emissions profile"
              >
                <div className="route-mode"><Train size={16} style={{ color: '#c084fc' }} /> Eco-Train</div>
                <div className="route-emission">
                  <div className="em-val">+{getEmissions(distanceValue, 'train').toFixed(1)} kg</div>
                  <div className="em-lbl">0.06 kg/mi</div>
                </div>
              </div>

              <div 
                className={`route-option ${selectedMode === 'bicycle' ? 'best' : ''}`} 
                style={{ cursor: 'pointer' }} 
                onClick={() => setSelectedMode('bicycle')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedMode('bicycle'); } }}
                role="button"
                tabIndex={0}
                aria-pressed={selectedMode === 'bicycle'}
                aria-label="Bicycle or Walking zero emissions profile"
              >
                <div className="route-mode"><Bike size={16} style={{ color: 'var(--accent-teal)' }} /> Bicycle / Walk</div>
                <div className="route-emission">
                  <div className="em-val">0.0 kg</div>
                  <div className="em-lbl">Zero Emissions</div>
                </div>
              </div>

              {loggedStatus ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(52,211,153,0.1)', color: 'var(--text-emerald)', borderRadius: '8px', fontSize: '13px', justifyContent: 'center' }}>
                  <Check size={16} /> Registered to impact ledger!
                </div>
              ) : (
                <button className="btn-primary w-full" onClick={handleLogRoute} style={{ marginTop: '10px', fontSize: '13px', justifyContent: 'center' }}>
                  <Award size={15} /> Register simulation metrics
                </button>
              )}
            </div>
          )}
        </div>

        {/* Map Rendering Container */}
        <div className="glass-card map-container">
          {useRealMap ? (
            isLoaded ? (
              <GoogleMap
                mapContainerClassName="actual-map"
                center={{ lat: 37.4220, lng: -122.0841 }}
                zoom={11}
                options={mapOptions}
              >
                {directionsResponse && (
                  <DirectionsRenderer directions={directionsResponse} />
                )}
              </GoogleMap>
            ) : (
              <div className="flex-center w-full" style={{ height: '100%', flexDirection: 'column', gap: '15px' }}>
                {loadError ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#ef4444' }}>
                    <ShieldAlert size={40} style={{ marginBottom: '10px' }} />
                    <p>Google Maps Load Error. Check your API Console and domain configuration.</p>
                  </div>
                ) : (
                  <>
                    <span className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid var(--accent-emerald)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                    <span>Loading Google Maps Platform...</span>
                  </>
                )}
              </div>
            )
          ) : (
            /* Custom Styled Vector Eco-Map Simulator for Demo Mode */
            <div className="actual-map flex-center" style={{ background: '#060a0f', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              {/* Futuristic grids */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'radial-gradient(rgba(16,185,129,0.06) 1px, transparent 0), radial-gradient(rgba(20,184,166,0.06) 1px, transparent 0)',
                backgroundSize: '24px 24px', backgroundPosition: '0 0, 12px 12px', opacity: 0.8
              }} />

              {/* Glowing decorative circles */}
              <div style={{ position: 'absolute', top: '10%', left: '15%', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)' }} />
              <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)' }} />

              {/* Status Banner */}
              <div style={{
                position: 'absolute', top: '20px', right: '20px', padding: '8px 12px',
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: '6px', color: '#fbbf24', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', zIndex: 2
              }}>
                <ShieldAlert size={14} /> Interactive Demo Mode (Simulated Canvas)
              </div>

              {/* Vector SVG drawing paths if coordinates active */}
              {showResults ? (
                <svg width="100%" height="100%" style={{ position: 'absolute', zIndex: 1 }}>
                  {/* Outer routing trace line */}
                  <path 
                    d="M 120 300 Q 280 120, 480 220" 
                    fill="none" 
                    stroke="rgba(255,255,255,0.05)" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                  />
                  {/* Glowing active path */}
                  <path 
                    d="M 120 300 Q 280 120, 480 220" 
                    fill="none" 
                    stroke="url(#routeGradient)" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeDasharray="1000"
                    strokeDashoffset="0"
                    style={{ animation: 'dash 5s linear infinite' }}
                  />
                  <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--accent-emerald)" />
                      <stop offset="100%" stopColor="var(--accent-teal)" />
                    </linearGradient>
                  </defs>
                  
                  {/* Origin Pulse marker */}
                  <circle cx="120" cy="300" r="10" fill="rgba(16, 185, 129, 0.2)" />
                  <circle cx="120" cy="300" r="4" fill="var(--accent-emerald)" />
                  
                  {/* Destination Pulse marker */}
                  <circle cx="480" cy="220" r="10" fill="rgba(20, 184, 166, 0.2)" />
                  <circle cx="480" cy="220" r="4" fill="var(--accent-teal)" />

                  {/* Text labels floating */}
                  <text x="120" y="325" fill="#f1f5f9" fontFamily="Outfit" fontSize="11" fontWeight="600" textAnchor="middle">
                    A: {origin.split(',')[0]}
                  </text>
                  <text x="480" y="245" fill="#f1f5f9" fontFamily="Outfit" fontSize="11" fontWeight="600" textAnchor="middle">
                    B: {destination.split(',')[0]}
                  </text>
                </svg>
              ) : (
                <div style={{ zIndex: 1, textAlign: 'center', maxWidth: '300px' }}>
                  <Navigation size={36} className="text-gradient" style={{ animation: 'bounce 2s infinite', marginBottom: '15px' }} />
                  <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>Interactive Mapping Visualizer</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                    Enter starting and endpoints and click analyze to map transit pathways and emissions levels.
                  </p>
                </div>
              )}

              {/* CSS Animation injection in Component */}
              <style>{`
                @keyframes dash {
                  to {
                    stroke-dashoffset: -40;
                  }
                }
                @keyframes bounce {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-8px); }
                }
              `}</style>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
