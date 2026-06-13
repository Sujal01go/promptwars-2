import React from 'react';
import { BookOpen, ExternalLink, Play } from 'lucide-react';

interface LearnVideo {
  id: string;
  youtubeId: string;
  title: string;
  channel: string;
  description: string;
}

const LEARN_VIDEOS: LearnVideo[] = [
  {
    id: 'vid1',
    youtubeId: 'jgWkp_9860c', // Kurzgesagt - Can YOU Fix Climate Change?
    title: 'Can YOU Fix Climate Change? Individual Action vs. Systemic Shift',
    channel: 'Kurzgesagt – In a Nutshell',
    description: 'An analytical exploration of carbon footprint metrics, comparing individual consumer actions like recycling and veganism against energy-grid transitions.'
  },
  {
    id: 'vid2',
    youtubeId: 's3S3hQdC8-0', // Google's Carbon Zero Energy goal
    title: 'Google\'s 24/7 Carbon-Free Energy Goal Explained',
    channel: 'Google Sustainability',
    description: 'An inside look at Google\'s engineering commitment to operate all data centers and offices on clean energy by matching grid consumption hourly.'
  },
  {
    id: 'vid3',
    youtubeId: 'b36T8XzWk7M', // Bill Gates - How to Avoid a Climate Disaster
    title: 'How to Avoid a Climate Disaster: Technical Levers & Green Premiums',
    channel: 'Bill Gates / Bloomberg Quicktake',
    description: 'Explaining carbon offsets, direct carbon capture, grid energy transition costs, and key industrial areas of cement, agriculture, and transportation.'
  }
];

export const LearnCenter: React.FC = () => {
  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 className="text-gradient" style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
          Green Education Center
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Discover the science of carbon tracking, clean energy grids, and Google\'s planetary sustainability goals through video modules.
        </p>
      </div>

      <div className="learn-grid">
        {LEARN_VIDEOS.map((vid) => (
          <div key={vid.id} className="glass-card video-card">
            <div className="video-container">
              <iframe
                title={vid.title}
                src={`https://www.youtube.com/embed/${vid.youtubeId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            
            <div className="video-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Play size={16} style={{ color: 'var(--accent-teal)' }} />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>{vid.channel}</span>
              </div>
              <h3 className="video-title">{vid.title}</h3>
              <p className="video-desc">{vid.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* External articles section */}
      <div className="glass-card" style={{ padding: '24px', marginTop: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(52, 211, 153, 0.15)', paddingBottom: '12px', marginBottom: '20px' }}>
          <BookOpen size={18} className="text-gradient" />
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Curated Ecological Reading</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <a 
            href="https://sustainability.google/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'block', padding: '16px', borderRadius: '10px', 
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
              textDecoration: 'none', transition: 'all 0.2s' 
            }}
            className="offset-card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Google Sustainability Portal</span>
              <ExternalLink size={14} style={{ color: 'var(--text-secondary)' }} />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Explore real-time telemetry, annual environmental reports, and Google\'s progress toward circular supply chains.
            </p>
          </a>

          <a 
            href="https://www.ipcc.ch/report/ar6/wg3/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'block', padding: '16px', borderRadius: '10px', 
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
              textDecoration: 'none', transition: 'all 0.2s' 
            }}
            className="offset-card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>IPCC Mitigation of Climate Change</span>
              <ExternalLink size={14} style={{ color: 'var(--text-secondary)' }} />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Global consensus reports outlining technical mitigation curves, carbon budgets, and policy recommendations.
            </p>
          </a>

          <a 
            href="https://www.footprintnetwork.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'block', padding: '16px', borderRadius: '10px', 
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
              textDecoration: 'none', transition: 'all 0.2s' 
            }}
            className="offset-card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Global Footprint Network</span>
              <ExternalLink size={14} style={{ color: 'var(--text-secondary)' }} />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Track the Earth Overshoot Day, calculate national ecological deficits, and research biocapacity metrics.
            </p>
          </a>
        </div>
      </div>
    </div>
  );
};
