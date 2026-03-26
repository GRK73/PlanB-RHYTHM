import React, { useState } from 'react';
import PixiCanvas from './core/PixiCanvas'
import SongSelect from './components/SongSelect'
import { GameEngine } from './core/GameEngine'
import './App.css'

function App() {
  const [gameState, setGameState] = useState<'LOBBY' | 'INGAME'>('LOBBY');

  const handleStartSong = async (songUrl: string, chartUrl: string) => {
    setGameState('INGAME');
    // Small delay to ensure engine is ready
    setTimeout(() => {
      GameEngine.getInstance().startSong(songUrl, chartUrl);
    }, 100);
  };

  return (
    <div className="App">
      <PixiCanvas />
      <div className="ui-overlay">
        {gameState === 'LOBBY' && (
          <div className="center-overlay">
            <SongSelect onStart={handleStartSong} />
          </div>
        )}
        
        {gameState === 'INGAME' && (
          <div className="ingame-hud">
            {/* Additional HUD elements like Score could go here */}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
