import React, { useRef, useEffect, useState } from 'react';

interface ProjectNode {
  name: string;
  lat: number;
  lng: number;
  color: string;
  description: string;
}

// Ecology projects from the Action Hub mapped to geographic coordinates
const PROJECTS_NODES: ProjectNode[] = [
  { name: 'Amazon Canopy Reforestation', lat: -3.4653, lng: -62.2159, color: '#10b981', description: 'Brazil' },
  { name: 'West Texas Wind Grid', lat: 32.4487, lng: -99.7331, color: '#06b6d4', description: 'Texas, USA' },
  { name: 'Rajasthan Solar Parks', lat: 27.5396, lng: 71.9167, color: '#f59e0b', description: 'India' },
  { name: 'Oregon Direct Air Capture', lat: 42.2249, lng: -121.7817, color: '#8b5cf6', description: 'Oregon, USA' }
];

export const EarthGlobe3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<ProjectNode | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const autoSpinSpeed = useRef(0.003); // Drifts automatically
  const rotationRef = useRef({ x: 0.3, y: 0.8 }); // Angle values: x = tilt, y = spin

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width;
    let height = canvas.height;

    // Handle high DPI displays
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      width = rect.width;
      height = rect.height;
    };
    resize();
    
    // Resize listener
    window.addEventListener('resize', resize);

    const radius = Math.min(width, height) * 0.38;
    const centerX = width / 2;
    const centerY = height / 2;

    // Generate grid coordinates once
    const numLatitudes = 9;
    const numLongitudes = 14;
    const gridPoints: { x: number; y: number; z: number }[] = [];

    // Precalculate wireframe sphere grid points
    for (let i = 0; i <= numLatitudes; i++) {
      const lat = (Math.PI * i) / numLatitudes - Math.PI / 2; // -90 to 90 deg
      for (let j = 0; j < numLongitudes; j++) {
        const lng = (Math.PI * 2 * j) / numLongitudes - Math.PI; // -180 to 180 deg
        
        // 3D Cartesian coordinates
        const x = radius * Math.cos(lat) * Math.sin(lng);
        const y = radius * Math.sin(lat);
        const z = radius * Math.cos(lat) * Math.cos(lng);
        
        gridPoints.push({ x, y, z });
      }
    }

    // Convert lat/lng to 3D sphere coordinate
    const latLngToCartesian = (lat: number, lng: number) => {
      // Convert degrees to radians
      const radLat = (lat * Math.PI) / 180;
      const radLng = (lng * Math.PI) / 180;
      
      return {
        x: radius * Math.cos(radLat) * Math.sin(radLng),
        y: radius * Math.sin(radLat),
        z: radius * Math.cos(radLat) * Math.cos(radLng)
      };
    };

    // Main animation draw loop
    const render = () => {
      // Clear canvas with a nice space transparency
      ctx.clearRect(0, 0, width, height);

      // Increment rotation unless user is dragging
      if (!isDraggingRef.current) {
        rotationRef.current.y += autoSpinSpeed.current;
      }

      const { x: rx, y: ry } = rotationRef.current;

      // 3D Rotation matrices math (Rotate Y then X)
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);

      const project = (point: { x: number; y: number; z: number }) => {
        // Rotate Y (horizontal rotation)
        const x1 = point.x * cosY - point.z * sinY;
        const z1 = point.x * sinY + point.z * cosY;

        // Rotate X (vertical tilt)
        const y2 = point.y * cosX + z1 * sinX;
        const z2 = -point.x * sinX * sinY + point.y * sinX + z1 * cosX; // Depth factor

        return {
          px: centerX + x1,
          py: centerY - y2,
          pz: z2 // Positive is closer to camera
        };
      };

      // 1. Draw glowing atmosphere background radial aura
      const auraGlow = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius * 1.3);
      auraGlow.addColorStop(0, 'rgba(16, 185, 129, 0.04)');
      auraGlow.addColorStop(0.5, 'rgba(6, 182, 212, 0.02)');
      auraGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw outer boundary atmospheric halo rim
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Draw grid lines (meridians and parallels)
      // Group grid points by latitudes
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= numLatitudes; i++) {
        ctx.beginPath();
        let first = true;
        for (let j = 0; j <= numLongitudes; j++) {
          const idx = i * numLongitudes + (j % numLongitudes);
          const rawPoint = gridPoints[idx];
          if (!rawPoint) continue;
          
          const { px, py, pz } = project(rawPoint);

          // We draw the grid. If depth pz is negative (back of earth), draw with lower opacity
          if (pz >= 0) {
            ctx.strokeStyle = 'rgba(52, 211, 153, 0.08)';
          } else {
            ctx.strokeStyle = 'rgba(52, 211, 153, 0.02)';
          }

          if (first) {
            ctx.moveTo(px, py);
            first = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
      }

      // Group by longitudes
      for (let j = 0; j < numLongitudes; j++) {
        ctx.beginPath();
        let first = true;
        for (let i = 0; i <= numLatitudes; i++) {
          const idx = i * numLongitudes + j;
          const rawPoint = gridPoints[idx];
          if (!rawPoint) continue;
          
          const { px, py, pz } = project(rawPoint);

          if (pz >= 0) {
            ctx.strokeStyle = 'rgba(52, 211, 153, 0.08)';
          } else {
            ctx.strokeStyle = 'rgba(52, 211, 153, 0.02)';
          }

          if (first) {
            ctx.moveTo(px, py);
            first = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
      }

      // 4. Draw geographic ecology data project nodes
      let currentHovered: ProjectNode | null = null;
      PROJECTS_NODES.forEach((node) => {
        const rawPoint = latLngToCartesian(node.lat, node.lng);
        const { px, py, pz } = project(rawPoint);

        // Hide node if it rotates to the back of the globe (pz < 0)
        if (pz < -10) return;

        // Pulse scale animation
        const pulse = 1 + Math.sin(Date.now() * 0.004) * 0.15;
        const nodeSize = 6 * pulse;

        // Draw glow ring
        ctx.beginPath();
        ctx.arc(px, py, nodeSize * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = node.color + '1a'; // 10% opacity
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, nodeSize * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = node.color + '40'; // 25% opacity
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(px, py, nodeSize * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Node outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(px, py, nodeSize * 0.7, 0, Math.PI * 2);
        ctx.stroke();

        // Text label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.font = '600 9px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.description, px, py - nodeSize * 2.2);

        // Check cursor hovering
        const mouseX = previousMousePosition.current.x;
        const mouseY = previousMousePosition.current.y;
        const dist = Math.hypot(px - mouseX, py - mouseY);
        if (dist < 15) {
          currentHovered = node;
        }
      });

      // Update hovered node
      if (currentHovered !== hoveredNode) {
        setHoveredNode(currentHovered);
      }

      // 5. Draw decorative equator ring
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.06)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius * 1.2, radius * 0.25, Math.PI / 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [hoveredNode]);

  // Handle Dragging / Spanning interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    previousMousePosition.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (!isDraggingRef.current) {
      // Just record mouse pos for hover checking
      previousMousePosition.current = { x: mouseX, y: mouseY };
      return;
    }

    const deltaX = mouseX - previousMousePosition.current.x;
    const deltaY = mouseY - previousMousePosition.current.y;

    rotationRef.current.y += deltaX * 0.008;
    rotationRef.current.x += deltaY * 0.008;

    // Constrain X rotation to prevent flipping upside down
    rotationRef.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotationRef.current.x));

    previousMousePosition.current = { x: mouseX, y: mouseY };
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '300px' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        role="img"
        aria-label="Interactive 3D Earth globe showing carbon offset projects"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      />

      {/* Floating dynamic telemetry telemetry card on hover */}
      {hoveredNode && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(3, 7, 18, 0.9)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${hoveredNode.color}60`,
          borderRadius: '10px',
          padding: '10px 14px',
          width: '85%',
          boxShadow: `0 4px 20px ${hoveredNode.color}25`,
          pointerEvents: 'none',
          animation: 'fadeInModal 0.2s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: hoveredNode.color, boxShadow: `0 0 6px ${hoveredNode.color}`
            }} />
            <strong style={{ fontSize: '12px', color: '#f8fafc', fontFamily: 'Outfit' }}>
              {hoveredNode.name}
            </strong>
          </div>
          <p style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.3 }}>
            Regional ecological offset station tracking carbon capture metrics.
          </p>
        </div>
      )}

      {/* Earth Telemetry Badge in bottom-left */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        padding: '4px 8px',
        borderRadius: '4px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        fontSize: '9px',
        color: 'var(--text-secondary)',
        fontFamily: 'Outfit',
        pointerEvents: 'none'
      }}>
        SPIN TO ROTATE GLOBE
      </div>
    </div>
  );
};
