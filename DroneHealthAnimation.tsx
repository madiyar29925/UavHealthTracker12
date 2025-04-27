import React, { useEffect, useRef, useState } from 'react';
import { Component } from '@shared/schema';

interface DroneHealthAnimationProps {
  components: Component[];
  batteryLevel: number;
  signalStrength: number;
  status: 'active' | 'warning' | 'critical' | 'offline';
}

const DroneHealthAnimation: React.FC<DroneHealthAnimationProps> = ({
  components,
  batteryLevel,
  signalStrength,
  status
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animating, setAnimating] = useState(true);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const animationFrameRef = useRef<number>(0);
  
  // Define drone parts and their positions
  const droneParts = {
    motor1: { x: 100, y: 100, radius: 15, type: 'motor' },
    motor2: { x: 300, y: 100, radius: 15, type: 'motor' },
    motor3: { x: 100, y: 300, radius: 15, type: 'motor' },
    motor4: { x: 300, y: 300, radius: 15, type: 'motor' },
    body: { x: 200, y: 200, width: 120, height: 120, type: 'body' },
    camera: { x: 200, y: 240, radius: 12, type: 'camera' },
    gps: { x: 200, y: 180, radius: 10, type: 'gps' },
    gyroscope: { x: 200, y: 200, radius: 8, type: 'gyroscope' },
    radio: { x: 220, y: 200, width: 20, height: 10, type: 'radio' }
  };
  
  // Get component status by type
  const getComponentStatus = (type: string): 'normal' | 'warning' | 'critical' => {
    const component = components.find(c => c.type === type);
    return component ? (component.status as 'normal' | 'warning' | 'critical') : 'normal';
  };
  
  // Get component value by type
  const getComponentValue = (type: string): number => {
    const component = components.find(c => c.type === type);
    return component?.value ?? 100; // Use nullish coalescing to handle null/undefined
  };
  
  // Get color based on component status
  const getStatusColor = (type: string): string => {
    const componentStatus = getComponentStatus(type);
    return componentStatus === 'normal' 
      ? '#10B981' 
      : componentStatus === 'warning' 
        ? '#F59E0B' 
        : '#EF4444';
  };
  
  // Get color based on value
  const getValueColor = (value: number): string => {
    return value > 60 
      ? '#10B981' 
      : value > 30 
        ? '#F59E0B' 
        : '#EF4444';
  };
  
  // Animation values (using refs to avoid state updates in animation loop)
  const rotationAngleRef = useRef(0);
  const hoverEffectsRef = useRef({
    motorPulse: 0,
    batteryPulse: 0,
    signalPulse: 0
  });

  // Handle canvas mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if mouse is over any part
    let hovering: string | null = null;
    
    Object.entries(droneParts).forEach(([partName, part]) => {
      if ('radius' in part) {
        // Check for circular parts
        const distance = Math.sqrt(
          Math.pow(x - part.x, 2) + Math.pow(y - part.y, 2)
        );
        if (distance <= part.radius + (part.type === 'motor' ? 5 : 0)) {
          hovering = partName;
        }
      } else if ('width' in part && 'height' in part) {
        // Check for rectangular parts
        const halfWidth = part.width / 2;
        const halfHeight = part.height / 2;
        if (
          x >= part.x - halfWidth &&
          x <= part.x + halfWidth &&
          y >= part.y - halfHeight &&
          y <= part.y + halfHeight
        ) {
          hovering = partName;
        }
      }
    });
    
    setHoveredPart(hovering);
  };
  
  // Animation loop
  useEffect(() => {
    const animate = () => {
      if (!canvasRef.current || !animating) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update animation values using refs instead of state
      rotationAngleRef.current = (rotationAngleRef.current + (status !== ('offline' as any) ? 2 : 0)) % 360;
      const hoverEffects = hoverEffectsRef.current;
      hoverEffects.motorPulse = (hoverEffects.motorPulse + 0.05) % (2 * Math.PI);
      hoverEffects.batteryPulse = (hoverEffects.batteryPulse + 0.03) % (2 * Math.PI);
      hoverEffects.signalPulse = (hoverEffects.signalPulse + 0.04) % (2 * Math.PI);
      
      // Draw drone body
      ctx.save();
      ctx.translate(droneParts.body.x, droneParts.body.y);
      
      // Draw body
      ctx.fillStyle = status === 'offline' ? '#9CA3AF' : '#4B5563';
      ctx.beginPath();
      const bodyWidth = droneParts.body.width;
      const bodyHeight = droneParts.body.height;
      ctx.rect(-bodyWidth/2, -bodyHeight/2, bodyWidth, bodyHeight);
      ctx.fill();
      
      // Draw cross arms
      ctx.strokeStyle = status === 'offline' ? '#9CA3AF' : '#4B5563';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(-bodyWidth/2 - 20, -bodyHeight/2 - 20);
      ctx.lineTo(-bodyWidth/2 - 70, -bodyHeight/2 - 70);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(bodyWidth/2 + 20, -bodyHeight/2 - 20);
      ctx.lineTo(bodyWidth/2 + 70, -bodyHeight/2 - 70);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(-bodyWidth/2 - 20, bodyHeight/2 + 20);
      ctx.lineTo(-bodyWidth/2 - 70, bodyHeight/2 + 70);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(bodyWidth/2 + 20, bodyHeight/2 + 20);
      ctx.lineTo(bodyWidth/2 + 70, bodyHeight/2 + 70);
      ctx.stroke();
      
      // Draw rotors
      ['motor1', 'motor2', 'motor3', 'motor4'].forEach((motorName, index) => {
        const motorStatus = getComponentStatus('motor');
        const motorColor = getStatusColor('motor');
        const x = index === 0 || index === 2 ? -bodyWidth/2 - 80 : bodyWidth/2 + 80;
        const y = index === 0 || index === 1 ? -bodyHeight/2 - 80 : bodyHeight/2 + 80;
        
        // Draw motor base
        ctx.fillStyle = status === 'offline' ? '#9CA3AF' : motorColor;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw rotor blades
        if (status !== 'offline') {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(((index % 2 === 0 ? 1 : -1) * rotationAngleRef.current * Math.PI) / 180);
          
          const bladeLength = 30;
          const isHovered = hoveredPart === motorName;
          // Fixed type issue with status comparison
          const bladeColor = isHovered ? '#FFFFFF' : (status === 'offline' as any ? '#9CA3AF' : '#111827');
          
          ctx.strokeStyle = bladeColor;
          ctx.lineWidth = 3;
          
          for (let i = 0; i < 3; i++) {
            ctx.save();
            ctx.rotate((i * 2 * Math.PI) / 3);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -bladeLength);
            ctx.stroke();
            ctx.restore();
          }
          
          // Add pulsing effect if hovered
          if (isHovered && status !== ('offline' as any)) {
            ctx.fillStyle = motorColor + '40'; // Add transparency
            ctx.beginPath();
            const pulseSize = 25 + Math.sin(hoverEffectsRef.current.motorPulse) * 5;
            ctx.arc(0, 0, pulseSize, 0, 2 * Math.PI);
            ctx.fill();
          }
          
          ctx.restore();
        }
      });
      
      // Draw camera
      const cameraStatus = getComponentStatus('camera');
      ctx.fillStyle = status === 'offline' ? '#9CA3AF' : getStatusColor('camera');
      ctx.beginPath();
      ctx.arc(0, 40, 15, 0, 2 * Math.PI);
      ctx.fill();
      
      if (hoveredPart === 'camera' && status !== ('offline' as any)) {
        ctx.fillStyle = getStatusColor('camera') + '40';
        ctx.beginPath();
        ctx.arc(0, 40, 20 + Math.sin(hoverEffectsRef.current.motorPulse) * 3, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Draw GPS
      const gpsStatus = getComponentStatus('gps');
      ctx.fillStyle = status === 'offline' ? '#9CA3AF' : getStatusColor('gps');
      ctx.beginPath();
      ctx.arc(0, -30, 12, 0, 2 * Math.PI);
      ctx.fill();
      
      if (hoveredPart === 'gps' && status !== ('offline' as any)) {
        ctx.fillStyle = getStatusColor('gps') + '40';
        ctx.beginPath();
        ctx.arc(0, -30, 16 + Math.sin(hoverEffectsRef.current.motorPulse) * 3, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Draw gyroscope
      const gyroStatus = getComponentStatus('gyroscope');
      ctx.fillStyle = status === 'offline' ? '#9CA3AF' : getStatusColor('gyroscope');
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, 2 * Math.PI);
      ctx.fill();
      
      if (hoveredPart === 'gyroscope' && status !== ('offline' as any)) {
        ctx.fillStyle = getStatusColor('gyroscope') + '40';
        ctx.beginPath();
        ctx.arc(0, 0, 14 + Math.sin(hoverEffectsRef.current.motorPulse) * 3, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Draw radio antennas
      const radioStatus = getComponentStatus('radio');
      ctx.strokeStyle = status === 'offline' ? '#9CA3AF' : getStatusColor('radio');
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.moveTo(30, -10);
      ctx.lineTo(30, -40);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(-30, -10);
      ctx.lineTo(-30, -40);
      ctx.stroke();
      
      if (hoveredPart === 'radio' && status !== ('offline' as any)) {
        // Signal waves
        ctx.strokeStyle = getStatusColor('radio') + '70';
        const waves = 3;
        const waveAmplitude = 10 + Math.sin(hoverEffectsRef.current.signalPulse) * 2;
        
        for (let i = 1; i <= waves; i++) {
          ctx.beginPath();
          ctx.arc(30, -40, i * waveAmplitude, Math.PI, 0, true);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.arc(-30, -40, i * waveAmplitude, Math.PI, 0, true);
          ctx.stroke();
        }
      }
      
      ctx.restore();
      
      // Draw battery indicator
      const batteryX = 50;
      const batteryY = canvas.height - 30;
      const batteryWidth = 60;
      const batteryHeight = 20;
      
      ctx.fillStyle = '#4B5563';
      ctx.fillRect(batteryX, batteryY, batteryWidth, batteryHeight);
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(batteryX + batteryWidth, batteryY + 5, 5, 10);
      
      // Battery level
      const levelWidth = (batteryWidth - 4) * (batteryLevel / 100);
      ctx.fillStyle = getValueColor(batteryLevel);
      ctx.fillRect(batteryX + 2, batteryY + 2, levelWidth, batteryHeight - 4);
      
      // Battery pulse effect
      if (status !== ('offline' as any) && batteryLevel < 30) {
        const pulseOpacity = Math.abs(Math.sin(hoverEffectsRef.current.batteryPulse));
        ctx.fillStyle = `rgba(239, 68, 68, ${pulseOpacity * 0.3})`;
        ctx.fillRect(batteryX - 5, batteryY - 5, batteryWidth + 15, batteryHeight + 10);
      }
      
      // Draw signal strength indicator
      const signalX = canvas.width - 110;
      const signalY = canvas.height - 40;
      const barWidth = 10;
      const barGap = 3;
      const barColors = [
        signalStrength >= 20 ? getValueColor(signalStrength) : '#9CA3AF',
        signalStrength >= 40 ? getValueColor(signalStrength) : '#9CA3AF',
        signalStrength >= 60 ? getValueColor(signalStrength) : '#9CA3AF',
        signalStrength >= 80 ? getValueColor(signalStrength) : '#9CA3AF',
        signalStrength >= 95 ? getValueColor(signalStrength) : '#9CA3AF'
      ];
      
      barColors.forEach((color, i) => {
        const height = 5 + (i * 5);
        ctx.fillStyle = status === 'offline' ? '#9CA3AF' : color;
        ctx.fillRect(signalX + (i * (barWidth + barGap)), signalY - height, barWidth, height);
      });
      
      // Signal pulse effect
      if (status !== ('offline' as any) && signalStrength < 30) {
        const pulseOpacity = Math.abs(Math.sin(hoverEffectsRef.current.signalPulse));
        ctx.strokeStyle = `rgba(239, 68, 68, ${pulseOpacity * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(signalX + 30, signalY - 20, 25, 0, 2 * Math.PI);
        ctx.stroke();
      }
      
      // Request next frame
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    animating, 
    components, 
    status, 
    batteryLevel, 
    signalStrength, 
    hoveredPart
  ]);
  
  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={400} 
        className="border border-neutral-200 rounded-lg bg-white"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredPart(null)}
      />
      
      {hoveredPart && (
        <div className="absolute bottom-4 left-4 p-2 bg-neutral-800 text-white text-xs rounded shadow-lg">
          {hoveredPart.includes('motor') ? (
            <>
              <strong>Motor</strong>
              <div>Status: {getComponentStatus('motor') === 'normal' ? 'Normal' : 
                           getComponentStatus('motor') === 'warning' ? 'Warning' : 'Critical'}</div>
              <div>Value: {getComponentValue('motor')}%</div>
            </>
          ) : hoveredPart === 'camera' ? (
            <>
              <strong>Camera</strong>
              <div>Status: {getComponentStatus('camera') === 'normal' ? 'Normal' : 
                           getComponentStatus('camera') === 'warning' ? 'Warning' : 'Critical'}</div>
              <div>Value: {getComponentValue('camera')}%</div>
            </>
          ) : hoveredPart === 'gps' ? (
            <>
              <strong>GPS</strong>
              <div>Status: {getComponentStatus('gps') === 'normal' ? 'Normal' : 
                           getComponentStatus('gps') === 'warning' ? 'Warning' : 'Critical'}</div>
              <div>Value: {getComponentValue('gps')}%</div>
            </>
          ) : hoveredPart === 'gyroscope' ? (
            <>
              <strong>Gyroscope</strong>
              <div>Status: {getComponentStatus('gyroscope') === 'normal' ? 'Normal' : 
                           getComponentStatus('gyroscope') === 'warning' ? 'Warning' : 'Critical'}</div>
              <div>Value: {getComponentValue('gyroscope')}%</div>
            </>
          ) : hoveredPart === 'radio' ? (
            <>
              <strong>Radio Control</strong>
              <div>Status: {getComponentStatus('radio') === 'normal' ? 'Normal' : 
                           getComponentStatus('radio') === 'warning' ? 'Warning' : 'Critical'}</div>
              <div>Value: {getComponentValue('radio')}%</div>
            </>
          ) : hoveredPart === 'body' ? (
            <>
              <strong>Drone Body</strong>
              <div>Status: {
                status === 'active' ? 'Active' : 
                status === 'warning' ? 'Warning' : 
                status === 'critical' ? 'Critical' : 'Inactive'
              }</div>
            </>
          ) : null}
        </div>
      )}
      
      <div className="absolute top-2 right-2">
        <button
          onClick={() => setAnimating(!animating)}
          className="bg-neutral-800 text-white text-xs px-2 py-1 rounded hover:bg-neutral-700 transition-colors"
        >
          {animating ? 'Pause' : 'Start'}
        </button>
      </div>
    </div>
  );
};

export default DroneHealthAnimation;