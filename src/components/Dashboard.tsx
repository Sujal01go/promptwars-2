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
  Download,
  Activity,
  Heart,
  Truck
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

  // Municipal Impact Engine State
  const [communityScale, setCommunityScale] = useState<number>(1000000);
  const [gridMix, setGridMix] = useState<string>('default');

  // Sync state when preset profile is changed
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSimTravelMiles(activePreset.travelMiles);
    setSimTravelMode(activePreset.travelMode);
    setSimDietType(activePreset.dietType);
    setSimEnergyKwh(activePreset.energyKwh);
    setSimWasteBags(activePreset.wasteBags);
  }, [activePreset]);

  // Calculations for live simulated values incorporating custom grid mixes
  const simulatedEmissions = useMemo(() => {
    const gridFactor = gridMix === 'eco-green' ? 0.15 : gridMix === 'coal-heavy' ? 0.75 : EMISSION_FACTORS.energy.electricity;
    
    const travelTons = (simTravelMiles * EMISSION_FACTORS.travel[simTravelMode as keyof typeof EMISSION_FACTORS.travel]) / 1000;
    const foodTons = (365 * EMISSION_FACTORS.food[simDietType as keyof typeof EMISSION_FACTORS.food]) / 1000;
    const energyTons = (simEnergyKwh * gridFactor) / 1000;
    const wasteTons = (simWasteBags * EMISSION_FACTORS.waste.landfill) / 1000;

    const total = parseFloat((travelTons + foodTons + energyTons + wasteTons).toFixed(2));
    return {
      travel: parseFloat(travelEmissionsTons(simTravelMiles, simTravelMode).toFixed(2)),
      food: parseFloat(foodEmissionsTons(simDietType).toFixed(2)),
      energy: parseFloat((simEnergyKwh * gridFactor / 1000).toFixed(2)),
      waste: parseFloat(wasteEmissionsTons(simWasteBags).toFixed(2)),
      total
    };
  }, [simTravelMiles, simTravelMode, simDietType, simEnergyKwh, simWasteBags, gridMix]);

  // Helpers
  function travelEmissionsTons(miles: number, mode: string) {
    return (miles * EMISSION_FACTORS.travel[mode as keyof typeof EMISSION_FACTORS.travel]) / 1000;
  }
  function foodEmissionsTons(diet: string) {
    return (365 * EMISSION_FACTORS.food[diet as keyof typeof EMISSION_FACTORS.food]) / 1000;
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

  // Educational Multiplier: Scale choices to the selected community scale and grid mix
  const defaultPresetEmissions = useMemo(() => {
    const gridFactor = gridMix === 'eco-green' ? 0.15 : gridMix === 'coal-heavy' ? 0.75 : EMISSION_FACTORS.energy.electricity;
    
    const travelTons = (activePreset.travelMiles * EMISSION_FACTORS.travel[activePreset.travelMode]) / 1000;
    const foodTons = (365 * EMISSION_FACTORS.food[activePreset.dietType]) / 1000;
    const energyTons = (activePreset.energyKwh * gridFactor) / 1000;
    const wasteTons = (activePreset.wasteBags * EMISSION_FACTORS.waste.landfill) / 1000;
    
    return parseFloat((travelTons + foodTons + energyTons + wasteTons).toFixed(2));
  }, [activePreset, gridMix]);

  const tonsSavedPerCapita = useMemo(() => {
    return Math.max(0, defaultPresetEmissions - simulatedEmissions.total);
  }, [defaultPresetEmissions, simulatedEmissions.total]);

  const municipalScaleMetrics = useMemo(() => {
    const totalTonsSaved = tonsSavedPerCapita * communityScale;
    const passengerCarsRemoved = totalTonsSaved / 4.6; // Average car emits 4.6 tons CO2/year
    const forestAcresPlanted = totalTonsSaved / 2.5; // Average acre of forest sequesters 2.5 tons CO2/year
    
    // 1 hour of operations for a standard local generator block avoids ~0.45 tons of CO2
    const coalHoursSaved = totalTonsSaved / 0.45;
    
    // Every ton of offset CO2 and particulate matter avoids ~$50 in local public health expenses
    const economicHealthSavings = totalTonsSaved * 50;
    
    const wasteBagsSavedPerCapita = Math.max(0, activePreset.wasteBags - simWasteBags);
    const wasteTrucksDiverted = (wasteBagsSavedPerCapita * communityScale) / 1000; // 1000 bags per waste truck
    
    return {
      totalTonsSaved: parseFloat(totalTonsSaved.toFixed(0)),
      passengerCarsRemoved: parseFloat(passengerCarsRemoved.toFixed(0)),
      forestAcresPlanted: parseFloat(forestAcresPlanted.toFixed(0)),
      coalHoursSaved: parseFloat(coalHoursSaved.toFixed(0)),
      economicHealthSavings: parseFloat(economicHealthSavings.toFixed(0)),
      wasteTrucksDiverted: parseFloat(wasteTrucksDiverted.toFixed(0))
    };
  }, [tonsSavedPerCapita, communityScale, activePreset, simWasteBags]);

  // Export educational briefing file
  const handleExportBriefing = () => {
    let content = `# GreenPulse Carbon Awareness Briefing\n`;
    content += `Profile Model: ${activePreset.name} (${activePreset.location})\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n\n`;

    content += `## 🌍 Lifestyles & Emissions Summary\n`;
    content += `${activePreset.description}\n\n`;

    content += `### Simulated Annual Footprint (Individual)\n`;
    content += `- **Total Simulated Carbon footprint**: ${simulatedEmissions.total} Tons CO₂ per year\n`;
    content += `- **Baseline Preset Footprint**: ${defaultPresetEmissions} Tons CO₂ per year\n`;
    content += `- **Paris Agreement cap Goal**: ${PARIS_AGREEMENT_GOAL_TONS} Tons CO₂ per year\n`;
    content += `- **US National Average**: ${US_AVERAGE_TONS} Tons CO₂ per year\n\n`;

    content += `### Simulated Actions Breakdown\n`;
    content += `- **Travel**: Commuting ${simTravelMiles} miles/year via ${simTravelMode} (${simulatedEmissions.travel} Tons CO₂)\n`;
    content += `- **Food**: Eating a ${simDietType.replace('-', ' ')} diet (${simulatedEmissions.food} Tons CO₂)\n`;
    content += `- **Energy**: Residing with ${simEnergyKwh} kWh/year electrical draw (${simulatedEmissions.energy} Tons CO₂)\n`;
    content += `- **Waste**: Disposing ${simWasteBags} trash bags/year (${simulatedEmissions.waste} Tons CO₂)\n\n`;

    content += `## 🏢 Municipal Scale-Up Impact Projections\n`;
    content += `If a community of **${communityScale.toLocaleString()} citizens** with a **${gridMix === 'eco-green' ? 'Clean Energy Solar/Hydro' : gridMix === 'coal-heavy' ? 'Fossil Coal-Heavy' : 'Standard baseline'}** grid adopted the modifications simulated in this briefing, the collective environmental recovery would equal:\n`;
    content += `- **Annual greenhouse gas offset**: **${municipalScaleMetrics.totalTonsSaved.toLocaleString()} Tons** of CO₂ saved.\n`;
    content += `- **Gasoline passenger vehicles removed**: **${municipalScaleMetrics.passengerCarsRemoved.toLocaleString()} cars** taken off roads.\n`;
    content += `- **Carbon sequestration equivalent**: **${municipalScaleMetrics.forestAcresPlanted.toLocaleString()} acres** of new forest planted.\n`;
    content += `- **Grid coal operations avoided**: **${municipalScaleMetrics.coalHoursSaved.toLocaleString()} hours** of standard coal plant runtime saved.\n`;
    content += `- **Economic health savings**: **$${municipalScaleMetrics.economicHealthSavings.toLocaleString()}** in local medical and infrastructure costs avoided.\n`;
    content += `- **Municipal waste management offset**: **${municipalScaleMetrics.wasteTrucksDiverted.toLocaleString()} truckloads** of garbage diverted from landfills.\n\n`;

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
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedProfileId(p.id);
                }
              }}
              className={`profile-card ${selectedProfileId === p.id ? 'active' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`Select profile preset for ${p.name}`}
              aria-pressed={selectedProfileId === p.id}
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
                <label id="travel-commute-label" className="slider-label" style={{ cursor: 'pointer' }}>
                  <Car size={16} className="text-gradient" />
                  <span>Annual Travel Commute</span>
                </label>
                <span className="slider-value">{simTravelMiles.toLocaleString()} miles</span>
              </div>
              
              <select 
                className="form-select" 
                value={simTravelMode} 
                onChange={(e) => setSimTravelMode(e.target.value)}
                aria-label="Annual travel vehicle type"
              >
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
                aria-labelledby="travel-commute-label"
                aria-valuemin={0}
                aria-valuemax={30000}
                aria-valuenow={simTravelMiles}
                aria-valuetext={`${simTravelMiles.toLocaleString()} miles`}
              />
            </div>

            {/* Diet Slider */}
            <div className="slider-group">
              <div className="slider-header">
                <label id="dietary-label" className="slider-label" style={{ cursor: 'pointer' }}>
                  <Utensils size={16} style={{ color: '#fbbf24' }} />
                  <span>Dietary Choices</span>
                </label>
                <span className="slider-value" style={{ color: '#fbbf24' }}>
                  {simDietType.toUpperCase().replace('-', ' ')}
                </span>
              </div>
              <select 
                className="form-select" 
                value={simDietType} 
                onChange={(e) => setSimDietType(e.target.value)}
                aria-labelledby="dietary-label"
              >
                <option value="meat-heavy">Meat Lover (Heavy Beef/Pork) (3.3 kg/day)</option>
                <option value="average">Omnivorous (Average Meat/Dairy) (2.5 kg/day)</option>
                <option value="vegetarian">Vegetarian (No Meat) (1.7 kg/day)</option>
                <option value="vegan">Vegan (Plant-Based) (1.0 kg/day)</option>
              </select>
            </div>

            {/* Utility Energy Slider */}
            <div className="slider-group">
              <div className="slider-header">
                <label id="energy-label" className="slider-label" style={{ cursor: 'pointer' }}>
                  <Lightbulb size={16} style={{ color: '#ec4899' }} />
                  <span>Household Grid Electricity</span>
                </label>
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
                aria-labelledby="energy-label"
                aria-valuemin={0}
                aria-valuemax={20000}
                aria-valuenow={simEnergyKwh}
                aria-valuetext={`${simEnergyKwh.toLocaleString()} kilowatt hours`}
              />
            </div>

            {/* Waste Slider */}
            <div className="slider-group">
              <div className="slider-header">
                <label id="waste-label" className="slider-label" style={{ cursor: 'pointer' }}>
                  <Trash size={16} style={{ color: '#c084fc' }} />
                  <span>Annual Waste Generation</span>
                </label>
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
                aria-labelledby="waste-label"
                aria-valuemin={0}
                aria-valuemax={300}
                aria-valuenow={simWasteBags}
                aria-valuetext={`${simWasteBags} trash bags`}
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
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '440px' }}>
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

        {/* Municipal Impact Projection Engine */}
        <div className="glass-card" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '440px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '12px', marginBottom: '16px' }}>
              <Globe size={18} className="text-gradient" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Municipal Impact Engine</h3>
            </div>
            
            {/* Municipal configuration selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label htmlFor="community-scale-select" style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Projected Citizens
                </label>
                <select 
                  id="community-scale-select"
                  className="form-select" 
                  value={communityScale} 
                  onChange={(e) => setCommunityScale(Number(e.target.value))}
                  style={{ fontSize: '12px', padding: '6px' }}
                >
                  <option value={10000}>10k (Neighborhood)</option>
                  <option value={50000}>50k (Township)</option>
                  <option value={500000}>500k (District)</option>
                  <option value={1000000}>1M (Major City)</option>
                  <option value={5000000}>5M (Metropolis)</option>
                  <option value={10000000}>10M (Megacity)</option>
                </select>
              </div>

              <div>
                <label htmlFor="grid-mix-select" style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Municipal Grid Mix
                </label>
                <select 
                  id="grid-mix-select"
                  className="form-select" 
                  value={gridMix} 
                  onChange={(e) => setGridMix(e.target.value)}
                  style={{ fontSize: '12px', padding: '6px' }}
                >
                  <option value="default">Default Grid (0.42)</option>
                  <option value="eco-green">Decarbonized (0.15)</option>
                  <option value="coal-heavy">Coal-Heavy (0.75)</option>
                </select>
              </div>
            </div>

            <div className="city-cockpit" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Annual CO₂ Sequestered:</span>
                <strong style={{ fontSize: '14px', color: 'var(--text-emerald)', fontFamily: 'var(--font-heading)' }}>
                  {municipalScaleMetrics.totalTonsSaved.toLocaleString()} Tons
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sedans Displaced Eq:</span>
                <strong style={{ fontSize: '14px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-heading)' }}>
                  {municipalScaleMetrics.passengerCarsRemoved.toLocaleString()} cars
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Coal Power Plants Off:</span>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                  <Activity size={12} className="text-gradient" /> {municipalScaleMetrics.coalHoursSaved.toLocaleString()} hrs
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Public Health Savings:</span>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: 'var(--text-emerald)', fontFamily: 'var(--font-heading)' }}>
                  <Heart size={12} style={{ color: '#f43f5e' }} /> ${municipalScaleMetrics.economicHealthSavings.toLocaleString()}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '2px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Garbage Trucks Diverted:</span>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: 'var(--accent-purple)', fontFamily: 'var(--font-heading)' }}>
                  <Truck size={12} style={{ color: '#a855f7' }} /> {municipalScaleMetrics.wasteTrucksDiverted.toLocaleString()} loads
                </strong>
              </div>
            </div>
          </div>

          <button className="btn-primary" onClick={handleExportBriefing} style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }}>
            <Download size={16} /> Export Lifestyle Briefing
          </button>
        </div>

        {/* 3D Earth Globe Card */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '440px' }}>
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
