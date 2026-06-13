import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  Sparkles, 
  Send, 
  Camera, 
  Image as ImageIcon,
  Bot, 
  User, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import type { CarbonLog } from '../utils/carbonCalculator';

interface AICoachProps {
  carbonLogs: CarbonLog[];
  geminiApiKey: string;
  isDemoMode: boolean;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  image?: string; // base64 or source url
}

// Preset images for simulated multimodal scanner
const PRESET_SCAN_ITEMS = [
  {
    id: 'bottle',
    name: 'Plastic Water Bottle',
    icon: '🥛',
    url: 'https://images.unsplash.com/photo-1608248597481-496100c80836?w=150',
    analysis: `🔍 **Object Scan Results:** Single-use PET Plastic Water Bottle.
    
🌳 **Lifecycle Carbon Footprint:** ~0.12 kg CO₂e (manufacture & transport).
    
💡 **AI Recommendations:**
- **Refuse & Reuse**: Transition to a reusable double-walled stainless steel flask (saves ~150 bottles/year).
- **Recycle properly**: Empty container completely, compress, and place in plastics bin. Recycled PET decreases emissions by 70%.
- **Tap Water**: Install an under-sink filtration system if local water purity is a concern.`
  },
  {
    id: 'receipt',
    name: 'Grocery Meat Receipt',
    icon: '🧾',
    url: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=150',
    analysis: `🔍 **Receipt Scan Results:** Grocery Purchase: 2 lbs Grain-fed Beef Ribeye.
    
🌳 **Lifecycle Carbon Footprint:** ~54.0 kg CO₂e (Heavy methane emissions during agricultural phase).
    
💡 **AI Recommendations:**
- **High Impact Substitution**: Swap beef for poultry (reduces food emissions by 80%) or pork (reduces by 65%).
- **Plant-based transition**: Cook a lentil dahl or check out pea-protein isolates (saves ~95% of agricultural carbon).
- **Zero-Waste Storage**: Freeze portioned cuts to avoid decay. Food rot in landfills accounts for 8% of global greenhouse output.`
  },
  {
    id: 'bulb',
    name: 'Incandescent Bulb',
    icon: '💡',
    url: 'https://images.unsplash.com/photo-1550537687-c91072c4792d?w=150',
    analysis: `🔍 **Appliance Scan Results:** 60W Tungsten Incandescent Lightbulb.
    
🌳 **Lifecycle Carbon Footprint:** ~72.0 kg CO₂e per year (continuous usage, relying on grid coal/gas electricity).
    
💡 **AI Recommendations:**
- **Immediate Upgrade**: Retrofit with a 9W LED bulb. LEDs consume 85% less energy and yield equal lumen output.
- **Financial Payback**: An LED pays for itself in electricity bill savings within 2 months.
- **Extended Lifespan**: LEDs last 25,000 hours vs. 1,000 hours for incandescent bulbs, reducing electronic waste.`
  }
];

export const AICoach: React.FC<AICoachProps> = ({ carbonLogs, geminiApiKey, isDemoMode }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const totalEmissions = carbonLogs.reduce((acc, log) => acc + log.emissions, 0);
    const greeting = `Hi, I am your GreenPulse Sustainability AI Coach! 🌿 
    
I've checked your carbon records: you have logged **${totalEmissions.toFixed(1)} kg CO₂** so far. 

How can I help you adopt green habits today? You can ask me questions about solar panels, diet choices, green commuting, or upload/select an item to scan its carbon impact!`;

    return [{ id: '1', sender: 'assistant', text: greeting }];
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Multimodal file upload state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);

  // Autoscroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Gemini Client Query
  const queryGemini = async (promptText: string, imageBase64: string | null = null) => {
    if (!geminiApiKey) throw new Error('API Key Missing');
    
    // Format carbon log context
    const logSummary = carbonLogs.map(l => `- ${l.date}: ${l.description} (${l.emissions} kg)`).slice(-5).join('\n');
    const systemPrompt = `You are a sustainability expert coach named GreenPulse Coach. Your goal is to guide the user on reducing their carbon footprint, suggesting sustainable habits, analyzing energy usage, and offering plant-based recipes or ecological tips. Keep your suggestions practical, encouraging, and clear. Use bullet points where appropriate.
    
    User Carbon Logs Context:
    Total Logged Emissions: ${carbonLogs.reduce((acc, l) => acc + l.emissions, 0).toFixed(1)} kg.
    Recent Actions:
    ${logSummary || 'No actions logged yet.'}
    
    Query: ${promptText}`;

    // Note: We use the official API wrapper
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    if (imageBase64) {
      // Split header off base64 if exists
      const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
      const response = await model.generateContent([
        systemPrompt,
        {
          inlineData: {
            data: cleanBase64,
            mimeType: 'image/jpeg'
          }
        }
      ]);
      return response.response.text();
    } else {
      const response = await model.generateContent(systemPrompt);
      return response.response.text();
    }
  };

  // Rule-based simulation for Demo Mode
  const querySimulatedAI = (promptText: string): string => {
    const text = promptText.toLowerCase();
    
    if (text.includes('travel') || text.includes('car') || text.includes('drive') || text.includes('commute')) {
      return `🚗 **GreenPulse Commuting Guide:**
      
- **Transition to EVs**: Switching from a gasoline sedan to an EV cuts driving emissions by ~70%, depending on your grid energy makeup.
- **Multimodal Transit**: Try to batch your trips or replace two solo car rides a week with public trains or buses.
- **Active Transit**: For commutes under 3 miles, cycling or walking generates zero emissions and offers cardiorespiratory benefits!`;
    }
    
    if (text.includes('food') || text.includes('diet') || text.includes('meat') || text.includes('vegan') || text.includes('vegetarian')) {
      return `🍽️ **Climate-Smart Diet Tips:**
      
- **The Power of Plants**: Agricultural carbon is heavily driven by beef, lamb, and cheese. Replacing beef with poultry or plant proteins (beans, tofu, lentils) saves huge quantities of land and emissions.
- **Meatless Mondays**: Even going vegetarian 1-2 days a week makes a measurable impact.
- **Combat Food Waste**: Buy only what you need. Decomposing organic matter in landfills generates methane, a gas 28x more potent than CO2 at trapping heat.`;
    }

    if (text.includes('solar') || text.includes('electricity') || text.includes('energy') || text.includes('power') || text.includes('heat')) {
      return `⚡ **Home Energy Efficiency Actions:**
      
- **Thermostat Adjustments**: Lowering your winter thermostat by 2°F and raising it by 2°F in summer can save over 300 kg of CO2 annually.
- **Phantom Loads**: Unplug idle chargers, game consoles, and electronics. These standby "vampire loads" make up 10% of home electricity use.
- **Clean Energy**: If rooftop solar isn't feasible, check if your local utility offers a "Community Solar" or green grid option to purchase renewable offset energy directly.`;
    }

    if (text.includes('hello') || text.includes('hi ') || text.includes('hey')) {
      return `Hello! How can I assist you on your sustainability journey today? Ask me about:
- Carbon emission benchmarks.
- Household energy reduction.
- Low-carbon shopping and food choices.
- Or upload an item image above to run a carbon analysis scan!`;
    }

    return `🌿 **GreenPulse Sustainability Coach Analysis:**
    
Thank you for your question! Reducing our carbon footprint relies on a series of small, incremental daily choices:
- **Minimize single-use products** (plastics, fast fashion).
- **Optimise household utilities** (switch to LED bulbs, wash clothes in cold water).
- **Re-evaluate transit choices** (walk or take public transit when possible).
- **Log actions** in our dashboard to monitor your progress!

Is there a specific area (travel, food, waste, energy) you would like to tackle next?`;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && !selectedImage) return;

    const userText = inputValue;
    const userImage = selectedImage;
    
    // Add user message
    const userMsgId = String(Date.now());
    setMessages(prev => [
      ...prev,
      { 
        id: userMsgId, 
        sender: 'user', 
        text: userText || `Scanned item: ${selectedImageName}`, 
        image: userImage || undefined 
      }
    ]);

    setInputValue('');
    setSelectedImage(null);
    setSelectedImageName(null);
    setIsLoading(true);

    try {
      if (geminiApiKey && !isDemoMode) {
        // Query real Gemini API
        const aiResponse = await queryGemini(userText || 'Analyze this image.', userImage);
        setMessages(prev => [
          ...prev,
          { id: String(Date.now() + 1), sender: 'assistant', text: aiResponse }
        ]);
        setIsLoading(false);
      } else {
        // Run simulated response
        setTimeout(() => {
          let responseText = '';
          if (userImage) {
            // Check if it matches a preset
            const matchingPreset = PRESET_SCAN_ITEMS.find(p => p.url === userImage);
            responseText = matchingPreset 
              ? matchingPreset.analysis 
              : `🔍 **Simulated Scan Results:** Analyzed custom image. Estimated Carbon footprint: ~0.4 kg CO₂e. Try switching to reusable alternatives!`;
          } else {
            responseText = querySimulatedAI(userText);
          }

          setMessages(prev => [
            ...prev,
            { id: String(Date.now() + 1), sender: 'assistant', text: responseText }
          ]);
          setIsLoading(false);
        }, 1200);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(err);
      setMessages(prev => [
        ...prev,
        { id: String(Date.now() + 1), sender: 'assistant', text: `Sorry, I encountered an error querying the Gemini API: ${errorMsg}. Reverting to Demo Mode suggestions.` }
      ]);
      setIsLoading(false);
    }
  };

  // Handle simulated upload preset selection
  const handleSelectPreset = (preset: typeof PRESET_SCAN_ITEMS[0]) => {
    setSelectedImage(preset.url);
    setSelectedImageName(preset.name);
  };

  // Real file uploader trigger
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setSelectedImageName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 className="text-gradient" style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
          Gemini AI Sustainability Coach
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Consult our Google Gemini chatbot on daily emissions reduction, or scan receipts and appliances for eco-audits.
        </p>
      </div>

      <div className="chat-layout">
        {/* Active Chat Interface */}
        <div className="glass-card chat-panel">
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={20} className="text-gradient" />
              <div>
                <span style={{ fontWeight: '600', fontSize: '15px', display: 'block' }}>GreenPulse AI Coach</span>
                <span style={{ fontSize: '11px', color: 'var(--text-emerald)' }}>
                  {geminiApiKey && !isDemoMode ? 'Gemini 1.5 Flash Active' : 'Interactive Demo Simulator'}
                </span>
              </div>
            </div>
          </div>

          {/* Messages display */}
          <div className="chat-messages" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', overflowY: 'auto', flex: 1 }}>
            {messages.map((m) => (
              <div key={m.id} className={`chat-bubble-card ${m.sender}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '11px', color: m.sender === 'user' ? '#030712' : 'var(--text-secondary)', fontWeight: 700, opacity: 0.8 }}>
                  {m.sender === 'user' ? <User size={12} /> : <Bot size={12} className="text-gradient" />}
                  <span>{m.sender === 'user' ? 'You' : 'Eco Coach'}</span>
                </div>
                
                {m.image && (
                  <img 
                    src={m.image} 
                    alt="Uploaded item" 
                    style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '10px', maxHeight: '180px', objectFit: 'cover' }}
                  />
                )}
                
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '13px', color: m.sender === 'user' ? '#030712' : 'var(--text-primary)' }}>
                  {m.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chat-bubble-card assistant" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 20px' }}>
                <span className="animate-spin" style={{ width: '12px', height: '12px', border: '2px solid var(--accent-emerald)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>AI is calculating green impact...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Selected image badge preview */}
          {selectedImage && (
            <div style={{ padding: '0 24px' }}>
              <div className="image-preview-badge">
                <ImageIcon size={14} />
                <span>Selected to scan: <strong>{selectedImageName}</strong></span>
                <button 
                  onClick={() => { setSelectedImage(null); setSelectedImageName(null); }}
                  style={{ background: 'none', border: 'none', color: '#ef4444', marginLeft: 'auto', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Form input controls */}
          <form onSubmit={handleSend} className="chat-input-area">
            <div className="chat-input-wrapper">
              <input 
                type="text" 
                className="chat-input" 
                placeholder="Ask about reducing emissions, recipes, solar power..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
              />
              <label className="image-attach-btn" title="Upload custom photo">
                <Camera size={18} />
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
              </label>
            </div>
            <button type="submit" className="btn-primary" style={{ borderRadius: '30px', padding: '10px 18px' }} disabled={isLoading}>
              <Send size={15} />
            </button>
          </form>
        </div>

        {/* Side Panel: Suggestions & Multimodal Presets */}
        <div className="chat-sustainability-panel">
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Sparkles size={16} className="text-gradient" />
              <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Multimodal Scan Demo</h4>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Select an item below to load its receipt/photo into the scanner and query Gemini's carbon analysis:
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {PRESET_SCAN_ITEMS.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => handleSelectPreset(item)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px',
                    borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)',
                    background: selectedImage === item.url ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.01)',
                    borderColor: selectedImage === item.url ? 'var(--accent-teal)' : 'rgba(255,255,255,0.05)',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', display: 'block' }}>{item.name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Simulated image scan</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <HelpCircle size={16} style={{ color: 'var(--accent-teal)' }} />
              <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Suggested Questions</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                className="btn-secondary" 
                style={{ fontSize: '12px', padding: '10px', textAlign: 'left', justifyContent: 'space-between' }}
                onClick={() => setInputValue('Tell me about the carbon benefits of switching to solar power.')}
              >
                Solar benefits <ArrowRight size={12} />
              </button>
              <button 
                className="btn-secondary" 
                style={{ fontSize: '12px', padding: '10px', textAlign: 'left', justifyContent: 'space-between' }}
                onClick={() => setInputValue('How can I make my daily diet more eco-friendly?')}
              >
                Diet recommendations <ArrowRight size={12} />
              </button>
              <button 
                className="btn-secondary" 
                style={{ fontSize: '12px', padding: '10px', textAlign: 'left', justifyContent: 'space-between' }}
                onClick={() => setInputValue('What are the top three ways to reduce travel carbon?')}
              >
                Travel alternatives <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
