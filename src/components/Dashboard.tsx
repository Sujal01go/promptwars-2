import React, { useState, useMemo } from 'react';
import { Chart } from 'react-google-charts';
import { 
  Globe, 
  Car, 
  Utensils, 
  Lightbulb, 
  Trash, 
  Compass, 
  TrendingDown,
  Info,
  Download
} from 'lucide-react';
import {
  LIFESTYLE_PROFILES,
  calculateProfileAnnualEmissionsTons,
  EMISSION_FACTORS,
  PARIS_AGREEMENT_GOAL_TONS,
  GLOBAL_AVERAGE_TONS,
  US_AVERAGE_TONS
} from '../utils/carbonCalculator';
import { EarthGlobe3D } from './EarthGlobe3D';

export const Dashboard: React.FC = () => {
  // Simulator State: Select active profile preset
  const [selectedProfileId, setSelectedProfileId] = useState<string>('suburban_us');
  
  // Custom Simulator state (initialized from selected preset)
  const activePreset = useMemo(() => {
    return LIFESTYLE_PROFILES.find(p => p.id === selectedProfileId) || LIFESTYLE_PROFILES[0];
  }, [selectedProfileId]);

  // Live simulation values based on user slider tweaks
  const [simTravelMiles, setSimTravelMiles] = useState<number>(activePreset.travelMiles);
  const [simTravelMode, setSimTravelMode] = useState<string>(activePreset.travelMode);
  const [simDietType, setSimDietType] = useState<string>(activePreset.dietType);
  const [simEnergyKwh, setSimEnergyKwh] = useState<number>(activePreset.energyKwh);
  const [simWasteBags, setSimWasteBags] = useState<number>(activePreset.wasteBags);

  // Sync state when preset profile is changed
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSimTravelMiles(activePreset.travelMiles);
    setSimTravelMode(activePreset.travelMode);
    setSimDietType(activePreset.dietType);
    setSimEnergyKwh(activePreset.energyKwh);
    setSimWasteBags(activePreset.wasteBags);
  }, [activePreset]);

  // Calculations for live simulated values
  const simulatedEmissions = useMemo(() => {
    const travelTons = (simTravelMiles * EMISSION_FACTORS.travel[simTravelMode as keyof typeof EMISSION_FACTORS.travel]) / 1000;
    const foodTons = (365 * EMISSION_FACTORS.food[simDietType as keyof typeof EMISSION_FACTORS.food]) / 1000;
    const energyTons = (simEnergyKwh * EMISSION_FACTORS.energy.electricity) / 1000;
    const wasteTons = (simWasteBags * EMISSION_FACTORS.waste.landfill) / 1000;

    const total = parseFloat((travelTons + foodTons + energyTons + wasteTons).toFixed(2));
    return {
      travel: parseFloat(travelEmissionsTons(simTravelMiles, simTravelMode).toFixed(2)),
      food: parseFloat(foodEmissionsTons(simDietType).toFixed(2)),
      energy: parseFloat(energyEmissionsTons(simEnergyKwh).toFixed(2)),
      waste: parseFloat(wasteEmissionsTons(simWasteBags).toFixed(2)),
      total
    };
  }, [simTravelMiles, simTravelMode, simDietType, simEnergyKwh, simWasteBags]);

  // Helpers
  function travelEmissionsTons(miles: number, mode: string) {
    return (miles * EMISSION_FACTORS.travel[mode as keyof typeof EMISSION_FACTORS.travel]) / 1000;
  }
  function foodEmissionsTons(diet: string) {
    return (365 * EMISSION_FACTORS.food[diet as keyof typeof EMISSION_FACTORS.food]) / 1000;
  }
  function energyEmissionsTons(kwh: number) {
    return (kwh * EMISSION_FACTORS.energy.electricity) / 1000;
  }
  function wasteEmissionsTons(bags: number) {
    return (bags * EMISSION_FACTORS.waste.landfill) / 1000;
  }

  // Google Pie Chart Data (Live Simulator results)
  const pieData = useMemo(() => [
    ['Category', 'Emissions (Tons/Year)', { role: 'style' }],
    ['Travel', simulatedEmissions.travel, '#3b82f6'],
    ['Food', simulatedEmissions.food, '#f59e0b'],
    ['Energy', simulatedEmissions.energy, '#ec4899'],
    ['Waste', simulatedEmissions.waste, '#a855f7'],
  ], [simulatedEmissions]);

  const pieOptions = {
    title: `Simulated Carbon Breakdown: ${activePreset.name}`,
    pieHole: 0.4,
    backgroundColor: 'transparent',
    legend: { textStyle: { color: '#94a3b8', fontName: 'Outfit', fontSize: 11 } },
    titleTextStyle: { color: '#f1f5f9', fontName: 'Outfit', fontSize: 14, bold: true },
    chartArea: { width: '90%', height: '80%' },
    colors: ['#3b82f6', '#f59e0b', '#ec4899', '#a855f7'],
    pieSliceBorderColor: 'rgba(255,255,255,0.05)',
  };

  // Google Column Chart Data (Compare simulated result vs Global Goals)
  const benchmarkData = useMemo(() => [
    ['Profile', 'Tons CO₂ / Year', { role: 'style' }, { role: 'annotation' }],
    ['Simulated Lifestyle', simulatedEmissions.total, '#10b981', 'Simulation'],
    ['Paris Target', PARIS_AGREEMENT_GOAL_TONS, '#14b8a6', 'Paris Goal'],
    ['Global Average', GLOBAL_AVERAGE_TONS, '#f59e0b', 'World Avg'],
    ['US Average', US_AVERAGE_TONS, '#ef4444', 'US Avg'],
  ], [simulatedEmissions.total]);

  const benchmarkOptions = {
    title: 'Carbon Benchmarks (Tons CO₂ per Capita)',
    backgroundColor: 'transparent',
    titleTextStyle: { color: '#f1f5f9', fontName: 'Outfit', fontSize: 14, bold: true },
    legend: { position: 'none' },
    hAxis: {
      textStyle: { color: '#94a3b8', fontName: 'Outfit', fontSize: 10 }
    },
    vAxis: {
      textStyle: { color: '#64748b', fontName: 'Outfit', fontSize: 10 },
      gridlines: { color: 'rgba(255,255,255,0.05)' }
    },
    bar: { groupWidth: '60%' }
  };

  // Educational Multiplier: Scale choices to 1,000,000 residents
  const defaultPresetEmissions = useMemo(() => {
    return calculateProfileAnnualEmissionsTons(activePreset);
  }, [activePreset]);

  const tonsSavedPerCapita = useMemo(() => {
    return Math.max(0, defaultPresetEmissions - simulatedEmissions.total);
  }, [defaultPresetEmissions, simulatedEmissions.total]);

  const cityScaleMetrics = useMemo(() => {
    const totalTonsSaved = tonsSavedPerCapita * 1000000;
    const passengerCarsRemoved = totalTonsSaved / 4.6; // Average car emits 4.6 tons CO2/year
    const forestAcresPlanted = totalTonsSaved / 2.5; // Average acre of forest sequesters 2.5 tons CO2/year
    return {
      totalTonsSaved: parseFloat(totalTonsSaved.toFixed(0)),
      passengerCarsRemoved: parseFloat(passengerCarsRemoved.toFixed(0)),
      forestAcresPlanted: parseFloat(forestAcresPlanted.toFixed(0))
    };
  }, [tonsSavedPerCapita]);

  // Export educational briefing file
  const handleExportBriefing = () => {
    let content = `# GreenPulse Carbon Awareness Briefing\n`;
    content += `Profile Analyzed: ${activePreset.name} (${activePreset.location})\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n\n`;

    content += `## 🌍 Lifestyles & Emissions Summary\n`;
    content += `${activePreset.description}\n\n`;

    content += `### Simulated Annual Footprint\n`;
    content += `- **Total Simulated Carbon footprint**: ${simulatedEmissions.total} Tons CO₂ per year\n`;
    content += `- **Baseline Preset Footprint**: ${defaultPresetEmissions} Tons CO₂ per year\n`;
    content += `- **Paris Agreement cap Goal**: ${PARIS_AGREEMENT_GOAL_TONS} Tons CO₂ per year\n`;
    content += `- **US National Average**: ${US_AVERAGE_TONS} Tons CO₂ per year\n\n`;

    content += `### Simulated Actions Breakdown\n`;
    content += `- **Travel**: Commuting ${simTravelMiles} miles/year via ${simTravelMode} (${simulatedEmissions.travel} Tons CO₂)\n`;
    content += `- **Food**: Eating a ${simDietType.replace('-', ' ')} diet (${simulatedEmissions.food} Tons CO₂)\n`;
    content += `- **Energy**: Residing with ${simEnergyKwh} kWh/year electrical draw (${simulatedEmissions.energy} Tons CO₂)\n`;
    content += `- **Waste**: Disposing ${simWasteBags} trash bags/year (${simulatedEmissions.waste} Tons CO₂)\n\n`;

    content += `## 🏢 Scale-Up Impact: City of 1,000,000 Residents\n`;
    content += `If a community of 1 million citizens adopted the modifications simulated in this briefing, the collective environmental recovery would equal:\n`;
    content += `- **Annual greenhouse gas offset**: **${cityScaleMetrics.totalTonsSaved.toLocaleString()} Tons** of CO₂ saved.\n`;
    content += `- **Gasoline passenger vehicles removed**: **${cityScaleMetrics.passengerCarsRemoved.toLocaleString()} cars** taken off roads.\n`;
    content += `- **Carbon sequestration equivalent**: **${cityScaleMetrics.forestAcresPlanted.toLocaleString()} acres** of new forest planted.\n\n`;

    content += `*GreenPulse - Google Prompt Wars Carbon Footprint Platform*\n`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GreenPulse_Eco_Briefing_${activePreset.name.replace(' ', '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 className="text-gradient" style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>
          Global Lifestyle Carbon Simulator
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Analyze standard regional behaviors, tweak lifestyle parameters in real-time, and project the global and municipal recovery scales.
        </p>
      </div>

      {/* Select Preset Profiles Row */}
      <div>
        <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', display: 'block', marginBottom: '12px', fontWeight: 700 }}>
          Select a Global Profile to Model:
        </span>
        <div className="profile-grid">
          {LIFESTYLE_PROFILES.map((p) => (
            <div 
              key={p.id}
              onClick={() => setSelectedProfileId(p.id)}
              className={`profile-card ${selectedProfileId === p.id ? 'active' : ''}`}
            >
              <div className="profile-card-header">
                <strong style={{ fontSize: '15px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{p.name}</strong>
                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  {p.location.split(',').pop()?.trim()}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Baseline: <span style={{ color: 'var(--text-emerald)', fontWeight: '600' }}>{calculateProfileAnnualEmissionsTons(p)} Tons CO₂/Yr</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Profile Info Banner */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
        <Info size={24} className="text-gradient" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            Lifestyle Profile Context: {activePreset.name} ({activePreset.location})
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {activePreset.description}
          </p>
        </div>
      </div>

      {/* Grid containing Sim Sliders and live benchmark comparison */}
      <div className="simulator-panel">
        {/* Sliders Input Panel */}
        <div className="glass-card panel-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '16px', marginBottom: '24px' }}>
            <Compass size={20} className="text-gradient" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Tweak Simulated Parameters</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            
            {/* Travel Sliders */}
            <div className="slider-group">
              <div className="slider-header">
                <div className="slider-label">
                  <Car size={16} className="text-gradient" />
                  <span>Annual Travel Commute</span>
                </div>
                <span className="slider-value">{simTravelMiles.toLocaleString()} miles</span>
              </div>
              
              <select className="form-select" value={simTravelMode} onChange={(e) => setSimTravelMode(e.target.value)}>
                <option value="suv">Gasoline SUV / Large Truck (0.44 kg/mi)</option>
                <option value="sedan">Gasoline Sedan / Compact (0.28 kg/mi)</option>
                <option value="electric">Electric Vehicle (0.08 kg/mi)</option>
                <option value="bus">Public Bus (0.12 kg/mi)</option>
                <option value="train">Subway / Transit Train (0.06 kg/mi)</option>
              </select>

              <input 
                type="range" 
                className="range-slider" 
                min={0} 
                max={30000} 
                step={500}
                value={simTravelMiles} 
                onChange={(e) => setSimTravelMiles(Number(e.target.value))} 
              />
            </div>

            {/* Diet Slider */}
            <div className="slider-group">
              <div className="slider-header">
                <div className="slider-label">
                  <Utensils size={16} style={{ color: '#fbbf24' }} />
                  <span>Dietary Choices</span>
                </div>
                <span className="slider-value" style={{ color: '#fbbf24' }}>
                  {simDietType.toUpperCase().replace('-', ' ')}
                </span>
              </div>
              <select className="form-select" value={simDietType} onChange={(e) => setSimDietType(e.target.value)}>
                <option value="meat-heavy">Meat Lover (Heavy Beef/Pork) (3.3 kg/day)</option>
                <option value="average">Omnivorous (Average Meat/Dairy) (2.5 kg/day)</option>
                <option value="vegetarian">Vegetarian (No Meat) (1.7 kg/day)</option>
                <option value="vegan">Vegan (Plant-Based) (1.0 kg/day)</option>
              </select>
            </div>

            {/* Utility Energy Slider */}
            <div className="slider-group">
              <div className="slider-header">
                <div className="slider-label">
                  <Lightbulb size={16} style={{ color: '#ec4899' }} />
                  <span>Household Grid Electricity</span>
                </div>
                <span className="slider-value" style={{ color: '#ec4899' }}>{simEnergyKwh.toLocaleString()} kWh</span>
              </div>
              <input 
                type="range" 
                className="range-slider" 
                min={0} 
                max={20000} 
                step={100}
                value={simEnergyKwh} 
                onChange={(e) => setSimEnergyKwh(Number(e.target.value))} 
              />
            </div>

            {/* Waste Slider */}
            <div className="slider-group">
              <div className="slider-header">
                <div className="slider-label">
                  <Trash size={16} style={{ color: '#c084fc' }} />
                  <span>Annual Waste Generation</span>
                </div>
                <span className="slider-value" style={{ color: '#c084fc' }}>{simWasteBags} bags</span>
              </div>
              <input 
                type="range" 
                className="range-slider" 
                min={0} 
                max={300} 
                step={5}
                value={simWasteBags} 
                onChange={(e) => setSimWasteBags(Number(e.target.value))} 
              />
            </div>

          </div>
        </div>

        {/* Live Pie Chart Breakdown */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ height: '340px' }}>
            <Chart
              chartType="PieChart"
              data={pieData}
              options={pieOptions}
              width="100%"
              height="100%"
              loader={
                <div className="flex-center" style={{ height: '100%' }}>
                  <Globe size={24} className="text-gradient animate-spin" />
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* Benchmark Comparisons & Community Scale Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '32px' }}>
        {/* Benchmark Chart */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '400px' }}>
          <div style={{ flex: 1 }}>
            <Chart
              chartType="ColumnChart"
              data={benchmarkData}
              options={benchmarkOptions}
              width="100%"
              height="100%"
              loader={
                <div className="flex-center" style={{ height: '100%' }}>
                  <TrendingDown size={24} className="text-gradient animate-spin" />
                </div>
              }
            />
          </div>
        </div>

        {/* Scale Multiplier Card */}
        <div className="glass-card" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '400px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '12px', marginBottom: '20px' }}>
              <Globe size={18} className="text-gradient" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>City-Scale Carbon Multiplier</h3>
            </div>
            
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
              If a community of <strong>1,000,000 residents</strong> adjusted their lifestyles from their baseline profiles to these simulated modifications:
            </p>

            <div className="city-cockpit" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Annual CO₂ Sequestered:</span>
                <strong style={{ fontSize: '16px', color: 'var(--text-emerald)', fontFamily: 'var(--font-heading)' }}>
                  {cityScaleMetrics.totalTonsSaved.toLocaleString()} Tons
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Sedans Displaced Eq:</span>
                <strong style={{ fontSize: '16px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-heading)' }}>
                  {cityScaleMetrics.passengerCarsRemoved.toLocaleString()} cars
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '4px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Forest Growth Eq:</span>
                <strong style={{ fontSize: '16px', color: 'var(--accent-purple)', fontFamily: 'var(--font-heading)' }}>
                  {cityScaleMetrics.forestAcresPlanted.toLocaleString()} acres
                </strong>
              </div>
            </div>
          </div>

          <button className="btn-primary" onClick={handleExportBriefing} style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }}>
            <Download size={16} /> Export Lifestyle Briefing
          </button>
        </div>

        {/* 3D Earth Globe Card */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '12px', marginBottom: '15px' }}>
            <Globe size={18} className="text-gradient" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Interactive 3D Carbon Globe</h3>
          </div>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <EarthGlobe3D />
          </div>
        </div>
      </div>
    </div>
  );
};
