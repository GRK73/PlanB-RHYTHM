import React, { useEffect, useRef } from 'react';
import { GameEngine } from './GameEngine';

const PixiCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = GameEngine.getInstance();
    
    const initPixi = async () => {
      await engine.init(containerRef.current!);
    };

    initPixi();

    return () => {
      engine.destroy();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '100vh', overflow: 'hidden' }}
    />
  );
};

export default PixiCanvas;
